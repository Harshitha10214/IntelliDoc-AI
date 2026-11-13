
from rag_pipeline import ask_question

questions = [
    "How many sick leaves are allowed?",
    "What are the working hours?",
    "Who approves work from home requests?",
    "What is the company's maternity leave policy?"
]

for question in questions:

    print("\n" + "=" * 60)
    print("QUESTION:", question)
    print("=" * 60)

    result = ask_question(question)

    print("\nAI ANSWER:")
    print(result["answer"])

    print("\nSOURCES:")
    print(result["sources"])
