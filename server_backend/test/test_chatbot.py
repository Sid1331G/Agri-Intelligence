import requests
import json

URL = "http://127.0.0.1:5000/api/chat"  # Change if deployed

payload = {
    "message": "My tomato leaves are turning yellow. What should I do?"
}

try:
    response = requests.post(URL, json=payload)

    print("Status Code:", response.status_code)
    print("Response JSON:")
    print(json.dumps(response.json(), indent=4))

except Exception as e:
    print("❌ Request Failed:", e)