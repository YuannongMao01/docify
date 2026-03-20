#!/bin/bash
# ============================================================
#  DocConverter — LaTeX OCR Service Installer
#  Installs TexTeller as a macOS background service that
#  starts automatically on login.
#
#  Usage:
#    bash ~/Desktop/asin/doc-converter-extension/install_service.sh
# ============================================================

# Get the directory where this script lives (works regardless of cwd)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_SCRIPT="$SCRIPT_DIR/latex_server.py"
PLIST_LABEL="com.docconverter.latexocr"
PLIST_PATH="$HOME/Library/LaunchAgents/${PLIST_LABEL}.plist"
LOG_DIR="$HOME/Library/Logs/DocConverter"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   DocConverter — LaTeX OCR Service Setup     ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── Step 1: Check Python ──────────────────────────────────
PYTHON_BIN=""
for candidate in python3 python3.12 python3.11 python3.10 /usr/local/bin/python3 /opt/homebrew/bin/python3; do
    if command -v "$candidate" &>/dev/null; then
        PYTHON_BIN="$(command -v "$candidate")"
        break
    fi
done

if [ -z "$PYTHON_BIN" ]; then
    echo "✗ Python 3 not found."
    echo "  Please install Python 3 from https://python.org"
    exit 1
fi
echo "✓ Python: $PYTHON_BIN ($("$PYTHON_BIN" --version 2>&1))"

# ── Step 2: Verify server script exists ───────────────────
if [ ! -f "$SERVER_SCRIPT" ]; then
    echo "✗ Server script not found: $SERVER_SCRIPT"
    exit 1
fi
echo "✓ Server script: $SERVER_SCRIPT"

# ── Step 3: Pre-install dependencies using the same Python ───
echo ""
echo "Installing Python dependencies (texify + Pillow)..."
# Use $PYTHON_BIN -m pip to ensure we install into the correct Python env
# This works regardless of whether the user has pip, pip3, or conda
"$PYTHON_BIN" -m pip install texify Pillow -q 2>&1 | tail -3
echo "✓ Dependencies installed (or already up to date)"

# ── Step 4: Create log directory ──────────────────────────
mkdir -p "$LOG_DIR"
echo "✓ Log directory: $LOG_DIR"

# ── Step 5: Create LaunchAgent plist ─────────────────────
echo ""
echo "Creating LaunchAgent..."

cat > "$PLIST_PATH" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${PLIST_LABEL}</string>

    <key>ProgramArguments</key>
    <array>
        <string>${PYTHON_BIN}</string>
        <string>${SERVER_SCRIPT}</string>
    </array>

    <key>RunAtLoad</key>
    <true/>

    <key>KeepAlive</key>
    <true/>

    <key>StandardOutPath</key>
    <string>${LOG_DIR}/latex_ocr.log</string>

    <key>StandardErrorPath</key>
    <string>${LOG_DIR}/latex_ocr_error.log</string>

    <key>WorkingDirectory</key>
    <string>${SCRIPT_DIR}</string>

    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:/opt/homebrew/sbin</string>
    </dict>
</dict>
</plist>
EOF

echo "✓ LaunchAgent created: $PLIST_PATH"

# ── Step 6: Load the service ──────────────────────────────
echo ""
echo "Starting service..."
launchctl unload "$PLIST_PATH" 2>/dev/null || true
launchctl load "$PLIST_PATH"
echo "✓ Service started"

# ── Step 7: Wait and verify ───────────────────────────────
echo ""
echo "Waiting for server to start..."
echo "(First run downloads the Texify model ~500MB, please wait)"
echo ""

READY=false
for i in $(seq 1 24); do
    sleep 5
    if curl -s --max-time 2 http://localhost:8765/health > /dev/null 2>&1; then
        READY=true
        echo "✓ Server is running at http://localhost:8765"
        break
    fi
    printf "  Waiting... %ds\r" $((i*5))
done

echo ""
if [ "$READY" = true ]; then
    echo "╔══════════════════════════════════════════════╗"
    echo "║   ✅ Installation Complete!                  ║"
    echo "║                                              ║"
    echo "║   The LaTeX OCR server will now start        ║"
    echo "║   automatically every time you log in.       ║"
    echo "║                                              ║"
    echo "║   Open DocConverter in Chrome and use        ║"
    echo "║   the Math OCR tab — it's ready!             ║"
    echo "╚══════════════════════════════════════════════╝"
else
    echo "╔══════════════════════════════════════════════╗"
    echo "║   ⏳ Service is still starting...            ║"
    echo "║                                              ║"
    echo "║   The model is downloading (~300MB).         ║"
    echo "║   Please wait a few minutes, then click      ║"
    echo "║   'Retry' in the Math OCR tab.               ║"
    echo "║                                              ║"
    echo "║   Check logs: ~/Library/Logs/DocConverter/   ║"
    echo "╚══════════════════════════════════════════════╝"
fi

echo ""
echo "To uninstall: bash $SCRIPT_DIR/uninstall_service.sh"
echo ""
