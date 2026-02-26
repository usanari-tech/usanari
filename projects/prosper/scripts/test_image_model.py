import os
import json
import urllib.request
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
api_key = os.getenv("GOOGLE_API_KEY", os.getenv("GEMINI_API_KEY"))

model_name = "models/gemini-2.5-flash-image"
url = f"https://generativelanguage.googleapis.com/v1beta/{model_name}:generateContent?key={api_key}"

payload = {
    "contents": [{
        "parts": [{"text": "Generate a picture of a cute cat"}]
    }]
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        print("Success! Image generation API works on free tier:")
        print(json.dumps(result, indent=2)[:500] + "...(truncated)")
except urllib.error.HTTPError as e:
    error_body = e.read().decode('utf-8')
    print(f"HTTPError {e.code}: {e.reason}")
    print(f"Details: {error_body}")
except Exception as e:
    print(f"Unexpected error: {e}")
