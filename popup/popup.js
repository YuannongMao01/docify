'use strict';
// ─── i18n ─────────────────────────────────────────────────────
const MATH_API = 'http://localhost:8765';

const I18N = {
  en: {
    tab_img2pdf:'Img→PDF', tab_pdf2img:'PDF→Img', tab_merge:'Merge', tab_math:'Math OCR',
    btn_add_more:'+ Add more', btn_replace_file:'↺ Replace file', btn_replace_all:'↺ Replace all',
    // (symbols are part of the text, no SVG icons needed)
    drop_img_title:'Drop images here', drop_img_sub:'JPG, PNG, JPEG — single or batch',
    drop_pdf_title:'Drop PDF here', drop_pdf2img_sub:'Each page exported as image',
    drop_merge_title:'Drop multiple PDFs here', drop_merge_sub:'Drag to reorder before merging',
    btn_select_files:'Select Files', btn_select_pdf:'Select PDF', btn_select_pdfs:'Select PDFs',
    btn_convert:'Convert', btn_merge:'Merge PDFs', btn_download:'Download',
    label_page_size:'Page Size', opt_fit:'Fit Image',
    label_format:'Format', label_resolution:'Resolution',
    opt_std:'Standard (72dpi)', opt_hd:'HD (144dpi)', opt_uhd:'Ultra HD (216dpi)',
    progress_processing:'Processing', progress_done:'Done!',
    toast_min2:'Please select at least 2 PDF files',
    toast_unsupported:'Unsupported file type',
    result_img2pdf_done:'images converted to PDF',
    result_pdf2img_done:'pages exported as',
    result_pdf2img_multi:'PDFs converted —',
    result_merge_done:'PDFs merged successfully',
    preview_label_pdf:'📄 Preview (first page)',
    preview_label_imgs:'🖼️ Preview (all pages)',
    preview_label_merged:'📑 Preview (merged)',
    err_convert:'Conversion failed',
    err_merge:'Merge failed',
    math_checking:'Checking server...',
    math_online:'✓ Server online — ready',
    math_offline:'✗ Server offline',
    math_retry:'Retry',
    math_server_notice:'⚠️ Local server not running. Start it first:',
    math_install_hint:'Install: pip install pix2tex Pillow',
    math_drop_title:'Drop formula image here',
    math_drop_sub:'PNG, JPG — screenshot of a math formula',
    math_select_btn:'Select Image',
    math_recognize_btn:'Recognize Formula',
    math_result_label:'LaTeX Output',
    math_copy_btn:'Copy',
    math_render_label:'Rendered Preview',
    math_copied:'Copied!',
    math_err_no_img:'Please select an image first',
    math_err_server:'Server error — is the server running?',
    math_err_recognize:'Recognition failed',
    math_step1:'Open Terminal and run:',
    math_step2:'Done! Server starts automatically on login.',
    math_open_install:'📂 Show Install Script in Finder',
    math_server_notice:'⚠️ Server not running. First-time setup:',
    math_install_hint:'Requires: pip install texteller Pillow',
    math_paste_hint:'or press ⌘V / Ctrl+V to paste',
    math_pasted:'Image pasted!',
  },
  zh: {
    tab_img2pdf:'图片→PDF', tab_pdf2img:'PDF→图片', tab_merge:'合并PDF', tab_math:'公式识别',
    btn_add_more:'+ 继续添加', btn_replace_file:'↺ 替换文件', btn_replace_all:'↺ 全部替换',
    // (symbols are part of the text, no SVG icons needed)
    drop_img_title:'拖拽图片到此处', drop_img_sub:'支持 JPG、PNG、JPEG，可多选',
    drop_pdf_title:'拖拽 PDF 到此处', drop_pdf2img_sub:'每页将导出为独立图片',
    drop_merge_title:'拖拽多个 PDF 到此处', drop_merge_sub:'按列表顺序合并，可拖拽排序',
    btn_select_files:'选择文件', btn_select_pdf:'选择 PDF', btn_select_pdfs:'选择 PDF 文件',
    btn_convert:'开始转换', btn_merge:'合并 PDF', btn_download:'下载文件',
    label_page_size:'页面大小', opt_fit:'适应图片',
    label_format:'输出格式', label_resolution:'分辨率',
    opt_std:'标准 (72dpi)', opt_hd:'高清 (144dpi)', opt_uhd:'超清 (216dpi)',
    progress_processing:'处理中', progress_done:'完成！',
    toast_min2:'请至少选择 2 个 PDF 文件',
    toast_unsupported:'不支持的文件类型',
    result_img2pdf_done:'张图片已转换为 PDF',
    result_pdf2img_done:'页已导出为',
    result_pdf2img_multi:'个 PDF 已转换 —',
    result_merge_done:'个 PDF 已合并',
    preview_label_pdf:'📄 预览（第一页）',
    preview_label_imgs:'🖼️ 预览（所有页面）',
    preview_label_merged:'📑 预览（合并结果）',
    err_convert:'转换失败',
    err_merge:'合并失败',
    math_checking:'检测服务器...',
    math_online:'✓ 服务器在线 — 就绪',
    math_offline:'✗ 服务器离线',
    math_retry:'重试',
    math_server_notice:'⚠️ 本地服务器未运行，请先启动：',
    math_install_hint:'安装：pip install pix2tex Pillow',
    math_drop_title:'拖拽公式图片到此处',
    math_drop_sub:'PNG、JPG — 数学公式截图',
    math_select_btn:'选择图片',
    math_recognize_btn:'识别公式',
    math_result_label:'LaTeX 输出',
    math_copy_btn:'复制',
    math_render_label:'渲染预览',
    math_copied:'已复制！',
    math_err_no_img:'请先选择图片',
    math_err_server:'服务器错误 — 服务器是否已启动？',
    math_err_recognize:'识别失败',
    math_step1:'打开终端，运行：',
    math_step2:'完成！之后每次登录自动启动。',
    math_open_install:'📂 在 Finder 中显示安装脚本',
    math_server_notice:'⚠️ 服务器未运行，首次使用请安装：',
    math_install_hint:'需要：pip install texteller Pillow',
    math_paste_hint:'或按 ⌘V / Ctrl+V 粘贴截图',
    math_pasted:'图片已粘贴！',
  }
};

// ─── State ────────────────────────────────────────────────────
const state = {
  lang: 'en',
  img2pdf: { files: [] },
  pdf2img: { files: [] },
  merge:   { files: [] },
  currentTab: 'img2pdf',
  outputBlobs: [],
  cancelController: null,  // AbortController for current operation
};

const t   = key => (I18N[state.lang][key] || I18N.en[key] || key);
const $   = id  => document.getElementById(id);
const $$  = sel => document.querySelectorAll(sel);

// ─── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initLang();
  initTabs();
  initDropZones();
  initFileInputs();
  initConvertButtons();
  initDownloadBtn();
  initCancelBtn();
  initMathOCR();
  initPreviewModal();
  applyI18n();
});

// ─── Language ─────────────────────────────────────────────────
function initLang() {
  // Always default to English, no persistence
  setLang('en');
  $('langEN').addEventListener('click', () => setLang('en'));
  $('langZH').addEventListener('click', () => setLang('zh'));
}

function setLang(lang) {
  state.lang = lang;
  $('langEN').classList.toggle('active', lang === 'en');
  $('langZH').classList.toggle('active', lang === 'zh');
  applyI18n();
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('option[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
}

// ─── Tabs ─────────────────────────────────────────────────────
function initTabs() {
  $$('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      $$('.tab-btn').forEach(b => b.classList.remove('active'));
      $$('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      $(`tab-${tab}`).classList.add('active');
      state.currentTab = tab;
      hideResult();
    });
  });
}

// ─── Drop Zones ───────────────────────────────────────────────
function initDropZones() {
  ['img2pdf','pdf2img','merge'].forEach(tab => {
    const zone = $(`dropZone-${tab}`);
    if (!zone) return;
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault(); zone.classList.remove('drag-over');
      addFiles(tab, Array.from(e.dataTransfer.files));
    });
    zone.addEventListener('click', e => {
      if (e.target.classList.contains('select-btn')) return;
      $(`fileInput-${tab}`).click();
    });
  });
}

// ─── File Inputs ──────────────────────────────────────────────
function initFileInputs() {
  ['img2pdf','pdf2img','merge'].forEach(tab => {
    const input      = $(`fileInput-${tab}`);
    const btn        = $(`selectBtn-${tab}`);
    const addBtn     = $(`compactAddBtn-${tab}`);     // "Add more" (img2pdf, merge only)
    const replaceBtn = $(`compactReplaceBtn-${tab}`); // "Replace" (all three tabs)
    if (!input || !btn) return;

    btn.addEventListener('click', e => { e.stopPropagation(); input.click(); });
    input.addEventListener('change', () => { addFiles(tab, Array.from(input.files)); input.value = ''; });

    // "Add more" — append files (img2pdf & merge)
    if (addBtn) addBtn.addEventListener('click', () => input.click());

    // "Replace" — clear existing files and restore drop zone (user re-uploads manually)
    if (replaceBtn) {
      replaceBtn.addEventListener('click', () => {
        state[tab].files = [];
        renderFileList(tab);
        updateConvertBtn(tab);
        updateDropZoneVisibility(tab);
      });
    }
  });
}

// ─── Toggle Drop Zone visibility ──────────────────────────────
function updateDropZoneVisibility(tab) {
  const zone    = $(`dropZone-${tab}`);
  const btnRow  = $(`compactBtnRow-${tab}`);
  if (!zone || !btnRow) return;
  const hasFiles = state[tab].files.length > 0;
  zone.style.display   = hasFiles ? 'none' : '';
  btnRow.style.display = hasFiles ? 'flex' : 'none';
}

// ─── Add Files ────────────────────────────────────────────────
function addFiles(tab, newFiles) {
  const allowed = {
    img2pdf: ['image/jpeg','image/png','image/jpg'],
    pdf2img: ['application/pdf'],
    merge:   ['application/pdf'],
  };
  const filtered = newFiles.filter(f => {
    if (!allowed[tab].includes(f.type)) { showToast(t('toast_unsupported') + ': ' + f.name, 'error'); return false; }
    return true;
  });
  state[tab].files.push(...filtered);
  renderFileList(tab);
  updateConvertBtn(tab);
  updateDropZoneVisibility(tab);
}

function renderFileList(tab) {
  const list = $(`fileList-${tab}`);
  list.innerHTML = '';
  const total = state[tab].files.length;
  state[tab].files.forEach((file, idx) => {
    const isPdf = file.type === 'application/pdf';
    const item = document.createElement('div');
    item.className = 'file-item';
    item.dataset.index = idx;

    // For merge tab: show order number + up/down buttons
    const mergeControls = tab === 'merge' ? `
      <span class="file-order">${idx + 1}</span>
      <div class="file-move-btns">
        <button class="file-move-btn move-up" data-idx="${idx}" title="Move up" ${idx === 0 ? 'disabled' : ''}>▲</button>
        <button class="file-move-btn move-down" data-idx="${idx}" title="Move down" ${idx === total - 1 ? 'disabled' : ''}>▼</button>
      </div>` : '';

    item.innerHTML = `
      ${mergeControls}
      <div class="file-icon ${isPdf ? 'pdf' : 'img'}">${isPdf ? 'PDF' : 'IMG'}</div>
      <div class="file-info">
        <div class="file-name" title="${file.name}">${file.name}</div>
        <div class="file-size">${formatSize(file.size)}</div>
      </div>
      <button class="file-remove" data-idx="${idx}">×</button>`;
    list.appendChild(item);
  });

  // Remove buttons
  list.querySelectorAll('.file-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      state[tab].files.splice(parseInt(btn.dataset.idx), 1);
      renderFileList(tab);
      updateConvertBtn(tab);
      updateDropZoneVisibility(tab);
    });
  });

  // Move up/down buttons (merge tab only)
  if (tab === 'merge') {
    list.querySelectorAll('.move-up').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const i = parseInt(btn.dataset.idx);
        if (i > 0) {
          [state[tab].files[i-1], state[tab].files[i]] = [state[tab].files[i], state[tab].files[i-1]];
          renderFileList(tab);
        }
      });
    });
    list.querySelectorAll('.move-down').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const i = parseInt(btn.dataset.idx);
        if (i < state[tab].files.length - 1) {
          [state[tab].files[i], state[tab].files[i+1]] = [state[tab].files[i+1], state[tab].files[i]];
          renderFileList(tab);
        }
      });
    });
    initSortable(list, tab);
  }
}

function initSortable(list, tab) {
  let dragSrc = null;
  list.querySelectorAll('.file-item').forEach(item => {
    item.setAttribute('draggable', true);
    item.addEventListener('dragstart', () => { dragSrc = item; setTimeout(() => item.classList.add('sortable-ghost'), 0); });
    item.addEventListener('dragend',   () => { item.classList.remove('sortable-ghost'); dragSrc = null; });
    item.addEventListener('dragover',  e => {
      e.preventDefault();
      if (dragSrc && dragSrc !== item) {
        const mid = item.getBoundingClientRect().top + item.getBoundingClientRect().height / 2;
        list.insertBefore(dragSrc, e.clientY < mid ? item : item.nextSibling);
        const newOrder = Array.from(list.querySelectorAll('.file-item')).map(el => state[tab].files[parseInt(el.dataset.index)]);
        state[tab].files = newOrder;
        renderFileList(tab);
      }
    });
  });
}

function updateConvertBtn(tab) {
  const btn = $(`convertBtn-${tab}`);
  if (btn) btn.disabled = state[tab].files.length === 0;
}

// ─── Convert Buttons ──────────────────────────────────────────
function initConvertButtons() {
  $('convertBtn-img2pdf').addEventListener('click', convertImg2Pdf);
  $('convertBtn-pdf2img').addEventListener('click', convertPdf2Img);
  $('convertBtn-merge').addEventListener('click',   convertMergePdf);
}

// ════ FEATURE 1: Image → PDF ══════════════════════════════════
async function convertImg2Pdf() {
  const files = state.img2pdf.files;
  const pageSize = $('pageSize-img2pdf').value;
  if (!files.length) return;
  setLoading('convertBtn-img2pdf', true);
  showProgress(0, t('progress_processing') + '...');
  try {
    const { PDFDocument } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const PAGE_SIZES = { A4:[595.28,841.89], Letter:[612,792] };
    for (let i = 0; i < files.length; i++) {
      showProgress(Math.round((i/files.length)*90), `${t('progress_processing')} ${i+1}/${files.length}...`);
      const ab = await readFileAsArrayBuffer(files[i]);
      const isJpeg = files[i].type === 'image/jpeg' || /\.(jpg|jpeg)$/i.test(files[i].name);
      let img;
      try { img = isJpeg ? await pdfDoc.embedJpg(ab) : await pdfDoc.embedPng(ab); }
      catch { img = isJpeg ? await pdfDoc.embedPng(ab) : await pdfDoc.embedJpg(ab); }
      let [pageW, pageH] = pageSize === 'fit' ? [img.width, img.height] : (PAGE_SIZES[pageSize] || PAGE_SIZES.A4);
      const page = pdfDoc.addPage([pageW, pageH]);
      const pad = pageSize === 'fit' ? 0 : 20;
      const scale = Math.min((pageW-pad*2)/img.width, (pageH-pad*2)/img.height, 1);
      const dw = img.width*scale, dh = img.height*scale;
      page.drawImage(img, { x:(pageW-dw)/2, y:(pageH-dh)/2, width:dw, height:dh });
    }
    showProgress(95, t('progress_processing') + '...');
    const bytes = await pdfDoc.save();
    const blob  = new Blob([bytes], { type:'application/pdf' });
    const fname = files.length===1 ? files[0].name.replace(/\.[^.]+$/,'')+'.pdf' : `converted_${timestamp()}.pdf`;
    state.outputBlobs = [{ blob, filename: fname }];
    showProgress(100, t('progress_done'));
    setTimeout(() => { hideProgress(); showResult(`${files.length} ${t('result_img2pdf_done')}`, 'pdf'); }, 400);
  } catch(err) {
    hideProgress(); showToast(t('err_convert') + ': ' + err.message, 'error'); console.error(err);
  } finally { setLoading('convertBtn-img2pdf', false); }
}

// ════ FEATURE 2: PDF → Images ═════════════════════════════════
async function convertPdf2Img() {
  const files  = state.pdf2img.files;
  const format = $('imgFormat-pdf2img').value;
  const scale  = parseFloat($('dpi-pdf2img').value);
  if (!files.length) return;
  setLoading('convertBtn-pdf2img', true);
  showProgress(0, t('progress_processing') + '...');
  try {
    if (typeof pdfjsLib === 'undefined') throw new Error('PDF.js not loaded');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '../lib/pdf.worker.min.js';

    const allBlobs = [];
    let totalPages = 0;

    for (let fi = 0; fi < files.length; fi++) {
      const file     = files[fi];
      const baseName = file.name.replace(/\.pdf$/i, '');
      // Progress: outer loop per file
      const fileBase = Math.round((fi / files.length) * 90);
      showProgress(fileBase, `${t('progress_processing')} ${file.name} (${fi+1}/${files.length})...`);

      const ab  = await readFileAsArrayBuffer(file);
      const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
      const numPages = pdf.numPages;

      for (let p = 1; p <= numPages; p++) {
        // Progress: inner loop per page within this file
        const pct = fileBase + Math.round((p / numPages) * (90 / files.length));
        showProgress(pct, `${t('progress_processing')} ${file.name} — ${p}/${numPages}...`);

        const page   = await pdf.getPage(p);
        const vp     = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = vp.width; canvas.height = vp.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
        const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const blob = dataURLtoBlob(canvas.toDataURL(mime, format === 'jpeg' ? 0.92 : undefined));
        // Prefix filename with PDF name when multiple files
        const fname = files.length > 1
          ? `${baseName}_page${p}.${format === 'jpeg' ? 'jpg' : 'png'}`
          : `${baseName}_page${p}.${format === 'jpeg' ? 'jpg' : 'png'}`;
        allBlobs.push({ blob, filename: fname });
        totalPages++;
      }
    }

    state.outputBlobs = allBlobs;
    showProgress(100, t('progress_done'));

    const resultText = files.length > 1
      ? `${files.length} ${t('result_pdf2img_multi')} ${totalPages} ${t('result_pdf2img_done')} ${format.toUpperCase()}`
      : `${totalPages} ${t('result_pdf2img_done')} ${format.toUpperCase()}`;

    setTimeout(() => { hideProgress(); showResult(resultText, 'images'); }, 400);
  } catch(err) {
    hideProgress(); showToast(t('err_convert') + ': ' + err.message, 'error'); console.error(err);
  } finally { setLoading('convertBtn-pdf2img', false); }
}

// ════ FEATURE 3: Merge PDFs ═══════════════════════════════════
async function convertMergePdf() {
  const files = state.merge.files;
  if (files.length < 2) { showToast(t('toast_min2'), 'error'); return; }
  setLoading('convertBtn-merge', true);
  showProgress(0, t('progress_processing') + '...');
  try {
    const { PDFDocument } = PDFLib;
    const merged = await PDFDocument.create();
    for (let i = 0; i < files.length; i++) {
      showProgress(Math.round((i/files.length)*90), `${t('progress_processing')} ${i+1}/${files.length}...`);
      const ab  = await readFileAsArrayBuffer(files[i]);
      const pdf = await PDFDocument.load(ab);
      const pages = await merged.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }
    showProgress(95, t('progress_processing') + '...');
    const bytes = await merged.save();
    const blob  = new Blob([bytes], { type:'application/pdf' });
    state.outputBlobs = [{ blob, filename: `merged_${timestamp()}.pdf` }];
    showProgress(100, t('progress_done'));
    setTimeout(() => { hideProgress(); showResult(`${files.length} ${t('result_merge_done')}`, 'merged'); }, 400);
  } catch(err) {
    hideProgress(); showToast(t('err_merge') + ': ' + err.message, 'error'); console.error(err);
  } finally { setLoading('convertBtn-merge', false); }
}

// ─── Download ─────────────────────────────────────────────────
function initDownloadBtn() {
  $('downloadBtn').addEventListener('click', async () => {
    const blobs = state.outputBlobs;
    if (!blobs.length) return;
    if (blobs.length === 1) {
      triggerDownload(blobs[0].blob, blobs[0].filename);
    } else {
      for (let i = 0; i < blobs.length; i++) {
        await new Promise(r => setTimeout(r, 300 * i));
        triggerDownload(blobs[i].blob, blobs[i].filename);
      }
      showToast(`Downloaded ${blobs.length} files`, 'success');
    }
  });
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ─── Progress ─────────────────────────────────────────────────
function showProgress(pct, text) {
  $('progressContainer').style.display = 'block';
  $('progressFill').style.width = pct + '%';
  $('progressText').textContent = text;
}
function hideProgress() {
  $('progressContainer').style.display = 'none';
  $('progressFill').style.width = '0%';
}

// ─── Result with Preview ──────────────────────────────────────
async function showResult(text, previewType) {
  $('resultText').textContent = text;
  $('resultArea').style.display = 'flex';

  const grid  = $('outputPreviewGrid');
  const label = $('outputPreviewLabel');
  grid.innerHTML = '';

  if (previewType === 'pdf' || previewType === 'merged') {
    label.textContent = previewType === 'pdf' ? t('preview_label_pdf') : t('preview_label_merged');
    const blob = state.outputBlobs[0]?.blob;
    if (blob && typeof pdfjsLib !== 'undefined') {
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '../lib/pdf.worker.min.js';
        const ab  = await blob.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
        const numPages  = pdf.numPages;
        const modalPages = [];

        // Render all pages (store canvases for modal)
        for (let p = 1; p <= numPages; p++) {
          const page = await pdf.getPage(p);
          const vp   = page.getViewport({ scale: 1.2 });
          const canvas = document.createElement('canvas');
          canvas.width = vp.width; canvas.height = vp.height;
          await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
          modalPages.push({ type: 'canvas', element: canvas });
        }

        // Show first page as thumbnail preview
        const firstCanvas = modalPages[0].element;
        const wrap = document.createElement('div');
        wrap.className = 'preview-single';
        wrap.appendChild(firstCanvas);

        // Page count badge
        if (numPages > 1) {
          const badge = document.createElement('div');
          badge.style.cssText = 'position:absolute;bottom:6px;right:6px;background:rgba(0,0,0,0.6);color:white;font-size:10px;padding:2px 7px;border-radius:10px;pointer-events:none;';
          badge.textContent = `1 / ${numPages}`;
          wrap.style.position = 'relative';
          wrap.appendChild(badge);
        }

        grid.appendChild(wrap);

        const modalTitle = previewType === 'pdf'
          ? `📄 PDF — ${numPages} page${numPages > 1 ? 's' : ''}`
          : `📑 Merged PDF — ${numPages} page${numPages > 1 ? 's' : ''}`;

        // Click to open modal (starts at page 1)
        wrap.addEventListener('click', () => {
          openPreviewModal(modalPages, 0, modalTitle);
        });
      } catch(e) { console.warn('Preview failed', e); }
    }
  } else if (previewType === 'images') {
    label.textContent = t('preview_label_imgs');
    // Build modal pages array (img elements with object URLs)
    const modalPages = [];
    for (let i = 0; i < state.outputBlobs.length; i++) {
      const { blob } = state.outputBlobs[i];
      const url   = URL.createObjectURL(blob);
      const thumb = document.createElement('div');
      thumb.className = 'preview-thumb';
      const img = document.createElement('img');
      img.src = url;
      const lbl = document.createElement('div');
      lbl.className = 'preview-thumb-label';
      lbl.textContent = `P${i+1}`;
      thumb.appendChild(img);
      thumb.appendChild(lbl);
      grid.appendChild(thumb);
      modalPages.push({ type: 'img', src: url, alt: `Page ${i+1}` });
      // Bind click to open modal at this page
      const idx = i;
      thumb.addEventListener('click', () => {
        openPreviewModal(modalPages, idx, `🖼️ ${state.outputBlobs.length} pages`);
      });
    }
  }
}

function hideResult() {
  $('resultArea').style.display = 'none';
  $('outputPreviewGrid').innerHTML = '';
  state.outputBlobs = [];
}

// ─── Preview Modal ────────────────────────────────────────────
// modalPages: array of { type: 'canvas'|'img', element }
const modalState = { pages: [], current: 0 };

function initPreviewModal() {
  $('previewModalClose').addEventListener('click', closePreviewModal);
  $('previewModalOverlay').addEventListener('click', closePreviewModal);
  $('previewPrevBtn').addEventListener('click', () => navigateModal(-1));
  $('previewNextBtn').addEventListener('click', () => navigateModal(1));
  document.addEventListener('keydown', e => {
    if ($('previewModal').style.display === 'none') return;
    if (e.key === 'Escape') closePreviewModal();
    if (e.key === 'ArrowLeft')  navigateModal(-1);
    if (e.key === 'ArrowRight') navigateModal(1);
  });
}

function openPreviewModal(pages, startIndex, title) {
  modalState.pages   = pages;
  modalState.current = startIndex;
  $('previewModalTitle').textContent = title;
  $('previewModal').style.display = 'flex';
  renderModalPage();
}

function closePreviewModal() {
  $('previewModal').style.display = 'none';
  $('previewModalBody').innerHTML = '';
  modalState.pages = [];
}

function navigateModal(delta) {
  const next = modalState.current + delta;
  if (next < 0 || next >= modalState.pages.length) return;
  modalState.current = next;
  renderModalPage();
}

function renderModalPage() {
  const { pages, current } = modalState;
  const body = $('previewModalBody');
  body.innerHTML = '';

  const page = pages[current];
  if (!page) return;

  if (page.type === 'canvas') {
    // Clone the canvas into the modal
    const clone = document.createElement('canvas');
    clone.width  = page.element.width;
    clone.height = page.element.height;
    clone.getContext('2d').drawImage(page.element, 0, 0);
    body.appendChild(clone);
  } else if (page.type === 'img') {
    const img = document.createElement('img');
    img.src = page.src;
    img.alt = page.alt || '';
    body.appendChild(img);
  }

  // Update nav
  const total = pages.length;
  const nav   = $('previewModalNav');
  nav.style.display = total > 1 ? 'flex' : 'none';
  $('previewNavIndicator').textContent = `${current + 1} / ${total}`;
  $('previewPrevBtn').disabled = current === 0;
  $('previewNextBtn').disabled = current === total - 1;
}

// ─── Cancel Button ────────────────────────────────────────────
function initCancelBtn() {
  $('cancelBtn').addEventListener('click', () => {
    if (state.cancelController) {
      state.cancelController.abort();
      state.cancelController = null;
    }
    hideProgress();
    // Re-enable the convert button but keep files intact
    const tab = state.currentTab;
    const btnId = `convertBtn-${tab}`;
    const btn = $(btnId);
    if (btn) {
      btn.classList.remove('loading');
      btn.disabled = state[tab]?.files.length === 0;
    }
    showToast(state.lang === 'zh' ? '已取消' : 'Cancelled');
  });
}

// ─── Button Loading ───────────────────────────────────────────
function setLoading(btnId, loading) {
  const btn = $(btnId);
  if (!btn) return;
  if (loading) { btn.classList.add('loading'); btn.disabled = true; }
  else { btn.classList.remove('loading'); btn.disabled = state[state.currentTab]?.files.length === 0; }
}

// ─── Toast ────────────────────────────────────────────────────
function showToast(msg, type = '') {
  const toast = $('toast');
  toast.textContent = msg;
  toast.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.className = 'toast'; }, 3000);
}

// ─── Utilities ────────────────────────────────────────────────
function readFileAsArrayBuffer(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = e => res(e.target.result); r.onerror = rej;
    r.readAsArrayBuffer(file);
  });
}
function dataURLtoBlob(dataUrl) {
  const [h, d] = dataUrl.split(',');
  const mime = h.match(/:(.*?);/)[1];
  const bin  = atob(d);
  const arr  = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}
function formatSize(b) {
  if (b < 1024)    return b + ' B';
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
  return (b/1048576).toFixed(1) + ' MB';
}
function timestamp() {
  const d = new Date();
  return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}
function p(n) { return String(n).padStart(2,'0'); }

// ════ FEATURE 4: Math OCR ═════════════════════════════════════
let mathImageDataUrl = null;

function initMathOCR() {
  // ── Detect OS and update install command ─────────────────
  updateInstallCommand();

  // ── Server health check ──────────────────────────────────
  checkMathServer();
  $('serverRetryBtn').addEventListener('click', checkMathServer);

  // ── Drop zone ────────────────────────────────────────────
  const zone = $('dropZone-math');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) loadMathImage(file);
  });
  zone.addEventListener('click', e => {
    if (e.target.classList.contains('select-btn')) return;
    $('fileInput-math').click();
  });

  // ── File input ───────────────────────────────────────────
  $('selectBtn-math').addEventListener('click', e => { e.stopPropagation(); $('fileInput-math').click(); });
  $('fileInput-math').addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) loadMathImage(file);
    e.target.value = '';
  });

  // ── Remove image button ──────────────────────────────────
  $('mathImgRemove').addEventListener('click', () => {
    mathImageDataUrl = null;
    $('mathPreviewImg').src = '';
    $('mathPreviewWrap').style.display = 'none';
    $('recognizeBtn').disabled = true;
    $('latexResult').style.display = 'none';
    $('fileInput-math').value = '';
    // Restore drop zone
    $('dropZone-math').style.display = '';
  });

  // ── Recognize button ─────────────────────────────────────
  $('recognizeBtn').addEventListener('click', recognizeMath);

  // ── Global paste (Cmd+V / Ctrl+V) ────────────────────────
  document.addEventListener('paste', e => {
    // Only handle paste when Math OCR tab is active
    if (state.currentTab !== 'math') return;

    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          loadMathImage(file);
          showToast(t('math_pasted'), 'success');
        }
        break;
      }
    }
  });

  // ── Install service button ───────────────────────────────
  $('openInstallBtn').addEventListener('click', () => {
    // Get the extension's install path to construct the correct command
    const extUrl = chrome.runtime.getURL('install_service.sh');
    // extUrl looks like: chrome-extension://[id]/install_service.sh
    // We can't get the real filesystem path directly, but we can copy
    // the command from the visible code element
    const cmdEl = $('installCmd');
    const cmd = cmdEl ? cmdEl.textContent : 'bash ~/Desktop/asin/doc-converter-extension/install_service.sh';

    navigator.clipboard.writeText(cmd).then(() => {
      const btn = $('openInstallBtn');
      const orig = btn.textContent;
      btn.textContent = state.lang === 'zh' ? '✓ 命令已复制！粘贴到终端运行' : '✓ Copied! Paste in Terminal';
      btn.style.background = 'var(--green)';
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = '';
      }, 3000);
    }).catch(() => {
      // Fallback: open extensions page
      chrome.tabs.create({ url: 'chrome://extensions/?id=' + chrome.runtime.id });
    });
  });

  // ── Copy button ──────────────────────────────────────────
  $('copyLatexBtn').addEventListener('click', () => {
    const code = $('latexCode').textContent;
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      const btn = $('copyLatexBtn');
      const orig = btn.textContent;
      btn.textContent = t('math_copied');
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 2000);
    });
  });
}

async function checkMathServer() {
  const dot   = $('serverDot');
  const label = $('serverLabel');
  const notice = $('serverNotice');

  dot.className   = 'server-dot checking';
  label.textContent = t('math_checking');

  try {
    const resp = await fetch(`${MATH_API}/health`, { signal: AbortSignal.timeout(3000) });
    const data = await resp.json();
    if (data.status === 'ok' && data.model_available) {
      dot.className     = 'server-dot online';
      label.textContent = t('math_online');
      notice.style.display = 'none';
    } else {
      throw new Error('model not available');
    }
  } catch {
    dot.className     = 'server-dot offline';
    label.textContent = t('math_offline');
    notice.style.display = 'flex';
  }
}

function loadMathImage(file) {
  if (!file.type.startsWith('image/')) {
    showToast(t('toast_unsupported'), 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    mathImageDataUrl = e.target.result;
    $('mathPreviewImg').src = mathImageDataUrl;
    $('mathPreviewWrap').style.display = 'flex';
    $('recognizeBtn').disabled = false;
    $('latexResult').style.display = 'none';
    // Hide drop zone once image is loaded
    $('dropZone-math').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

async function recognizeMath() {
  if (!mathImageDataUrl) { showToast(t('math_err_no_img'), 'error'); return; }

  const btn = $('recognizeBtn');
  btn.classList.add('loading');
  btn.disabled = true;

  try {
    const resp = await fetch(`${MATH_API}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: mathImageDataUrl }),
      signal: AbortSignal.timeout(30000),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || t('math_err_server'));
    }

    const data = await resp.json();
    const latex = data.latex || '';

    // Show result
    $('latexCode').textContent = latex;
    $('latexResult').style.display = 'flex';

    // Render with MathJax
    renderLatex(latex);

  } catch(err) {
    if (err.name === 'TimeoutError') {
      showToast(t('math_err_server'), 'error');
    } else {
      showToast(t('math_err_recognize') + ': ' + err.message, 'error');
    }
    console.error(err);
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

function renderLatex(latex) {
  const container = $('latexRender');
  container.className = 'latex-render';
  container.innerHTML = '';

  if (typeof katex === 'undefined') {
    container.textContent = `$$${latex}$$`;
    return;
  }

  // ── Try to render with KaTeX ──────────────────────────────
  // Some LaTeX environments (array, align, etc.) need special handling
  const tryRender = (src, displayMode) => {
    try {
      katex.render(src, container, {
        displayMode,
        throwOnError: true,
        strict: false,   // suppress warnings like \\ in display mode
        trust: false,
        macros: { '\\R': '\\mathbb{R}', '\\N': '\\mathbb{N}' },
      });
      return true;
    } catch {
      return false;
    }
  };

  // 1. Try display mode as-is
  if (tryRender(latex, true)) return;

  // 2. Try wrapping array/align environments in \displaystyle
  const wrapped = `\\displaystyle{${latex}}`;
  if (tryRender(wrapped, true)) return;

  // 3. Try inline mode
  if (tryRender(latex, false)) return;

  // 4. Fallback: show raw LaTeX in a styled code block
  container.className = 'latex-render latex-raw';
  container.innerHTML = `<code style="font-family:monospace;font-size:12px;color:#1C1C1E;white-space:pre-wrap;word-break:break-all;">${escapeHtml(latex)}</code>`;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ─── OS Detection & Install Command ──────────────────────────
function isWindows() {
  return navigator.userAgent.includes('Windows') ||
         navigator.platform.startsWith('Win');
}

function updateInstallCommand() {
  const cmdEl = $('installCmd');
  if (!cmdEl) return;

  if (isWindows()) {
    // Windows: show .bat file path
    cmdEl.textContent = 'install_service.bat';
    // Update step 1 hint
    const step1 = document.querySelector('[data-i18n="math_step1"]');
    if (step1) step1.textContent = isWindows()
      ? (state.lang === 'zh' ? '双击运行安装脚本：' : 'Double-click to run:')
      : t('math_step1');
  } else {
    // macOS/Linux: show bash command
    cmdEl.textContent = 'bash ~/Desktop/asin/doc-converter-extension/install_service.sh';
  }

  // Update paste hint based on OS
  const pasteHint = document.querySelector('[data-i18n="math_paste_hint"]');
  if (pasteHint) {
    pasteHint.textContent = isWindows()
      ? (state.lang === 'zh' ? '或按 Ctrl+V 粘贴截图' : 'or press Ctrl+V to paste')
      : t('math_paste_hint');
  }
}
