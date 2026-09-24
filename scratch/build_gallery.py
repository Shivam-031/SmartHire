import json
import os

with open(r'c:\vs code notes\Minor Project\SmartHire\docs\stitch_screens\all_screens.json', 'r', encoding='utf-8') as f:
    screens = json.load(f)

cards_html = []
for s in screens:
    is_core = '14' if s['num'] <= 14 else 'flows'
    dev = s['device'].lower()
    badge_bg = 'bg-[#2F6F4E] text-white' if s['device'] == 'DESKTOP' else ('bg-[#B08D2F] text-white' if s['device'] == 'MOBILE' else 'bg-[#5C6B60] text-white')
    img_url = f"images/{s['image_filename']}"
    html_url = f"html/{s['html_filename']}"
    title_escaped = s['title'].replace("'", "&#39;").replace('"', "&quot;")
    
    cards_html.append(f'''
      <div class="screen-card bg-white border border-[#D2D5C9] rounded overflow-hidden flex flex-col hover:shadow-md transition-shadow" data-category="{is_core}" data-device="{dev}">
        <div class="p-3 bg-[#EEF0EA]/60 border-b border-[#D2D5C9] flex items-center justify-between font-mono text-xs">
          <span class="font-bold text-[#1A2E22]">#{s['num']:02d}</span>
          <span class="px-2 py-0.5 text-[10px] uppercase font-bold rounded {badge_bg}">{s['device']}</span>
        </div>

        <div class="relative bg-[#1A2E22]/5 p-2 flex items-center justify-center min-h-[220px] max-h-[260px] overflow-hidden border-b border-[#D2D5C9] cursor-pointer group" onclick="openComparator('{html_url}', '{img_url}', '{title_escaped}', '{s['device']}')">
          <img src="{img_url}" alt="{title_escaped}" class="max-h-[240px] w-auto object-contain rounded shadow-sm group-hover:scale-[1.02] transition-transform duration-200" loading="lazy">
          <div class="absolute inset-0 bg-[#1A2E22]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-mono font-medium gap-2">
            <span class="bg-[#2F6F4E] px-3 py-1 rounded shadow">Inspect Split View</span>
          </div>
        </div>

        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div class="text-[10px] font-mono text-[#5C6B60] uppercase tracking-wider mb-1">{s.get('category', 'WORKSHEET')}</div>
            <h3 class="font-serif font-semibold text-[#1A2E22] text-base leading-snug mb-2">{s['title']}</h3>
          </div>

          <div class="pt-3 border-t border-[#D2D5C9] flex items-center justify-between text-xs font-mono gap-2">
            <a href="{html_url}" target="_blank" class="flex-1 text-center py-2 px-3 bg-[#2F6F4E] text-white rounded hover:bg-[#265a3f] transition-colors font-medium">
              Open HTML ↗
            </a>
            <button onclick="openComparator('{html_url}', '{img_url}', '{title_escaped}', '{s['device']}')" class="flex-1 text-center py-2 px-3 bg-[#EEF0EA] text-[#1A2E22] border border-[#D2D5C9] rounded hover:bg-[#D2D5C9] transition-colors font-medium">
              Split View ⇄
            </button>
          </div>
        </div>
      </div>''')

joined_cards = "\n".join(cards_html)

full_html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SmartHire Prep — Pixel-Perfect Stitch Screens Design Gallery</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {{
      theme: {{
        extend: {{
          colors: {{
            paper: '#EEF0EA',
            surface: '#FFFFFF',
            ink: '#1A2E22',
            muted: '#5C6B60',
            hairline: '#D2D5C9',
            accent: '#2F6F4E',
            'accent-tint': '#E9F2EC',
            gold: '#B08D2F',
            flag: '#B23A2E'
          }},
          fontFamily: {{
            serif: ['Fraunces', 'Georgia', 'serif'],
            sans: ['"IBM Plex Sans"', '-apple-system', 'sans-serif'],
            mono: ['"IBM Plex Mono"', 'monospace']
          }}
        }}
      }}
    }}
  </script>
  <style>
    body {{
      background-color: #EEF0EA;
      color: #1A2E22;
      font-family: 'IBM Plex Sans', -apple-system, sans-serif;
    }}
    .sheet-border {{ border: 1px solid #D2D5C9; }}
    .hairline-b {{ border-bottom: 1px solid #D2D5C9; }}
    .hairline-t {{ border-top: 1px solid #D2D5C9; }}
    .hairline-r {{ border-right: 1px solid #D2D5C9; }}
    .hairline-l {{ border-left: 1px solid #D2D5C9; }}
  </style>
</head>
<body class="min-h-screen p-4 sm:p-8">
  <div class="max-w-7xl mx-auto">
    
    <!-- Top Header / Dossier Style Banner -->
    <header class="bg-white border border-[#D2D5C9] p-6 mb-8 rounded shadow-sm">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D2D5C9] pb-6">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <span class="px-2 py-0.5 text-xs font-mono font-semibold bg-[#2F6F4E] text-white rounded">SYSTEM DOSSIER</span>
            <span class="text-xs font-mono text-[#5C6B60] tracking-wider uppercase">STITCH MCP SPECIFICATION ARCHIVE</span>
          </div>
          <h1 class="text-3xl font-serif font-bold text-[#1A2E22]">SmartHire Prep Design System</h1>
          <p class="text-sm text-[#5C6B60] mt-1">
            14 Pixel-Perfect Worksheet Screens + 7 Dynamic Interactive Flows verified and archived locally.
          </p>
        </div>
        <div class="flex items-center gap-2 self-start md:self-auto">
          <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-[#E9F2EC] text-[#2F6F4E] border border-[#2F6F4E]/20">
            <span class="w-2 h-2 rounded-full bg-[#2F6F4E] mr-2 animate-pulse"></span>
            100% Verified Local Assets
          </span>
        </div>
      </div>

      <!-- Quick Metrics Bar -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-center font-mono text-xs">
        <div class="p-3 bg-[#EEF0EA]/60 rounded border border-[#D2D5C9]">
          <div class="text-[#5C6B60] uppercase text-[10px]">Worksheet Screens</div>
          <div class="text-xl font-bold text-[#1A2E22] mt-0.5">14</div>
          <div class="text-[11px] text-[#2F6F4E] font-medium mt-0.5">7 Desktop • 7 Mobile</div>
        </div>
        <div class="p-3 bg-[#EEF0EA]/60 rounded border border-[#D2D5C9]">
          <div class="text-[#5C6B60] uppercase text-[10px]">Total Flow Screens</div>
          <div class="text-xl font-bold text-[#1A2E22] mt-0.5">21</div>
          <div class="text-[11px] text-[#5C6B60] font-medium mt-0.5">Login, ATS, Mock, Drills</div>
        </div>
        <div class="p-3 bg-[#EEF0EA]/60 rounded border border-[#D2D5C9]">
          <div class="text-[#5C6B60] uppercase text-[10px]">Design Artifacts</div>
          <div class="text-xl font-bold text-[#1A2E22] mt-0.5">27 PNGs</div>
          <div class="text-[11px] text-[#5C6B60] font-medium mt-0.5">Stitch High-Res Renders</div>
        </div>
        <div class="p-3 bg-[#EEF0EA]/60 rounded border border-[#D2D5C9]">
          <div class="text-[#5C6B60] uppercase text-[10px]">Token Palettes</div>
          <div class="text-xl font-bold text-[#1A2E22] mt-0.5">Fraunces / Plex</div>
          <div class="text-[11px] text-[#2F6F4E] font-medium mt-0.5">#EEF0EA • #1A2E22</div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="mt-6 flex flex-wrap gap-2 pt-4 border-t border-[#D2D5C9] text-xs font-mono">
        <button onclick="filterCategory('all')" id="btn-all" class="filter-btn px-3 py-1.5 rounded bg-[#2F6F4E] text-white font-medium">All Screens (21)</button>
        <button onclick="filterCategory('14')" id="btn-14" class="filter-btn px-3 py-1.5 rounded bg-[#EEF0EA] text-[#1A2E22] hover:bg-[#D2D5C9] font-medium">14 Core Worksheet Screens</button>
        <button onclick="filterCategory('desktop')" id="btn-desktop" class="filter-btn px-3 py-1.5 rounded bg-[#EEF0EA] text-[#1A2E22] hover:bg-[#D2D5C9] font-medium">Desktop Only</button>
        <button onclick="filterCategory('mobile')" id="btn-mobile" class="filter-btn px-3 py-1.5 rounded bg-[#EEF0EA] text-[#1A2E22] hover:bg-[#D2D5C9] font-medium">Mobile Only</button>
        <button onclick="filterCategory('flows')" id="btn-flows" class="filter-btn px-3 py-1.5 rounded bg-[#EEF0EA] text-[#1A2E22] hover:bg-[#D2D5C9] font-medium">Auth & Flows</button>
      </div>
    </header>

    <!-- Screens Grid -->
    <div id="screens-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
{joined_cards}
    </div>

    <!-- Footer -->
    <footer class="text-center text-xs font-mono text-[#5C6B60] pb-8 border-t border-[#D2D5C9] pt-6">
      SmartHire Prep • Google Stitch MCP Design Integration • Fraunces & IBM Plex Tokens • All rights reserved
    </footer>

  </div>

  <!-- Side-by-Side Comparator Modal -->
  <div id="comparator-modal" class="fixed inset-0 z-50 bg-[#1A2E22]/80 backdrop-blur-sm hidden flex flex-col">
    <!-- Modal Header -->
    <div class="bg-white border-b border-[#D2D5C9] p-4 flex items-center justify-between text-xs font-mono">
      <div class="flex items-center gap-3">
        <span id="modal-badge" class="px-2 py-0.5 rounded text-white font-bold bg-[#2F6F4E]">DESKTOP</span>
        <h2 id="modal-title" class="font-serif font-bold text-base text-[#1A2E22]">Screen Title</h2>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 bg-[#EEF0EA] px-3 py-1 rounded border border-[#D2D5C9]">
          <span class="text-[#5C6B60]">Mode:</span>
          <button onclick="setComparatorMode('split')" id="btn-mode-split" class="font-bold text-[#2F6F4E]">Side-by-Side</button>
          <span class="text-[#D2D5C9]">|</span>
          <button onclick="setComparatorMode('overlay')" id="btn-mode-overlay" class="text-[#5C6B60]">Overlay Blend</button>
        </div>
        <div id="opacity-slider-container" class="hidden flex items-center gap-2 bg-[#EEF0EA] px-3 py-1 rounded border border-[#D2D5C9]">
          <span class="text-[#5C6B60]">Opacity:</span>
          <input type="range" id="opacity-slider" min="0" max="100" value="50" oninput="updateOverlayOpacity(this.value)" class="w-24">
        </div>
        <a id="modal-html-link" href="#" target="_blank" class="bg-[#2F6F4E] text-white px-3 py-1 rounded hover:bg-[#265a3f]">Open in New Window ↗</a>
        <button onclick="closeComparator()" class="bg-[#EEF0EA] text-[#1A2E22] px-3 py-1 rounded border border-[#D2D5C9] hover:bg-[#D2D5C9] font-bold text-sm">✕ Close</button>
      </div>
    </div>

    <!-- Modal Content Panes -->
    <div id="comparator-panes" class="flex-1 bg-[#EEF0EA]/40 p-4 overflow-hidden flex flex-row gap-4 relative">
      <!-- Left Pane: Live Rendered HTML -->
      <div id="pane-left" class="flex-1 bg-white border border-[#D2D5C9] rounded flex flex-col overflow-hidden shadow">
        <div class="bg-[#EEF0EA]/80 p-2 border-b border-[#D2D5C9] font-mono text-[11px] text-[#5C6B60] flex items-center justify-between">
          <span class="font-semibold text-[#1A2E22]">LIVE HTML RENDER (100% Native DOM)</span>
          <span id="pane-res" class="text-[10px]">Responsive Iframe</span>
        </div>
        <iframe id="live-frame" class="w-full flex-1 border-none" src="about:blank"></iframe>
      </div>

      <!-- Right Pane: Original Stitch Design Screenshot -->
      <div id="pane-right" class="flex-1 bg-white border border-[#D2D5C9] rounded flex flex-col overflow-hidden shadow">
        <div class="bg-[#EEF0EA]/80 p-2 border-b border-[#D2D5C9] font-mono text-[11px] text-[#5C6B60] flex items-center justify-between">
          <span class="font-semibold text-[#1A2E22]">ORIGINAL STITCH DESIGN SPECIFICATION (PNG)</span>
          <span class="text-[10px]">Pixel Reference</span>
        </div>
        <div class="flex-1 overflow-auto p-4 flex justify-center bg-[#F9FAF8]">
          <img id="spec-image" src="" alt="Spec Screenshot" class="max-w-full h-auto object-contain self-start shadow-sm border border-[#D2D5C9]">
        </div>
      </div>
    </div>
  </div>

  <script>
    function filterCategory(cat) {{
      document.querySelectorAll('.filter-btn').forEach(btn => {{
        btn.classList.remove('bg-[#2F6F4E]', 'text-white');
        btn.classList.add('bg-[#EEF0EA]', 'text-[#1A2E22]');
      }});
      const activeBtn = document.getElementById('btn-' + cat);
      if (activeBtn) {{
        activeBtn.classList.remove('bg-[#EEF0EA]', 'text-[#1A2E22]');
        activeBtn.classList.add('bg-[#2F6F4E]', 'text-white');
      }}

      const cards = document.querySelectorAll('.screen-card');
      cards.forEach(card => {{
        const c = card.getAttribute('data-category');
        const d = card.getAttribute('data-device');
        if (cat === 'all') {{
          card.classList.remove('hidden');
        }} else if (cat === '14') {{
          if (c === '14') card.classList.remove('hidden');
          else card.classList.add('hidden');
        }} else if (cat === 'desktop') {{
          if (d === 'desktop') card.classList.remove('hidden');
          else card.classList.add('hidden');
        }} else if (cat === 'mobile') {{
          if (d === 'mobile') card.classList.remove('hidden');
          else card.classList.add('hidden');
        }} else if (cat === 'flows') {{
          if (c === 'flows') card.classList.remove('hidden');
          else card.classList.add('hidden');
        }}
      }});
    }}

    let currentMode = 'split';

    function openComparator(htmlUrl, imgUrl, title, device) {{
      document.getElementById('modal-title').textContent = title;
      document.getElementById('modal-badge').textContent = device;
      document.getElementById('modal-badge').className = device === 'DESKTOP' 
        ? 'px-2 py-0.5 rounded text-white font-bold bg-[#2F6F4E]' 
        : (device === 'MOBILE' ? 'px-2 py-0.5 rounded text-white font-bold bg-[#B08D2F]' : 'px-2 py-0.5 rounded text-white font-bold bg-[#5C6B60]');
      
      document.getElementById('live-frame').src = htmlUrl;
      document.getElementById('spec-image').src = imgUrl;
      document.getElementById('modal-html-link').href = htmlUrl;

      setComparatorMode('split');
      document.getElementById('comparator-modal').classList.remove('hidden');
    }}

    function closeComparator() {{
      document.getElementById('live-frame').src = 'about:blank';
      document.getElementById('comparator-modal').classList.add('hidden');
    }}

    function setComparatorMode(mode) {{
      currentMode = mode;
      const left = document.getElementById('pane-left');
      const right = document.getElementById('pane-right');
      const sliderCont = document.getElementById('opacity-slider-container');
      const btnSplit = document.getElementById('btn-mode-split');
      const btnOverlay = document.getElementById('btn-mode-overlay');

      if (mode === 'split') {{
        sliderCont.classList.add('hidden');
        btnSplit.className = 'font-bold text-[#2F6F4E]';
        btnOverlay.className = 'text-[#5C6B60]';
        left.style.position = 'relative';
        left.style.width = '50%';
        left.style.opacity = '1';
        right.style.position = 'relative';
        right.style.width = '50%';
        right.style.opacity = '1';
        right.classList.remove('hidden');
      }} else {{
        sliderCont.classList.remove('hidden');
        btnOverlay.className = 'font-bold text-[#2F6F4E]';
        btnSplit.className = 'text-[#5C6B60]';
        left.style.position = 'absolute';
        left.style.inset = '1rem';
        left.style.width = 'calc(100% - 2rem)';
        left.style.zIndex = '10';
        left.style.opacity = '0.5';

        right.style.position = 'absolute';
        right.style.inset = '1rem';
        right.style.width = 'calc(100% - 2rem)';
        right.style.zIndex = '5';
        right.style.opacity = '1';
        right.classList.remove('hidden');
      }}
    }}

    function updateOverlayOpacity(val) {{
      document.getElementById('pane-left').style.opacity = (val / 100).toString();
    }}
  </script>
</body>
</html>'''

with open(r'c:\vs code notes\Minor Project\SmartHire\docs\stitch_screens\index.html', 'w', encoding='utf-8') as f:
    f.write(full_html)

print('Generated docs/stitch_screens/index.html successfully.')

