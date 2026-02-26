import os
import argparse
import json
import re
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), "../../.env")
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

class ProsperEditor:
    def __init__(self, model_name="gemini-2.0-flash"):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("API Key not found in .env")
        
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = model_name

    def optimize(self, file_path, interactive=False):
        print(f"📖 Reading draft: {file_path}")
        
        if not os.path.exists(file_path):
            print(f"❌ Error: File not found: {file_path}")
            return None

        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        print("🤖 Analyzing content with Gemini...")
        
        # 1. Generate Metadata (Titles, Tags, Lead Polish)
        analysis_result = self._analyze_content(content)
        
        if not analysis_result:
            print("❌ Failed to analyze content.")
            return None

        # 2. Select Options
        if interactive:
            selected_title = self._interactive_select("Title", analysis_result["titles"])
        else:
            selected_title = analysis_result["titles"][0] # Default to best
            
        tags = analysis_result["tags"]
        polished_lead = analysis_result["lead_polish"]

        # 3. Reconstruct Content
        new_content = self._reconstruct_content(content, selected_title, tags, polished_lead)
        
        # 4. Save
        base, ext = os.path.splitext(file_path)
        output_path = f"{base}_Optimized{ext}"
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
            
        print(f"\n✨ Optimization Complete!")
        print(f"   - Title: {selected_title}")
        print(f"   - Tags:  {' '.join(tags)}")
        print(f"   - Output: {output_path}")
        
        return output_path

    def _analyze_content(self, content):
        prompt = """
        あなたはWebメディアの「凄腕編集者」です。
        以下の記事原稿を読み、PVを最大化するための要素を生成してください。

        [Input Content]
        {content_sample}
        
        [Tasks]
        1. **Titles**: Create 5 variations of "Click-worthy" titles for Note.com.
           - Appeal to emotion, curiosity, or benefit.
           - Keep it under 40 characters if possible.
           - Avoid click-bait that lies, but maximize intrigue.
        2. **Tags**: Generate 5-8 hashtags.
           - Mix "Big Words" (e.g., #ビジネス, #コラム) and "Niche Words" (specific to content).
           - Do not use '#' in the string list, just the word.
        3. **Lead Polish**: Rewrite the very beginning (first 3-5 lines) to be more hooking.
           - The goal is to make the user read the next paragraph.
           - Keep the original tone but make it sharper.
        
        [Output Format]
        Return purely JSON format:
        {{
            "titles": ["Title 1", "Title 2", ...],
            "tags": ["Tag1", "Tag2", ...],
            "lead_polish": "The rewritten lead text..."
        }}
        """
        
        # Truncate content for prompt context if too long, but keep enough for context
        content_sample = content[:10000] 
        
        import time
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt.format(content_sample=content_sample),
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json"
                    )
                )
                return json.loads(response.text)
            except Exception as e:
                error_str = str(e)
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    wait_time = 30 * (attempt + 1)
                    print(f"⚠️ Quota exceeded. Retrying in {wait_time}s... (Attempt {attempt+1}/{max_retries})")
                    time.sleep(wait_time)
                else:
                    print(f"Error in AI generation: {e}")
                    return None
        
        print("❌ Failed after max retries.")
        return None

    def _interactive_select(self, label, options):
        print(f"\n🔎 {label} Selection:")
        for i, opt in enumerate(options):
            print(f"  {i+1}: {opt}")
        
        while True:
            try:
                choice = input(f"Select {label} (1-{len(options)}): ")
                idx = int(choice) - 1
                if 0 <= idx < len(options):
                    return options[idx]
            except ValueError:
                pass
            print("Invalid selection. Try again.")

    def _reconstruct_content(self, original_content, new_title, tags, polished_lead):
        lines = original_content.splitlines()
        new_lines = []
        
        # Add Tags Header
        tags_str = " ".join([f"#{t}" for t in tags])
        new_lines.append(f"[TAGS]: {tags_str}")
        new_lines.append("") # Empty line
        
        # Replace Title (First H1)
        title_found = False
        
        # Identify Lead block (simplified logic: content before first H2)
        # We will attempt to replace the first non-empty text blocks with polished lead
        # IF the polished lead is not empty.
        
        # For simplicity in V1:
        # 1. We replace the # Title
        # 2. We keep the Banner if present
        # 3. We insert the polished lead *after* the title/banner and *before* the first header,
        #    REPLACING the original lead text. 
        #    *Risk*: Identifying exact lead lines is hard.
        #    *Alternative*: Just prepend the polished lead and ask user to clean up? 
        #    *Better*: Since lead_polish is supposed to rewrite the beginning, 
        #    we can try to fuzzy match or just replace the first N lines of text.
        
        # Revised Strategy for V1:
        # Just replace Title and add Tags. 
        # Lead Polish is tricky to automate safely without destroying structure.
        # Let's try to detect the first paragraph.
        
        iterator = iter(lines)
        header_processed = False
        
        for line in iterator:
            # Replace Title
            if line.startswith("# ") and not title_found:
                new_lines.append(f"# {new_title}")
                title_found = True
                continue
                
            new_lines.append(line)
            
        return "\n".join(new_lines)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Prosper Editor - Optimize for Note.com")
    parser.add_argument("file", help="Draft file path")
    parser.add_argument("--interactive", "-i", action="store_true", help="Select title interactively")
    parser.add_argument("--model", default="gemini-2.0-flash", help="Model to use")
    
    args = parser.parse_args()
    
    editor = ProsperEditor(model_name=args.model)
    editor.optimize(args.file, interactive=args.interactive)
