import asyncio
import sys
import subprocess
import os
import edge_tts
import tempfile
import argparse
import time

# ロックファイルのパス
LOCK_FILE = "/tmp/antigravity_tts.lock"

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--voice", default="ja-JP-NanamiNeural", help="Voice to use")
    parser.add_argument("--rate", default="+0%", help="Speed rate")
    parser.add_argument("--volume", default="+0%", help="Volume change")
    parser.add_argument("text", nargs="*", default=[], help="Text to speak")

    args = parser.parse_args()
    text = " ".join(args.text)
    
    if not text and not sys.stdin.isatty():
        text = sys.stdin.read().strip()

    if not text:
        return

    # 二重起動の防止（システムリトライ対策）
    if os.path.exists(LOCK_FILE):
        if time.time() - os.path.getmtime(LOCK_FILE) < 10:
            return
    
    # ロックファイル作成
    with open(LOCK_FILE, "w") as f:
        f.write(str(os.getpid()))

    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as fp:
        output_file = fp.name

    try:
        communicate = edge_tts.Communicate(text, args.voice, rate=args.rate, volume=args.volume)
        await communicate.save(output_file)
        subprocess.run(["afplay", output_file])
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if os.path.exists(output_file):
            os.remove(output_file)
        if os.path.exists(LOCK_FILE):
            os.remove(LOCK_FILE)

if __name__ == "__main__":
    asyncio.run(main())
