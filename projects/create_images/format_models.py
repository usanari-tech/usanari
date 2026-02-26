import os
from google import genai
from dotenv import load_dotenv

ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(ENV_PATH):
    load_dotenv(ENV_PATH)

def format_models():
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("GOOGLE_API_KEY is missing.")
        return
        
    client = genai.Client(api_key=api_key)
    try:
        models = list(client.models.list())
    except Exception as e:
         print(f"Error fetching models: {e}")
         return
         
    # 分類用のリスト
    gemini_2_5 = []
    gemini_3 = []
    gemini_2_0 = []
    gemma = []
    image_video = []
    others = []
    
    for m in models:
        name = m.name.replace("models/", "")
        display = m.display_name if hasattr(m, "display_name") else name
        version = m.version if hasattr(m, "version") else "N/A"
        
        info = f"- **{name}** (表示名: {display})"
        
        if "imagen" in name or "veo" in name:
            image_video.append(info + " ⚠️課金必須(API経由)")
        elif "gemini-3" in name or "nano-banana" in name:
            if "image" in name or "banana" in name:
                image_video.append(info + " ⚠️画像系は課金必須/UI専用")
            else:
                gemini_3.append(info)
        elif "gemini-2.5" in name:
             if "image" in name:
                 image_video.append(info + " ⚠️画像系")
             else:
                 gemini_2_5.append(info)
        elif "gemini-2.0" in name:
             gemini_2_0.append(info)
        elif "gemma" in name:
             gemma.append(info)
        else:
             others.append(info)
             
             
    print("### 🔹 Gemini 3 系 (最新プレビュー)")
    print("最新世代の推論・マルチモーダルモデルです。")
    print("\n".join(gemini_3) if gemini_3 else "(なし)")
    
    print("\n### 🔹 Gemini 2.5 系 (主力・安定版)")
    print("現在の主力モデルです。FlashLiteは非常に軽量で制限が緩いです。")
    print("\n".join(gemini_2_5) if gemini_2_5 else "(なし)")
    
    print("\n### 🔹 Gemini 2.0 系 (旧バージョン)")
    print("\n".join(gemini_2_0) if gemini_2_0 else "(なし)")
    
    print("\n### 🔹 Gemma 3 系 (オープンウェイトモデル)")
    print("軽量で高速なオープンモデル系列です。")
    print("\n".join(gemma) if gemma else "(なし)")
    
    print("\n### 🔹 画像・動画生成系 (❌ API無料枠では利用不可)")
    print("AI StudioのWebブラウザ画面からは使えますが、API経由では課金(Billing)設定が必要です。")
    print("\n".join(image_video) if image_video else "(なし)")
    
    print("\n### 🔹 その他 (最新エイリアス、埋め込み、AQA等)")
    print("\n".join(others) if others else "(なし)")

if __name__ == "__main__":
    format_models()
