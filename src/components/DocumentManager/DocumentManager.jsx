import React from "react";
import DocCard from "../shared/DocCard";
import { CATEGORIES } from "../../utils/constants";

export default function DocumentManager({
  docs,
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
  onNavigate,
}) {
  const filtered = docs.filter((d) => {
    const matchCat    = activeCat === "all" || d.categoryId === activeCat;
    const matchSearch = `${d.name} ${d.categoryLabel || ""} ${d.owner || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="main-content">
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-header__title">All Documents</h1>
        <p className="page-header__sub">Browse, search, and manage all your uploaded documents.</p>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-4)", padding: "var(--sp-4) var(--sp-6) 0", flexWrap: "wrap" }}>
        <div className="search-wrap" style={{ flex: "1 1 260px", minWidth: "200px" }}>
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="search"
            placeholder="Search documents…"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <button
          className="btn btn--teal btn--sm"
          onClick={() => onNavigate("upload")}
        >
          ↑ Upload New
        </button>
      </div>

      {/* Category chips */}
      <div className="cat-chips">
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

      <div className="section-divider">
        <span className="section-divider__label">
          {activeCat === "all" ? "All Documents" : CATEGORIES.find((c) => c.id === activeCat)?.label}
          {" "}({filtered.length})
        </span>
        <div className="section-divider__line" />
      </div>

      {/* Document list */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📂</div>
          <div className="empty-state__title">
            {docs.length === 0 ? "No documents yet" : "No results"}
          </div>
          <p className="empty-state__text">
            {docs.length === 0
              ? "Upload your first file to start organising documents."
              : "Try a different filter or search term."}
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
        <div className="doc-list">
          {filtered.map((doc, i) => (
            <DocCard
              key={doc.id}
              doc={doc}
              isSelected={selectedDoc?.id === doc.id}
              menuOpenId={menuOpenId}
              onClick={(d) => { onSelectDoc(d); onNavigate("dashboard"); }}
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
  );
}
