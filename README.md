# Docify — PDF, Image & Math OCR

A modern Apple-style Chrome/Edge browser extension for document conversion and math formula recognition. Everything runs locally — no file uploads, no servers, no data collection.

## ✨ Features

| Tab | Feature |
|-----|---------|
| 🖼️ **Img→PDF** | Convert JPG/PNG/JPEG to PDF (single or batch), supports A4/Letter/Fit |
| 📄 **PDF→Img** | Export each PDF page as PNG or JPEG, supports Standard/HD/Ultra HD |
| 📑 **Merge PDF** | Merge multiple PDFs, drag or use ▲▼ buttons to reorder |
| 🔢 **Math OCR** | Screenshot a math formula → get LaTeX code with rendered preview |

---

## 🚀 Installation

### Step 1: Download JS Libraries

```bash
bash setup.sh
# or
python3 download_libs.py
```

### Step 2: Install Math OCR Service (optional, for Math OCR tab)

**macOS:**
```bash
bash install_service.sh
```

**Windows:**
```
Double-click install_service.bat
```

This will automatically:
- Install `texify` and `Pillow` via pip
- Register the server to auto-start on login (macOS: LaunchAgent, Windows: Task Scheduler)
- First run downloads the Texify model (~500MB)

### Step 3: Load Extension in Chrome/Edge

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `docify` folder
5. Done! Click the Docify icon in the toolbar

> **Edge users**: Open `edge://extensions/` — same steps apply

---

## 🔢 Using Math OCR

1. Take a screenshot of a math formula
2. Switch to the **Math OCR** tab
3. Confirm the server status shows **✓ Online** (green dot)
4. Drop the image, click **Select Image**, or press **⌘V / Ctrl+V** to paste
5. Click **Recognize Formula**
6. Copy the LaTeX code or view the rendered preview

**Example output:**

Input image: `∫₀^∞ e^(-x²) dx = √π/2`

Output LaTeX:
```latex
\int_{0}^{\infty} e^{-x^{2}} d x=\frac{\sqrt{\pi}}{2}
```

---

## 📁 File Structure

```
docify/
├── manifest.json              # Chrome MV3 config
├── latex_server.py            # Local LaTeX OCR API server (Texify)
├── install_service.sh         # macOS one-click install script
├── install_service.bat        # Windows one-click install script
├── uninstall_service.sh       # macOS uninstall
├── uninstall_service.bat      # Windows uninstall
├── setup.sh                   # Download JS libraries (macOS/Linux)
├── download_libs.py           # Download JS libraries (cross-platform)
├── popup/
│   ├── popup.html             # Main UI (4 tabs)
│   ├── popup.css              # Apple-style design
│   └── popup.js               # All conversion logic
├── background/
│   └── service_worker.js      # Background service worker
└── lib/                       # JS libraries (run setup.sh to populate)
    ├── pdf-lib.min.js
    ├── pdf.min.js
    ├── pdf.worker.min.js
    ├── katex.min.js
    ├── katex.min.css
    └── fonts/                 # KaTeX fonts
```

---

## 🔒 Privacy

- All PDF/image processing runs **locally in the browser** — no uploads
- Math OCR runs on a **local Python server** — no internet required
- **Zero data persistence** — files are cleared when the popup closes
- No analytics, no tracking, no cookies

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| PDF creation/merge | pdf-lib v1.17.1 |
| PDF rendering | PDF.js v3.11.174 |
| Math formula recognition | Texify (VikParuchuri) |
| LaTeX rendering | KaTeX v0.16.9 |
| Browser extension | Chrome Extension Manifest V3 |

---

## 💻 Compatibility

| Platform | Browser | Version |
|----------|---------|---------|
| macOS | Chrome | 88+ |
| macOS | Edge | 88+ |
| Windows | Chrome | 88+ |
| Windows | Edge | 88+ |

---

## ❓ FAQ

**Q: Math OCR server shows offline?**
A: Make sure you've run `install_service.sh` (macOS) or `install_service.bat` (Windows).

**Q: First recognition is slow?**
A: Texify downloads its model (~500MB) on first run. Subsequent runs are much faster.

**Q: Recognition accuracy is poor?**
A: Use a clear screenshot with the formula cropped tightly. Avoid noisy backgrounds.

**Q: Do I need the Math OCR server for PDF/image features?**
A: No. The PDF conversion and merge features work completely offline without any server.
