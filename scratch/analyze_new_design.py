import json
import os
import re

manifest_path = r'c:\vs code notes\Minor Project\SmartHire\docs\stitch_screens\manifest.json'
with open(manifest_path, 'r', encoding='utf-8') as f:
    manifest = json.load(f)

html_dir = r'c:\vs code notes\Minor Project\SmartHire\docs\stitch_screens\html'

print(f"Total screens in manifest: {len(manifest)}")
for item in manifest:
    h_path = os.path.join(html_dir, item['html_filename'])
    exists = os.path.exists(h_path)
    size = os.path.getsize(h_path) if exists else 0
    print(f"Screen {item['num']:02d}: {item['title']} | HTML size: {size} bytes | File: {item['html_filename']}")

# Analyze fonts, colors, and layout patterns across a few key screens
sample_screens = [
    '08_SmartHire_Prep_Login_b425418e.html',
    '09_SmartHire_Prep_Field_Selection_18183580.html',
    '12_SmartHire_Prep_Role_Selection_IT_Track_d0f683bd.html',
    '06_SmartHire_Prep_Resume_Upload_IT_Track_9aa5aaeabeda496c8835328bf2a911ad.html',
    '18_SmartHire_Prep_Interview_Q_A_IT_Track_93ec875e.html',
    '03_SmartHire_Prep_ATS_Report_IT_Track_3686027d.html',
    '05_SmartHire_Prep_Session_Summary_IT_Track_d2758b6a.html',
    '15_SmartHire_Prep_Candidate_Profile_b2e6131b.html'
]

for s in sample_screens:
    p = os.path.join(html_dir, s)
    if os.path.exists(p):
        with open(p, 'r', encoding='utf-8') as f:
            content = f.read()
            # Find fonts
            fonts = re.findall(r'family=([^\'\"&]+)', content)
            # Find tailwind / theme colors
            colors = set(re.findall(r'#[0-9a-fA-F]{6}', content))
            print(f"\n--- {s} ---")
            print(f"Fonts: {set(fonts)}")
            print(f"Sample hex colors (count: {len(colors)}): {list(colors)[:10]}")

