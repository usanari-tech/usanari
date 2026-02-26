import os
import argparse
import re
import datetime
import time
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), "../../../.env")
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

class ProsperWriter:
    def __init__(self, model_name=None):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("API Key not found in .env (GEMINI_API_KEY or GOOGLE_API_KEY)")
        
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = model_name or "models/gemini-2.5-flash"
        self.rules = self._load_rules()

    def _load_rules(self):
        try:
            rules_path = os.path.join(os.path.dirname(__file__), "../RULES.md")
            with open(rules_path, "r", encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            print("Warning: RULES.md not found. Using default minimal rules.")
            return "Use standard Markdown. No H4. Use bold for emphasis."

    def _read_report(self, report_path):
        with open(report_path, "r", encoding="utf-8") as f:
            return f.read()

    def generate_article(self, report_path, output_dir=None):
        report_content = self._read_report(report_path)
        timestamp = datetime.datetime.now().strftime("%Y%m%d")
        
        # Extract theme from filename or content
        basename = os.path.basename(report_path)
        theme_match = re.search(r'\d{8}_\d{6}_(.+)_DEEP\.md', basename)
        theme = theme_match.group(1) if theme_match else "Untitled"
        
        print(f">>> Starting Writer for theme: {theme}")
        print(f"    Model: {self.model_name}")

        # 1. Outline Generation
        print("    [Phase 1] Generating Outline...")
        outline = self._generate_outline(report_content)
        print("    Outline generated.")

        # 2. Section Writing
        print("    [Phase 2] Writing content...")
        full_text = self._write_sections(outline, report_content)

        # 3. Save
        if not output_dir:
            output_dir = os.path.join(os.path.dirname(__file__), "drafts")
        os.makedirs(output_dir, exist_ok=True)
        
        filename = f"{timestamp}_{theme}_Draft.md"
        output_path = os.path.join(output_dir, filename)
        
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(full_text)
            
        print(f">>> Draft saved to: {output_path}")
        return output_path

    def _generate_outline(self, report):
        prompt = f"""
        You are a professional editor for Note.com.
        Based on the provided Research Report, create a logical outline for a 10,000-character article.
        
        [Research Report]
        {report[:30000]} (Truncated if too long)
        
        [Requirements]
        1. Title (H1): Catchy, emotional, or intriguing.
        2. Structure: H2 (Major Sections) and H3 (Sub-sections).
        3. Flow: Hook -> Context -> Deep Dive -> Logic/Analysis -> Conclusion.
        4. Output Format: JSON list of section titles (strings).
           Example: ["H1: Title", "H2: Section 1", "H3: Subsec 1.1", "H2: Section 2", ...]
        """
        
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
             config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        try:
             import json
             return json.loads(response.text)
        except:
             # Fallback
             return ["H1: Generated Article", "H2: Introduction", "H2: Body", "H2: Conclusion"]

    def _write_sections(self, outline, report):
        full_article = ""
        current_context = ""
        
        # Simple loop for now - improved version would split by H2
        # For simplicity in V1, we prompt for the WHOLE article in one go if possible, 
        # or split if outline is long.
        # Given Gemini 2.5 Flash's large context, we might be able to do it in one shot 
        # but output token limits (8k) are the bottleneck for 10k chars (approx 5-10k tokens depending on language).
        # Safe bet: Write section by section.
        
        # Group outline into chunks
        current_chunk = []
        
        # Initial Header
        full_article += "[BANNER]: PLACEHOLDER\n\n"
        
        for item in outline:
            if item.startswith("H1:"):
                title = item.replace("H1:", "").strip()
                full_article += f"# {title}\n\n[TOC]\n\n"
            else:
                current_chunk.append(item)
        
        # Process chunks (e.g., per H2)
        # Simplified: Pass entire outline and report, ask to write section X
        
        prompt = f"""
        You are a top-tier writer for Note.com. Write the full article based on the Outline and Report.
        
        [Rules]
        {self.rules}
        
        [Research Report]
        {report[:50000]}
        
        [Outline]
        {json.dumps(outline, indent=2)}
        
        [Instruction]
        - Write the COMPLETE article content.
        - Use H2 and H3 as specified in the outline.
        - Do NOT write H1 (already handled).
        - Insert `[IMAGE]: PLACEHOLDER` meaningfully every 3-4 paragraphs.
        - Ensure a tone of "Intellectual Discovery" or "Passionate Analysis".
        - Length: Aim for maximum detail. Do not summarize.
        """
        
        # Rate limit wait
        time.sleep(5)
        
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt
        )
        
        full_article += response.text
        return full_article

if __name__ == "__main__":
    import json
    parser = argparse.ArgumentParser()
    parser.add_argument("report", help="Path to research report")
    parser.add_argument("--model", help="Model name", default="models/gemini-2.5-flash")
    args = parser.parse_args()
    
    writer = ProsperWriter(model_name=args.model)
    writer.generate_article(args.report)
