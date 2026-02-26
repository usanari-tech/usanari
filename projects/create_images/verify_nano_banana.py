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
    
    # 試したいモデル名のリスト
    test_models = [
        "imagen-3.0-generate-002",
        "imagen-3.0-generate-001",
        "gemini-2.5-flash-image",
        "gemini-2.5-flash",
        "gemini-3-pro-image-preview",
        "gemini-2.0-flash-exp-image-generation"
    ]
    
    print("Testing Image Generation Models...")
    
    for model_name in test_models:
        print(f"\n--- Testing Model: {model_name} ---")
        
        # 1. generate_images メソッドのテスト (Imagen系想定)
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
                # breakしてもいいが今回は全検証する
            else:
                print("  ❌ SUCCESS API but no image returned.")
        except Exception as e:
            print(f"  ❌ FAILED: {str(e)[:150]}...")

        # 2. generate_content メソッドのテスト (Gemini系想定)
        try:
            print("  Method: generate_content")
            response = client.models.generate_content(
                model=model_name,
                contents="Generate an image of a red apple."
            )
            # check parts
            if response.candidates and response.candidates[0].content.parts:
                has_image = any(p.inline_data for p in response.candidates[0].content.parts)
                if has_image:
                     print(f"  ✅ SUCCESS: {model_name} works with generate_content and returned inline_data!")
                else:
                     print(f"  ⚠️ SUCCESS API but no inline_data (Text only: {response.text[:50]}...)")
            else:
                print("  ❌ SUCCESS API but no parts returned.")
        except Exception as e:
            print(f"  ❌ FAILED: {str(e)[:150]}...")

if __name__ == "__main__":
    test_models()
