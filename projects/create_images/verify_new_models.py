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
    
    # 試したいモデル名のリスト (最新のリストから抽出)
    test_models = [
        "imagen-4.0-generate-001",
        "imagen-4.0-fast-generate-001",
        "gemini-2.5-flash"
    ]
    
    print("Testing Image Generation Models...")
    
    for model_name in test_models:
        print(f"\n--- Testing Model: {model_name} ---")
        
        # 1. generate_images メソッドのテスト
        if "imagen" in model_name:
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

        # 2. generate_content メソッドのテスト (Gemini系)
        if "gemini" in model_name:
            try:
                print("  Method: generate_content")
                response = client.models.generate_content(
                    model=model_name,
                    contents="Generate a photo of an ocean.",
                )
                if response.candidates and response.candidates[0].content.parts:
                    has_image = any(p.inline_data for p in response.candidates[0].content.parts)
                    if has_image:
                         print(f"  ✅ SUCCESS: {model_name} works with generate_content!")
                    else:
                         print(f"  ❌ SUCCESS API but no inline_data (Text: {response.text[:50]}...)")
                else:
                    print("  ❌ SUCCESS API but no parts returned.")
            except Exception as e:
                print(f"  ❌ FAILED: {str(e)[:150]}...")

if __name__ == "__main__":
    test_models()
