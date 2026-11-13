from embeddings import generate_embeddings


sentences = [
    "I want to learn artificial intelligence",
    "I want to study AI",
    "I like eating pizza"
]


embeddings = generate_embeddings(sentences)


print("Number of sentences:", len(sentences))

print("Embedding shape:", embeddings.shape)

print("\nFirst sentence embedding:")

print(embeddings[0])

print("\nVector dimensions:", len(embeddings[0]))