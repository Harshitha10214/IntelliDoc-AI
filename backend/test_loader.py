from document_loader import load_txt

file_path = "data/documents/company_policy.txt"

text = load_txt(file_path)

print("Extracted Document Content:")
print("---------------------------")
print(text)