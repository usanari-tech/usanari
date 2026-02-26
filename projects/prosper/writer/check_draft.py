import sys
import re
import os
import argparse

def validate_draft(file_path):
    print(f"🔍 Validating draft: {file_path}")
    
    if not os.path.exists(file_path):
        print(f"❌ Error: File not found: {file_path}")
        return False

    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    errors = []
    
    for i, line in enumerate(lines):
        line_num = i + 1
        line = line.rstrip()

        # Rule 1: Header Format
        if re.match(r'^#{2,6}[^ ]', line):
            errors.append(f"Line {line_num}: Header mismatch. Missing space after #. Found: '{line}'")

        # Rule 2: Standard Image Syntax
        img_standard_match = re.match(r'!\[.*?\]\((.*?)\)', line)
        if img_standard_match:
             path = img_standard_match.group(1).strip()
             if "PLACEHOLDER" in path:
                  print(f"⚠️  Line {line_num}: Image placeholder found")
             elif not os.path.exists(path):
                  errors.append(f"Line {line_num}: Image path does not exist: '{path}'")
             continue

        # Rule 3: Prosper Image Syntax [IMAGE]: path
        img_match = re.match(r'^\[IMAGE\]:\s*(.*)', line)
        if img_match:
            path = img_match.group(1).strip()
            if "PLACEHOLDER" in path:
                print(f"⚠️  Line {line_num}: Image placeholder found")
            elif not os.path.exists(path):
                errors.append(f"Line {line_num}: Image path does not exist: '{path}'")
            elif not os.path.isabs(path):
                errors.append(f"Line {line_num}: Image path must be absolute: '{path}'")

        # Rule 4: Banner Syntax
        banner_match = re.match(r'^\[BANNER\]:\s*(.*)', line)
        if banner_match:
            path = banner_match.group(1).strip()
            if "PLACEHOLDER" in path:
                print(f"⚠️  Line {line_num}: Banner placeholder found")
            elif not os.path.exists(path):
                errors.append(f"Line {line_num}: Banner path does not exist: '{path}'")
            elif not os.path.isabs(path):
                errors.append(f"Line {line_num}: Banner path must be absolute: '{path}'")

        # Rule 5: Subtitle Format
        if re.match(r'^\*\*.+\*\*$', line):
             if len(line) < 50:
                 errors.append(f"Line {line_num}: Deprecated Bold Subtitle format detected. Use '「Subtitle」'. Found: '{line}'")
        
        # Check for Parentheses style mistakes
        if re.match(r'^\(.*\)$', line) or re.match(r'^\*\*(User Hypothesis|基本情報|興行収入).*\)\*\*$', line):
             errors.append(f"Line {line_num}: Forbidden Parenthesis/Key style. Use '「Title」'. Found: '{line}'")

    if errors:
        print("\n❌ Validation FAILED with the following errors:")
        for e in errors:
            print(f"  - {e}")
        return False

    return True

def validate_volume(draft_path, source_path):
    if not source_path:
        return True
    
    print(f"⚖️  Checking Volume Ratio vs {source_path}")
    
    if not os.path.exists(source_path):
        print(f"⚠️  Source file not found: {source_path}. Skipping volume check.")
        return True
        
    with open(draft_path, 'r', encoding='utf-8') as f:
        draft_chars = len(f.read())
        
    with open(source_path, 'r', encoding='utf-8') as f:
        source_chars = len(f.read())
        
    ratio = draft_chars / source_chars
    percentage = ratio * 100
    
    print(f"   - Source: {source_chars:,} chars")
    print(f"   - Draft:  {draft_chars:,} chars")
    print(f"   - Ratio:  {percentage:.1f}%")
    
    # Modified Guardrail for Digest: Allow if > 30% OR > 5,000 chars absolute
    if ratio < 0.3 and draft_chars < 5000:
        print(f"❌ Volume Error: Draft is too short ({percentage:.1f}%). Minimum 30% or 5,000 chars required.")
        return False
        
    print("✅ Volume Check PASSED")
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Validate Prosper Draft")
    parser.add_argument("file", help="Path to the draft markdown file")
    parser.add_argument("--source", help="Path to the source report for volume checking", required=False)
    args = parser.parse_args()

    format_success = validate_draft(args.file)
    volume_success = validate_volume(args.file, args.source)
    
    sys.exit(0 if (format_success and volume_success) else 1)
