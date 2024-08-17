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

load_dotenv()

logging.basicConfig(level=logging.INFO)

OLLAMA_BASE_URL = os.getenv('OLLAMA_BASE_URL')
MODEL_NAME = os.getenv('MODEL_NAME')

BASE_DIR = 'user_data'
CHROMA_DIR = os.path.join(BASE_DIR, 'chroma_db')
DB_PATH = os.path.join(BASE_DIR, 'local_db.sqlite')

os.makedirs(CHROMA_DIR, exist_ok=True)

agent = Agent("MainAgent", CHROMA_DIR, OLLAMA_BASE_URL, MODEL_NAME)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS personas
                 (id INTEGER PRIMARY KEY, name TEXT, data JSON, timestamp TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS documents
                 (id INTEGER PRIMARY KEY, filename TEXT UNIQUE, content TEXT, timestamp TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS streaming_responses
                 (id INTEGER PRIMARY KEY, content TEXT, timestamp TEXT)''')
    conn.commit()
    conn.close()

os.makedirs(BASE_DIR, exist_ok=True)
init_db()

@app.route('/')
def home():
    return "Server is running"

@app.route('/test', methods=['GET'])
def test():
    output = agent.llm.invoke("Come up with 10 names for a song about parrots")
    return jsonify({"message": f"{output}"}), 200

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
    filename = secure_filename(data['filename'])
    content = data['content']
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''INSERT OR REPLACE INTO documents (filename, content, timestamp)
                 VALUES (?, ?, ?)''', (filename, content, datetime.now().isoformat()))
    conn.commit()
    conn.close()
    
    threading.Thread(target=agent.update_chroma_db, args=(content, filename)).start()
    
    return jsonify({'message': f'Document {filename} updated successfully. Chroma DB update started.'})

def stream_generator(input_text, documents_content):
    queue = Queue()
    def callback(token):
        queue.put(token)

    threading.Thread(target=agent.generate_stream, args=(input_text, documents_content, callback)).start()

    while True:
        token = queue.get()
        if token is None:
            break
        yield f"data: {json.dumps({'token': token})}\n\n"

@app.route('/api/generate_persona_stream', methods=['POST'])
def generate_persona_stream():
    data = request.json
    input_text = data['input']
    selected_documents = data.get('selected_documents', [])

    relevant_docs = agent.get_relevant_documents(input_text, k=5)
    all_docs = selected_documents + relevant_docs
    documents_content = ' '.join(all_docs)

    return Response(stream_with_context(stream_generator(input_text, documents_content)),
                    content_type='text/event-stream')

@app.route('/api/generate_persona', methods=['POST'])
def generate_persona():
    try:
        data = request.json
        input_text = data['input']
        selected_documents = data.get('selected_documents', [])

        relevant_docs = agent.get_relevant_documents(input_text, k=5)
        all_docs = selected_documents + relevant_docs
        documents_content = ' '.join(all_docs)

        persona_response = agent.generate(input_text, documents_content)
        
        try:
            persona = json.loads(persona_response)
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid persona format"}), 500

        with sqlite3.connect(DB_PATH) as conn:
            c = conn.cursor()
            c.execute("INSERT INTO personas (name, data, timestamp) VALUES (?, ?, ?)",
                      (persona.get('Name', 'Unnamed Persona'), json.dumps(persona), datetime.now().isoformat()))
        
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