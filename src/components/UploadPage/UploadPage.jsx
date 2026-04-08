import React, { useRef, useState } from "react";
import { ALLOWED_TYPES, CATEGORIES } from "../../utils/constants";
import { fileIcon } from "../../utils/helpers";
import { getCat } from "../../utils/helpers";

export default function UploadPage({ queue, onFiles }) {
  const inputRef  = useRef(null);
  const [drag, setDrag]     = useState(false);
  const [error, setError]   = useState("");
  const [names, setNames]   = useState([]);

  function validate(fileList) {
    const arr = Array.from(fileList || []);
    if (!arr.length) return;
    setNames(arr.map((f) => f.name));

    const valid = [], errs = [];
    arr.forEach((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) errs.push(`"${f.name}": unsupported type`);
      else if (f.size > 10 * 1024 * 1024)  errs.push(`"${f.name}": exceeds 10 MB`);
      else valid.push(f);
    });

    setError(errs[0] || "");
    if (valid.length) onFiles(valid);
  }

  const isProcessing = queue.some((q) => q.progress < 100);

  return (
    <div className="main-content" style={{ padding: "var(--sp-6)" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>

        <div style={{ marginBottom: "var(--sp-6)" }}>
          <h1 style={{ fontFamily: "var(--ff-display)", fontSize: "var(--text-2xl)", color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "var(--sp-1)" }}>
            Upload Document
          </h1>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
            Upload files for automatic AI classification into one of 7 categories.
          </p>
        </div>

        {/* Queue */}
        {queue.length > 0 && (
          <div className="queue" style={{ marginBottom: "var(--sp-5)" }}>
            {queue.map((item) => {
              const qcat = item.categoryId ? getCat(item.categoryId) : null;
              const bs   = item.error
                ? { background: "var(--error-bg)", color: "var(--error)", borderColor: "rgba(220,38,38,.3)" }
                : qcat
                ? { background: qcat.bg, color: qcat.color, borderColor: qcat.color }
                : { background: "var(--info-bg)", color: "var(--info)", borderColor: "rgba(37,99,235,.3)" };
              const fc = item.error ? "var(--error)" : qcat?.color || "var(--teal)";
              return (
                <div className="queue-item" key={item.id}>
                  <div className="queue-item__icon">{fileIcon(item.name)}</div>
                  <div className="queue-item__body">
                    <div className="queue-item__name">{item.name}</div>
                    <div className="queue-item__status">{item.error || item.status}</div>
                    <div className="queue-item__bar">
                      <div className="queue-item__fill" style={{ width: `${item.progress}%`, background: fc }} />
                    </div>
                  </div>
                  <span className="queue-item__badge" style={bs}>
                    {item.error ? "Failed" : qcat ? qcat.label : "Processing"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Drop zone */}
        <div
          className={`upload-zone ${drag ? "upload-zone--drag" : ""}`}
          tabIndex={0}
          role="button"
          aria-label="Drop files here or click to browse"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDrag(false); }}
          onDrop={(e) => { e.preventDefault(); setDrag(false); validate(e.dataTransfer.files); }}
        >
          <div className="upload-zone__icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M24 6v24M14 16l10-10 10 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 34v5a3 3 0 003 3h30a3 3 0 003-3v-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="upload-zone__title">
            {isProcessing ? "Processing your files…" : "Drop your files here"}
          </div>
          <p className="upload-zone__sub">or click to browse from your computer · max 10 MB per file</p>
          <div className="upload-zone__fmts">
            {["PDF","DOCX","DOC","JPG","PNG","TXT"].map((f) => (
              <span key={f} className="upload-zone__fmt">{f}</span>
            ))}
          </div>

          <button
            className="btn btn--teal"
            style={{ marginTop: "var(--sp-4)" }}
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing…" : "Choose Files"}
          </button>

          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.txt"
            onChange={(e) => { validate(e.target.files); e.target.value = ""; }}
          />
        </div>

        {/* Selected file list */}
        {names.length > 0 && !isProcessing && (
          <div className="selected-files-box" style={{ marginTop: "var(--sp-4)" }}>
            <div className="selected-files-box__count">
              {names.length} file{names.length > 1 ? "s" : ""} selected
            </div>
            <div className="selected-files-box__list">
              {names.slice(0, 5).map((n, i) => (
                <span key={i} className="selected-file">{fileIcon(n)} {n}</span>
              ))}
              {names.length > 5 && (
                <span className="selected-file selected-file--muted">+{names.length - 5} more</span>
              )}
            </div>
          </div>
        )}

        {error && <p className="upload-error" style={{ marginTop: "var(--sp-3)" }}>{error}</p>}

        {/* Supported categories */}
        <div style={{ marginTop: "var(--sp-8)" }}>
          <div className="section-divider" style={{ padding: 0, marginBottom: "var(--sp-4)" }}>
            <span className="section-divider__label">Supported Categories</span>
            <div className="section-divider__line" />
          </div>
          <div className="supported-cats">
            {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
              <span
                key={cat.id}
                className="cat-badge"
                style={{ background: cat.bg, color: cat.color, padding: "6px 12px", fontSize: "12px" }}
              >
                {cat.icon} {cat.label}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
