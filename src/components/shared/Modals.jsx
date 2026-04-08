import React from "react";
import { getCat, fileIcon, formatBytes, formatDate, getPreviewKind } from "../../utils/helpers";

// ── Preview surface ───────────────────────────────────────────────────────────

function PdfPreview({ doc }) {
  return (
    <div className="preview-surface">
      <div className="preview-page">
        <div className="preview-page-hdr">
          <span className="preview-badge">PDF</span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{doc.name}</span>
        </div>
        <div className="preview-line preview-line--lg" />
        <div className="preview-line preview-line--md" />
        <div className="preview-line preview-line--sm" />
        <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "14px", margin: "16px 0" }}>
          <div className="preview-line preview-line--md" />
          <div className="preview-line preview-line--lg" />
          <div className="preview-line preview-line--md" />
        </div>
        <div className="preview-table">
          <div className="preview-table-row"><span>Field</span><span>Value</span></div>
          {doc.analysis?.fields?.map((f, i) => (
            <div className="preview-table-row preview-table-row--body" key={i}>
              <span>{f.label}</span><span>{f.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImagePreview({ doc }) {
  return (
    <div className="preview-surface">
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--border)", fontSize: "12px", fontWeight: 600 }}>
          <span className="preview-badge">IMAGE</span>
          <span style={{ color: "var(--text-muted)" }}>{doc.name}</span>
        </div>
        <div className="preview-img-canvas">
          <div className="preview-img-shape preview-img-shape--lg" />
          <div className="preview-img-shape preview-img-shape--sm" />
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Visual preview for {doc.type}</p>
        </div>
      </div>
    </div>
  );
}

function DocPreview({ doc }) {
  return (
    <div className="preview-surface">
      <div className="preview-page" style={{ background: "linear-gradient(to bottom, #fff, var(--surface-2))" }}>
        <div className="preview-page-hdr">
          <span className="preview-badge">DOC</span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{doc.name}</span>
        </div>
        <div className="preview-word-title">{doc.analysis?.category}</div>
        {["lg","lg","md","lg","sm"].map((s, i) => (
          <div key={i} className={`preview-line preview-line--${s}`} />
        ))}
        <div style={{ marginTop: "20px" }}>
          {[0,1,2].map((i) => <div key={i} className="preview-bullet" />)}
        </div>
      </div>
    </div>
  );
}

function GenericPreview({ doc }) {
  return (
    <div className="preview-surface" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: "32px", background: "var(--surface-2)", borderRadius: "var(--r-lg)", border: "1px solid var(--border)", maxWidth: "300px", width: "100%" }}>
        <div style={{ fontSize: "52px", marginBottom: "12px" }}>{fileIcon(doc.name)}</div>
        <h3 style={{ fontSize: "16px", color: "var(--text-primary)", marginBottom: "6px" }}>{doc.name}</h3>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{doc.type}</p>
      </div>
    </div>
  );
}

function PreviewContent({ doc }) {
  const k = getPreviewKind(doc.name);
  if (k === "pdf")   return <PdfPreview doc={doc} />;
  if (k === "image") return <ImagePreview doc={doc} />;
  if (k === "doc")   return <DocPreview doc={doc} />;
  return <GenericPreview doc={doc} />;
}

// ── Viewer modal ──────────────────────────────────────────────────────────────

export function ViewerModal({ doc, onClose, onDownload }) {
  const cat = getCat(doc.categoryId);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <span style={{ fontSize: "24px" }}>{fileIcon(doc.name)}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="modal__title" style={{ fontSize: "16px" }}>{doc.name}</div>
            <span className="cat-badge" style={{ background: cat.bg || "#dbeafe", color: cat.color || "#1d4ed8", marginTop: "4px", display: "inline-flex" }}>
              {cat.icon} {cat.label}
            </span>
          </div>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-viewer-body">
          <div className="modal-viewer-main">
            <PreviewContent doc={doc} />
          </div>
          <div className="modal-viewer-side">
            <div className="modal-info-card">
              <div className="modal-info-card__title">Document Info</div>
              {[
                ["Name",       doc.name],
                ["Owner",      doc.owner],
                ["Category",   doc.categoryLabel],
                ["Date",       doc.date],
                ["Size",       formatBytes(doc.size)],
                ["Confidence", doc.confidencePct],
              ].map(([l, v]) => (
                <div className="modal-info-row" key={l}>
                  <span className="modal-info-row__label">{l}</span>
                  <span className="modal-info-row__val">{v || "—"}</span>
                </div>
              ))}
            </div>

            <div className="modal-info-card">
              <div className="modal-info-card__title">AI Summary</div>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.65" }}>{doc.summary}</p>
            </div>

            {doc.text && (
              <div className="modal-info-card">
                <div className="modal-info-card__title">Extracted Text</div>
                <pre className="text-preview">{doc.text}</pre>
              </div>
            )}
          </div>
        </div>

        <div className="modal__footer">
          <button className="btn btn--secondary" onClick={onClose}>Close</button>
          <button className="btn btn--primary" onClick={() => onDownload(doc)}>↓ Download</button>
        </div>
      </div>
    </div>
  );
}

// ── Details modal ─────────────────────────────────────────────────────────────

export function DetailsModal({ doc, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <span className="modal__title">Document Details</span>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="modal__body">
          {[
            ["File Name",    doc.name],
            ["Owner",        doc.owner],
            ["Category",     doc.categoryLabel],
            ["Type",         doc.type],
            ["Upload Date",  formatDate(doc.uploadedAt)],
            ["File Size",    formatBytes(doc.size)],
            ["Confidence",   doc.confidencePct],
          ].map(([l, v]) => (
            <div className="detail-row" key={l}>
              <span className="detail-row__label">{l}</span>
              <span className="detail-row__val">{v || "—"}</span>
            </div>
          ))}
          <div className="detail-summary-box">
            <h4>AI Summary</h4>
            <p>{doc.summary}</p>
          </div>
        </div>
        <div className="modal__footer">
          <button className="btn btn--secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Rename modal ──────────────────────────────────────────────────────────────

export function RenameModal({ doc, value, onChange, onSave, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <span className="modal__title">Rename Document</span>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="modal__body">
          <label className="form-label">New file name</label>
          <input
            className="form-input"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSave()}
            placeholder="Enter document name"
            autoFocus
          />
        </div>
        <div className="modal__footer">
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
}
