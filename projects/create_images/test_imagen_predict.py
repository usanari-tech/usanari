import os
import io
from google import genai
from google.genai import types
from PIL import Image
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    load_dotenv("../../.env")
    api_key = os.getenv("GOOGLE_API_KEY")

client = genai.Client(api_key=api_key)

# Models actually listed in debug_api.py
models_to_test = [
    "imagen-4.0-fast-generate-001",
    "imagen-4.0-generate-001",
    "imagen-4.0-generate-preview-06-06"
]

print("=== Starting Imagen 4 Verification ===")

for model_name in models_to_test:
    print(f"\nTesting {model_name}...")
    try:
        response = client.models.generate_images(
            model=model_name,
            prompt="A small blue bird, pixel art",
            config=types.GenerateImagesConfig(
                number_of_images=1,
            )
        )
        if response.generated_images:
            print(f"✅ Success with {model_name}!")
            break
        else:
            print(f"❌ No images returned from {model_name}.")
            
    except Exception as e:
        print(f"❌ Error with {model_name}: {e}")
