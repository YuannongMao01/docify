#!/bin/bash
# DocConverter Extension — Setup Script
# Downloads required JS libraries

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB_DIR="$SCRIPT_DIR/lib"

mkdir -p "$LIB_DIR"

echo "DocConverter — Downloading JS libraries..."
echo ""

# pdf-lib
echo "  [1/3] Downloading pdf-lib..."
curl -L -s -o "$LIB_DIR/pdf-lib.min.js" \
  "https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js"
echo "  ✓ pdf-lib.min.js ($(du -sh "$LIB_DIR/pdf-lib.min.js" | cut -f1))"

# PDF.js main
echo "  [2/3] Downloading PDF.js..."
curl -L -s -o "$LIB_DIR/pdf.min.js" \
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
echo "  ✓ pdf.min.js ($(du -sh "$LIB_DIR/pdf.min.js" | cut -f1))"

# PDF.js worker
echo "  [3/3] Downloading PDF.js worker..."
curl -L -s -o "$LIB_DIR/pdf.worker.min.js" \
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
echo "  ✓ pdf.worker.min.js ($(du -sh "$LIB_DIR/pdf.worker.min.js" | cut -f1))"

echo ""
echo "All libraries downloaded to: $LIB_DIR"
echo ""
echo "Next steps:"
echo "  1. Open Chrome and go to: chrome://extensions/"
echo "  2. Enable 'Developer mode' (top right toggle)"
echo "  3. Click 'Load unpacked'"
echo "  4. Select the folder: $SCRIPT_DIR"
echo "  5. The DocConverter extension is now installed!"
