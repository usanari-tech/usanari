import os
from google import genai
from dotenv import load_dotenv

# 環境変数の読み込み
ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(ENV_PATH):
    load_dotenv(ENV_PATH)

def test_models():
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("GOOGLE_API_KEY is missing.")
        return
        
    client = genai.Client(api_key=api_key)
    
    # 試したいモデル名のリスト (Imagen3)
    test_models = [
        "imagen-3.0-generate-002",
        "imagen-3.0-fast-generate-001"
    ]
    
    print("Testing Image Generation Models (Standard API)...")
    
    for model_name in test_models:
        print(f"\n--- Testing Model: {model_name} ---")
        try:
            print("  Method: generate_images")
            result = client.models.generate_images(
                model=model_name,
                prompt="A cute baby banana wearing sunglasses",
                config=dict(
                    number_of_images=1,
                    output_mime_type="image/jpeg",
                    aspect_ratio="1:1"
                )
            )
            if result.generated_images:
                print(f"  ✅ SUCCESS: {model_name} works with generate_images!")
            else:
                print("  ❌ SUCCESS API but no image returned.")
        except Exception as e:
            print(f"  ❌ FAILED: {str(e)[:150]}...")

if __name__ == "__main__":
    test_models()
