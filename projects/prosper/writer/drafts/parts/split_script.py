
import re

source_path = "projects/prosper/investigator/reports/combined_report.txt"

with open(source_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Define keywords to likely identify sections (using the grep output as hint)
# Chap 1: Stats
# Chap 2: Economics (Line 222)
# Chap 3: Culture (Line 255)
# Chap 4: Biology (Line 337)
# Chap 5: Future/Solution (Line 443)

sections = {
    "chap1_source.txt": [r"(?s)(^# .*?)(?=# 睡眠不足がもたらす)"], # Start to Economics
    "chap2_source.txt": [r"(?s)(# 睡眠不足がもたらす.*?)(?=# 国民性・文化と睡眠)"], # Economics to Culture
    "chap3_source.txt": [r"(?s)(# 国民性・文化と睡眠.*?)(?=# 睡眠の生物学的)"], # Culture to Biology
    "chap4_source.txt": [r"(?s)(# 睡眠の生物学的.*?)(?=# 2026年以降の)"], # Biology to Future (Note: Skip 'Optimal' section? No, include it)
    # Actually 'Optimal' (Line 396) is between Biology (337) and Future (443). Let's put Optimal in Biology or Solution? Solution usually.
    # Let's put 337-396 in Chap 4.
    # 396-End in Chap 5?
    "chap5_source.txt": [r"(?s)(# 2026年以降の.*)", r"(?s)(# 「最適な」睡眠時間.*)"] # Future
}

# Refined Split Logic based on headers seen in grep
# Report 1 headers: 
# 1. 2026年世界の睡眠時間... (Intro)
# 2. 睡眠関連産業... (Industry - maybe Chap 5?)
# 3. 睡眠習慣に影響を与える... (Factors)
# 4. 統計データの詳細... (Stats)
# 5. ユーザー体験... (User)
# 6. 社会的・経済的影響... (Long term impact - Rep1 end)

# Report 2 headers start around Line 222 (Economics)
# It seems Report 1 is lines 1-221? No, combined file simply concatenated them.
# I need to distinguish.

# Let's just capture by broad keywords.

def extract(pattern, text):
    m = re.search(pattern, text)
    return m.group(1) if m else ""

# 1. Global Data (Stats) - Getting the first report's main stats part
# Assuming "統計データ" or similar.
chap1_text = extract(r"(?s)(.*?)(?=# 睡眠不足がもたらす)", content) 
# Note: First report content is at the top.

# 2. Economics
chap2_text = extract(r"(?s)(# 睡眠不足がもたらす.*?)(?=# 国民性・文化と睡眠)", content)

# 3. Culture
chap3_text = extract(r"(?s)(# 国民性・文化と睡眠.*?)(?=# 睡眠の生物学的)", content)

# 4. Biology
chap4_text = extract(r"(?s)(# 睡眠の生物学的.*?)(?=# 「最適な」睡眠時間)", content)

# 5. Solution (Optimal sleep + Future + Industry from Rep 1?)
# Let's grab the end of Rep 2
chap5_text_b = extract(r"(?s)(# 「最適な」睡眠時間.*)", content)

# Write to files
out_dir = "projects/prosper/writer/drafts/parts/"
with open(out_dir + "chap1_source.txt", "w") as f: f.write(chap1_text)
with open(out_dir + "chap2_source.txt", "w") as f: f.write(chap2_text)
with open(out_dir + "chap3_source.txt", "w") as f: f.write(chap3_text)
with open(out_dir + "chap4_source.txt", "w") as f: f.write(chap4_text)
with open(out_dir + "chap5_source.txt", "w") as f: f.write(chap5_text_b)

print("Split complete.")
