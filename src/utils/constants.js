// constants.js — single source of truth for app-wide values

export const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "text/plain",
];

export const CATEGORIES = [
  { id: "all",            label: "All Documents",       icon: "📁", color: null,       bg: null,                      keywords: [] },
  { id: "identification", label: "Identification",      icon: "🪪", color: "#1d4ed8",  bg: "rgba(96,165,250,0.13)",   keywords: ["passport","national id","driver license","driving licence","student id","identity card","identification","id card","date of birth","nationality","expiry date","document number","visa","biometric","citizenship"] },
  { id: "financial",      label: "Financial",           icon: "💰", color: "#059669",  bg: "rgba(52,211,153,0.13)",   keywords: ["bank statement","salary slip","payslip","pay stub","tax return","tax form","financial report","balance sheet","income statement","account number","iban","swift","debit","credit","transaction history","withholding tax","1099","annual report","dividend"] },
  { id: "invoices",       label: "Invoices & Receipts", icon: "🧾", color: "#b45309",  bg: "rgba(251,191,36,0.13)",   keywords: ["invoice","receipt","payment receipt","bill","purchase order","order confirmation","amount due","total amount","subtotal","tax invoice","vat","quantity","unit price","billing address","due date","payment terms","transaction id","order number"] },
  { id: "academic",       label: "Academic",            icon: "🎓", color: "#7c3aed",  bg: "rgba(167,139,250,0.13)",  keywords: ["certificate","transcript","diploma","degree","assignment","thesis","research paper","abstract","methodology","bibliography","references","hypothesis","gpa","grade","semester","course","university","college","student","professor","academic","journal"] },
  { id: "legal",          label: "Legal",               icon: "⚖️", color: "#dc2626",  bg: "rgba(248,113,113,0.13)",  keywords: ["contract","agreement","legal notice","license","licence","terms and conditions","hereby agrees","party","obligations","clause","whereas","jurisdiction","indemnification","liability","arbitration","notary","affidavit","nda","non-disclosure"] },
  { id: "business",       label: "Business / Work",     icon: "💼", color: "#c2410c",  bg: "rgba(251,146,60,0.13)",   keywords: ["business report","project plan","meeting minutes","agenda","memo","company","organization","department","quarterly","kpi","objective","strategy","proposal","stakeholder","deliverable","milestone","budget","forecast","risk assessment","sop"] },
  { id: "personal",       label: "Personal",            icon: "👤", color: "#9333ea",  bg: "rgba(232,121,249,0.13)",  keywords: ["resume","cv","curriculum vitae","cover letter","personal statement","work experience","employment history","skills","hobbies","references","linkedin","portfolio","letter of recommendation","personal record","diary","notes","journal"] },
];

export const FILE_ICONS = {
  pdf: "📕", docx: "📘", doc: "📘", txt: "📃",
  jpg: "🖼️", jpeg: "🖼️", png: "🖼️", webp: "🖼️",
  default: "📄",
};

export const STORAGE_KEY  = "documentai_v5";
export const FOLDERS_KEY  = "documentai_folders_v2";

export const NAV_ITEMS = [
  { id: "dashboard",  label: "Dashboard",  icon: "⊞" },
  { id: "upload",     label: "Upload",     icon: "↑" },
  { id: "documents",  label: "Documents",  icon: "≡" },
  { id: "storage",    label: "Storage",    icon: "⬛" },
  { id: "profile",    label: "Profile",    icon: "◉" },
];
