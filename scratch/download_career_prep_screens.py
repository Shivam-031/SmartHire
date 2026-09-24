import json
import os
import re
import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

list_path = r'C:\Users\shiva\.gemini\antigravity\brain\187b562c-7187-46cf-aa56-a7805b568234\.system_generated\steps\1704\output.txt'

target_base = r'c:\vs code notes\Minor Project\SmartHire\docs\stitch_screens\career_prep_platform'
target_html_dir = os.path.join(target_base, 'html')
target_img_dir = os.path.join(target_base, 'images')

os.makedirs(target_html_dir, exist_ok=True)
os.makedirs(target_img_dir, exist_ok=True)

with open(list_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

screens = data.get('screens', [])
print(f"Total screens to fetch: {len(screens)}")

manifest = []

for idx, s in enumerate(screens, start=1):
    screen_name = s.get('name', '')
    screen_id = screen_name.split('/')[-1] if '/' in screen_name else screen_name
    title = s.get('title', f'Screen_{idx}')
    device = s.get('deviceType', 'DESKTOP') or 'DESKTOP'
    width = s.get('width', '1280')
    height = s.get('height', '800')
    
    # Sanitize title for filename
    clean_title = re.sub(r'[^\w\-_]+', '_', title).strip('_')
    prefix = f"{idx:02d}_{clean_title[:45]}_{screen_id[:8]}"
    
    html_fname = f"{prefix}.html"
    img_fname = f"{prefix}.png"
    
    html_target = os.path.join(target_html_dir, html_fname)
    img_target = os.path.join(target_img_dir, img_fname)
    
    html_url = s.get('htmlCode', {}).get('downloadUrl') if s.get('htmlCode') else None
    img_url = s.get('screenshot', {}).get('downloadUrl') if s.get('screenshot') else None
    
    html_size = 0
    img_size = 0
    
    if html_url:
        try:
            req = urllib.request.Request(html_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
                content = resp.read()
                with open(html_target, 'wb') as out_f:
                    out_f.write(content)
                html_size = len(content)
        except Exception as e:
            print(f"[{idx}] Failed to download HTML for '{title}': {e}")
            
    if img_url:
        try:
            req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
                content = resp.read()
                with open(img_target, 'wb') as out_f:
                    out_f.write(content)
                img_size = len(content)
        except Exception as e:
            print(f"[{idx}] Failed to download image for '{title}': {e}")
            
    print(f"[{idx:02d}/20] '{title}' ({device}) -> HTML: {html_size} bytes, IMG: {img_size} bytes")
    
    manifest.append({
        'num': idx,
        'id': screen_id,
        'fullName': screen_name,
        'title': title,
        'device': device,
        'width': width,
        'height': height,
        'html_filename': html_fname,
        'image_filename': img_fname,
        'html_size': html_size,
        'image_size': img_size
    })

manifest_path = os.path.join(target_base, 'manifest.json')
with open(manifest_path, 'w', encoding='utf-8') as mf:
    json.dump(manifest, mf, indent=2)

print(f"\nSuccessfully wrote manifest to {manifest_path}")

