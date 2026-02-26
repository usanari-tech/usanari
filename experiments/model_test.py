import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
import time

# Load env from project root or current dir
load_dotenv(".env")
load_dotenv("projects/create_images/.env")

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("No API Key found")
    exit(1)

client = genai.Client(api_key=api_key)

def test_gemini_content(model_name):
    print(f"\n--- Testing {model_name} (generate_content) ---")
    try:
        response = client.models.generate_content(
            model=model_name,
            contents="A cute tiny banana mascot, pixel art",
            config=types.GenerateContentConfig(
                response_mime_type="image/jpeg"
            )
        )
        if response.candidates and response.candidates[0].content.parts:
            print("✅ SUCCESS! Image generated.")
            return True
        else:
            print("❌ Failed: No content.")
    except Exception as e:
        print(f"❌ Error: {e}")
    return False

def test_imagen_predict(model_name):
    print(f"\n--- Testing {model_name} (generate_images) ---")
    try:
        response = client.models.generate_images(
            model=model_name,
            prompt="A cute tiny banana mascot, pixel art",
            config=types.GenerateImagesConfig(
                number_of_images=1
            )
        )
        if response.generated_images:
            print("✅ SUCCESS! Image generated.")
            return True
        else:
            print("❌ Failed: No images.")
    except Exception as e:
        print(f"❌ Error: {e}")
    return False

# 1. Try Gemini 2.0 Flash Exp (Likely Free)
test_gemini_content("gemini-2.0-flash-exp-image-generation")

# 2. Try Imagen 4 (Preview)
test_imagen_predict("imagen-4.0-generate-001")

# 3. Try Gemini 2.5 Flash again (Just to see)
test_gemini_content("gemini-2.5-flash-image")
