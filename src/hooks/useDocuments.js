// useDocuments.js — central document state with persistence

import { useState, useCallback } from "react";
import { loadDocs, saveDocs } from "../services/storage";

export function useDocuments() {
  const [docs, setDocs] = useState(() => loadDocs());

  const addDoc = useCallback((doc) => {
    setDocs((prev) => {
      const next = [doc, ...prev];
      saveDocs(next);
      return next;
    });
  }, []);

  const updateDoc = useCallback((id, updater) => {
    setDocs((prev) => {
      const next = prev.map((d) => (d.id === id ? updater(d) : d));
      saveDocs(next);
      return next;
    });
  }, []);

  const removeDoc = useCallback((id) => {
    setDocs((prev) => {
      const next = prev.filter((d) => d.id !== id);
      saveDocs(next);
      return next;
    });
  }, []);

  const getDoc = useCallback((id) => docs.find((d) => d.id === id) || null, [docs]);

  const catCounts = {};
  docs.forEach((d) => {
    catCounts[d.categoryId] = (catCounts[d.categoryId] || 0) + 1;
  });

  const stats = {
    total:      docs.length,
    classified: docs.filter((d) => d.confidence).length,
    categories: new Set(docs.map((d) => d.categoryId)).size,
    today:      docs.filter((d) => new Date(d.uploadedAt).toDateString() === new Date().toDateString()).length,
  };

  return { docs, addDoc, updateDoc, removeDoc, getDoc, catCounts, stats };
}
