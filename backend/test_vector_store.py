from document_loader import load_txt
from chunking import split_text
from embeddings import generate_embeddings

from vector_store import store_chunks, get_collection_count


# Step 1: Load document
text = load_txt(
    "data/documents/company_policy.txt"
)


# Step 2: Split into chunks
chunks = split_text(
    text,
    chunk_size=100,
    overlap=20
)


# Step 3: Generate embeddings
embeddings = generate_embeddings(chunks)


# Step 4: Store in ChromaDB
store_chunks(
    chunks,
    embeddings,
    source="company_policy.txt"
)


# Step 5: Check database
count = get_collection_count()

print("Total records in ChromaDB:", count)