"""
One-time setup: copy CSS/JS/lib from doc-converter-extension into renderer/
Run: python3 setup.py
"""
import shutil, os

src = os.path.join(os.path.dirname(__file__), '..', 'doc-converter-extension', 'popup')
dst = os.path.join(os.path.dirname(__file__), 'renderer')
lib_src = os.path.join(os.path.dirname(__file__), '..', 'doc-converter-extension', 'lib')
lib_dst = os.path.join(dst, 'lib')

os.makedirs(dst, exist_ok=True)
os.makedirs(lib_dst, exist_ok=True)

# Copy popup.css and popup.js
for f in ['popup.css', 'popup.js']:
    s = os.path.join(src, f)
    d = os.path.join(dst, f)
    if os.path.exists(s):
        shutil.copy2(s, d)
        print(f'  ✓ Copied {f}')
    else:
        print(f'  ✗ Not found: {s}')

# Copy lib files (katex, pdf-lib, pdf.js, fonts)
for item in os.listdir(lib_src):
    s = os.path.join(lib_src, item)
    d = os.path.join(lib_dst, item)
    if os.path.isdir(s):
        if os.path.exists(d):
            shutil.rmtree(d)
        shutil.copytree(s, d)
        print(f'  ✓ Copied lib/{item}/')
    else:
        shutil.copy2(s, d)
        print(f'  ✓ Copied lib/{item}')

print('\nDone! Now run:')
print('  cd docify-app && npm install && npm start')
