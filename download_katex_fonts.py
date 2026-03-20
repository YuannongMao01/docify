#!/usr/bin/env python3
"""Download KaTeX fonts for offline use in the extension."""
import urllib.request, ssl, os, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

lib_dir = os.path.join(os.path.dirname(__file__), 'lib')
fonts_dir = os.path.join(lib_dir, 'fonts')
os.makedirs(fonts_dir, exist_ok=True)

# Read katex.min.css to find font references
css_path = os.path.join(lib_dir, 'katex.min.css')
with open(css_path, 'r') as f:
    css = f.read()

font_files = sorted(set(re.findall(r'fonts/(KaTeX_[^"\']+\.(?:woff2|woff|ttf))', css)))
print(f'Found {len(font_files)} font files')

base_url = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/fonts/'
ok = 0
for fname in font_files:
    dest = os.path.join(fonts_dir, fname)
    if os.path.exists(dest) and os.path.getsize(dest) > 100:
        ok += 1
        print(f'  ✓ {fname} (cached)')
        continue
    try:
        req = urllib.request.Request(base_url + fname, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15, context=ctx) as r:
            data = r.read()
        with open(dest, 'wb') as fh:
            fh.write(data)
        ok += 1
        print(f'  ✓ {fname} ({len(data)//1024}KB)')
    except Exception as e:
        print(f'  ✗ {fname}: {e}')

print(f'\nDone: {ok}/{len(font_files)} fonts ready in {fonts_dir}')
