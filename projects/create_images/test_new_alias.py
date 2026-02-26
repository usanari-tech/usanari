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

model_name = "nano-banana-pro-preview"

print(f"=== Testing New Alias: {model_name} ===")

try:
    response = client.models.generate_content(
        model=model_name,
        contents="A small green apple, pixel art",
    )
    
    if response.candidates and response.candidates[0].content.parts:
        part = response.candidates[0].content.parts[0]
        if part.inline_data:
            print(f"✅ Success! Image received from {model_name}")
        else:
                print(f"⚠️ Text received from {model_name}: {part.text[:50]}...")
    else:
        print(f"❌ No content from {model_name}")
        
except Exception as e:
    print(f"❌ Error: {e}")
