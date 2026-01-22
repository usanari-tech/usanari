from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter
import sys
import argparse

def get_transcript_content(video_id):
    """
    Fetches transcript for the given video ID.
    Supports older version of youtube_transcript_api where fetch is an instance method.
    """
    try:
        # Instantiate API (required for older versions found in environment)
        api = YouTubeTranscriptApi()
        
        # Try to fetch Japanese transcript first
        try:
            transcript = api.fetch(video_id, languages=['ja'])
            return transcript
        except Exception:
            pass
            
        # Try to fetch English transcript
        try:
            transcript = api.fetch(video_id, languages=['en'])
            return transcript
        except Exception:
            pass
            
        # Try to fetch default (first available)
        transcript = api.fetch(video_id)
        return transcript

    except Exception as e:
        raise Exception(f"Failed to fetch transcript: {e}")

def main():
    parser = argparse.ArgumentParser(description='Fetch YouTube transcript.')
    parser.add_argument('video_id', help='YouTube Video ID')
    args = parser.parse_args()

    try:
        transcript_data = get_transcript_content(args.video_id)
        
        # Older version of transcript data might be list of objects or list of dicts.
        # Check if items have .text attribute (objects) or ['text'] (dicts)
        if transcript_data and len(transcript_data) > 0:
            first_item = transcript_data[0]
            if hasattr(first_item, 'text'):
                # It's an object, manual formatting needed or conversion
                text_content = ""
                for item in transcript_data:
                    text_content += item.text + " "
                print(text_content)
            else:
                # It's likely a dict, use formatter
                formatter = TextFormatter()
                print(formatter.format_transcript(transcript_data))
        else:
            print("") # Empty transcript

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
