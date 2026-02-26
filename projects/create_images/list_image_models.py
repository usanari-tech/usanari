import os
from google import genai
from dotenv import load_dotenv

# 環境変数の読み込み
ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(ENV_PATH):
    load_dotenv(ENV_PATH)

def list_models():
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("GOOGLE_API_KEY is missing.")
        return
        
    client = genai.Client(api_key=api_key)
    
    print("Listing ALL available models...")
    try:
        models = client.models.list()
        for i, m in enumerate(models):
             print(f"[{i}] {m.name}")
             if hasattr(m, 'display_name'):
                 print(f"    Display Name: {m.display_name}")
             if hasattr(m, 'supported_generation_methods'):
                 print(f"    Methods: {m.supported_generation_methods}")
             if hasattr(m, 'version'):
                 print(f"    Version: {m.version}")
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    list_models()
