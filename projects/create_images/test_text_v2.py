import os
import time
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    load_dotenv("../../.env")
    api_key = os.getenv("GOOGLE_API_KEY")

client = genai.Client(api_key=api_key)

model_name = "gemini-2.5-flash"

print(f"=== Testing {model_name} ===")

# Test 1: Plain Text
print("\n--- Test 1: Text Generation ---")
try:
    response = client.models.generate_content(
        model=model_name,
        contents="Explain quantum computing in one sentence."
    )
    if response.text:
        print(f"✅ Success (Text): {response.text.strip()}")
    else:
        print("❌ Failed (No text)")
except Exception as e:
    print(f"❌ Error (Text): {e}")

# Test 2: Image Generation via MIME type (if supported)
print("\n--- Test 2: Image Generation (MIME Type) ---")
try:
    response = client.models.generate_content(
        model=model_name,
        contents="A pixel art cat",
        config=types.GenerateContentConfig(
            response_mime_type="image/jpeg"
        )
    )
    if response.candidates and response.candidates[0].content.parts:
        if response.candidates[0].content.parts[0].inline_data:
            print("✅ Success (Image)!")
        else:
             print(f"⚠️ Text received instead: {response.candidates[0].content.parts[0].text[:50]}")
    else:
        print("❌ Failed (No content)")
except Exception as e:
    print(f"❌ Error (Image): {e}")
