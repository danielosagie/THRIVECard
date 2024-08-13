# THRIVECard
THRIVECard is an AI-powered tool for generating detailed persona profiles. It combines advanced language
models with a user-friendly interface to create rich, contextual character descriptions.

## Features
### AI-driven persona generation
### User-friendly web interface
### Document upload and processing
### Customizable persona attributes

## Quick Start
1. Clone the repository:
```bash
git clone https://github.com/danielosagie/THRIVECard.git
cd THRIVECard
```
2. Set up the backend:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up the frontend:
```bash
npm install
```

4. Configure environment:
Create a `.env` file in the root directory with:
```markdown
OLLAMA_BASE_URL=http://localhost:11434
MODEL_NAME=llama2
```

5. Run the application:
```bash
python app.py
```
In a new terminal:
```bash
npm run dev
```
6. Access the application at `http://localhost:5173`

## Prerequisites
* Python 3.8+
* Node.js 14+
* Ollama (installed and running)

## Development
### Backend: Flask (`app.py`)
### Frontend: React (in `src/` directory)
### AI Agent: `agent.py`

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.