import requests
import json
import random
import string

def random_string(length=10):
    return ''.join(random.choices(string.ascii_lowercase, k=length))

url = "http://127.0.0.1:8000/api/auth/register/"
headers = {"Content-Type": "application/json"}
# Valid data
data = {
    "username": f"testuser_{random_string()}",
    "email": f"testuser_{random_string()}@example.com",
    "password": "password123"
}

try:
    response = requests.post(url, headers=headers, data=json.dumps(data))
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"An error occurred: {e}")
