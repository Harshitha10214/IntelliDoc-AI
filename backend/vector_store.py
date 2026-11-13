import chromadb


# Create a persistent ChromaDB client
client = chromadb.PersistentClient(
    path="data/chroma_db"
)


# Create or access our collection
collection = client.get_or_create_collection(
    name="company_documents",
    metadata={"hnsw:space": "cosine"}
)



def store_chunks(chunks, embeddings, source):
    # Remove previously stored chunks from this document
    collection.delete(
        where={"source": source}
    )

    ids = [f"{source}_{i}" for i in range(len(chunks))]

    metadatas = [
        {"source": source, "chunk_number": i}
        for i in range(len(chunks))
    ]

    collection.upsert(
        ids=ids,
        documents=chunks,
        embeddings=embeddings.tolist(),
        metadatas=metadatas
    )

    print(f"Successfully stored {len(chunks)} chunks!")



def get_collection_count():

    return collection.count()


def delete_document(source):
    collection.delete(where={"source": source})
    print(f"Deleted document chunks for: {source}")