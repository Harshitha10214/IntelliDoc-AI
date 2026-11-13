from retrieval import retrieve_documents


questions = [
    "How many sick leaves are allowed?",
    "What are the working hours?",
    "Who approves work from home requests?"
]


for question in questions:

    print("\n" + "=" * 60)

    print("QUESTION:", question)

    print("=" * 60)

    results = retrieve_documents(question, top_k=3)

    for index, result in enumerate(results):

        print(f"\nResult {index + 1}")

        print("Chunk ID:", result["id"])

        print("Content:", result["text"])

        print("Source:", result["metadata"]["source"])

        print("Distance:", result["distance"])