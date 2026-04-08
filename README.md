# DocumentAI — Intelligent Document Management System

> Final Year Computer Science Project  
> B.Tech Computer Science

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Objectives](#3-objectives)
4. [System Architecture](#4-system-architecture)
5. [Technology Stack](#5-technology-stack)
6. [Core Features](#6-core-features)
7. [How the AI Classification Works](#7-how-the-ai-classification-works)
8. [The 7 Document Categories](#8-the-7-document-categories)
9. [Project File Structure](#9-project-file-structure)
10. [Data Flow — Step by Step](#10-data-flow--step-by-step)
11. [Text Extraction Pipeline](#11-text-extraction-pipeline)
12. [Storage Architecture](#12-storage-architecture)
13. [Running the Project](#13-running-the-project)
14. [API Integration](#14-api-integration)
15. [Design Decisions and Trade-offs](#15-design-decisions-and-trade-offs)
16. [Limitations and Future Scope](#16-limitations-and-future-scope)


---

## 1. Project Overview

**DocumentAI** is a web-based intelligent document management system that uses Artificial Intelligence to automatically read, understand, and classify uploaded documents. The system accepts PDF files, Microsoft Word documents, images (JPG, PNG), and plain text files. Once a file is uploaded, a pipeline of technologies extracts readable text from the document and sends it to an AI language model, which returns a classification category, a confidence score, and a one-sentence summary — all within seconds.

The system is built as a **React.js single-page application (SPA)** that runs entirely in the browser. There is no custom backend server. All document processing happens client-side using third-party JavaScript libraries loaded from CDNs, and AI classification is done by calling the Anthropic Claude API directly from the frontend.

The interface has five pages: **Dashboard**, **Upload**, **Documents**, **Storage**, and **Profile**. It includes a manual document grouping system called Storage, where users can organise documents into named collections without duplicating the files. All data is stored in the browser's localStorage, making the system fully self-contained.

---

## 2. Problem Statement

In daily life and in organisations, people handle a large volume of documents — invoices, bank statements, contracts, certificates, resumes, passports, and more. Managing these manually is time-consuming, error-prone, and inefficient. The challenges include:

- **Manual categorisation is slow.** A person processing 50 documents per day must read each one to understand what it is.
- **Searching for the right document is difficult** when files are poorly named or disorganised.
- **No intelligent understanding.** Traditional file systems sort files by name or date, not by content.
- **Storage duplication.** When the same document belongs to multiple projects, people copy it into multiple folders, wasting storage.

DocumentAI addresses all four of these problems by automatically reading and understanding the content of documents using AI, and by using a reference-based grouping system that avoids file duplication.

---

## 3. Objectives

The primary objectives of this project are:

1. **Automatic AI classification** — Upload a document and have the AI identify what type it is, without any manual tagging.
2. **Support multiple file formats** — Handle PDFs (both digital and scanned), Word documents, images, and plain text.
3. **OCR capability** — Extract text from scanned documents and photographs using Optical Character Recognition.
4. **Confidence scoring** — Show the user how certain the AI is about its classification decision.
5. **AI-generated summaries** — Produce a one-sentence description of each document's specific content.
6. **Manual document grouping** — Allow users to group documents into named collections by reference (no duplication).
7. **Persistent storage** — Documents and groups survive page refreshes via localStorage.
8. **Offline fallback** — If the AI API is unavailable, a keyword-based classifier ensures the system still works.
9. **Production-quality UI** — A responsive, accessible, professional interface that works on different screen sizes.

---

## 4. System Architecture

DocumentAI follows a **three-layer client-side architecture**:


┌─────────────────────────────────────────────────────────────────┐
│                     BROWSER (Client Only)                       │
│                                                                 │
│   ┌─────────────────┐   ┌─────────────────┐   ┌──────────── ─┐  │
│   │   Presentation  │   │  Business Logic │   │  Storage     │  │
│   │   (React UI)    │──▶│  (Services &    │──▶│  Layer      │  │
│   │                 │   │   Hooks)        │   │ (localStorage)  │
│   │  - Dashboard    │   │                 │   │              │  │
│   │  - Upload       │   │  - extractor.js │   │  - docs      │  │
│   │  - Documents    │   │  - classifier.js│   │  - folders   │  │
│   │  - Storage      │   │  - storage.js   │   │              │  │
│   │  - Profile      │   │                 │   │              │  │
│   └─────────────────┘   └─────────────────┘   └──────────────┘  │
│                                 │                               │
│                    ┌────────────▼────────────┐                  │
│                    │    CDN Libraries        │                  │
│                    │                         │                  │
│                    │  PDF.js  (PDF text)     │                  │
│                    │  Mammoth (Word text)    │                  │
│                    │  Tesseract (OCR/images) │                  │
│                    └────────────┬────────────┘                  │
└─────────────────────────────────┼───────────────────────────────┘
│ HTTPS
┌────────────▼─────────────┐
│   Anthropic Claude API   │
│   (External AI Service)  │
│   claude-sonnet-4-...    │
└──────────────────────────┘



---

## 5. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| UI Framework | React.js | 19.2.4 | Component-based interface, state management |
| Build Tool | Create React App | 5.0.1 | Zero-config build, dev server, bundling |
| Styling | Plain CSS (design tokens) | — | Custom property system, no CSS framework |
| PDF Extraction | PDF.js | 3.11.174 | Reads text from digital PDF files |
| Word Extraction | Mammoth.js | 1.6.0 | Reads text from .docx and .doc files |
| OCR | Tesseract.js | 5.x | Converts image pixels to machine-readable text |
| AI Model | Claude Sonnet 4 | claude-sonnet-4-20250514 | Natural language understanding and classification |
| Data Persistence | Browser localStorage | — | Stores document metadata across sessions |
| Icons | Lucide React | 0.383.0 | SVG icon components |

**Why React?** React was chosen because its component model maps naturally onto the modular UI design of this project. Each page (Dashboard, Upload, Documents, Storage, Profile) is an independent component, and shared elements (DocCard, Modals, Toast) are reused without duplication. React's hooks (`useState`, `useEffect`, `useCallback`) make complex state logic readable and testable. React 19 is the latest stable version and includes performance improvements over previous versions.

**Why no CSS framework like Tailwind or Bootstrap?** A custom CSS token system was used instead of a utility framework because it produces smaller bundles, gives full control over design decisions, and demonstrates understanding of CSS fundamentals — which is more appropriate for a university project. All design tokens (colours, spacing, typography, shadows, transitions) are defined as CSS custom properties in `src/styles/globals.css`.

---

## 6. Core Features

### 6.1 Automatic AI Classification
Every uploaded document is automatically analysed by the Claude AI model and assigned to one of seven categories. The user does not need to label anything manually. Classification happens in the background while the UI shows a real-time progress indicator.

### 6.2 Multi-format Support
The system supports five file types through three different extraction methods:
- **PDF** — digital text via PDF.js; scanned PDF via OCR fallback
- **DOCX / DOC** — Word document text via Mammoth.js
- **JPG / PNG** — image text via Tesseract.js OCR
- **TXT** — read directly by the browser's FileReader API

### 6.3 Real-time Processing Queue
When a file is uploaded, a queue item appears immediately showing the current step: Extracting text → Classifying with AI → Storing. A progress bar updates as each step completes. Multiple files are processed sequentially.

### 6.4 Confidence Score
Each classified document shows an AI confidence score (0–100%) represented as an animated progress bar coloured according to the document's category. A score of 85% or above marks the document as "Verified".

### 6.5 AI Summary
Along with the category and confidence score, the AI generates a one-sentence summary that describes the specific content of the document, not just its type. For example: "Monthly invoice for software subscription services totaling $2,400" rather than just "Invoice".

### 6.6 Storage / Document Groups
The Storage page allows users to create named groups (e.g., "Project A Documents", "Year 2024 Invoices"). Groups store only the IDs of the documents they contain — not copies of the files. This means:
- The same document can belong to multiple groups simultaneously.
- Deleting a group does not delete any documents.
- There is zero file duplication.
- Groups persist in localStorage between sessions.

### 6.7 Document Viewer
Clicking "Open" on any document opens a full-screen modal showing a visual preview (simulated page for PDF, image canvas for images, word page for DOCX), all metadata, the AI summary, and the full extracted text.

### 6.8 Offline Fallback
If the Claude API is unavailable (network error, quota exceeded, or the user is offline), the system automatically falls back to a keyword-scoring classifier. This scans the extracted text for domain-specific keywords associated with each category and picks the best match. The system remains functional without internet access.

### 6.9 Persistent Data
Document metadata (name, category, confidence, summary, extracted text, date) is stored in the browser's localStorage under the key `documentai_v5`. File binary data (for downloads) is held in memory only during the current session and is not written to localStorage to avoid storage quota errors.

### 6.10 Profile and Ownership
Users can set their name and email on the Profile page. When the name is changed, all documents owned by that user are updated automatically across all state slots.

---

## 7. How the AI Classification Works

This is the most technically important part of the project.

### Step 1 — Text Extraction
First, the raw file is processed to extract machine-readable text. The method depends on the file type (see Section 11 for the full pipeline).

### Step 2 — Prompt Construction
The extracted text (limited to the first 3,500 characters to stay within token limits) is embedded into a structured prompt. The prompt tells the AI model exactly what categories exist, what the filename is, and what output format is expected:

```
You are a document classification system. Classify into exactly one category.

Categories:
- identification: Identification
- financial: Financial
- invoices: Invoices & Receipts
- academic: Academic
- legal: Legal
- business: Business / Work
- personal: Personal

Filename: "Invoice_March_2024.pdf"
Text:
"""
INVOICE
Date: March 1 2024
Invoice #: INV-2024-031
Bill To: Acme Corp
...
"""

Reply ONLY with raw JSON: {"categoryId":"<id>","confidence":<0.0-1.0>,"summary":"<one sentence>"}
```

### Step 3 — API Call
The prompt is sent to the Anthropic Messages API endpoint (`https://api.anthropic.com/v1/messages`) using the `claude-sonnet-4-20250514` model with `max_tokens: 200`. The system uses the Claude Sonnet model because it balances accuracy with speed and cost for classification tasks.

### Step 4 — Response Parsing
The API returns a JSON object. The system parses it, validates that the `categoryId` is one of the seven known categories, and clamps the `confidence` value between 0.0 and 1.0.

### Step 5 — Fallback on Error
If the API call fails for any reason (network error, invalid response, timeout), the `keywordFallback()` function runs instead. It converts the text and filename to lowercase and counts how many domain-specific keywords from each category appear. The category with the most keyword hits wins. If there are no keyword matches, it defaults to the "personal" category.

The keyword fallback is defined in `src/utils/helpers.js` and uses the same keyword arrays from `src/utils/constants.js` that are displayed in the sidebar filters.

---

## 8. The 7 Document Categories

Each category has a unique ID, label, icon, colour, background colour, and a list of domain-specific keywords used by the fallback classifier.

| Icon | ID | Label | Colour | Example Keywords |
|------|----|-------|--------|------------------|
| 🪪 | `identification` | Identification | Blue `#1d4ed8` | passport, national id, driver license, visa, citizenship |
| 💰 | `financial` | Financial | Green `#059669` | bank statement, salary slip, tax form, balance sheet, iban |
| 🧾 | `invoices` | Invoices & Receipts | Amber `#b45309` | invoice, receipt, amount due, purchase order, vat |
| 🎓 | `academic` | Academic | Violet `#7c3aed` | certificate, transcript, gpa, university, research paper |
| ⚖️ | `legal` | Legal | Red `#dc2626` | contract, agreement, nda, clause, jurisdiction |
| 💼 | `business` | Business / Work | Orange `#c2410c` | business report, project plan, kpi, stakeholder, sop |
| 👤 | `personal` | Personal | Purple `#9333ea` | resume, cv, cover letter, work experience, linkedin |

The "All Documents" option (id: `all`) is a filter-only category, not a classification target.

---

## 9. Project File Structure

```
document-ai-ui/
│
├── public/
│   └── index.html              HTML entry point; loads PDF.js, Mammoth, Tesseract from CDN
│
└── src/
    │
    ├── index.js                React entry point; mounts <App /> into #root
    │
    ├── App.js                  Root component; holds all global state; routes between pages
    │
    ├── styles/
    │   └── globals.css          Complete design system: tokens, layout, components, animations
    │
    ├── utils/
    │   ├── constants.js        Categories, nav items, file icons, storage keys — single source of truth
    │   └── helpers.js          Pure functions: fileExt, fileIcon, formatBytes, uid, getCat, toBase64, keywordFallback
    │
    ├── services/
    │   ├── storage.js          localStorage read/write for documents and folders
    │   ├── extractor.js        Text extraction: PDF.js, Mammoth.js, Tesseract.js, FileReader
    │   └── classifier.js       Claude API call + keyword fallback
    │
    ├── hooks/
    │   ├── useDocuments.js     Custom hook: document array state + CRUD + stats + category counts
    │   ├── useFolders.js       Custom hook: folder array state + create/rename/delete/addDocs/removeDoc
    │   └── useToast.js         Custom hook: toast notification queue with auto-dismiss
    │
    └── components/
        ├── TopBar/
        │   └── TopBar.jsx      Navigation bar: logo, AI status indicator
        │
        ├── Sidebar/
        │   └── Sidebar.jsx     Left panel: main nav buttons + category quick-filters with live counts
        │
        ├── Dashboard/
        │   └── Dashboard.jsx   Two-column layout: document list (left) + preview panel (right)
        │
        ├── UploadPage/
        │   └── UploadPage.jsx  Drag-and-drop zone, queue display, supported categories grid
        │
        ├── DocumentManager/
        │   └── DocumentManager.jsx  Full document list with search and category filter chips
        │
        ├── StoragePage/
        │   └── StoragePage.jsx Storage groups: create/open/rename/delete folders, reference-only
        │
        ├── Profile/
        │   └── Profile.jsx     User profile card + account settings form
        │
        └── shared/
            ├── DocCard.jsx     Reusable document card: icon, name, badge, confidence bar, action menu
            ├── Modals.jsx      ViewerModal, DetailsModal, RenameModal — all document modals
            └── Toast.jsx       Notification toast stack (success / error / info)
```

**Total: 20 source files, approximately 1,900 lines of application code.**

---

## 10. Data Flow — Step by Step

This describes exactly what happens from the moment a user drops a file until it appears in the library.

```
User drops a file on the Upload Zone
            │
            ▼
handleFiles() in App.js
  → validates file type (ALLOWED_TYPES list)
  → validates file size (max 10 MB)
  → calls processFiles() for each valid file
            │
            ▼
processFiles() — runs sequentially for each file
  │
  ├─ 1. Creates a queue entry { id, name, status:"Preparing", progress:4 }
  │       → User sees the item appear in the UI immediately
  │
  ├─ 2. Calls extractText(file) from services/extractor.js
  │       → Updates queue: status="Extracting text…", progress=18
  │       → Routes to the correct extractor based on file extension
  │       → Returns a plain text string
  │
  ├─ 3. Calls classifyDocument(text, filename) from services/classifier.js
  │       → Updates queue: status="Classifying with AI…", progress=55
  │       → Sends POST request to Anthropic API
  │       → Receives { categoryId, confidence, summary }
  │       → On API failure: runs keywordFallback(text, filename) instead
  │
  ├─ 4. Calls toBase64(file)
  │       → Updates queue: status="Storing…", progress=85
  │       → Converts the raw File object to a base64 data URL for download support
  │
  ├─ 5. Builds the document record:
  │       {
  │         id, name, ext, size, mimeType,
  │         text (first 6000 chars of extracted text),
  │         categoryId, categoryLabel, confidence, confidencePct,
  │         summary, analysis { fields[] },
  │         owner, date, fileData (base64),
  │         uploadedAt (ISO timestamp)
  │       }
  │
  ├─ 6. Calls addDoc(doc) from useDocuments hook
  │       → Adds to React state array
  │       → Calls saveDocs() → localStorage.setItem("documentai_v5", ...)
  │
  └─ 7. Updates queue: status="Done!", progress=100, categoryId=result
          → After 2.8 seconds, removes the queue item with fade animation
          → Shows a success toast: "🧾 Invoice_March.pdf → Invoices & Receipts"
          → Navigates to Dashboard and selects the new document
```

---

## 11. Text Extraction Pipeline

The extractor (`src/services/extractor.js`) uses different methods depending on the file type:

```
extractText(file)
│
├── .txt file
│     → file.text()  [Browser FileReader API]
│     → Returns string directly
│
├── .pdf file  →  extractPDF(file)
│     → file.arrayBuffer()
│     → pdfjsLib.getDocument({ data: buffer })
│     → Loop through up to 15 pages
│     → page.getTextContent() → join items → text string
│     │
│     └── IF text.trim().length < 60 characters (scanned PDF)
│           → Render page 1 to an HTML Canvas element at 1.8x scale
│           → canvas.toBlob() → PNG image
│           → Pass to extractOCR() below
│
├── .docx / .doc file  →  extractDocx(file)
│     → file.arrayBuffer()
│     → mammoth.extractRawText({ arrayBuffer })
│     → Returns plain text string
│
└── .jpg / .jpeg / .png / .webp  →  extractOCR(file)
      → Tesseract.createWorker("eng")
      → URL.createObjectURL(file)  [create temporary browser URL]
      → worker.recognize(url)  [runs OCR neural network]
      → worker.terminate()
      → URL.revokeObjectURL(url)  [clean up memory]
      → Returns recognised text string
```

**Why the 60-character threshold for scanned PDFs?** A legitimate digital PDF that has been read by PDF.js will almost always contain at least one sentence of text. If the result is fewer than 60 characters, it almost certainly means the PDF contains scanned images rather than digital text — so OCR is applied to the first page as a fallback.

---

## 12. Storage Architecture

### Document Storage
Documents are stored in the browser's `localStorage` under the key `documentai_v5`. The stored format is a JSON array of document objects. File binary data (`fileData`) is **stripped out before saving** to avoid exceeding the browser's typical 5–10 MB localStorage quota. Binary data is kept in React state (memory) only and is lost when the page is refreshed — this is a known and accepted limitation.

```javascript
// What gets saved to localStorage (fileData stripped):
[
  {
    id: "lbt2xr9f1",
    name: "Invoice_March_2024.pdf",
    ext: "pdf",
    size: 142000,
    categoryId: "invoices",
    categoryLabel: "Invoices & Receipts",
    confidence: 0.94,
    confidencePct: "94%",
    summary: "Monthly invoice for software services totaling $2,400.",
    text: "INVOICE\nDate: March 1 2024...",   // up to 6000 chars
    owner: "John Doe",
    date: "Mar 01",
    uploadedAt: "2024-03-01T10:30:00.000Z",
    fileData: null   // ← always null in storage
  }
]
```

### Folder Storage (Storage Page)
Folders are stored under the key `documentai_folders_v2`. A folder contains only an array of document IDs, never a copy of the document data. This is a **reference-based storage model** that prevents duplication.

```javascript
// Folder record in localStorage:
{
  id: "m2k9a3",
  name: "Project A Documents",
  docIds: ["lbt2xr9f1", "c3p7d2", "z9q1m8"],  // ← only IDs
  createdAt: "2024-03-01T12:00:00.000Z"
}
```

This means:
- A document can appear in any number of folders simultaneously.
- Deleting a folder removes only the folder record, not the documents.
- If a document is deleted, it disappears from all folders that reference it.
- Total storage footprint is much smaller than copying files.

---

## 13. Running the Project

### Prerequisites
- Node.js version 16 or higher
- npm version 8 or higher
- A modern browser (Chrome, Firefox, Edge, Safari)

### Installation

```bash
# Clone the repository
git clone https://github.com/aryendrapratap/document-ai-ui.git
cd document-ai-ui

# Install dependencies (React, lucide-react, testing libraries)
npm install --force

# Start the development server
npm start
```

The app opens at `http://localhost:3000` automatically.

### Production Build

```bash
npm run build
```

This creates a `build/` folder with optimised, minified files ready for deployment on any static hosting service (Netlify, Vercel, GitHub Pages, Apache, Nginx).

### No Environment Variables Needed
The Anthropic API is called directly from the frontend code. No `.env` file is required for the AI to work — the API integration is embedded in `src/services/classifier.js`.

---

## 14. API Integration

### Anthropic Claude API

**Endpoint:** `https://api.anthropic.com/v1/messages`  
**Method:** `POST`  
**Model:** `claude-sonnet-4-20250514`

**Request body structure:**
```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 200,
  "messages": [
    {
      "role": "user",
      "content": "You are a document classification system..."
    }
  ]
}
```

**Expected response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"categoryId\":\"invoices\",\"confidence\":0.94,\"summary\":\"Monthly invoice for software services.\"}"
    }
  ]
}
```

**Why max_tokens: 200?** The AI only needs to return a small JSON object. Setting max_tokens to 200 prevents the model from generating a long explanation and keeps response time fast. Setting it too low (e.g., 50) risks truncating the JSON.

**Why Claude Sonnet and not GPT-4 or Gemini?** Claude Sonnet was chosen because it consistently follows structured output instructions (returning valid JSON without markdown wrappers), handles multilingual document text well, and provides accurate classification even for domain-specific terminology found in legal, financial, and medical documents.

### Offline / Fallback Mode
If the API call throws any error (network failure, rate limiting, invalid response, JSON parse error), the `catch` block silently calls `keywordFallback(text, filename)` instead. The user sees the same UI result — the only difference is that the confidence score will be lower (typically 45–65% instead of 85–97%) and the summary will note "(keyword analysis)" at the end.

---

## 15. Design Decisions and Trade-offs

### Decision 1: No Backend Server
**Choice:** All processing is done in the browser. The only external call is to the Anthropic API.

**Reasons:**
- Eliminates the need to set up and host a server (Node.js, Java Spring Boot, Python Flask, etc.)
- Removes security risks associated with storing user documents on a server
- Makes deployment trivial — any static file host works
- Demonstrates that meaningful AI-powered applications can be built without a backend

**Trade-off:** File binary data cannot persist across page refreshes because localStorage has a 5–10 MB quota. If the user reloads the page, they can still see document metadata and summaries, but must re-upload the file to download the original again.

### Decision 2: Sequential File Processing
**Choice:** Files are processed one at a time, not in parallel.

**Reasons:**
- Tesseract.js runs a neural network (LSTM) in the browser. Running multiple OCR workers simultaneously causes high CPU usage and browser freezing, especially on low-end devices.
- Sequential processing gives clear, predictable queue progress indicators.
- Most use cases involve uploading a small number of files at once.

**Trade-off:** Uploading 10 large PDFs takes longer than it would with parallel processing.

### Decision 3: Text truncation at 3,500 characters for AI
**Choice:** Only the first 3,500 characters of extracted text are sent to the Claude API.

**Reasons:**
- Claude Sonnet has an input context limit. Sending 50 pages of a legal contract would exceed token limits and cost significantly more.
- Classification can be determined from the first few paragraphs of virtually any document. An invoice always states it is an invoice at the top. A resume always begins with a name and objective.
- Shorter prompts = faster API responses = better user experience.

**Trade-off:** A document where the category-identifying text appears late (rare in practice) might be misclassified.

### Decision 4: Reference-based folder storage
**Choice:** The Storage page stores only document IDs, not file copies.

**Reasons:**
- Prevents storage duplication (a 5 MB PDF that belongs to three groups still only takes 5 MB of space, not 15 MB)
- Allows a document to belong to multiple groups simultaneously without inconsistency
- Follows established database principles (foreign key references instead of data duplication)

**Trade-off:** If a document is deleted, the folder that referenced it will show fewer files, which could confuse users who expected the group to be self-contained.

### Decision 5: Custom CSS design system over Tailwind/Bootstrap
**Choice:** All styling is written as plain CSS with custom properties (CSS variables).

**Reasons:**
- Smaller bundle size — no unused utility classes shipped to the browser
- Full control over every design decision
- Demonstrates understanding of CSS fundamentals, cascade, and design tokens
- A single file (`global.css`) defines the entire visual language of the application

**Trade-off:** Takes more time to write than utility classes. No pre-built components available.

---

## 16. Limitations and Future Scope

### Current Limitations

| Limitation | Cause | Impact |
|---|---|---|
| File downloads unavailable after page refresh | Binary data not saved to localStorage | User must re-upload to download original |
| Processing speed for OCR | Tesseract runs a neural network in-browser | Large scanned PDFs take 10–30 seconds |
| No server-side storage | Client-side only architecture | Data is per-browser; cannot sync across devices |
| English-only OCR | Tesseract worker loaded with "eng" language | Non-English scanned text may be misrecognised |
| Max 10 MB per file | UI validation limit | Very large documents rejected at upload |
| localStorage quota | Browser storage limit (~5–10 MB) | Extracted text is trimmed; binary not saved |

### Future Enhancements

1. **Spring Boot backend** — A Java REST API that stores documents in a database (PostgreSQL) and handles file storage on the server, removing the localStorage limitations.
2. **Cloud storage integration** — Google Drive or AWS S3 for persistent binary file storage.
3. **AI document summarisation on demand** — A button to generate a full summary of any document, not just the one-line classification summary.
4. **Question answering** — Allow users to ask questions about a specific document: "What is the total amount on this invoice?" and receive an AI-generated answer.
5. **Smart search** — Natural language search across all documents: "show me all contracts from last year".
6. **Multi-language OCR** — Load additional Tesseract language models for Hindi, Arabic, Chinese, etc.
7. **Batch export** — Download all documents in a category or group as a ZIP file.
8. **Mobile Progressive Web App (PWA)** — Camera capture for instant receipt or ID scanning on mobile devices.
9. **Role-based access** — Multiple user accounts with shared document libraries for team use.
10. **Audit log** — Track who uploaded, modified, or deleted each document and when.

---