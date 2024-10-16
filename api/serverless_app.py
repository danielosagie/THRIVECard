import os
import json
from http.server import BaseHTTPRequestHandler
from groq import Groq
import chromadb
from chromadb.config import Settings

# Initialize ChromaDB
CHROMA_DIR = '/tmp/chroma_db'
os.makedirs(CHROMA_DIR, exist_ok=True)
chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)
persona_collection = chroma_client.get_or_create_collection(name="personas")

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

class VercelHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        return json.loads(post_data.decode('utf-8'))

    def send_response_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
