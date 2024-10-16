from api.serverless_app import VercelHandler, persona_collection
import json

class handler(VercelHandler):
    def do_GET(self):
        persona_id = self.path.split('/')[-1]
        try:
            results = persona_collection.get(ids=[persona_id])
            if results['documents']:
                persona_data = json.loads(results['documents'][0])
                self.send_response_json(persona_data)
            else:
                self.send_response_json({'error': 'Persona not found'}, 404)
        except Exception as e:
            self.send_response_json({'error': str(e)}, 500)
