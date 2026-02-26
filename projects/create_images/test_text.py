import os
import time
from google import genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    load_dotenv("../../.env")
    api_key = os.getenv("GOOGLE_API_KEY")

client = genai.Client(api_key=api_key)

models = [
    "gemini-1.5-flash",
    "gemini-2.0-flash-exp",
]

print("=== Text Generation Test ===")

for m in models:
    print(f"\nTesting {m}...")
    try:
        response = client.models.generate_content(
            model=m,
            contents="Hello",
        )
        if response.text:
            print(f"✅ Success with {m}: {response.text.strip()}")
        else:
            print(f"❌ Failed (No text) with {m}")
    except Exception as e:
        print(f"❌ Error with {m}: {e}")
        if "429" in str(e):
             print("   -> Quota exceeded / Limit 0")
             time.sleep(1)
