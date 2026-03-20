import urllib.request, ssl, os, re
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
lib = '/Users/yuannong/Desktop/asin/doc-converter-extension/lib'
fd = lib + '/fonts'
os.makedirs(fd, exist_ok=True)
css = open(lib+'/katex.min.css').read()
fonts = sorted(set(re.findall(r'fonts/(KaTeX_[^"\']+\.woff2)', css)))
base = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/fonts/'
ok = 0
for fn in fonts:
    dest = fd + '/' + fn
    if os.path.exists(dest) and os.path.getsize(dest) > 100:
        ok += 1
        continue
    try:
        req = urllib.request.Request(base+fn, headers={'User-Agent':'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=20, context=ctx) as r:
            data = r.read()
        with open(dest, 'wb') as fh:
            fh.write(data)
        ok += 1
    except Exception as e:
        print('SKIP', fn, e)
print(f'Done {ok}/{len(fonts)}')
print(os.listdir(fd))
