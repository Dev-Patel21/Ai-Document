import React, { useState, useRef, useCallback } from "react";
import { fileIcon, uid, formatDate, formatBytes } from "../../utils/helpers";

// ── ZIP download helper ───────────────────────────────────────────────────────
// Uses JSZip loaded from CDN in public/index.html
// Downloads each doc as its original file if fileData (base64) is in session,
// otherwise creates a .txt summary — then bundles everything into a single ZIP.

async function downloadFolderAsZip(folderName, folderDocs, onProgress) {
  const JSZip = window.JSZip;
  if (!JSZip) {
    alert("JSZip library not loaded. Check your internet connection and reload.");
    return;
  }

  const zip = new JSZip();
  const folder = zip.folder(folderName);
  let done = 0;

  for (const doc of folderDocs) {
    if (doc.fileData && doc.fileData !== "__session__") {
      // We have the real binary — decode base64 and add original file
      const base64 = doc.fileData.split(",")[1];     // strip "data:...;base64,"
      folder.file(doc.name, base64, { base64: true });
    } else {
      // Binary not available (page was refreshed) — add a text summary instead
      const summary =
        `Document: ${doc.name}\n` +
        `Category: ${doc.categoryLabel || "—"}\n` +
        `Confidence: ${doc.confidencePct || "—"}\n` +
        `Owner: ${doc.owner || "—"}\n` +
        `Date: ${doc.date || "—"}\n` +
        `Summary: ${doc.summary || "—"}\n\n` +
        `Extracted Text:\n${doc.text || "No text available."}`;
      folder.file(doc.name + ".txt", summary);
    }
    done++;
    if (onProgress) onProgress(Math.round((done / folderDocs.length) * 100));
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), {
    href:     url,
    download: `${folderName}.zip`,
  });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Create Folder Modal ───────────────────────────────────────────────────────

function CreateFolderModal({ docs, onSave, onClose }) {
  const [name,     setName]     = useState("");
  const [selected, setSelected] = useState(new Set());
  const [search,   setSearch]   = useState("");
  const inputRef = useRef(null);

  const filtered = docs.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.categoryLabel || "").toLowerCase().includes(search.toLowerCase())
  );

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) { inputRef.current?.focus(); return; }
    if (selected.size === 0) return;
    onSave(trimmed, [...selected]);
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: "580px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <span className="modal__title">Create Document Group</span>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__body" style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
          <div>
            <label className="form-label">Group name *</label>
            <input
              ref={inputRef}
              className="form-input"
              type="text"
              placeholder="e.g. Project A Documents"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
          </div>

          <div>
            <label className="form-label">
              Select documents ({selected.size} selected)
            </label>
            {docs.length === 0 ? (
              <div style={{ padding: "var(--sp-5)", textAlign: "center", background: "var(--surface-2)", borderRadius: "var(--r-md)", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
                No documents uploaded yet. Upload files first.
              </div>
            ) : (
              <>
                <input
                  className="form-input"
                  type="search"
                  placeholder="Search documents to add…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ marginBottom: "var(--sp-2)" }}
                />
                <div style={{ maxHeight: "280px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "var(--sp-2)" }}>
                  {filtered.map((doc) => {
                    const isOn = selected.has(doc.id);
                    return (
                      <label
                        key={doc.id}
                        style={{
                          display: "flex", alignItems: "center", gap: "var(--sp-3)",
                          padding: "8px 10px", borderRadius: "var(--r-sm)", cursor: "pointer",
                          background: isOn ? "rgba(37,99,235,0.08)" : "transparent",
                          border: `1px solid ${isOn ? "rgba(37,99,235,0.25)" : "transparent"}`,
                          transition: "all 0.13s",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isOn}
                          onChange={() => toggle(doc.id)}
                          style={{ width: "15px", height: "15px", accentColor: "#2563eb", flexShrink: 0 }}
                        />
                        <span style={{ fontSize: "18px", flexShrink: 0 }}>{fileIcon(doc.name)}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{doc.categoryLabel} · {formatBytes(doc.size)}</div>
                        </div>
                      </label>
                    );
                  })}
                  {filtered.length === 0 && (
                    <div style={{ padding: "var(--sp-4)", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
                      No documents match your search.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="modal__footer" style={{ justifyContent: "space-between" }}>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            {selected.size > 0
              ? `${selected.size} file${selected.size > 1 ? "s" : ""} will be added`
              : "Select at least one file"}
          </span>
          <div style={{ display: "flex", gap: "var(--sp-2)" }}>
            <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
            <button
              className="btn btn--primary"
              onClick={handleSave}
              disabled={!name.trim() || selected.size === 0}
            >
              Create Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Rename folder modal ───────────────────────────────────────────────────────

function RenameFolderModal({ folder, onSave, onClose }) {
  const [value, setValue] = useState(folder.name);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <span className="modal__title">Rename Group</span>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="modal__body">
          <label className="form-label">Group name</label>
          <input
            className="form-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSave(value)}
            autoFocus
          />
        </div>
        <div className="modal__footer">
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={() => onSave(value)} disabled={!value.trim()}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Folder detail modal ───────────────────────────────────────────────────────

function FolderDetailModal({ folder, docs, onRemoveDoc, onClose, onDownload, showToast }) {
  const folderDocs  = docs.filter((d) => folder.docIds.includes(d.id));
  const [zipping,   setZipping]   = useState(false);
  const [zipPct,    setZipPct]    = useState(0);

  async function handleDownloadAll() {
    if (folderDocs.length === 0) return;
    setZipping(true);
    setZipPct(0);
    try {
      await downloadFolderAsZip(folder.name, folderDocs, (pct) => setZipPct(pct));
      showToast("success", `Downloaded ${folderDocs.length} file${folderDocs.length > 1 ? "s" : ""} as "${folder.name}.zip"`);
    } catch (err) {
      console.error(err);
      showToast("error", "Download failed: " + err.message);
    } finally {
      setZipping(false);
      setZipPct(0);
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: "580px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <span style={{ fontSize: "26px" }}>📂</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="modal__title">{folder.name}</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "2px" }}>
              {folderDocs.length} document{folderDocs.length !== 1 ? "s" : ""} · Created {formatDate(folder.createdAt)}
            </div>
          </div>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__body">
          {/* ZIP progress bar — visible only while zipping */}
          {zipping && (
            <div style={{ marginBottom: "var(--sp-4)", padding: "var(--sp-3) var(--sp-4)", background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.2)", borderRadius: "var(--r-md)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginBottom: "6px" }}>
                <span>Packaging files into ZIP…</span>
                <span>{zipPct}%</span>
              </div>
              <div style={{ height: "4px", background: "var(--surface-3)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${zipPct}%`, background: "var(--teal)", borderRadius: "2px", transition: "width 0.3s ease" }} />
              </div>
            </div>
          )}

          {folderDocs.length === 0 ? (
            <div style={{ padding: "var(--sp-6)", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
              All documents in this group have been removed.
            </div>
          ) : (
            <div className="folder-doc-list">
              {folderDocs.map((doc) => (
                <div key={doc.id} className="folder-doc-item">
                  <span className="folder-doc-item__icon">{fileIcon(doc.name)}</span>
                  <span className="folder-doc-item__name" title={doc.name}>{doc.name}</span>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", flexShrink: 0 }}>
                    {doc.categoryLabel}
                  </span>
                  <button
                    className="btn btn--ghost btn--sm"
                    style={{ flexShrink: 0 }}
                    onClick={() => onDownload(doc)}
                    title="Download this file"
                  >
                    ↓
                  </button>
                  <button
                    className="folder-doc-item__remove"
                    onClick={() => onRemoveDoc(folder.id, doc.id)}
                    title="Remove from group"
                    aria-label={`Remove ${doc.name} from group`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal__footer" style={{ justifyContent: "space-between" }}>
          {/* LEFT — Download All button */}
          <button
            className="btn btn--teal"
            onClick={handleDownloadAll}
            disabled={zipping || folderDocs.length === 0}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
            title={`Download all ${folderDocs.length} files as a ZIP`}
          >
            {zipping ? (
              <>
                <span className="spinner spinner--sm" />
                Zipping… {zipPct}%
              </>
            ) : (
              <>
                ⬇ Download All ({folderDocs.length})
              </>
            )}
          </button>

          {/* RIGHT — Close */}
          <button className="btn btn--secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Storage Page ─────────────────────────────────────────────────────────

export default function StoragePage({
  folders,
  docs,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onRemoveDocFromFolder,
  onDownload,
  showToast,
}) {
  const [showCreate,   setShowCreate]   = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [search,       setSearch]       = useState("");
  const [zippingId,    setZippingId]    = useState(null);   // tracks which card is currently zipping

  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleCreate(name, docIds) {
    onCreateFolder(name, docIds);
    setShowCreate(false);
    showToast("success", `Group "${name}" created with ${docIds.length} file${docIds.length > 1 ? "s" : ""}`);
  }

  function handleRename(name) {
    if (!name.trim()) return;
    onRenameFolder(renameTarget.id, name);
    showToast("success", `Renamed to "${name.trim()}"`);
    setRenameTarget(null);
  }

  function handleDelete(folder) {
    if (!window.confirm(`Delete group "${folder.name}"? The documents themselves will not be deleted.`)) return;
    onDeleteFolder(folder.id);
    if (detailTarget?.id === folder.id) setDetailTarget(null);
    showToast("info", `Group "${folder.name}" deleted`);
  }

  function handleRemoveDoc(folderId, docId) {
    onRemoveDocFromFolder(folderId, docId);
    const doc = docs.find((d) => d.id === docId);
    showToast("info", doc ? `"${doc.name}" removed from group` : "Document removed from group");
    setDetailTarget((prev) =>
      prev ? { ...prev, docIds: prev.docIds.filter((id) => id !== docId) } : null
    );
  }

  // Download All directly from the folder card (no modal needed)
  async function handleCardDownloadAll(e, folder) {
    e.stopPropagation();
    const folderDocs = docs.filter((d) => folder.docIds.includes(d.id));
    if (folderDocs.length === 0) return;
    setZippingId(folder.id);
    try {
      await downloadFolderAsZip(folder.name, folderDocs, () => {});
      showToast("success", `Downloaded ${folderDocs.length} file${folderDocs.length > 1 ? "s" : ""} as "${folder.name}.zip"`);
    } catch (err) {
      showToast("error", "Download failed: " + err.message);
    } finally {
      setZippingId(null);
    }
  }

  return (
    <div className="main-content">
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-header__title">Storage</h1>
        <p className="page-header__sub">
          Organise documents into named groups — no file duplication, just references.
        </p>
      </div>

      {/* Toolbar */}
      <div
        className="storage-toolbar"
        style={{ padding: "var(--sp-5) var(--sp-6) 0" }}
      >
        <div className="search-wrap" style={{ flex: "1 1 260px", maxWidth: "380px" }}>
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="search"
            placeholder="Search groups…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn--teal" onClick={() => setShowCreate(true)}>
          + New Group
        </button>
      </div>

      {/* Info banner */}
      <div style={{
        margin: "var(--sp-4) var(--sp-6) 0",
        padding: "var(--sp-3) var(--sp-4)",
        background: "rgba(20,184,166,0.08)",
        border: "1px solid rgba(20,184,166,0.2)",
        borderRadius: "var(--r-md)",
        display: "flex", alignItems: "center", gap: "var(--sp-3)",
      }}>
        <span style={{ fontSize: "18px" }}>💡</span>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          Groups store <strong>references</strong> to your documents — the same file can belong to multiple groups without being duplicated.
          Use <strong>Download All</strong> on any group to get a ZIP of all its files.
        </p>
      </div>

      <div className="section-divider">
        <span className="section-divider__label">
          {search ? `Results for "${search}"` : "All Groups"} ({filteredFolders.length})
        </span>
        <div className="section-divider__line" />
      </div>

      {/* Grid */}
      {filteredFolders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📂</div>
          <div className="empty-state__title">
            {folders.length === 0 ? "No groups yet" : "No groups match"}
          </div>
          <p className="empty-state__text">
            {folders.length === 0
              ? "Create your first group to organise documents together."
              : "Try a different search term."}
          </p>
          {folders.length === 0 && (
            <button
              className="btn btn--primary"
              style={{ marginTop: "var(--sp-4)" }}
              onClick={() => setShowCreate(true)}
            >
              + Create First Group
            </button>
          )}
        </div>
      ) : (
        <div className="storage-grid">
          {filteredFolders.map((folder, i) => {
            const folderDocs  = docs.filter((d) => folder.docIds.includes(d.id));
            const preview     = folderDocs.slice(0, 3);
            const isZipping   = zippingId === folder.id;

            return (
              <div
                key={folder.id}
                className="folder-card anim-fade-up"
                style={{ animationDelay: `${i * 55}ms` }}
                onClick={() => setDetailTarget(folder)}
              >
                {/* Card top */}
                <div className="folder-card__top">
                  <div className="folder-card__icon">📂</div>
                  <div className="folder-card__info">
                    <div className="folder-card__name" title={folder.name}>{folder.name}</div>
                    <div className="folder-card__meta">
                      {folderDocs.length} file{folderDocs.length !== 1 ? "s" : ""} · {formatDate(folder.createdAt)}
                    </div>
                  </div>
                </div>

                {/* File preview list */}
                {preview.length > 0 && (
                  <div style={{ padding: "0 var(--sp-4) var(--sp-3)", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {preview.map((doc) => (
                      <div
                        key={doc.id}
                        style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}
                      >
                        <span>{fileIcon(doc.name)}</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {doc.name}
                        </span>
                      </div>
                    ))}
                    {folderDocs.length > 3 && (
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", paddingLeft: "22px" }}>
                        +{folderDocs.length - 3} more file{folderDocs.length - 3 > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                )}

                {/* Card footer — actions */}
                <div className="folder-card__footer" onClick={(e) => e.stopPropagation()}>

                  {/* ── DOWNLOAD ALL button ── */}
                  <button
                    className="btn btn--teal btn--sm"
                    onClick={(e) => handleCardDownloadAll(e, folder)}
                    disabled={isZipping || folderDocs.length === 0}
                    title={`Download all ${folderDocs.length} files as ZIP`}
                    style={{ display: "flex", alignItems: "center", gap: "5px" }}
                  >
                    {isZipping ? (
                      <><span className="spinner spinner--sm" /> Zipping…</>
                    ) : (
                      <>⬇ Download All</>
                    )}
                  </button>

                  {/* Manage buttons */}
                  <div style={{ display: "flex", gap: "var(--sp-1)" }}>
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={(e) => { e.stopPropagation(); setDetailTarget(folder); }}
                      title="Open group"
                    >
                      Open
                    </button>
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={(e) => { e.stopPropagation(); setRenameTarget(folder); }}
                      title="Rename"
                    >
                      ✎
                    </button>
                    <button
                      className="btn btn--danger btn--sm"
                      onClick={(e) => { e.stopPropagation(); handleDelete(folder); }}
                      title="Delete group"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <CreateFolderModal
          docs={docs}
          onSave={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}
      {renameTarget && (
        <RenameFolderModal
          folder={renameTarget}
          onSave={handleRename}
          onClose={() => setRenameTarget(null)}
        />
      )}
      {detailTarget && (
        <FolderDetailModal
          folder={detailTarget}
          docs={docs}
          onRemoveDoc={handleRemoveDoc}
          onClose={() => setDetailTarget(null)}
          onDownload={onDownload}
          showToast={showToast}
        />
      )}
    </div>
  );
}
