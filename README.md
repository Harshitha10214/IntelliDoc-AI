IntelliDoc AI
An AI-powered document question-answering application that uses Retrieval-Augmented Generation (RAG) to answer questions from uploaded documents.

IntelliDoc AI lets users upload PDF and TXT files, retrieve relevant information through semantic search, and generate answers grounded in the uploaded content with source references.
Features
- Upload PDF and TXT documents.
- Extract text and split it into smaller chunks.
- Generate text embeddings using Sentence Transformers (all-MiniLM-L6-v2).
- Store and search document embeddings with ChromaDB.
- Retrieve relevant document chunks for a user's question.
- Generate context-aware answers using a local LLM through Ollama (qwen2.5:3b).
- Display source references with answers.
- Ask questions about a selected document or use the general chat mode.
- View and delete uploaded documents.
Technology Stack
Area	Technologies
Frontend	Next.js, React, TypeScript, Tailwind CSS
Backend	Python, FastAPI, Uvicorn
Embeddings	Sentence Transformers, all-MiniLM-L6-v2
Vector database	ChromaDB
Local LLM	Ollama, qwen2.5:3b
Document processing	PyPDF


How RAG Works
1. Upload: A PDF or TXT document is uploaded.
2. Extract: Text is extracted from the document.
3. Chunk: The text is divided into smaller, overlapping sections.
4. Embed: Sentence Transformers converts each chunk into a numerical embedding.
5. Store: ChromaDB stores the embeddings and associated document metadata.
6. Retrieve: When a question is asked, the application finds the most relevant chunks using semantic similarity.
7. Generate: The retrieved context is sent to the local LLM through Ollama to generate a grounded response.
8. Cite: The application returns the answer with source information.
Project Structure
IntelliDoc-AI/
├── backend/
│   ├── chunking.py
│   ├── document_loader.py
│   ├── embeddings.py
│   ├── llm.py
│   ├── main.py
│   ├── rag_pipeline.py
│   ├── retrieval.py
│   ├── vector_store.py
│   └── ...
├── frontend/
│   ├── app/
│   ├── public/
│   ├── package.json
│   └── ...
├── data/
│   ├── documents/       # Uploaded documents (not committed)
│   └── chroma_db/       # Generated vector database (not committed)
├── requirements.txt
└── README.md
Prerequisites
Install the following before running the application:
- Python 3.11
- Node.js and npm
- Ollama
Run Locally
1. Clone the repository
git clone https://github.com/Harshitha10214/IntelliDoc-AI.git
cd IntelliDoc-AI
2. Set up the Python backend
Create and activate a virtual environment from the project root.

Windows PowerShell:
python -m venv venv
.\venv\Scripts\Activate.ps1
Install the Python dependencies:
pip install -r requirements.txt
Start the FastAPI backend from the project root:
uvicorn backend.main:app --reload
The backend should be available at http://localhost:8000 (unless configured differently).
3. Set up Ollama
Install and start Ollama, then download the model used by the application:
ollama pull qwen2.5:3b
Make sure the Ollama service is running while using the application.
4. Set up the frontend
Open a second terminal:
cd frontend
npm install
npm run dev
Open http://localhost:3000 in your browser.
The frontend must be configured to call the backend's local API address. If you change the backend host or port, update the API base URL in the frontend configuration/code accordingly.

Notes
- The first run of the embedding model may take additional time because the model may need to be downloaded.
- Uploaded documents and the generated ChromaDB data are intentionally excluded from version control.
- Do not commit API keys, .env files, private documents, virtual environments, node_modules, or generated build/database folders.
- This project uses a local Ollama model; ensure Ollama is installed and running before asking questions.
Future Improvements
- Add authentication and user-specific document collections.
- Improve document parsing for additional file formats.
- Add configurable chunking and retrieval settings.
- Add automated backend and frontend tests.
- Deploy the frontend and backend with persistent vector storage.
Author
Harshitha Goud

GitHub: Harshitha10214

Project repository: IntelliDoc AI
