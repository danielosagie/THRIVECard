# app.py
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
from datetime import datetime
import sqlite3
from dotenv import load_dotenv
from agent import Agent
import logging
import threading
from queue import Queue
from groq import Groq
import chromadb
from chromadb.config import Settings
import re


load_dotenv('.env.local')

logging.basicConfig(level=logging.INFO)

OLLAMA_BASE_URL = os.getenv('OLLAMA_BASE_URL')
MODEL_NAME = os.getenv('MODEL_NAME')

BASE_DIR = 'user_data'
CHROMA_DIR = os.path.join(BASE_DIR, 'chroma_db')
DB_PATH = os.path.join(BASE_DIR, 'local_db.sqlite')

UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'doc', 'docx'}

os.makedirs(CHROMA_DIR, exist_ok=True)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize ChromaDB with PersistentClient
chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)

# Create a collection for personas
persona_collection = chroma_client.get_or_create_collection(name="personas")

agent = Agent("MainAgent", CHROMA_DIR, OLLAMA_BASE_URL, MODEL_NAME)

app = Flask(__name__)

# Configure CORS
if os.environ.get('FLASK_ENV') == 'production':
    # In production, only allow requests from your Vercel domain
    CORS(app, resources={r"/*": {"origins": "https://your-vercel-domain.vercel.app"}})
else:
    # In development, allow requests from the local frontend
    CORS(app, resources={r"/*": {"origins": "http://localhost:3001"}})

@app.after_request
def after_request(response):
    if os.environ.get('FLASK_ENV') != 'production':
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3001')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/generate_persona_stream', methods=['POST'])
def generate_persona_stream():
    app.logger.info("Received request for generate_persona_stream")
    data = request.form
    app.logger.info(f"Request data: {data}")
    
    # Construct the input text from the received data
    input_text = f"""
    Career Journey: {data.get('careerJourney', '')}
    Name: {data.get('firstName', '')} {data.get('lastName', '')}
    Age Range: {data.get('ageRange', '')}
    Career Goals: {data.get('careerGoals', '')}
    Education: {data.get('education', '')}
    Additional Training: {data.get('additionalTraining', '')}
    Technical Skills: {data.get('technicalSkills', '')}
    Creative Skills: {data.get('creativeSkills', '')}
    Other Skills: {data.get('otherSkills', '')}
    Work Experiences: {data.get('workExperiences', '')}
    Military Life Experiences: {data.get('militaryLifeExperiences', '')}
    Drive Distance: {data.get('driveDistance', '')}
    """
    
    # Parse generation settings
    generation_settings = json.loads(data.get('generation_settings', '{}'))
    
    api_key = generation_settings.get('api_key') or os.environ.get("GROQ_API_KEY")
    model = generation_settings.get('model', 'llama3-8b-8192')
    creativity = float(generation_settings.get('creativity', 0.5))
    realism = float(generation_settings.get('realism', 0.5))
    custom_prompt = generation_settings.get('default_prompt', '')

    client = Groq(api_key=api_key)

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": custom_prompt
                },
                {
                    "role": "user",
                    "content": input_text
                }
            ],
            model=model,
            temperature=creativity,
            max_tokens=7000,
            top_p=realism,
            stream=True
        )

        generated_persona = ''
        for chunk in chat_completion:
            if chunk.choices[0].delta.content is not None:
                generated_persona += chunk.choices[0].delta.content

        # Parse the generated persona into structured data
        persona_data = parse_generated_persona(generated_persona)

        # Combine submitted data with generated data
        full_persona_data = {
            **data.to_dict(),
            **persona_data,
            'generated_text': generated_persona,
            'timestamp': datetime.now().isoformat()
        }

        # Store the full persona data in ChromaDB
        persona_id = store_persona_in_chroma(full_persona_data)

        app.logger.info(f"Persona stored with ID: {persona_id}")
        return jsonify({'persona': generated_persona, 'persona_id': persona_id})

    except Exception as e:
        app.logger.error(f"Error in generate_persona_stream: {str(e)}")
        return jsonify({'error': str(e)}), 500

def parse_generated_persona(generated_text):
    sections = {
        'summary': r'(?s).*?(?=\n\n)',
        'qualifications': r'Qualifications and Education:(.*?)(?=\n\n)',
        'goals': r'Career Goals:(.*?)(?=\n\n)',
        'skills': r'Skills and Preferences:(.*?)(?=\n\n)',
        'nextSteps': r'Professional Development Plans:(.*?)(?=\n\n)',
        'strengths': r'Key Strengths:(.*?)(?=\n\n)',
        'lifeExperiences': r'Relevant Life Experiences:(.*?)(?=\n\n)',
        'valueProposition': r'Unique Value Proposition:(.*?)(?=\n\n|$)'
    }

    parsed_data = {}
    for key, pattern in sections.items():
        match = re.search(pattern, generated_text, re.DOTALL)
        if match:
            content = match.group(1) if key != 'summary' else match.group(0)
            parsed_data[key] = [item.strip() for item in content.split('\n') if item.strip()]

    return parsed_data

def store_persona_in_chroma(persona_data):
    persona_id = str(datetime.now().timestamp())
    try:
        persona_collection.add(
            ids=[persona_id],
            documents=[json.dumps(persona_data)],
            metadatas=[{"type": "persona"}]
        )
        app.logger.info(f"Persona stored in ChromaDB with ID: {persona_id}")
        return persona_id
    except Exception as e:
        app.logger.error(f"Error storing persona in ChromaDB: {str(e)}")
        raise

@app.route('/get_persona/<persona_id>', methods=['GET'])
def get_persona(persona_id):
    try:
        results = persona_collection.get(ids=[persona_id])
        if results['documents']:
            persona_data = json.loads(results['documents'][0])
            return jsonify(persona_data)
        else:
            return jsonify({'error': 'Persona not found'}), 404
    except Exception as e:
        app.logger.error(f"Error in get_persona: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/update_persona/<persona_id>', methods=['PUT'])
def update_persona(persona_id):
    try:
        data = request.json
        existing_data = json.loads(persona_collection.get(ids=[persona_id])['documents'][0])
        updated_data = {**existing_data, **data}
        persona_collection.update(
            ids=[persona_id],
            documents=[json.dumps(updated_data)],
            metadatas=[{"type": "persona"}]
        )
        return jsonify({'message': 'Persona updated successfully'})
    except Exception as e:
        app.logger.error(f"Error in update_persona: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/get_all_personas', methods=['GET'])
def get_all_personas():
    try:
        results = persona_collection.get()
        personas = []
        for doc, metadata in zip(results['documents'], results['metadatas']):
            persona = json.loads(doc)
            persona['id'] = metadata['id']  # Assuming the ID is stored in metadata
            personas.append(persona)
        return jsonify(personas)
    except Exception as e:
        app.logger.error(f"Error in get_all_personas: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/')
def hello():
    return "Hello, World!"

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_ENV') != 'production')
