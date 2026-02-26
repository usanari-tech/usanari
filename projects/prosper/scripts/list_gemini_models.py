import os
import json
import urllib.request
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
api_key = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY"))

if not api_key:
    print("Error: GEMINI_API_KEY and GOOGLE_API_KEY not found in .env")
    exit(1)

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

req = urllib.request.Request(url)
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        
        models = data.get("models", [])
        
        print(f"Total models returned: {len(models)}")
        
        for m in models:
            if "generateContent" in m.get("supportedGenerationMethods", []):
                print(f"- **Name**: `{m.get('name')}`")
                print(f"  **Display Name**: {m.get('displayName')}")
                print(f"  **Version**: {m.get('version')}")
                print(f"  **Input Token Limit**: {m.get('inputTokenLimit')}")
                print(f"  **Output Token Limit**: {m.get('outputTokenLimit')}")
                print(f"  **Description**: {m.get('description', 'N/A')}")
                print("---")

except Exception as e:
    print(f"Error calling API: {e}")
