
from backend.retrieval import retrieve_documents

question = "How many sick leaves are provided annually?"

source = "GGST_Annual_Leave_Policy.pdf"

results = retrieve_documents(
    question,
    top_k=5,
    source=source
)

print("\n========== DOCUMENT FILTER TEST ==========")

for index, result in enumerate(results, start=1):
    print(f"\nCHUNK {index}")
    print("SOURCE:", result["metadata"]["source"])
    print("DISTANCE:", result["distance"])
    print("TEXT:", result["text"])

print("\n========== TEST COMPLETE ==========")
