from document_loader import load_txt
from chunking import split_text

file_path = "data/documents/company_policy.txt"

text = load_txt(file_path)

chunks = split_text(
    text,
    chunk_size=100,
    overlap=20
)

print("Total Chunks:", len(chunks))

for index, chunk in enumerate(chunks):

    print(f"\nChunk {index + 1}:")
    print(chunk)