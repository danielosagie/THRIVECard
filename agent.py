import os
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import TextLoader, PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.llms import HuggingFaceEndpoint
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
import json

class Agent:
    def __init__(self, name, db_path, endpoint_url, api_token=None):
        self.name = name
        self.persona = ""
        self.memory = ""
        self.conversation_history = ""
        self.path = f"{db_path}/{self.name}_chroma_db"
        
        self.embeddings = HuggingFaceEmbeddings()
        
        if os.path.exists(self.path):
            self.db = Chroma(persist_directory=self.path, embedding_function=self.embeddings)
        else:
            self.db = Chroma(persist_directory=self.path, embedding_function=self.embeddings)
            self.db.persist()

        self.llm = HuggingFaceEndpoint(
            endpoint_url=endpoint_url,
            huggingfacehub_api_token=api_token,
            max_new_tokens=1024,
            top_k=10,
            top_p=0.95,
            typical_p=0.95,
            temperature=0.01,
            repetition_penalty=1.03,
            streaming=True,
        )

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

    def _get_documents(self, query, k=5):
        if self.db is None:
            return []
        
        docs = self.db.similarity_search(query, k)
        return [doc.page_content for doc in docs]

    def _update_memory(self, response):
        self.memory += f"\n{response}"

    def _update_conv(self, instruction, response):
        self.conversation_history += f"\nUser: {instruction}\nAI: {response}"

    def instruct(self, instruction):
        docs = self._get_documents(instruction, k=5)
        
        response = self.chain.run(
            name=self.name,
            instruction=instruction,
            memory=self.memory,
            conversation_history=self.conversation_history,
            documents=docs
        )

        self._update_conv(instruction, response)
        self._update_memory(response)

        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {"error": "Failed to generate valid JSON response"}

    def add_to_db(self, document_path):
        if document_path.lower().endswith('.pdf'):
            loader = PDFLoader(document_path)
        else:
            loader = TextLoader(document_path)
        
        docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)
        self.db.add_documents(splits)
        self.db.persist()
        return "File Successfully Uploaded."