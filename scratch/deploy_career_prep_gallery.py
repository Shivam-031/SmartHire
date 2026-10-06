import json
import os
import shutil

src_base = r'c:\vs code notes\Minor Project\SmartHire\docs\stitch_screens\career_prep_platform'
dest_base = r'c:\vs code notes\Minor Project\SmartHire\frontend\public\stitch_screens\career_prep_platform'

# Copy images and html to frontend/public
os.makedirs(dest_base, exist_ok=True)
for sub in ['html', 'images']:
    s = os.path.join(src_base, sub)
    d = os.path.join(dest_base, sub)
    if os.path.exists(s):
        if os.path.exists(d):
            shutil.rmtree(d)
        shutil.copytree(s, d)

with open(os.path.join(src_base, 'manifest.json'), 'r', encoding='utf-8') as f:
    manifest = json.load(f)

# Group screens into categories
def get_category(title):
    t = title.lower()
    if 'login' in t or 'signup' in t or 'avatar' in t:
        return 'Authentication & Identity'
    if 'field' in t or 'track' in t or 'role' in t:
        return 'Track Setup & Role Selection'
    if 'resume' in t or 'template' in t or 'editor' in t:
        return 'Resume Dossier & Templates'
    if 'interview' in t or 'mcq' in t or 'practice' in t:
        return 'Interview & Practice Simulation'
    if 'ats' in t:
        return 'ATS Diagnostics & Audit'
    if 'session' in t or 'summary' in t or 'profile' in t:
        return 'Session Summary & Profile'
    return 'Brand & Assets'

cards_html = []
for item in manifest:
    cat = get_category(item['title'])
    has_html = item['html_size'] > 0
    html_link = f"html/{item['html_filename']}" if has_html else '#'
    img_link = f"images/{item['image_filename']}"
    title_clean = item['title'].replace("'", "&#39;").replace('"', "&quot;")
    
    card = f"""
    <div class="screen-card bg-white border border-[#D2D5C9] rounded-lg overflow-hidden flex flex-col hover:shadow-lg transition-all" data-category="{cat}">
      <div class="p-3 bg-[#F8F9FA] border-b border-[#E5E7EB] flex items-center justify-between font-mono text-xs">
        <span class="font-bold text-[#17181C]">#{item['num']:02d}</span>
        <span class="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#2E6FF2]/10 text-[#2E6FF2] border border-[#2E6FF2]/20">
          {item['device']}
        </span>
      </div>

      <div class="relative bg-[#17181C]/5 p-2 flex items-center justify-center min-h-[220px] max-h-[260px] overflow-hidden border-b border-[#E5E7EB] cursor-pointer group" onclick="openComparator('{html_link}', '{img_link}', '{title_clean}', '{has_html}')">
        <img src="{img_link}" alt="{title_clean}" class="max-h-[230px] w-auto object-contain rounded shadow-xs group-hover:scale-105 transition-transform duration-200" loading="lazy">
        <div class="absolute inset-0 bg-[#17181C]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-mono font-medium gap-2">
          <span class="bg-[#2E6FF2] px-3 py-1.5 rounded shadow">Inspect Split View ⇄</span>
        </div>
      </div>

      <div class="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span class="text-[10px] font-mono uppercase tracking-wider text-[#6B7078] block mb-1">{cat}</span>
          <h3 class="font-sans font-semibold text-[#17181C] text-sm leading-snug line-clamp-2" title="{title_clean}">{item['title']}</h3>
        </div>

        <div class="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center gap-2 text-xs font-mono">
          {f'<a href="{html_link}" target="_blank" class="flex-1 text-center py-2 px-3 bg-[#2E6FF2] text-white rounded hover:bg-[#2055bf] transition-colors font-medium">Open Live HTML ↗</a>' if has_html else '<span class="flex-1 text-center py-2 px-3 bg-[#F3F4F6] text-[#9CA3AF] rounded cursor-not-allowed">Image Only</span>'}
          <button onclick="openComparator('{html_link}', '{img_link}', '{title_clean}', '{has_html}')" class="flex-1 text-center py-2 px-3 bg-[#F3F4F6] text-[#17181C] border border-[#E5E7EB] rounded hover:bg-[#E5E7EB] transition-colors font-medium">
            Compare ⇄
          </button>
        </div>
      </div>
    </div>
    """
    cards_html.append(card)

joined_cards = "\n".join(cards_html)

gallery_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SmartHire Career Prep Platform — Stitch Design Gallery (20 Screens)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {{
      theme: {{
        extend: {{
          colors: {{
            base: '#FFFFFF',
            surface: '#FCF8F8',
            ink: '#17181C',
            muted: '#6B7078',
            it: '#2E6FF2',
            management: '#8B4FE0',
            law: '#0EA5B7'
          }},
          fontFamily: {{
            sans: ['Inter', -apple-system, sans-serif],
            mono: ['"JetBrains Mono"', 'monospace']
          }}
        }}
      }}
    }}
  </script>
</head>
<body class="bg-[#F8F9FA] text-[#17181C] min-h-screen p-4 sm:p-8 font-sans antialiased">
  <div class="max-w-7xl mx-auto">

    <!-- Header Banner -->
    <header class="bg-white border border-[#E5E7EB] p-6 mb-8 rounded-xl shadow-xs">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-6">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <span class="px-2.5 py-0.5 text-xs font-mono font-semibold bg-[#2E6FF2] text-white rounded">STITCH PROJECT</span>
            <span class="text-xs font-mono text-[#6B7078] tracking-wider uppercase">PROJECT ID: 2326060774500769583</span>
          </div>
          <h1 class="text-3xl font-bold tracking-tight text-[#17181C]">SmartHire Career Prep Platform</h1>
          <p class="text-sm text-[#6B7078] mt-1">
            Complete Stitch Design System &mdash; 20 Pixel-Perfect Screens across IT, Management, and Law tracks.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <a href="/" class="px-4 py-2 bg-white border border-[#E5E7EB] hover:bg-[#F3F4F6] text-xs font-mono text-[#17181C] rounded-lg transition-colors">
            &larr; Return to App
          </a>
          <span class="inline-flex items-center px-3 py-2 rounded-lg text-xs font-mono font-medium bg-[#2E6FF2]/10 text-[#2E6FF2] border border-[#2E6FF2]/20">
            <span class="w-2 h-2 rounded-full bg-[#2E6FF2] mr-2 animate-pulse"></span>
            20 Screens Verified
          </span>
        </div>
      </div>

      <!-- Quick Metrics Bar -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-center font-mono text-xs">
        <div class="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
          <div class="text-[#6B7078] uppercase text-[10px]">Total Screens</div>
          <div class="text-2xl font-bold text-[#17181C] mt-0.5">20</div>
          <div class="text-[11px] text-[#2E6FF2] font-medium mt-0.5">Full Journey Coverage</div>
        </div>
        <div class="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
          <div class="text-[#6B7078] uppercase text-[10px]">HTML Templates</div>
          <div class="text-2xl font-bold text-[#17181C] mt-0.5">18</div>
          <div class="text-[11px] text-[#16A34A] font-medium mt-0.5">Live Interactive HTML</div>
        </div>
        <div class="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
          <div class="text-[#6B7078] uppercase text-[10px]">Stitch Renders</div>
          <div class="text-2xl font-bold text-[#17181C] mt-0.5">20</div>
          <div class="text-[11px] text-[#8B4FE0] font-medium mt-0.5">High-Res Screenshots</div>
        </div>
        <div class="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
          <div class="text-[#6B7078] uppercase text-[10px]">Domain Tracks</div>
          <div class="text-2xl font-bold text-[#17181C] mt-0.5">3</div>
          <div class="text-[11px] text-[#0EA5B7] font-medium mt-0.5">IT • Mgmt • Law</div>
        </div>
      </div>

      <!-- Category Filter Pills -->
      <div class="mt-6 flex flex-wrap gap-2 pt-4 border-t border-[#E5E7EB] text-xs font-mono">
        <button onclick="filterCat('all')" class="cat-btn px-3 py-1.5 rounded-lg bg-[#2E6FF2] text-white font-medium">All Screens (20)</button>
        <button onclick="filterCat('Authentication & Identity')" class="cat-btn px-3 py-1.5 rounded-lg bg-[#F3F4F6] text-[#17181C] hover:bg-[#E5E7EB]">Auth & Identity</button>
        <button onclick="filterCat('Track Setup & Role Selection')" class="cat-btn px-3 py-1.5 rounded-lg bg-[#F3F4F6] text-[#17181C] hover:bg-[#E5E7EB]">Track & Role Setup</button>
        <button onclick="filterCat('Resume Dossier & Templates')" class="cat-btn px-3 py-1.5 rounded-lg bg-[#F3F4F6] text-[#17181C] hover:bg-[#E5E7EB]">Resume & Editor</button>
        <button onclick="filterCat('Interview & Practice Simulation')" class="cat-btn px-3 py-1.5 rounded-lg bg-[#F3F4F6] text-[#17181C] hover:bg-[#E5E7EB]">Interview & Simulation</button>
        <button onclick="filterCat('ATS Diagnostics & Audit')" class="cat-btn px-3 py-1.5 rounded-lg bg-[#F3F4F6] text-[#17181C] hover:bg-[#E5E7EB]">ATS Diagnostics</button>
        <button onclick="filterCat('Session Summary & Profile')" class="cat-btn px-3 py-1.5 rounded-lg bg-[#F3F4F6] text-[#17181C] hover:bg-[#E5E7EB]">Summary & Profile</button>
      </div>
    </header>

    <!-- Grid of Screen Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="screens-grid">
      {joined_cards}
    </div>

  </div>

  <!-- Side-by-Side Split View Comparator Modal -->
  <div id="comparator-modal" class="fixed inset-0 z-50 hidden bg-[#17181C]/70 backdrop-blur-xs flex flex-col p-4 sm:p-6 animate-fadeIn">
    <div class="bg-white rounded-xl shadow-2xl flex-1 flex flex-col overflow-hidden border border-[#E5E7EB]">
      <!-- Comparator Top Bar -->
      <div class="bg-[#F8F9FA] px-6 py-3 border-b border-[#E5E7EB] flex items-center justify-between text-xs font-mono">
        <div class="flex items-center gap-3">
          <span class="w-2.5 h-2.5 rounded-full bg-[#2E6FF2]"></span>
          <h2 id="modal-title" class="font-bold text-sm text-[#17181C] font-sans">Screen Title</h2>
          <span class="text-[#E5E7EB]">|</span>
          <span class="text-[#6B7078]">Side-by-Side Comparator</span>
        </div>
        <div class="flex items-center gap-4">
          <a id="modal-open-tab" href="#" target="_blank" class="text-[#2E6FF2] hover:underline flex items-center gap-1">
            <span>Open in New Tab</span> ↗
          </a>
          <button onclick="closeComparator()" class="w-7 h-7 rounded-lg bg-[#E5E7EB] hover:bg-[#D1D5DB] flex items-center justify-center font-bold text-sm text-[#17181C] cursor-pointer">
            ✕
          </button>
        </div>
      </div>

      <!-- Comparator Body -->
      <div class="flex-1 flex flex-col lg:flex-row overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-[#E5E7EB]">
        <!-- Left: Live Rendered HTML -->
        <div class="flex-1 flex flex-col min-h-0">
          <div class="bg-white px-4 py-2 border-b border-[#E5E7EB] font-mono text-[11px] text-[#6B7078] flex items-center justify-between">
            <span class="font-semibold text-[#17181C]">LIVE INTERACTIVE HTML RENDER</span>
            <span class="text-[10px] bg-[#2E6FF2]/10 text-[#2E6FF2] px-2 py-0.5 rounded">Native Browser DOM</span>
          </div>
          <div class="flex-1 bg-white overflow-auto relative">
            <iframe id="modal-iframe" class="w-full h-full border-0 min-h-[500px]" sandbox="allow-scripts allow-same-origin"></iframe>
            <div id="no-html-notice" class="hidden absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-500 font-mono text-xs">
              No HTML template for this asset (Image Only)
            </div>
          </div>
        </div>

        <!-- Right: Stitch PNG Screenshot -->
        <div class="flex-1 flex flex-col min-h-0 bg-[#F8F9FA]">
          <div class="bg-white px-4 py-2 border-b border-[#E5E7EB] font-mono text-[11px] text-[#6B7078] flex items-center justify-between">
            <span class="font-semibold text-[#17181C]">STITCH DESIGN REFERENCE (PNG)</span>
            <span class="text-[10px] bg-[#8B4FE0]/10 text-[#8B4FE0] px-2 py-0.5 rounded">Ground Truth Capture</span>
          </div>
          <div class="flex-1 overflow-auto p-4 flex items-start justify-center">
            <img id="modal-img" src="" alt="Design Reference" class="max-w-full h-auto object-contain rounded border border-[#E5E7EB] shadow-sm">
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    function filterCat(category) {{
      document.querySelectorAll('.cat-btn').forEach(btn => {{
        if ((category === 'all' && btn.innerText.includes('All Screens')) || btn.innerText.includes(category.substring(0, 10))) {{
          btn.className = 'cat-btn px-3 py-1.5 rounded-lg bg-[#2E6FF2] text-white font-medium';
        }} else {{
          btn.className = 'cat-btn px-3 py-1.5 rounded-lg bg-[#F3F4F6] text-[#17181C] hover:bg-[#E5E7EB]';
        }}
      }});

      document.querySelectorAll('.screen-card').forEach(card => {{
        if (category === 'all' || card.getAttribute('data-category') === category) {{
          card.style.display = 'flex';
        }} else {{
          card.style.display = 'none';
        }}
      }});
    }}

    function openComparator(htmlUrl, imgUrl, title, hasHtml) {{
      document.getElementById('modal-title').innerText = title;
      document.getElementById('modal-img').src = imgUrl;
      const iframe = document.getElementById('modal-iframe');
      const noHtmlNotice = document.getElementById('no-html-notice');
      const openTabBtn = document.getElementById('modal-open-tab');

      if (hasHtml === 'True' || hasHtml === true) {{
        iframe.classList.remove('hidden');
        noHtmlNotice.classList.add('hidden');
        iframe.src = htmlUrl;
        openTabBtn.href = htmlUrl;
        openTabBtn.classList.remove('hidden');
      }} else {{
        iframe.classList.add('hidden');
        noHtmlNotice.classList.remove('hidden');
        openTabBtn.classList.add('hidden');
      }}

      document.getElementById('comparator-modal').classList.remove('hidden');
    }}

    function closeComparator() {{
      document.getElementById('comparator-modal').classList.add('hidden');
      document.getElementById('modal-iframe').src = '';
    }}

    document.addEventListener('keydown', (e) => {{
      if (e.key === 'Escape') closeComparator();
    }});
  </script>
</body>
</html>
"""

# Save to docs and public
with open(os.path.join(src_base, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(gallery_html)

with open(os.path.join(dest_base, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(gallery_html)

# Also copy manifest.json to dest_base
shutil.copy(os.path.join(src_base, 'manifest.json'), os.path.join(dest_base, 'manifest.json'))

print("Gallery generated and deployed successfully to docs and frontend/public.")

