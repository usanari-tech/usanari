import os
import time
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    load_dotenv("../../.env")
    api_key = os.getenv("GOOGLE_API_KEY")

client = genai.Client(api_key=api_key)

print("=== Definitive Model List ===")
print(f"Time: {time.ctime()}")

try:
    # List all models
    models = list(client.models.list())
    
    # Sort for easier reading
    models.sort(key=lambda x: x.name)

    print(f"Total Models Found: {len(models)}")
    
    for m in models:
        print(f"\nName: {m.name}")
        print(f"Display Name: {m.display_name}")
        if hasattr(m, 'supported_actions'):
            print(f"Supported Actions: {m.supported_actions}")
        if hasattr(m, 'version'):
             print(f"Version: {m.version}")
        if hasattr(m, 'description'):
             print(f"Description: {m.description}")

except Exception as e:
    print(f"Error listing models: {e}")
