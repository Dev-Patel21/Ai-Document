// helpers.js — pure utility functions

import { FILE_ICONS, CATEGORIES } from "./constants";

export function fileExt(name) {
  return (name?.split(".").pop() || "").toLowerCase();
}

export function fileIcon(name) {
  return FILE_ICONS[fileExt(name)] || FILE_ICONS.default;
}

export function formatBytes(b) {
  if (!b) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export function formatDateShort(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function getCat(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
}

export function getPreviewKind(name) {
  const e = fileExt(name);
  if (e === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "webp"].includes(e)) return "image";
  if (e === "docx" || e === "doc") return "doc";
  return "generic";
}

export function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("FileReader failed"));
    reader.readAsDataURL(file);
  });
}

export function keywordFallback(text, filename) {
  const hay = (text + " " + filename).toLowerCase();
  let best = null;
  let bestScore = 0;
  CATEGORIES.filter((c) => c.id !== "all").forEach((cat) => {
    const hits = cat.keywords.filter((kw) => hay.includes(kw)).length;
    if (hits > bestScore) {
      bestScore = hits;
      best = cat;
    }
  });
  if (!best) best = getCat("personal");
  return {
    categoryId: best.id,
    confidence: Math.min(0.85, 0.45 + bestScore * 0.06),
    summary: `A ${best.label.toLowerCase()} document (keyword analysis).`,
  };
}
