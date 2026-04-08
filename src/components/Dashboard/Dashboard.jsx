import React from "react";
import DocCard from "../shared/DocCard";
import { getCat, fileIcon, formatBytes } from "../../utils/helpers";
import { CATEGORIES } from "../../utils/constants";

export default function Dashboard({
  docs,
  stats,
  catCounts,
  activeCat,
  onCatChange,
  searchTerm,
  onSearchChange,
  selectedDoc,
  onSelectDoc,
  onOpen,
  onDetails,
  onRename,
  onDownload,
  onDelete,
  menuOpenId,
  onMenuToggle,
  loading,
  loadingAction,
  queue,
  onNavigate,
}) {
  // filter by category + search
  const filtered = docs.filter((d) => {
    const matchCat    = activeCat === "all" || d.categoryId === activeCat;
    const matchSearch = `${d.name} ${d.categoryLabel || ""} ${d.owner || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const cat    = getCat(selectedDoc?.categoryId);
  const pct    = Math.round((selectedDoc?.confidence || 0) * 100);
  const fillClr = cat.color || "#2563eb";

  return (
    <div className="main-content">
      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: "Total Documents",  val: stats.total      },
          { label: "AI Classified",    val: stats.classified  },
          { label: "Categories Used",  val: stats.categories  },
          { label: "Added Today",      val: stats.today       },
        ].map((s, i) => (
          <div
            key={s.label}
            className={`stat-card anim-fade-up ${i === 0 ? "stat-card__accent" : ""}`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="stat-card__val">{s.val}</div>
            <div className="stat-card__label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div style={{ padding: "var(--sp-5) var(--sp-6) 0" }}>
          <div className="queue">
            {queue.map((item) => {
              const qcat = item.categoryId ? getCat(item.categoryId) : null;
              const bs   = item.error
                ? { background: "var(--error-bg)", color: "var(--error)", borderColor: "rgba(220,38,38,.3)" }
                : qcat
                ? { background: qcat.bg,    color: qcat.color,   borderColor: qcat.color }
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
        </div>
      )}

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "var(--sp-5)", padding: "var(--sp-5) var(--sp-6)", flex: 1, overflow: "hidden" }}>

        {/* Left — document list */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>

          {/* Search + heading */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-4)", marginBottom: "var(--sp-3)", flexShrink: 0 }}>
            <h2 style={{ fontFamily: "var(--ff-display)", fontSize: "var(--text-xl)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Documents
            </h2>
            <div className="search-wrap" style={{ flex: 1 }}>
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                type="search"
                placeholder="Search documents…"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          {/* Category chips */}
          <div className="cat-chips" style={{ padding: 0, marginBottom: "var(--sp-3)", flexShrink: 0 }}>
            {CATEGORIES.map((c) => {
              const cnt = c.id === "all" ? docs.length : (catCounts[c.id] || 0);
              return (
                <button
                  key={c.id}
                  className={`cat-chip ${activeCat === c.id ? "active" : ""}`}
                  onClick={() => onCatChange(c.id)}
                >
                  {c.icon} {c.id === "all" ? "All" : c.label}
                  <span className="cat-chip__count">({cnt})</span>
                </button>
              );
            })}
          </div>

          {/* Doc list */}
          <div style={{ flex: 1, overflowY: "auto", paddingRight: "var(--sp-2)" }}>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">📂</div>
                <div className="empty-state__title">No documents found</div>
                <p className="empty-state__text">
                  {docs.length === 0
                    ? "Upload your first document to get started."
                    : "Try a different search or category filter."}
                </p>
                {docs.length === 0 && (
                  <button
                    className="btn btn--primary"
                    style={{ marginTop: "var(--sp-4)" }}
                    onClick={() => onNavigate("upload")}
                  >
                    ↑ Upload Document
                  </button>
                )}
              </div>
            ) : (
              <div className="doc-list" style={{ padding: 0 }}>
                {filtered.map((doc, i) => (
                  <DocCard
                    key={doc.id}
                    doc={doc}
                    isSelected={selectedDoc?.id === doc.id}
                    menuOpenId={menuOpenId}
                    onClick={onSelectDoc}
                    onMenuToggle={onMenuToggle}
                    onOpen={onOpen}
                    onDetails={onDetails}
                    onRename={onRename}
                    onDownload={onDownload}
                    onDelete={onDelete}
                    loading={loading}
                    loadingAction={loadingAction}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — preview panel */}
        <div style={{ overflowY: "auto" }}>
          {!selectedDoc ? (
            <div className="preview-panel" style={{ alignItems: "center", justifyContent: "center", minHeight: "260px", textAlign: "center" }}>
              <div className="empty-state__icon">📄</div>
              <div className="empty-state__title" style={{ fontSize: "var(--text-lg)" }}>No document selected</div>
              <p className="empty-state__text">Click any document to view its AI analysis here.</p>
            </div>
          ) : (
            <div className="preview-panel">
              <div className="preview-panel__icon" style={{ background: cat.bg || "var(--surface-3)" }}>
                {fileIcon(selectedDoc.name)}
              </div>
              <div className="preview-panel__name">{selectedDoc.name}</div>
              <div className="preview-panel__meta">
                {selectedDoc.owner} · {selectedDoc.date} · {formatBytes(selectedDoc.size)}
              </div>

              <div className="preview-panel__actions">
                <button className="btn btn--primary btn--sm" onClick={() => onOpen(selectedDoc)} disabled={loading}>
                  Open
                </button>
                <button className="btn btn--secondary btn--sm" onClick={() => onDetails(selectedDoc)}>
                  Details
                </button>
                <button className="btn btn--secondary btn--sm" onClick={() => onDownload(selectedDoc)}>
                  Download
                </button>
                <button
                  className="btn btn--danger btn--sm"
                  onClick={() => onDelete(selectedDoc)}
                  disabled={loading}
                >
                  {loadingAction === "deleting" ? "Deleting…" : "Delete"}
                </button>
              </div>

              {/* AI analysis */}
              <div className="analysis-block">
                <div className="analysis-block__header">
                  <span className="analysis-block__title">AI Analysis</span>
                  <span className="analysis-block__badge">{selectedDoc.confidencePct}</span>
                </div>
                <div className="analysis-block__cat">Category: {selectedDoc.categoryLabel}</div>
                <div className="analysis-block__sum">{selectedDoc.summary}</div>

                {/* confidence bar */}
                <div style={{ marginBottom: "var(--sp-3)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "4px" }}>
                    <span>Confidence</span><span>{pct}%</span>
                  </div>
                  <div style={{ height: "5px", background: "var(--surface-3)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: fillClr, borderRadius: "3px", transition: "width 0.6s var(--ease)" }} />
                  </div>
                </div>

                <div className="analysis-block__fields">
                  {selectedDoc.analysis?.fields?.map((f, i) => (
                    <div className="analysis-field" key={i}>
                      <span className="analysis-field__label">{f.label}</span>
                      <span className="analysis-field__value">{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
