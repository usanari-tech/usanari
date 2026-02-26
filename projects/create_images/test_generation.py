import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    # Try looking in root
    load_dotenv("../../.env")
    api_key = os.getenv("GOOGLE_API_KEY")

print(f"Key: {api_key[:5]}...")

client = genai.Client(api_key=api_key)
model_name = "gemini-3-pro-image-preview"

prompt = "A futuristic city with flying cars, cyberpunk style, aspect ratio 1:1"
print(f"Generating with {model_name}...")

try:
    # Minimal call - mirroring what SHOULD be in logic.py
    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
        # No config passed
    )
    
    print("Response received!")
    if response.candidates:
        print(f"Candidates: {len(response.candidates)}")
        for part in response.candidates[0].content.parts:
            if part.inline_data:
                print("Image data found!")
            else:
                print(f"Text: {part.text}")
    else:
        print("No candidates.")

except Exception as e:
    print(f"ERROR: {e}")
