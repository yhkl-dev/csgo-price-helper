import json

with open("./730.json", encoding="utf-8") as f:
    data = json.loads(f.read())
converted_data = {key: str(value) for key, value in data.items()}

converted_json_str = json.dumps(converted_data, indent=2, ensure_ascii=False)

print(converted_json_str)

with open("./string_730.json", "a+", encoding="utf-8") as f1:
    f1.write(converted_json_str)