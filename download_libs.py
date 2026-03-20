#!/usr/bin/env python3
"""Download required JS libraries for DocConverter extension."""

import urllib.request
import os
import sys

LIB_DIR = os.path.join(os.path.dirname(__file__), 'lib')
os.makedirs(LIB_DIR, exist_ok=True)

LIBS = [
    {
        'url': 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js',
        'filename': 'pdf-lib.min.js',
        'desc': 'pdf-lib (PDF creation/editing)',
    },
    {
        'url': 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
        'filename': 'pdf.min.js',
        'desc': 'PDF.js main (PDF rendering)',
    },
    {
        'url': 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
        'filename': 'pdf.worker.min.js',
        'desc': 'PDF.js worker',
    },
]

def download(url, dest, desc):
    print(f'  Downloading {desc}...')
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
        with open(dest, 'wb') as f:
            f.write(data)
        size_kb = len(data) / 1024
        print(f'  ✓ {os.path.basename(dest)} ({size_kb:.0f} KB)')
        return True
    except Exception as e:
        print(f'  ✗ Failed: {e}')
        return False

print('DocConverter — Downloading JS libraries\n')
success = 0
for lib in LIBS:
    dest = os.path.join(LIB_DIR, lib['filename'])
    if os.path.exists(dest) and os.path.getsize(dest) > 1000:
        print(f'  ✓ {lib["filename"]} already exists, skipping.')
        success += 1
    else:
        if download(lib['url'], dest, lib['desc']):
            success += 1

print(f'\nDone: {success}/{len(LIBS)} libraries ready.')
if success == len(LIBS):
    print('All libraries downloaded successfully!')
else:
    print('Some downloads failed. Check your internet connection.')
    sys.exit(1)
