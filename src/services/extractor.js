// extractor.js — text extraction using CDN-loaded libs (PDF.js, Mammoth, Tesseract)

import { fileExt } from "../utils/helpers";

export async function extractText(file) {
  const ext = fileExt(file.name);
  if (ext === "txt")                              return file.text();
  if (ext === "pdf")                              return extractPDF(file);
  if (ext === "docx" || ext === "doc")            return extractDocx(file);
  if (["jpg","jpeg","png","webp"].includes(ext))  return extractOCR(file);
  return file.text().catch(() => "");
}

async function extractPDF(file) {
  const lib = window.pdfjsLib;
  if (!lib) throw new Error("PDF.js not loaded — check public/index.html");
  const buf = await file.arrayBuffer();
  const pdf = await lib.getDocument({ data: buf }).promise;
  let text = "";
  for (let i = 1; i <= Math.min(pdf.numPages, 15); i++) {
    const pg = await pdf.getPage(i);
    const ct = await pg.getTextContent();
    text += ct.items.map((it) => it.str).join(" ") + "\n";
  }
  // scanned PDF → OCR first page
  if (text.trim().length < 60) {
    const pg  = await pdf.getPage(1);
    const vp  = pg.getViewport({ scale: 1.8 });
    const cv  = document.createElement("canvas");
    cv.width  = vp.width;
    cv.height = vp.height;
    await pg.render({ canvasContext: cv.getContext("2d"), viewport: vp }).promise;
    const blob = await new Promise((r) => cv.toBlob(r, "image/png"));
    return extractOCR(blob);
  }
  return text.trim();
}

async function extractDocx(file) {
  if (!window.mammoth) throw new Error("Mammoth not loaded");
  const buf = await file.arrayBuffer();
  const result = await window.mammoth.extractRawText({ arrayBuffer: buf });
  return result.value.trim();
}

async function extractOCR(fileOrBlob) {
  if (!window.Tesseract) throw new Error("Tesseract not loaded");
  const worker = await window.Tesseract.createWorker("eng");
  const url = URL.createObjectURL(fileOrBlob);
  const { data: { text } } = await worker.recognize(url);
  await worker.terminate();
  URL.revokeObjectURL(url);
  return text.trim();
}
