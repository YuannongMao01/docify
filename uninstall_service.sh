#!/bin/bash
# DocConverter — Uninstall LaTeX OCR background service

PLIST_LABEL="com.docconverter.latexocr"
PLIST_PATH="$HOME/Library/LaunchAgents/${PLIST_LABEL}.plist"

echo ""
echo "Uninstalling DocConverter LaTeX OCR service..."

if [ -f "$PLIST_PATH" ]; then
    launchctl unload "$PLIST_PATH" 2>/dev/null || true
    rm -f "$PLIST_PATH"
    echo "✓ Service removed"
else
    echo "  Service not found (already uninstalled?)"
fi

echo "✓ Done. The LaTeX OCR server will no longer start automatically."
echo ""
