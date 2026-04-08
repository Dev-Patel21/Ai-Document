import React from "react";
import { getCat, fileIcon, formatBytes, formatDateShort } from "../../utils/helpers";

export default function DocCard({
  doc,
  isSelected,
  menuOpenId,
  onClick,
  onMenuToggle,
  onOpen,
  onDetails,
  onRename,
  onDownload,
  onDelete,
  loading,
  loadingAction,
  index = 0,
}) {
  const cat  = getCat(doc.categoryId);
  const pct  = Math.round((doc.confidence || 0) * 100);
  const iconBg  = cat.bg  || "var(--surface-3)";
  const badgeBg = cat.bg  || "#dbeafe";
  const badgeClr= cat.color || "#1d4ed8";

  return (
    <div
      className={[
        "doc-card anim-fade-up",
        isSelected ? "selected" : "",
        menuOpenId === doc.id ? "menu-open" : "",
      ].join(" ")}
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => { if (!loading) onClick(doc); }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && !loading && onClick(doc)}
      aria-label={doc.name}
    >
      {/* File icon */}
      <div className="doc-card__icon" style={{ background: iconBg }}>
        {fileIcon(doc.name)}
      </div>

      {/* Info */}
      <div className="doc-card__body">
        <div className="doc-card__name" title={doc.name}>{doc.name}</div>
        <div className="doc-card__meta">
          Uploaded {formatDateShort(doc.uploadedAt)} · {formatBytes(doc.size)}
        </div>
        <div className="doc-card__tags">
          <span
            className="cat-badge"
            style={{ background: badgeBg, color: badgeClr }}
          >
            {cat.icon} {cat.label}
          </span>
        </div>

        {pct > 0 && (
          <div className="doc-card__conf-wrap">
            <div className="doc-card__conf-label">
              <span>AI Confidence</span>
              <span>{pct}%</span>
            </div>
            <div className="doc-card__conf-track">
              <div
                className="doc-card__conf-fill"
                style={{ width: `${pct}%`, background: cat.color || "#2563eb" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions menu */}
      <div
        className="menu-wrapper"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="menu-trigger"
          onClick={(e) => { e.stopPropagation(); onMenuToggle(doc.id); }}
          disabled={loading}
          aria-label="More actions"
        >
          ⋯
        </button>

        {menuOpenId === doc.id && (
          <div className="action-menu">
            <button className="action-item" onClick={() => onOpen(doc)}>
              <span className="action-item__icon">↗</span> Open
            </button>
            <button className="action-item" onClick={() => onDetails(doc)}>
              <span className="action-item__icon">ℹ</span> Details
            </button>
            <button className="action-item" onClick={() => onRename(doc)}>
              <span className="action-item__icon">✎</span> Rename
            </button>
            <button className="action-item" onClick={() => onDownload(doc)}>
              <span className="action-item__icon">↓</span> Download
            </button>
            <button
              className="action-item action-item--danger"
              onClick={() => onDelete(doc)}
              disabled={loadingAction === "deleting"}
            >
              <span className="action-item__icon">✕</span>
              {loadingAction === "deleting" ? "Deleting…" : "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
