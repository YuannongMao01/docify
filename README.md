# DocConverter — PDF, Image & Math OCR Tools

一个现代 Apple 风格的 Chrome/Edge 浏览器插件，支持文档格式转换和数学公式识别，完全本地运行。

## ✨ 功能

| Tab | 功能 |
|-----|------|
| 🖼️ **图片→PDF** | JPG/PNG/JPEG 单张或批量转换为 PDF，支持 A4/Letter/适应图片 |
| 📄 **PDF→图片** | PDF 每页导出为 PNG 或 JPEG，支持标准/高清/超清分辨率 |
| 📑 **合并PDF** | 多个 PDF 合并为一个，支持拖拽排序 |
| 🔢 **公式识别** | 截图数学公式 → 自动识别为 LaTeX 代码，支持渲染预览 |

---

## 🚀 安装步骤

### 第一步：下载 JS 库（PDF 功能需要）

```bash
bash setup.sh
# 或
python3 download_libs.py
```

### 第二步：安装公式识别服务（Math OCR 功能需要）

```bash
# 安装 pix2tex（LaTeX-OCR）
pip install pix2tex Pillow

# 启动本地 API 服务器（每次使用前需要运行）
python3 latex_server.py
```

服务器启动后会在 `http://localhost:8765` 监听。

> **首次运行**会自动下载 pix2tex 模型（约 300MB），请耐心等待。

### 第三步：加载插件到 Chrome/Edge

1. 打开 Chrome，地址栏输入：`chrome://extensions/`
2. 右上角开启 **开发者模式**（Developer mode）
3. 点击 **加载已解压的扩展程序**（Load unpacked）
4. 选择 `doc-converter-extension` 文件夹
5. 完成！点击工具栏中的 DocConverter 图标即可使用

---

## 🔢 公式识别使用方法

1. 截图一张包含数学公式的图片（系统截图工具 / 截图软件）
2. 切换到 **公式识别** Tab
3. 确认服务器状态为 **✓ 在线**（绿色）
4. 拖拽截图或点击"选择图片"
5. 点击 **识别公式**
6. 等待识别完成（首次约 5-10 秒）
7. 复制 LaTeX 代码，或查看渲染预览

### 示例输出

输入图片：`∫₀^∞ e^(-x²) dx = √π/2`

输出 LaTeX：
```latex
\int_{0}^{\infty} e^{-x^{2}} d x=\frac{\sqrt{\pi}}{2}
```

---

## 📁 文件结构

```
doc-converter-extension/
├── manifest.json              # Chrome MV3 配置
├── latex_server.py            # 本地 LaTeX OCR API 服务器
├── setup.sh                   # 一键下载 JS 库
├── download_libs.py           # Python 下载脚本
├── popup/
│   ├── popup.html             # 主界面（4个功能Tab）
│   ├── popup.css              # Apple 风格样式
│   └── popup.js               # 所有功能逻辑
├── background/
│   └── service_worker.js      # 后台服务
└── lib/                       # JS 库（运行 setup.sh 后生成）
    ├── pdf-lib.min.js
    ├── pdf.min.js
    └── pdf.worker.min.js
```

---

## 🔒 隐私说明

- PDF/图片处理均在**本地浏览器**完成，不上传文件
- 公式识别通过**本地 Python 服务器**处理，不联网
- 不收集任何用户数据

---

## 🛠️ 技术栈

| 组件 | 技术 |
|------|------|
| PDF 创建/合并 | pdf-lib v1.17.1 |
| PDF 渲染 | PDF.js v3.11.174 |
| 公式识别 | pix2tex (LaTeX-OCR) |
| 公式渲染 | MathJax v3 |
| 浏览器插件 | Chrome Extension Manifest V3 |

---

## 💻 兼容性

| 平台 | 浏览器 | 版本要求 |
|------|--------|---------|
| macOS | Chrome | 88+ |
| macOS | Edge | 88+ |
| Windows | Chrome | 88+ |
| Windows | Edge | 88+ |

---

## ❓ 常见问题

**Q: 公式识别服务器显示离线？**
A: 确保已运行 `python3 latex_server.py`，并且 pix2tex 已安装。

**Q: 首次识别很慢？**
A: pix2tex 首次运行需要加载模型（约 300MB），之后会快很多。

**Q: 识别结果不准确？**
A: 建议使用清晰的截图，公式区域尽量裁剪干净，避免背景干扰。
