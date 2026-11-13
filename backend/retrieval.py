
from backend.embeddings import generate_embeddings
from backend.vector_store import collection


def retrieve_documents(query, top_k=3, source=None):
    # Convert the user's question into an embedding
    query_embedding = generate_embeddings([query])

    # Check whether the collection contains documents
    total_documents = collection.count()

    if total_documents == 0:
        return []

    # Build search filters
    query_filters = {}

    if source:
        query_filters["where"] = {"source": source}

    # Search ChromaDB
    results = collection.query(
        query_embeddings=query_embedding.tolist(),
        n_results=min(top_k, total_documents),
        **query_filters
    )

    retrieved_chunks = []

    for i in range(len(results["documents"][0])):
        retrieved_chunks.append({
            "id": results["ids"][0][i],
            "text": results["documents"][0][i],
            "metadata": results["metadatas"][0][i],
            "distance": results["distances"][0][i]
        })

    return retrieved_chunks
