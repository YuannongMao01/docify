#!/usr/bin/env python3
"""
LaTeX OCR Local API Server — powered by Texify
https://github.com/VikParuchuri/texify

Install:
    pip install texify Pillow

Run manually:
    python3 latex_server.py

Or install as a background service (auto-start on login):
    bash install_service.sh
"""

import sys
import io
import base64
import json
import subprocess
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

PORT = 8765

# ── Auto-install missing dependencies ─────────────────────────
def ensure_package(package, import_name=None):
    """Install a package using the same Python that's running this script.
    Works regardless of whether the user has pip, pip3, or conda."""
    name = import_name or package.lower().replace('-', '_').split('[')[0]
    try:
        __import__(name)
        return True
    except ImportError:
        print(f"  Installing {package}...")
        try:
            subprocess.check_call(
                [sys.executable, '-m', 'pip', 'install', package, '-q'],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.STDOUT
            )
            print(f"  ✓ {package} installed")
            return True
        except subprocess.CalledProcessError as e:
            print(f"  ✗ Failed to install {package}: {e}")
            return False

print("Checking dependencies...")
ensure_package('texify')
ensure_package('Pillow', 'PIL')
print("Dependencies ready.\n")

# ── Load Texify model ─────────────────────────────────────────
MODEL_AVAILABLE = False
texify_model = None
texify_processor = None

try:
    from texify.inference import batch_inference
    from texify.model.model import load_model
    from texify.model.processor import load_processor

    print("Loading Texify model (first run downloads ~500MB)...")
    texify_model     = load_model()
    texify_processor = load_processor()
    print("✓ Texify model loaded successfully")
    MODEL_AVAILABLE = True
except ImportError as e:
    print(f"✗ Texify not installed: {e}")
    print("  Run: pip install texify")
except Exception as e:
    print(f"✗ Failed to load Texify model: {e}")

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    print("✗ Pillow not installed. Run: pip install Pillow")
    PIL_AVAILABLE = False


class CORSHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # suppress default logging

    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path
        if path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            resp = {
                'status': 'ok',
                'model_available': MODEL_AVAILABLE,
                'pil_available': PIL_AVAILABLE,
                'engine': 'texify',
            }
            self.wfile.write(json.dumps(resp).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        path = urlparse(self.path).path
        if path != '/predict':
            self.send_response(404)
            self.end_headers()
            return

        if not MODEL_AVAILABLE or not PIL_AVAILABLE:
            self.send_response(503)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({
                'error': 'Model not available. Run: pip install texify Pillow'
            }).encode())
            return

        try:
            length = int(self.headers.get('Content-Length', 0))
            body   = self.rfile.read(length)
            data   = json.loads(body)

            img_b64 = data.get('image', '')
            if img_b64.startswith('data:'):
                img_b64 = img_b64.split(',', 1)[1]

            img_bytes = base64.b64decode(img_b64)
            img = Image.open(io.BytesIO(img_bytes)).convert('RGB')

            # Texify inference — batch_inference returns a list of strings
            results = batch_inference([img], texify_model, texify_processor)
            latex = results[0] if results else ''
            latex = str(latex).strip()
            print(f"  → {latex[:80]}{'...' if len(latex) > 80 else ''}")

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({'latex': latex}).encode())

        except Exception as e:
            print(f"  ✗ Error: {e}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())


def main():
    print(f"\n{'='*50}")
    print(f"  LaTeX OCR Server (Texify) — port {PORT}")
    print(f"{'='*50}")
    if not MODEL_AVAILABLE:
        print("\n  ⚠️  Install Texify first:")
        print("     pip install texify Pillow\n")
    else:
        print(f"\n  ✓ Ready at http://localhost:{PORT}")
        print(f"  Health: http://localhost:{PORT}/health\n")

    server = HTTPServer(('localhost', PORT), CORSHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Server stopped.")
        server.server_close()


if __name__ == '__main__':
    main()
