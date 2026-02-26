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

# Test cases: (Model Name, Config/MimeType Description)
test_cases = [
    ("gemini-2.0-flash", "Default (Text default)"),
    ("gemini-2.0-flash", "image/jpeg"),
    ("gemini-2.0-flash-exp", "image/jpeg"),
    ("gemini-1.5-flash", "image/jpeg"),
]

print("=== Starting Variation Testing ===")

for model_name, mime_type in test_cases:
    print(f"\nTesting {model_name} with {mime_type}...")
    try:
        config = None
        if mime_type != "Default (Text default)":
            config = types.GenerateContentConfig(
                response_mime_type=mime_type
            )
            
        response = client.models.generate_content(
            model=model_name,
            contents="Generate a small pixel art of a cat.",
            config=config
        )
        
        if response.candidates and response.candidates[0].content.parts:
            part = response.candidates[0].content.parts[0]
            if part.inline_data:
                 print(f"✅ Success! Image received from {model_name} ({mime_type})")
            else:
                 print(f"⚠️ Text received: {part.text[:50]}...")
        else:
            print("❌ No content.")
            
    except Exception as e:
        print(f"❌ Failed: {e}")
        if "429" in str(e):
            print("   -> Quota exceeded / Limit 0")
            time.sleep(1) 
