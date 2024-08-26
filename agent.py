import os
import json
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama.llms import OllamaLLM
from langchain_community.embeddings import OllamaEmbeddings
from langchain_chroma import Chroma
import logging

logging.basicConfig(level=logging.DEBUG)

class Agent:
    def __init__(self, name, db_path, base_url, model):
        self.name = name
        self.path = os.path.join(db_path, f"{self.name}_chroma_db")
        self.base_url = base_url
        self.model_name = model

        try:
            self.embedding_function = OllamaEmbeddings(
                model=model,
                base_url=base_url
            )
            logging.info("OllamaEmbeddings initialized successfully")
        except Exception as e:
            logging.error(f"Error initializing OllamaEmbeddings: {str(e)}")
            raise

        try:
            self.db = Chroma(persist_directory=self.path, embedding_function=self.embedding_function)
            logging.info("Chroma DB initialized successfully")
        except Exception as e:
            logging.error(f"Error initializing Chroma DB: {str(e)}")
            raise

        try:
            self.llm = OllamaLLM(model=model, base_url=base_url)
            logging.info("OllamaLLM initialized successfully")
        except Exception as e:
            logging.error(f"Error initializing OllamaLLM: {str(e)}")
            raise

        self.template = """
        Generate a detailed persona based on this input and the following documents: {input_text}
        
        Documents content: {documents}
        
        Include categories such as Name, Professional Summary, Goals, Qualifications and Education, Skills, Strengths, and Value Proposition.
        Format the response as a JSON object.
        """
        self.prompt = ChatPromptTemplate.from_template(self.template)
        self.chain = self.prompt | self.llm

    def generate_stream(self, input_text, documents_content, callback):
        try:
            full_response = ""
            for chunk in self.chain.stream({
                "input_text": input_text,
                "documents": documents_content
            }):
                full_response += chunk
                callback(chunk)
            
            # Try to parse the full response as JSON
            try:
                json_response = json.loads(full_response)
                callback(json.dumps(json_response))
            except json.JSONDecodeError:
                # If it's not valid JSON, just return the full response
                callback(full_response)
            
            return full_response
        except Exception as e:
            logging.error(f"Error generating persona stream: {str(e)}")
            raise

    def add_to_db(self, content, filename):
        try:
            self.db.add_texts(texts=[content], metadatas=[{"source": filename}])
            logging.info(f"Content added to Chroma DB: {filename}")
        except Exception as e:
            logging.error(f"Error adding content to Chroma DB: {str(e)}")
            raise

    def update_chroma_db(self, content, filename):
        try:
            self.add_to_db(content, filename)
            logging.info(f"Chroma DB updated for {filename}")
        except Exception as e:
            logging.error(f"Error updating Chroma DB for {filename}: {str(e)}")

    def get_relevant_documents(self, query, k=5):
        try:
            docs = self.db.similarity_search(query, k=k)
            return [doc.page_content for doc in docs]
        except Exception as e:
            logging.error(f"Error retrieving relevant documents: {str(e)}")
            raise