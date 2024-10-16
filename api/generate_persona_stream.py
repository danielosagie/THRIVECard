from http.server import BaseHTTPRequestHandler
from api.serverless_app import VercelHandler, Groq, parse_generated_persona, store_persona_in_chroma
import os
import json
from datetime import datetime

def handler(request, response):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            api_key = os.environ.get("GROQ_API_KEY")
            model = "llama3-8b-8192"
            creativity = float(data.get('creativity', 0.5))
            realism = float(data.get('realism', 0.5))
            custom_prompt = data.get('custom_prompt', 'Generate a persona based on the given information.')

            client = Groq(api_key=api_key)

            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": custom_prompt},
                    {"role": "user", "content": json.dumps(data)}
                ],
                model=model,
                temperature=creativity,
                max_tokens=7000,
                top_p=realism,
                stream=True
            )

            def generate():
                generated_persona = ''
                for chunk in chat_completion:
                    if chunk.choices[0].delta.content is not None:
                        content = chunk.choices[0].delta.content
                        generated_persona += content
                        yield f"data: {content}\n\n"

                persona_data = parse_generated_persona(generated_persona)
                full_persona_data = {
                    **data,
                    **persona_data,
                    'generated_text': generated_persona,
                    'timestamp': datetime.now().isoformat()
                }
                persona_id = store_persona_in_chroma(full_persona_data)
                yield f"data: {{\"persona_id\": \"{persona_id}\"}}\n\n"

            response.status_code = 200
            response.headers['Content-Type'] = 'text/event-stream'
            response.headers['Cache-Control'] = 'no-cache'
            response.headers['Connection'] = 'keep-alive'
            response.body = generate()

        except Exception as e:
            response.status_code = 500
            response.headers['Content-Type'] = 'application/json'
            response.body = json.dumps({'error': str(e)})

    else:
        response.status_code = 405
        response.headers['Content-Type'] = 'application/json'
        response.body = json.dumps({'error': 'Method not allowed'})

    return response
