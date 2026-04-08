// storage.js — localStorage persistence for documents and folders

import { STORAGE_KEY, FOLDERS_KEY } from "../utils/constants";

// ── Documents ─────────────────────────────────────────────────

export function loadDocs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    // fileData is session-only — strip on load to save space
    return JSON.parse(raw).map((d) => ({ ...d, fileData: null }));
  } catch {
    return [];
  }
}

export function saveDocs(docs) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(docs.map((d) => ({ ...d, fileData: null })))
    );
  } catch (e) {
    // quota exceeded — strip text too and retry
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(docs.map((d) => ({ ...d, fileData: null, text: d.text?.slice(0, 200) || "" })))
      );
    } catch { /* silent fail */ }
  }
}

// ── Folders (Storage page) ────────────────────────────────────
// A folder stores { id, name, docIds[], createdAt }
// docIds are references to document IDs — no file duplication.

export function loadFolders() {
  try {
    const raw = localStorage.getItem(FOLDERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveFolders(folders) {
  try {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  } catch { /* silent */ }
}
