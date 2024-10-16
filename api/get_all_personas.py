from api.serverless_app import VercelHandler, persona_collection
import json

class handler(VercelHandler):
    def do_GET(self):
        try:
            results = persona_collection.get()
            personas = []
            for doc, metadata in zip(results['documents'], results['metadatas']):
                persona = json.loads(doc)
                persona['id'] = metadata['id']
                personas.append(persona)
            self.send_response_json(personas)
        except Exception as e:
            self.send_response_json({'error': str(e)}, 500)
