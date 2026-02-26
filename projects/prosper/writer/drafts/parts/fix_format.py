
import re

file_path = "projects/prosper/writer/drafts/20260205_Sleep_Culture_2026.md"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    # Normalize header spaces: #{2,6} followed by any whitespace (including full-width) -> #{2,6} space
    # Regex: ^(#{2,6})\s+(.*) -> \1 \2
    # But we want to match specifically the failure case ^#{2,6}[^ ]
    # Actually, we should just enforce "Hash+Space+Content"
    
    # Check for H2-H6
    match = re.match(r'^(#{2,6})\s*(.*)', line)
    if match:
        hashes = match.group(1)
        content = match.group(2)
        # Force single ascii space
        new_line = f"{hashes} {content}\n"
        new_lines.append(new_line)
    else:
        new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Headers normalized.")
