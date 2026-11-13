
from backend.retrieval import retrieve_documents
from backend.llm import generate_answer, generate_general_answer


def ask_question(question, source=None, mode="documents"):

    # GENERAL CHAT MODE
    if mode == "general":
        answer = generate_general_answer(question)

        return {
            "answer": answer,
            "sources": [],
            "mode": "general"
        }

    # DOCUMENT CHAT MODE
    retrieved_chunks = retrieve_documents(
        question,
        top_k=5,
        source=source
    )

    if not retrieved_chunks:
        return {
            "answer": "No relevant information was found in the selected document.",
            "sources": [],
            "mode": "documents"
        }

    context = "\n\n".join(
        chunk["text"] for chunk in retrieved_chunks
    )

    answer = generate_answer(question, context)

    sources = list(dict.fromkeys(
        chunk["metadata"]["source"]
        for chunk in retrieved_chunks
    ))

    return {
        "answer": answer,
        "sources": sources,
        "mode": "documents"
    }
