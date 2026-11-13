from sentence_transformers import SentenceTransformer, util


model = SentenceTransformer("all-MiniLM-L6-v2")


sentences = [
    "I want to learn artificial intelligence",
    "I want to study AI",
    "I like eating pizza"
]


embeddings = model.encode(sentences)


similarity_1 = util.cos_sim(
    embeddings[0],
    embeddings[1]
)

similarity_2 = util.cos_sim(
    embeddings[0],
    embeddings[2]
)


print("AI sentence similarity:", similarity_1.item())

print("AI and pizza similarity:", similarity_2.item())