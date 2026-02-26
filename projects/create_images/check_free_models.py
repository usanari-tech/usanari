import os
import time
from google import genai
from dotenv import load_dotenv

ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(ENV_PATH):
    load_dotenv(ENV_PATH)

def test_free_models():
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("GOOGLE_API_KEY is missing.")
        return
        
    client = genai.Client(api_key=api_key)
    print("Fetching models...")
    try:
        models = list(client.models.list())
    except Exception as e:
        print(f"Error fetching models: {e}")
        return
    
    available = []
    billing_required = []
    
    print("Starting tests (this may take a minute)...\n")
    for m in models:
        name = m.name
        
        # 除外: TTS, Audio, Embedding, AQAなどはテキスト生成APIと異なるエンドポイント/形式を要求するためスキップ
        if any(x in name for x in ["tts", "audio", "embedding", "aqa", "veo", "imagen"]):
            # Imagen/Veoは以前のテストで課金必須と判明済み
            if "imagen" in name or "veo" in name:
                billing_required.append(name + " (Image/Video Generation)")
            continue
            
        print(f"Testing {name} ... ", end="", flush=True)
        try:
            # 短いテキストで生成テスト
            response = client.models.generate_content(
                model=name,
                contents="hi"
            )
            available.append(name)
            print("🟢 SUCCESS")
        except Exception as e:
            err = str(e)
            if "429" in err or "400" in err or "403" in err or "404" in err:
                billing_required.append(name)
                print(f"🔴 FAILED (Quota/Billing)")
            else:
                print(f"🟡 FAILED (Other error: {err[:30]}...)")
                
        # APIのレートリミット（RPM切れ）を避けるために少し待機
        time.sleep(1)
                
    print("\n" + "="*40)
    print("🎯 検証完了：あなたの無料枠APIキーで使えるモデル一覧")
    print("="*40)
    print("\n🟢 【利用可能】 (テキスト生成・画像認識など)")
    for a in available:
        print(f"  - {a}")
        
    print("\n🔴 【利用不可】 (課金必須 / クォータ制限)")
    for b in billing_required:
        print(f"  - {b}")

if __name__ == "__main__":
    test_free_models()
