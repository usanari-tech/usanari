import os
import time
from google import genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    # Try loading from root if local not found
    load_dotenv("../../.env")
    api_key = os.getenv("GOOGLE_API_KEY")

client = genai.Client(api_key=api_key)

models_to_test = [
    "gemini-2.0-flash-exp-image-generation",
    "gemini-2.5-flash-image",
    "gemini-3-pro-image-preview",
    "imagen-3.0-generate-001",
    "imagen-4.0-generate-preview-06-06",
]

print("=== Starting Model Verification ===")

for model_name in models_to_test:
    print(f"\nTesting model: {model_name}")
    try:
        response = client.models.generate_content(
            model=model_name,
            contents="A small red apple, pixel art",
        )
        
        if response.candidates and response.candidates[0].content.parts:
            print(f"✅ Success with {model_name}!")
            # Check if it's actually an image
            if response.candidates[0].content.parts[0].inline_data:
                print("   -> Image data received.")
            else:
                print(f"   -> Text received (unexpected): {response.candidates[0].content.parts[0].text}")
            break # Stop after first success
        else:
            print(f"❌ No content returned from {model_name}")
            
    except Exception as e:
        print(f"❌ Failed with {model_name}: {e}")
        if "429" in str(e):
            print("   -> Quota exceeded. Waiting 2 seconds...")
            time.sleep(2)
