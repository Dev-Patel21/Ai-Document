// useToast.js — lightweight toast notification hook

import { useState, useCallback } from "react";
import { uid } from "../utils/helpers";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((type, text) => {
    const id = uid();
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3400);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, show, dismiss };
}
