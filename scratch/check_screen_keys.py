import json

path1 = r'C:\Users\shiva\.gemini\antigravity\brain\187b562c-7187-46cf-aa56-a7805b568234\.system_generated\steps\1704\output.txt'
with open(path1, 'r', encoding='utf-8') as f:
    d = json.load(f)
    screens = d.get('screens', [])
    print("Keys of screen[0]:", list(screens[0].keys()))
    if 'htmlCode' in screens[0]:
        print("htmlCode present:", screens[0]['htmlCode'])
    if 'screenshot' in screens[0]:
        print("screenshot present:", screens[0]['screenshot'])

