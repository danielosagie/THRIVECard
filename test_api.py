# test_api.py
import requests
import json
from langchain_ollama.llms import OllamaLLM
from agent import Agent

agent = Agent

BASE_URL = "http://localhost:5000"

def test_home():
    response = requests.get(f"{BASE_URL}/")
    print("Home:", response.text)

def initialize_chroma_db():

    for i, doc in enumerate(test_docs):
        agent.add_to_db(doc, f"test_doc_{i}")

def test_generate_persona():
    data = {
        "input": "Create a persona for a software engineer",
        "selected_documents": ["Document 1 content", "Document 2 content"]
    }
    response = requests.post(f"{BASE_URL}/api/generate_persona", json=data)
    print("Generate Persona Status:", response.status_code)
    print("Generate Persona Response:", json.dumps(response.json(), indent=2))

def test_get_personas():
    response = requests.get(f"{BASE_URL}/get_personas")
    print("Get Personas:", json.dumps(response.json(), indent=2))

def test_update_document():
    data = {
        "filename": "test_doc.txt",
        "content": "This is a test document content."
    }
    response = requests.post(f"{BASE_URL}/update_document", json=data)
    print("Update Document:", response.json())

def test_get_input_documents():
    response = requests.get(f"{BASE_URL}/get_input_documents")
    print("Get Input Documents:", json.dumps(response.json(), indent=2))

if __name__ == "__main__":
    test_home()
    llm = OllamaLLM(model="llama3", base_url="http://localhost:11434")
    result = llm("Generate a brief persona for a software engineer")
    print(result)
    initialize_chroma_db()
    test_generate_persona()
    test_get_personas()
    test_update_document()
    test_get_input_documents()
