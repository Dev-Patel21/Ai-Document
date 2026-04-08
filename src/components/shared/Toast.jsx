import React from "react";

const ICONS = { success: "✅", error: "⚠️", info: "ℹ️", warning: "⚡" };
const LABELS = { success: "Success", error: "Error", info: "Info", warning: "Warning" };

export default function Toast({ toasts, onDismiss }) {
  return (
    <div className="toast-rack" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast--${t.type}`}
          onClick={() => onDismiss(t.id)}
          role="status"
        >
          <span className="toast__icon">{ICONS[t.type] || "ℹ️"}</span>
          <div className="toast__body">
            <p className="toast__title">{LABELS[t.type] || "Info"}</p>
            <p className="toast__text">{t.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
