from document_loader import load_txt
from chunking import split_text
from embeddings import generate_embeddings


# Step 1: Load document
text = load_txt("data/documents/company_policy.txt")


# Step 2: Split document
chunks = split_text(text, chunk_size=100, overlap=20)


# Step 3: Generate embeddings
embeddings = generate_embeddings(chunks)


# Step 4: Display results
print("Total chunks:", len(chunks))

print("Total embeddings:", len(embeddings))

print("Dimensions per embedding:", len(embeddings[0]))