import os
from google import genai
from dotenv import load_dotenv

# Load from local or root .env
load_dotenv()
if not os.getenv("GOOGLE_API_KEY"):
    load_dotenv("../../.env")

api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("ERROR: GOOGLE_API_KEY not found in environment.")
    exit(1)

print(f"API Key found: {api_key[:5]}...{api_key[-5:]}")

try:
    client = genai.Client(api_key=api_key)
    print("Client initialized. Listing models...")
    
    # List models using the new SDK
    # The new SDK might use client.models.list() returning an iterator
    pager = client.models.list()
    
    print("\n=== Available Image Models ===")
    found_imagen = False
    for model in pager:
        # Check for image capabilities or naming
        name = model.name.lower()
        if "image" in name or "imen" in name or "veo" in name:
            print(f"- {model.name}")
            print(f"  Display Name: {model.display_name}")
            print(f"  Supported Actions: {model.supported_actions}")
            found_imagen = True
            
    print("\n=== All Models (First 20) ===")
    for i, model in enumerate(client.models.list()):
        if i >= 20: break
        print(f"- {model.name}")

except Exception as e:
    print(f"Connection failed: {e}")
