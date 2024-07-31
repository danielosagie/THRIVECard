from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
from datetime import datetime
from agent import Agent
import subprocess

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
DOCUMENT_FOLDER = 'documents'
CHROMA_DB_PATH = 'chroma_db'
PERSONAS_FOLDER = 'user_data/personas'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['DOCUMENT_FOLDER'] = DOCUMENT_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(DOCUMENT_FOLDER, exist_ok=True)
os.makedirs(CHROMA_DB_PATH, exist_ok=True)
os.makedirs(PERSONAS_FOLDER, exist_ok=True)

hf_agent = Agent("HFAgent", CHROMA_DB_PATH, "")
ollama_agent = Agent("OllamaAgent", CHROMA_DB_PATH, "http://localhost:11434")

@app.route('/initialize_ollama', methods=['POST'])
def initialize_ollama():
    try:
        subprocess.Popen(["ollama", "run", "llama3"])
        return jsonify({'message': 'Ollama initialized successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/initialize_hf_endpoint', methods=['POST'])
def initialize_hf_endpoint():
    try:
        endpoint = request.json.get('endpoint')
        token = request.json.get('token')
        if not endpoint or not token:
            return jsonify({'error': 'Endpoint or token not provided'}), 400

        hf_agent.llm.endpoint_url = endpoint
        hf_agent.llm.huggingfacehub_api_token = token
        
        return jsonify({'message': 'HuggingFace Endpoint initialized successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/test_llm', methods=['POST'])
def test_llm():
    method = request.json.get('method')
    agent = hf_agent if method == 'hf_endpoint' else ollama_agent
    
    try:
        test_response = agent.instruct("Generate a short test message to confirm the LLM is working.")
        return jsonify({'message': test_response.get('Description', 'Test successful, but no description generated.')}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        result = ollama_agent.add_to_db(file_path)
        
        return jsonify({'message': result, 'filename': filename}), 200

@app.route('/generate_persona', methods=['POST'])
def generate_persona():
    input_text = request.json['input']
    uploaded_files = request.json.get('uploaded_files', [])
    generation_method = request.json.get('generation_method', 'ollama')
    
    agent = hf_agent if generation_method == 'hf_endpoint' else ollama_agent
    
    def generate():
        prompt = f"""Generate a detailed persona based on this input and the following files: {input_text}. Files: {', '.join(uploaded_files)}"""
        persona = agent.instruct(prompt)
        
        for key, value in persona.items():
            yield json.dumps({key: value}) + '\n'

    return Response(stream_with_context(generate()), mimetype='application/json')

@app.route('/update_persona', methods=['POST'])
def update_persona():
    updated_persona = request.json['persona']
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"persona_{timestamp}.json"
    file_path = os.path.join(PERSONAS_FOLDER, filename)
    
    with open(file_path, 'w') as f:
        json.dump(updated_persona, f)
    
    return jsonify({'message': 'Persona updated and saved successfully', 'filename': filename})

@app.route('/add_content', methods=['POST'])
def add_content():
    new_content = request.json['content']
    
    filename = f"new_content_{len(os.listdir(app.config['DOCUMENT_FOLDER']))}.txt"
    file_path = os.path.join(app.config['DOCUMENT_FOLDER'], filename)
    with open(file_path, 'w') as f:
        f.write(new_content)
    
    ollama_agent.add_to_db(file_path)
    
    prompt = f"""Update the persona based on this new information: {new_content}"""
    updated_persona = ollama_agent.instruct(prompt)
    
    return jsonify(updated_persona)

@app.route('/get_memory', methods=['GET'])
def get_memory():
    return jsonify({'memory': ollama_agent.memory})

@app.route('/save_version', methods=['POST'])
def save_version():
    persona = request.json['persona']
    description = request.json.get('description', 'No description provided')
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"persona_{timestamp}.json"
    file_path = os.path.join(PERSONAS_FOLDER, filename)
    
    version_data = {
        'persona': persona,
        'description': description,
        'timestamp': timestamp
    }
    
    with open(file_path, 'w') as f:
        json.dump(version_data, f)
    
    return jsonify({'message': 'Version saved successfully', 'filename': filename})

@app.route('/get_versions', methods=['GET'])
def get_versions():
    versions = []
    for filename in os.listdir(PERSONAS_FOLDER):
        if filename.endswith('.json'):
            file_path = os.path.join(PERSONAS_FOLDER, filename)
            with open(file_path, 'r') as f:
                version_data = json.load(f)
            versions.append({
                'id': filename,
                'description': version_data.get('description', 'No description available'),
                'timestamp': version_data.get('timestamp', 'Unknown')
            })
    return jsonify({'versions': versions})

@app.route('/load_version/<version_id>', methods=['GET'])
def load_version(version_id):
    file_path = os.path.join(PERSONAS_FOLDER, version_id)
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            version_data = json.load(f)
        return jsonify({'persona': version_data['persona']})
    else:
        return jsonify({'error': 'Version not found'}), 404

@app.route('/get_uploaded_files', methods=['GET'])
def get_uploaded_files():
    files = os.listdir(UPLOAD_FOLDER)
    return jsonify({'files': files})

if __name__ == '__main__':
    app.run(debug=True, port=5000)