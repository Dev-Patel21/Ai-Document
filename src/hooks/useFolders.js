// useFolders.js — folder state for the Storage page

import { useState, useCallback } from "react";
import { loadFolders, saveFolders } from "../services/storage";
import { uid } from "../utils/helpers";

export function useFolders() {
  const [folders, setFolders] = useState(() => loadFolders());

  const createFolder = useCallback((name, docIds = []) => {
    const folder = {
      id:        uid(),
      name:      name.trim(),
      docIds:    [...new Set(docIds)],   // deduplicate
      createdAt: new Date().toISOString(),
    };
    setFolders((prev) => {
      const next = [folder, ...prev];
      saveFolders(next);
      return next;
    });
    return folder;
  }, []);

  const renameFolder = useCallback((id, name) => {
    setFolders((prev) => {
      const next = prev.map((f) => (f.id === id ? { ...f, name: name.trim() } : f));
      saveFolders(next);
      return next;
    });
  }, []);

  const deleteFolder = useCallback((id) => {
    setFolders((prev) => {
      const next = prev.filter((f) => f.id !== id);
      saveFolders(next);
      return next;
    });
  }, []);

  // Add extra docIds to an existing folder (by reference — no file duplication)
  const addDocsToFolder = useCallback((folderId, docIds) => {
    setFolders((prev) => {
      const next = prev.map((f) => {
        if (f.id !== folderId) return f;
        const merged = [...new Set([...f.docIds, ...docIds])];
        return { ...f, docIds: merged };
      });
      saveFolders(next);
      return next;
    });
  }, []);

  // Remove a docId from a folder
  const removeDocFromFolder = useCallback((folderId, docId) => {
    setFolders((prev) => {
      const next = prev.map((f) => {
        if (f.id !== folderId) return f;
        return { ...f, docIds: f.docIds.filter((id) => id !== docId) };
      });
      saveFolders(next);
      return next;
    });
  }, []);

  const getFolder = useCallback((id) => folders.find((f) => f.id === id) || null, [folders]);

  return { folders, createFolder, renameFolder, deleteFolder, addDocsToFolder, removeDocFromFolder, getFolder };
}
