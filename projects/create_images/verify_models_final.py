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

# The last hope: Standard Gemini 2.0 Flash Exp (sometimes has image capability?)
# and verifying the exact 2.5 flash image again just in case.
candidates = [
    "gemini-2.0-flash-exp", 
    "gemini-2.5-flash-image" 
]

print("=== Final check for ANY working model ===")

for model_name in candidates:
    print(f"\nTesting: {model_name}")
    try:
        # For 2.0 Flash Exp, we try the "text to image" implicit mode or simple generateContent
        response = client.models.generate_content(
            model=model_name,
            contents="Generate an image of a pixel art apple.",
            config=types.GenerateContentConfig(
                response_mime_type="image/jpeg" if "exp" in model_name else None
            )
        )
        
        if response.candidates and response.candidates[0].content.parts:
            part = response.candidates[0].content.parts[0]
            if part.inline_data:
                print(f"✅ Success! Image received from {model_name}")
            else:
                 print(f"⚠️ Text received from {model_name}: {part.text[:100]}...")
        else:
            print(f"❌ No content from {model_name}")
            
    except Exception as e:
         print(f"❌ Error with {model_name}: {e}")
