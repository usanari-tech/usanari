import asyncio
import sys
import subprocess
import os
import edge_tts
import tempfile
import argparse

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--voice", default="ja-JP-NanamiNeural", help="Voice to use (e.g., ja-JP-KeitaNeural)")
    parser.add_argument("--rate", default="+0%", help="Speed rate (e.g., +10%)")
    parser.add_argument("--volume", default="+0%", help="Volume change (e.g., +10%)")
    # Capture all remaining positional arguments as the text
    parser.add_argument("text", nargs="*", default=[], help="Text to speak")

    args = parser.parse_args()
    
    # Combine positional arguments into a single string
    text = " ".join(args.text)
    
    # If no text in args, try reading from stdin
    if not text and not sys.stdin.isatty():
        text = sys.stdin.read().strip()

    if not text:
        # Silently exit or print usage? Let's verify silently for now or print error
        print("No text provided.")
        return

    # Create a temporary file for the audio
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as fp:
        output_file = fp.name

    try:
        communicate = edge_tts.Communicate(text, args.voice, rate=args.rate, volume=args.volume)
        await communicate.save(output_file)
        
        # Play audio using macOS built-in afplay
        subprocess.run(["afplay", output_file])
    except Exception as e:
        print(f"Error: {e}")
    finally:
        # Clean up
        if os.path.exists(output_file):
            os.remove(output_file)

if __name__ == "__main__":
    asyncio.run(main())
