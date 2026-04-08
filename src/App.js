import React, { useState, useCallback, useEffect } from "react";
import "./styles/global.css";

// Layout
import TopBar  from "./components/TopBar/TopBar";
import Sidebar from "./components/Sidebar/Sidebar";

// Pages
import Dashboard       from "./components/Dashboard/Dashboard";
import UploadPage      from "./components/UploadPage/UploadPage";
import DocumentManager from "./components/DocumentManager/DocumentManager";
import StoragePage     from "./components/StoragePage/StoragePage";
import Profile         from "./components/Profile/Profile";

// Shared
import { ViewerModal, DetailsModal, RenameModal } from "./components/shared/Modals";
import Toast from "./components/shared/Toast";

// State hooks
import { useDocuments } from "./hooks/useDocuments";
import { useFolders }   from "./hooks/useFolders";
import { useToast }     from "./hooks/useToast";

// Services
import { extractText }       from "./services/extractor";
import { classifyDocument }  from "./services/classifier";

// Helpers
import { uid, fileExt, getCat, toBase64, formatDateShort } from "./utils/helpers";
import { ALLOWED_TYPES } from "./utils/constants";

export default function App() {
  // ── Navigation ───────────────────────────────────────────────
  const [activePage,  setActivePage]  = useState("dashboard");
  const [activeCat,   setActiveCat]   = useState("all");
  const [searchTerm,  setSearchTerm]  = useState("");

  // ── Document state ───────────────────────────────────────────
  const { docs, addDoc, updateDoc, removeDoc, getDoc, catCounts, stats } = useDocuments();

  // ── Folder state ─────────────────────────────────────────────
  const { folders, createFolder, renameFolder, deleteFolder, addDocsToFolder, removeDocFromFolder } = useFolders();

  // ── Toast ─────────────────────────────────────────────────────
  const { toasts, show: showToast, dismiss } = useToast();

  // ── UI state ──────────────────────────────────────────────────
  const [selectedDoc,   setSelectedDoc]   = useState(null);
  const [openedDoc,     setOpenedDoc]     = useState(null);
  const [detailsDoc,    setDetailsDoc]    = useState(null);
  const [renameDoc,     setRenameDoc]     = useState(null);
  const [renameValue,   setRenameValue]   = useState("");
  const [menuOpenId,    setMenuOpenId]    = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [queue,         setQueue]         = useState([]);
  const [profile,       setProfile]       = useState({
    name: "Navya Naveli", email: "Navya_Naveli@gmail.com", plan: "Premium",
  });

  // Auto-select first doc
  useEffect(() => {
    if (!selectedDoc && docs.length) setSelectedDoc(docs[0]);
  }, [docs, selectedDoc]);

  // Close menu on outside click
  useEffect(() => {
    const close = () => setMenuOpenId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // Escape closes modals
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") {
        setOpenedDoc(null);
        setDetailsDoc(null);
        setRenameDoc(null);
        setRenameValue("");
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  // ── Queue helpers ─────────────────────────────────────────────
  const queueUpdate = useCallback((id, patch) =>
    setQueue((prev) => prev.map((q) => q.id === id ? { ...q, ...patch } : q)), []);

  const queueRemove = useCallback((id) =>
    setTimeout(() => setQueue((prev) => prev.filter((q) => q.id !== id)), 2800), []);

  // ── Upload pipeline ───────────────────────────────────────────
  const processFiles = useCallback(async (files) => {
    for (const file of files) {
      const id  = uid();
      const ext = fileExt(file.name);

      setQueue((prev) => [
        ...prev,
        { id, name: file.name, ext, status: "Preparing…", progress: 4, categoryId: null, error: null },
      ]);

      try {
        queueUpdate(id, { status: "Extracting text…", progress: 18 });
        const text = await extractText(file);

        queueUpdate(id, { status: "Classifying with AI…", progress: 55 });
        const result = await classifyDocument(text, file.name);

        queueUpdate(id, { status: "Storing…", progress: 85 });
        const fileData = await toBase64(file);
        const cat      = getCat(result.categoryId);
        const pct      = Math.round(result.confidence * 100);

        const doc = {
          id,
          name:          file.name,
          ext,
          size:          file.size,
          mimeType:      file.type,
          text:          text.slice(0, 6000),
          categoryId:    result.categoryId,
          categoryLabel: cat.label,
          categoryIcon:  cat.icon,
          confidence:    result.confidence,
          confidencePct: `${pct}%`,
          summary:       result.summary,
          analysis: {
            category:   cat.label,
            confidence: `${pct}%`,
            summary:    result.summary,
            fields: [
              { label: "Owner",      value: profile.name  },
              { label: "Category",   value: cat.label      },
              { label: "Confidence", value: `${pct}%`      },
              { label: "Status",     value: pct >= 85 ? "Verified" : "Processed" },
            ],
          },
          owner:      profile.name,
          date:       formatDateShort(new Date().toISOString()),
          type:       cat.label,
          fileData,
          uploadedAt: new Date().toISOString(),
        };

        addDoc(doc);
        setSelectedDoc(doc);
        setActivePage("dashboard");

        queueUpdate(id, { status: "Done!", progress: 100, categoryId: result.categoryId });
        queueRemove(id);
        showToast("success", `${cat.icon} "${file.name.slice(0, 28)}" → ${cat.label}`);

      } catch (err) {
        console.error("[DocumentAI]", err);
        queueUpdate(id, { status: "", progress: 100, error: err.message || "Processing failed" });
        queueRemove(id);
        showToast("error", `Failed: "${file.name.slice(0, 24)}"`);
      }
    }
  }, [profile.name, addDoc, queueUpdate, queueRemove, showToast]);

  const handleFiles = useCallback((files) => {
    const valid = [], errs = [];
    Array.from(files).forEach((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) errs.push(`"${f.name}": unsupported type`);
      else if (f.size > 10 * 1024 * 1024)  errs.push(`"${f.name}": exceeds 10 MB`);
      else valid.push(f);
    });
    if (errs.length)   showToast("error", errs[0]);
    if (valid.length)  processFiles(valid);
  }, [processFiles, showToast]);

  // ── Doc actions ───────────────────────────────────────────────
  const handleOpen = useCallback((doc) => {
    setLoading(true);
    setTimeout(() => { setOpenedDoc(doc); setLoading(false); }, 320);
  }, []);

  const handleDelete = useCallback((doc) => {
    if (!window.confirm(`Delete "${doc.name}"?`)) return;
    setLoading(true); setLoadingAction("deleting");
    setTimeout(() => {
      removeDoc(doc.id);
      if (openedDoc?.id === doc.id)  setOpenedDoc(null);
      if (detailsDoc?.id === doc.id) setDetailsDoc(null);
      if (renameDoc?.id === doc.id)  { setRenameDoc(null); setRenameValue(""); }
      if (selectedDoc?.id === doc.id) setSelectedDoc(docs.find((d) => d.id !== doc.id) || null);
      setMenuOpenId(null);
      setLoading(false); setLoadingAction(null);
      showToast("info", `Deleted "${doc.name.slice(0, 28)}"`);
    }, 500);
  }, [removeDoc, openedDoc, detailsDoc, renameDoc, selectedDoc, docs, showToast]);

  const handleDownload = useCallback((doc) => {
    if (doc.fileData) {
      const a = Object.assign(document.createElement("a"), { href: doc.fileData, download: doc.name });
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } else {
      const content = `Document: ${doc.name}\nOwner: ${doc.owner}\nCategory: ${doc.categoryLabel}\nConfidence: ${doc.confidencePct}\nDate: ${doc.date}\nSummary: ${doc.summary}\n\nExtracted Text:\n${doc.text || "—"}`;
      const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
      const a   = Object.assign(document.createElement("a"), { href: url, download: `${doc.name}.txt` });
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    showToast("info", `Downloading "${doc.name.slice(0, 26)}"`);
    setMenuOpenId(null);
  }, [showToast]);

  const handleSaveRename = useCallback(() => {
    if (!renameDoc || !renameValue.trim()) return;
    const name = renameValue.trim();
    updateDoc(renameDoc.id, (d) => ({ ...d, name }));
    if (openedDoc?.id  === renameDoc.id) setOpenedDoc((p)  => p ? { ...p, name } : p);
    if (detailsDoc?.id === renameDoc.id) setDetailsDoc((p) => p ? { ...p, name } : p);
    if (selectedDoc?.id=== renameDoc.id) setSelectedDoc((p)=> p ? { ...p, name } : p);
    showToast("success", "Renamed successfully");
    setRenameDoc(null); setRenameValue("");
  }, [renameDoc, renameValue, updateDoc, openedDoc, detailsDoc, selectedDoc, showToast]);

  const handleProfileChange = useCallback((key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleProfileSave = useCallback(() => {
    if (!profile.name.trim() || !profile.email.trim()) {
      showToast("error", "Please fill all fields"); return;
    }
    const name = profile.name.trim();
    const upd  = (d) => ({
      ...d,
      owner: name,
      analysis: {
        ...d.analysis,
        fields: d.analysis.fields.map((f) =>
          ["Owner","Full Name","Account Holder","Candidate"].includes(f.label)
            ? { ...f, value: name }
            : f
        ),
      },
    });
    // update all docs with new owner name
    docs.forEach((d) => updateDoc(d.id, upd));
    if (openedDoc)   setOpenedDoc(upd(openedDoc));
    if (detailsDoc)  setDetailsDoc(upd(detailsDoc));
    if (selectedDoc) setSelectedDoc(upd(selectedDoc));
    showToast("success", "Profile updated");
  }, [profile, docs, updateDoc, openedDoc, detailsDoc, selectedDoc, showToast]);

  // ── Shared doc card props ─────────────────────────────────────
  const docCardProps = {
    menuOpenId,
    onMenuToggle: (id) => setMenuOpenId((prev) => prev === id ? null : id),
    onOpen:    handleOpen,
    onDetails: (doc) => { setDetailsDoc(doc); setMenuOpenId(null); },
    onRename:  (doc) => { setRenameDoc(doc); setRenameValue(doc.name); setMenuOpenId(null); },
    onDownload: handleDownload,
    onDelete:   handleDelete,
    loading,
    loadingAction,
  };

  return (
    <div className="app-shell">
      <TopBar />

      <div className="app-body">
        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          activeCat={activeCat}
          onCatSelect={setActiveCat}
          catCounts={catCounts}
          docCount={docs.length}
        />

        {/* Pages */}
        {activePage === "dashboard" && (
          <Dashboard
            docs={docs}
            stats={stats}
            catCounts={catCounts}
            activeCat={activeCat}
            onCatChange={setActiveCat}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedDoc={selectedDoc}
            onSelectDoc={setSelectedDoc}
            queue={queue}
            onNavigate={setActivePage}
            {...docCardProps}
          />
        )}

        {activePage === "upload" && (
          <UploadPage queue={queue} onFiles={handleFiles} />
        )}

        {activePage === "documents" && (
          <DocumentManager
            docs={docs}
            catCounts={catCounts}
            activeCat={activeCat}
            onCatChange={setActiveCat}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedDoc={selectedDoc}
            onSelectDoc={setSelectedDoc}
            onNavigate={setActivePage}
            {...docCardProps}
          />
        )}

        {activePage === "storage" && (
          <StoragePage
            folders={folders}
            docs={docs}
            onCreateFolder={createFolder}
            onRenameFolder={renameFolder}
            onDeleteFolder={deleteFolder}
            onRemoveDocFromFolder={removeDocFromFolder}
            onDownload={handleDownload}
            showToast={showToast}
          />
        )}

        {activePage === "profile" && (
          <Profile
            profile={profile}
            onProfileChange={handleProfileChange}
            onSave={handleProfileSave}
            stats={stats}
            docs={docs}
          />
        )}
      </div>

      {/* Global modals */}
      {openedDoc && (
        <ViewerModal
          doc={openedDoc}
          onClose={() => setOpenedDoc(null)}
          onDownload={handleDownload}
        />
      )}
      {detailsDoc && (
        <DetailsModal
          doc={detailsDoc}
          onClose={() => setDetailsDoc(null)}
        />
      )}
      {renameDoc && (
        <RenameModal
          doc={renameDoc}
          value={renameValue}
          onChange={setRenameValue}
          onSave={handleSaveRename}
          onClose={() => { setRenameDoc(null); setRenameValue(""); }}
        />
      )}

      {/* Loading spinner overlay */}
      {loading && loadingAction === "deleting" && (
        <div className="overlay" style={{ background: "rgba(9,18,40,0.3)" }}>
          <div className="spinner" />
        </div>
      )}

      <Toast toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
