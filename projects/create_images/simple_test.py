import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

client = genai.Client(api_key=api_key)
model_name = "gemini-2.5-flash"

print(f"Testing {model_name}...")
try:
    # Clean request, no config
    response = client.models.generate_content(
        model=model_name,
        contents="A small green apple, pixel art",
    )
    print("Request sent.")
    if response.candidates and response.candidates[0].content.parts:
        print("✅ Success! Content received.")
    else:
        print("❌ No content.")
except Exception as e:
    print(f"❌ Error: {e}")
