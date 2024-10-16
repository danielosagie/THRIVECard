from api.serverless_app import VercelHandler, persona_collection
import json

class handler(VercelHandler):
    def do_PUT(self):
        persona_id = self.path.split('/')[-1]
        data = self.do_POST()
        try:
            existing_data = json.loads(persona_collection.get(ids=[persona_id])['documents'][0])
            updated_data = {**existing_data, **data}
            persona_collection.update(
                ids=[persona_id],
                documents=[json.dumps(updated_data)],
                metadatas=[{"type": "persona"}]
            )
            self.send_response_json({'message': 'Persona updated successfully'})
        except Exception as e:
            self.send_response_json({'error': str(e)}, 500)
