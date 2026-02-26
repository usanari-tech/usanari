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

# Extended list of potential model names to test
candidates = [
    # Confirmed by search
    "gemini-2.5-flash-image",
    "gemini-3-pro-image-preview",
    
    # Variations based on UI labels
    "gemini-2.5-flash-preview-image", 
    "gemini-3-pro-image",
    
    # Older/Other variations potentially still active or aliased
    "gemini-2.0-flash-exp-image-generation",
    "gemini-2.5-flash-preview", # sometimes text/image combined?
]

print("=== Starting Thorough Model Name Verification ===")

for model_name in candidates:
    print(f"\nTesting: {model_name}")
    try:
        response = client.models.generate_content(
            model=model_name,
            contents="A small red apple, pixel art",
        )
        
        if response.candidates and response.candidates[0].content.parts:
            part = response.candidates[0].content.parts[0]
            if part.inline_data:
                print(f"✅ Success! Image received from {model_name}")
                break
            else:
                 print(f"⚠️ Text received from {model_name}: {part.text[:50]}...")
        else:
            print(f"❌ No content from {model_name}")
            
    except Exception as e:
        error_str = str(e)
        if "404" in error_str:
             print(f"❌ 404: Model not found")
        elif "429" in error_str:
             print(f"❌ 429: Quota Exceeded (Limit: 0) - Model Exists!")
             time.sleep(1) # Backoff
        elif "400" in error_str:
             print(f"❌ 400: Invalid Argument")
        else:
             print(f"❌ Error: {error_str}")
