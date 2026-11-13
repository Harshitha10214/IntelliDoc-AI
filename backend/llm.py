
import requests

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "qwen2.5:3b"


def generate_answer(question, context):

    prompt = f"""
    Answer the user's question using ONLY the context below.

    If the answer is not available in the context,
    clearly say that the information is not available
    in the provided documents.

    Context:
    {context}

    User Question:
    {question}

    Answer:
    """

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL_NAME,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "stream": False
        },
        timeout=180
    )

    response.raise_for_status()

    result = response.json()

    return result["message"]["content"]



def generate_general_answer(question):
    prompt = f"""
    You are IntelliDoc AI, a helpful AI assistant.

    Answer the user's question clearly and accurately.
    If you are unsure about something, say so.

    User Question:
    {question}

    Answer:
    """

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL_NAME,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "stream": False
        },
        timeout=180
    )

    response.raise_for_status()

    result = response.json()

    return result["message"]["content"]

