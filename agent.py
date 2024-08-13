import os
from langchain_community.llms import Ollama
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_community.embeddings import OllamaEmbeddings
from langchain_chroma import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
import json
import logging

logging.basicConfig(level=logging.DEBUG)

class Agent:
    def __init__(self, name, db_path, base_url, model):
       self.name = name
       self.persona = ""
       self.memory = ""
       self.conversation_history = ""
       self.path = os.path.join(db_path, f"{self.name}_chroma_db")
       
       logging.info(f"Initializing Agent with base_url: {base_url}, model: {model}")
       
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
           self.llm = Ollama(
               model=model,
               base_url=base_url
           )
           logging.info("Ollama LLM initialized successfully")
       except Exception as e:
           logging.error(f"Error initializing Ollama LLM: {str(e)}")
           raise

       self.prompt = PromptTemplate(
           input_variables=["instruction", "memory", "conversation_history", "documents"],
           template="""Your name is {name}. You are to keep all your responses concise. Respond to the instruction. You will also be provided your memory and your conversation history.
       
           Memory: {memory}
           
           Conversation history: {conversation_history}
           
           You are a helpful Chatbot. You will be given a User Instruction to respond to. Here is some information that may help you with your response: {documents}

           User Instruction: {instruction}.

           Respond in JSON format with the following structure:
           {{
               "Name": "User's name",
               "Description": "A brief description of the persona",
               "Goals": ["Goal 1", "Goal 2", ...],
               "Life Experiences": ["Experience 1", "Experience 2", ...],
               "Qualifications and Education": ["Qualification 1", "Qualification 2", ...],
               "Skills": ["Skill 1", "Skill 2", ...],
               "Strengths": ["Strength 1", "Strength 2", ...],
               "Value Proposition": ["Value 1", "Value 2", ...]
           }}
           """
       )

       self.chain = LLMChain(llm=self.llm, prompt=self.prompt)

    def _update_memory(self, response):
        self.memory += f"\n{response}"

    def _update_conv(self, instruction, response):
        self.conversation_history += f"\nUser: {instruction}\nAI: {response}"

    def generate(self, instruction):
        logging.info(f"Generating response for instruction: {instruction}")
        try:
            docs = self._get_documents(instruction, k=5)
            
            response = self.chain.run(
                name=self.name,
                instruction=instruction,
                memory=self.memory,
                conversation_history=self.conversation_history,
                documents=docs
            )

            logging.info(f"Generated response: {response}")

            self._update_conv(instruction, response)
            self._update_memory(response)

            try:
                return json.loads(response)
            except json.JSONDecodeError:
                logging.error(f"Failed to parse JSON response: {response}")
                return {"error": "Failed to generate valid JSON response"}
        except Exception as e:
            logging.error(f"Error in generate method: {str(e)}")
            return {"error": str(e)}

    def add_to_db(self, content, filename):
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=20)
        texts = text_splitter.split_text(content)
        metadatas = [{"source": filename}] * len(texts)
        self.db.add_texts(texts=texts, metadatas=metadatas)
        return "Content Successfully Added to DB."

    def _get_documents(self, query, k=5):
        if self.db is None:
            return []
        
        docs = self.db.similarity_search(query, k=k)
        return [doc.page_content for doc in docs]