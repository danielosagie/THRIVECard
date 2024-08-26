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

UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'doc', 'docx'}

os.makedirs(CHROMA_DIR, exist_ok=True)

agent = Agent("MainAgent", CHROMA_DIR, OLLAMA_BASE_URL, MODEL_NAME)

load_dotenv('.env.local') 

app = Flask(__name__)

FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

CORS(app, resources={r"/*": {
    "origins": FRONTEND_URL,
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', FRONTEND_URL)
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS personas
                 (id INTEGER PRIMARY KEY, 
                  name TEXT, 
                  data JSON, 
                  timestamp TEXT,
                  professional_summary TEXT,
                  goals TEXT,
                  qualifications_and_education TEXT,
                  skills TEXT,
                  strengths TEXT,
                  value_proposition TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS documents
                 (id INTEGER PRIMARY KEY, 
                  filename TEXT UNIQUE, 
                  content TEXT, 
                  timestamp TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS streaming_responses
                 (id INTEGER PRIMARY KEY, 
                  content TEXT, 
                  timestamp TEXT)''')
    conn.commit()
    conn.close()

os.makedirs(BASE_DIR, exist_ok=True)
init_db()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def home():
    return "Server is running"

@app.route('/set_input_form', methods=['POST'])
def set_input_form():
    data = request.json
    filename = secure_filename(data['name'])
    content = json.dumps(data['content'])
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''INSERT OR REPLACE INTO documents (filename, content, timestamp)
                 VALUES (?, ?, ?)''', (filename, content, datetime.now().isoformat()))
    document_id = c.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({'message': f'Input form saved successfully', 'id': document_id})

@app.route('/get_input/<int:document_id>', methods=['GET'])
def get_input(document_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT content FROM documents WHERE id = ?", (document_id,))
    result = c.fetchone()
    conn.close()
    
    if result:
        return jsonify({'content': json.loads(result[0])})
    else:
        return jsonify({'error': 'Input not found'}), 404

@app.route('/set_response', methods=['POST'])
def set_response():
    data = request.json
    content = json.dumps(data['content'])
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''INSERT INTO streaming_responses (content, timestamp)
                 VALUES (?, ?)''', (content, datetime.now().isoformat()))
    response_id = c.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Response saved successfully', 'id': response_id})

@app.route('/remove_file', methods=['POST'])
def remove_file():
    try:
        data = request.json
        filename = secure_filename(data['filename'])
        file_path = os.path.join(UPLOAD_FOLDER, filename)

        # Remove file from the file system
        if os.path.exists(file_path):
            os.remove(file_path)
        else:
            return jsonify({"error": "File not found on server"}), 404

        # Remove file entry from the database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM documents WHERE filename = ?", (filename,))
        conn.commit()
        conn.close()

        return jsonify({"message": f"File {filename} removed successfully"}), 200
    except KeyError:
        return jsonify({"error": "Filename not provided"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/upload_file', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Store file info in the database
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('''INSERT INTO documents (filename, content, timestamp)
                     VALUES (?, ?, ?)''', (filename, '', datetime.now().isoformat()))
        file_id = c.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'File uploaded successfully', 'id': file_id, 'filename': filename})
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/get_uploaded_files', methods=['GET'])
def get_uploaded_files():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, filename, timestamp FROM documents ORDER BY timestamp DESC")
    files = [{'id': row[0], 'filename': row[1], 'timestamp': row[2]} for row in c.fetchall()]
    conn.close()
    return jsonify({'files': files})


@app.route('/generate_persona_stream', methods=['POST'])
def generate_persona_stream():
    app.logger.info("Received request for generate_persona_stream")
    data = request.json
    app.logger.info(f"Request data: {data}")
    input_text = data['input']
    selected_document_ids = data.get('selected_documents', [])

    def generate():
        persona = {}
        def callback(chunk):
            nonlocal persona
            app.logger.info(f"Generated chunk: {chunk}")
            try:
                chunk_data = json.loads(chunk)
                persona.update(chunk_data)
                yield f"data: {json.dumps({'token': chunk})}\n\n"
            except json.JSONDecodeError:
                yield f"data: {json.dumps({'token': chunk})}\n\n"

        try:
            app.logger.info("Starting persona generation")
            agent.generate_stream(input_text, "", callback)
            app.logger.info("Persona generation completed")

            # Store the streaming response
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute('''INSERT INTO streaming_responses (content, timestamp)
                         VALUES (?, ?)''', (json.dumps(persona), datetime.now().isoformat()))
            streaming_response_id = c.lastrowid

            # Store the structured persona data
            c.execute('''INSERT INTO personas_new (name, professional_summary, goals, 
                         qualifications_and_education, skills, strengths, value_proposition, timestamp)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                      (persona.get('Name', 'Unnamed'),
                       persona.get('Professional Summary', ''),
                       json.dumps(persona.get('Goals', [])),
                       json.dumps(persona.get('Qualifications and Education', [])),
                       json.dumps(persona.get('Skills', [])),
                       json.dumps(persona.get('Strengths', [])),
                       json.dumps(persona.get('Value Proposition', [])),
                       datetime.now().isoformat()))
            persona_id = c.lastrowid
            conn.commit()
            conn.close()

            app.logger.info(f"Persona stored with ID: {persona_id}")
            yield f"data: {json.dumps({'complete': True, 'persona_id': persona_id})}\n\n"
        except Exception as e:
            app.logger.error(f"Error in generate_persona_stream: {str(e)}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return Response(stream_with_context(generate()), content_type='text/event-stream')


@app.route('/get_current_input/<int:document_id>', methods=['GET'])
def get_current_input(document_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT content FROM documents WHERE id = ?", (document_id,))
    result = c.fetchone()
    conn.close()
    
    if result:
        content = json.loads(result[0])
        return jsonify(content)
    else:
        return jsonify({'error': 'Input not found'}), 404

@app.route('/set_new_input/<int:document_id>', methods=['POST'])
def set_new_input(document_id):
    data = request.json
    content = json.dumps(data)
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("UPDATE documents SET content = ?, timestamp = ? WHERE id = ?",
              (content, datetime.now().isoformat(), document_id))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Input updated successfully'})

@app.route('/get_current_persona/<int:persona_id>', methods=['GET'])
def get_current_persona(persona_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        SELECT name, professional_summary, goals, qualifications_and_education,
               skills, strengths, value_proposition
        FROM personas WHERE id = ?
    """, (persona_id,))
    result = c.fetchone()
    conn.close()
    
    if result:
        return jsonify({
            'name': result[0],
            'professional_summary': result[1],
            'goals': json.loads(result[2]),
            'qualifications_and_education': json.loads(result[3]),
            'skills': json.loads(result[4]),
            'strengths': json.loads(result[5]),
            'value_proposition': json.loads(result[6])
        })
    else:
        return jsonify({'error': 'Persona not found'}), 404

@app.route('/update_persona/<int:persona_id>', methods=['POST'])
def update_persona(persona_id):
    data = request.json
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute("""
        UPDATE personas SET
            name = ?,
            professional_summary = ?,
            goals = ?,
            qualifications_and_education = ?,
            skills = ?,
            strengths = ?,
            value_proposition = ?,
            data = ?,
            timestamp = ?
        WHERE id = ?
    """, (
        data.get('name'),
        data.get('professional_summary'),
        json.dumps(data.get('goals', [])),
        json.dumps(data.get('qualifications_and_education', [])),
        json.dumps(data.get('skills', [])),
        json.dumps(data.get('strengths', [])),
        json.dumps(data.get('value_proposition', [])),
        json.dumps(data),
        datetime.now().isoformat(),
        persona_id
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Persona updated successfully'})

@app.route('/get_personas', methods=['GET'])
def get_personas():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, name, timestamp FROM personas ORDER BY timestamp DESC")
    personas = [{'id': row[0], 'name': row[1], 'timestamp': row[2]} for row in c.fetchall()]
    conn.close()
    
    return jsonify({'personas': personas})

if __name__ == '__main__':
    port = int(os.environ.get('FLASK_RUN_PORT', 5000))
    try:
        app.run(debug=True, port=port)
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"Port {port} is already in use. Please choose a different port or close the application using this port.")
        else:
            print(f"An error occurred: {e}")
        exit(1)