from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
from datetime import datetime
import sqlite3
from dotenv import load_dotenv
from langchain_chroma import Chroma
from agent import Agent
import logging


load_dotenv()

logging.basicConfig(level=logging.INFO)

OLLAMA_BASE_URL = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
MODEL_NAME = os.getenv('MODEL_NAME', 'llama3')

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

BASE_DIR = 'user_data'
CHROMA_DIR = os.path.join(BASE_DIR, 'chroma_db')
DB_PATH = os.path.join(BASE_DIR, 'local_db.sqlite')

# Ensure the directory exists
os.makedirs(CHROMA_DIR, exist_ok=True)

chroma_client = Chroma(persist_directory=CHROMA_DIR)

agent = Agent("MainAgent", CHROMA_DIR, OLLAMA_BASE_URL, MODEL_NAME)

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS personas
                 (id INTEGER PRIMARY KEY, name TEXT, data JSON, timestamp TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS documents
                 (id INTEGER PRIMARY KEY, filename TEXT, content TEXT, timestamp TEXT)''')
    conn.commit()
    conn.close()

def create_or_update_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Check if 'personas' table exists and has the correct schema
    c.execute("CREATE TABLE IF NOT EXISTS personas (id INTEGER PRIMARY KEY, name TEXT, data JSON, timestamp TEXT)")
    
    # Check if 'documents' table exists and has the correct schema
    c.execute("CREATE TABLE IF NOT EXISTS documents (id INTEGER PRIMARY KEY, filename TEXT, content TEXT, timestamp TEXT)")
    
    conn.commit()
    conn.close()

# Call this function before starting the Flask app
create_or_update_db()

# Initialize folders and database
os.makedirs(BASE_DIR, exist_ok=True)
init_db()

@app.route('/')
def home():
    return "Server is running"

@app.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "Flask server is running"}), 200

@app.route('/get_input_documents', methods=['GET'])
def get_input_documents():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT filename, content FROM documents")
    documents = {row[0]: row[1] for row in c.fetchall()}
    conn.close()
    return jsonify(documents)

@app.route('/update_document', methods=['POST'])
def update_document():
    data = request.json
    filename = data['filename']
    content = data['content']
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("UPDATE documents SET content = ?, timestamp = ? WHERE filename = ?",
              (content, datetime.now().isoformat(), filename))
    if c.rowcount == 0:
        c.execute("INSERT INTO documents (filename, content, timestamp) VALUES (?, ?, ?)",
                  (filename, content, datetime.now().isoformat()))
    conn.commit()
    conn.close()
    
    # Update Chroma DB
    agent.add_to_db(content, filename)
    
    return jsonify({'message': f'Document {filename} updated successfully'})

@app.route('/generate_persona', methods=['POST'])
def generate_persona():
    try:
        input_text = request.json['input']
        selected_documents = request.json.get('selected_documents', [])
        
        documents_content = []
        if selected_documents:
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            placeholders = ','.join(['?'] * len(selected_documents))
            c.execute(f"SELECT content FROM documents WHERE filename IN ({placeholders})", selected_documents)
            documents_content = [row[0] for row in c.fetchall() if row[0]]
            conn.close()

        prompt = f"""Generate a detailed persona based on this input and the following documents: {input_text}. 
        Documents content: {' '.join(documents_content)}
        Include categories such as Education, Experience, Skills, Strengths, Goals, and Values. Format the response as a JSON object."""
        
        logging.info(f"Sending prompt to agent: {prompt}")
        persona = agent.generate(prompt)
        
        logging.info(f"Received persona from agent: {persona}")
        
        if isinstance(persona, dict) and 'error' in persona:
            logging.error(f"Error generating persona: {persona['error']}")
            return jsonify(persona), 500
        
        # Save persona to SQLite
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("INSERT INTO personas (name, data, timestamp) VALUES (?, ?, ?)",
                  (persona.get('Name', 'Unnamed Persona'), json.dumps(persona), datetime.now().isoformat()))
        conn.commit()
        conn.close()
        
        logging.info(f"Persona saved to database")
        
        return jsonify(persona), 200
    except Exception as e:
        logging.error(f"Error in generate_persona: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get_personas', methods=['GET'])
def get_personas():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, name, timestamp FROM personas ORDER BY timestamp DESC")
    personas = [{'id': row[0], 'name': row[1], 'timestamp': row[2]} for row in c.fetchall()]
    conn.close()
    
    return jsonify({'personas': personas})

@app.route('/load_persona/<persona_id>', methods=['GET'])
def load_persona(persona_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT data FROM personas WHERE id = ?", (persona_id,))
    result = c.fetchone()
    conn.close()
    
    if result:
        return jsonify({'persona': json.loads(result[0])})
    else:
        return jsonify({'error': 'Persona not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)