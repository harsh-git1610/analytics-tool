"use strict";
"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/* ══════════════════════════════════════════════
   SHARED HELPERS
   ══════════════════════════════════════════════ */

function extractText(node) {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node?.props?.children) return extractText(node.props.children);
  return "";
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ══════════════════════════════════════════════
   SHARED FILE UPLOAD COMPONENT
   ══════════════════════════════════════════════ */

function FileUploadZone({ files, setFiles, setError, acceptHint }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length > 0) {
      const dropped = Array.from(e.dataTransfer.files);
      setFiles((prev) => {
        const names = new Set(prev.map((f) => f.name));
        return [...prev, ...dropped.filter((f) => !names.has(f.name))];
      });
      setError("");
    }
  }, [setFiles, setError]);

  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => {
        const names = new Set(prev.map((f) => f.name));
        return [...prev, ...selected.filter((f) => !names.has(f.name))];
      });
      setError("");
      e.target.value = "";
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <label htmlFor="file-upload" className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
        Documents
      </label>
      <label
        htmlFor="file-upload"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center px-4 py-5 border-2 border-dashed rounded-md cursor-pointer transition-all duration-200 ${dragActive
          ? "border-stone-500 bg-stone-100 scale-[1.01]"
          : "border-stone-300 hover:border-stone-400 hover:bg-stone-50"
          }`}
      >
        <div className="flex items-center gap-3 text-sm">
          <svg className="h-5 w-5 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16V4m0 0l-4 4m4-4l4 4M4 18h16" />
          </svg>
          <span className="text-stone-400">
            Drop files here or <span className="text-stone-600 underline underline-offset-2">browse</span>
          </span>
        </div>
        <p className="text-[11px] text-stone-400 mt-1.5">{acceptHint || "PDF or TXT · max 10 MB per file"}</p>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          onChange={handleFileChange}
          accept=".pdf,.txt"
          multiple
        />
      </label>

      {files.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {files.map((f, i) => (
            <div key={`${f.name}-${i}`} className="flex items-center justify-between px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <svg className="h-4 w-4 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-stone-700 truncate">{f.name}</span>
                <span className="text-stone-400 text-xs shrink-0">({formatFileSize(f.size)})</span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-stone-400 hover:text-rose-500 transition-colors p-0.5 shrink-0"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════
   LOADING SKELETON
   ══════════════════════════════════════════════ */

function LoadingSkeleton({ steps, progressStep }) {
  return (
    <div className="bg-white border border-stone-200 rounded-lg px-8 py-8 mb-8 animate-fade-in">
      <div className="space-y-4">
        {steps.map((step, i) => (
          <div
            key={step}
            className={`flex items-center gap-3 transition-all duration-500 ${i <= progressStep ? "opacity-100" : "opacity-0 translate-y-1"}`}
          >
            {i < progressStep ? (
              <svg className="h-4 w-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : i === progressStep ? (
              <div className="h-4 w-4 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin shrink-0"></div>
            ) : (
              <div className="h-4 w-4 shrink-0"></div>
            )}
            <span className={`text-sm ${i <= progressStep ? "text-stone-600" : "text-stone-300"}`}>
              {step}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-stone-100 flex items-center gap-2">
        <svg className="h-3.5 w-3.5 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-stone-400">The last step may take 1–2 minutes. Please Wait </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   TOOL A: EARNINGS CALL ANALYZER (existing)
   ══════════════════════════════════════════════ */

function Badge({ children, variant = "neutral" }) {
  const styles = {
    positive: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    negative: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-sky-50 text-sky-700 border-sky-200",
    neutral: "bg-stone-100 text-stone-600 border-stone-200",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border ${styles[variant]}`}>
      {children}
    </span>
  );
}

function styleBadges(text) {
  const badges = {
    "Optimistic": "positive", "Cautious": "warning", "Neutral": "neutral", "Pessimistic": "negative",
    "High": "positive", "Medium": "warning", "Low": "negative",
    "Credible": "positive", "Vague": "warning", "Unverifiable": "negative",
  };
  for (const [term, variant] of Object.entries(badges)) {
    if (text === term) return <Badge variant={variant}>{term}</Badge>;
  }
  return null;
}

const markdownComponents = {
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold text-stone-800 border-b border-stone-200 pb-2 mt-10 mb-4 tracking-tight">
      {children}
    </h2>
  ),
  h3: ({ children }) => {
    const text = extractText(children);
    const match = text.match(/^(\d+)\.\s/);
    return (
      <h3 className="flex items-center gap-2.5 text-base font-semibold text-stone-700 mt-8 mb-3 tracking-tight">
        {match && (
          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-stone-800 text-white text-[11px] font-bold shrink-0">
            {match[1]}
          </span>
        )}
        <span>{match ? text.replace(match[0], "") : children}</span>
      </h3>
    );
  },
  h4: ({ children }) => (
    <h4 className="text-sm font-semibold text-stone-600 mt-5 mb-2 uppercase tracking-wide">
      {children}
    </h4>
  ),
  p: ({ children }) => {
    const text = extractText(children);
    if (text.match(/^\(analyst note:/i)) {
      return (
        <div className="flex gap-2 items-start bg-stone-50 border border-stone-200 rounded-md px-3 py-2.5 my-3">
          <span className="text-stone-400 text-xs mt-0.5 shrink-0">💡</span>
          <p className="text-xs text-stone-500 italic leading-relaxed">{children}</p>
        </div>
      );
    }
    if (text.includes("Not discussed in this call")) {
      return <p className="text-stone-400 italic text-sm my-2 pl-3 border-l-2 border-stone-200">{children}</p>;
    }
    if (text.match(/^\*?\*?(Sentiment|Confidence Level|Call Nature):\*?\*?\s/i)) {
      return <p className="text-stone-600 text-[0.9rem] my-1.5 flex items-center gap-2 flex-wrap">{children}</p>;
    }
    return <p className="text-stone-600 leading-relaxed my-2 text-[0.9rem]">{children}</p>;
  },
  strong: ({ children }) => {
    const text = extractText(children);
    const badge = styleBadges(text.trim());
    if (badge) return badge;
    if (["Sentiment:", "Confidence Level:", "Call Nature:"].includes(text.trim())) {
      return <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">{children}</span>;
    }
    return <strong className="font-semibold text-stone-800">{children}</strong>;
  },
  ul: ({ children }) => <ul className="space-y-2.5 my-3">{children}</ul>,
  li: ({ children }) => {
    const text = extractText(children);
    if (/\((?:Analyst|analyst) note:/i.test(text)) {
      const nodes = Array.isArray(children) ? children : [children];
      const beforeNote = [];
      const noteContent = [];
      let foundNote = false;
      for (let i = 0; i < nodes.length; i++) {
        const child = nodes[i];
        if (foundNote) { noteContent.push(child); continue; }
        if (typeof child === "string") {
          const idx = child.search(/\((?:Analyst|analyst) note:/i);
          if (idx !== -1) {
            foundNote = true;
            const before = child.slice(0, idx);
            const after = child.slice(idx);
            if (before) beforeNote.push(before);
            noteContent.push(after);
            continue;
          }
        }
        beforeNote.push(child);
      }
      return (
        <li className="text-stone-600 leading-relaxed text-[0.9rem] pl-3.5 border-l-2 border-stone-200 ml-1">
          {beforeNote}
          <div className="flex gap-2 items-start bg-stone-50 border border-stone-200 rounded-md px-3 py-2 mt-2 mb-1">
            <span className="text-stone-400 text-xs mt-0.5 shrink-0">💡</span>
            <span className="text-xs text-stone-500 italic leading-relaxed">{noteContent}</span>
          </div>
        </li>
      );
    }
    return <li className="text-stone-600 leading-relaxed text-[0.9rem] pl-3.5 border-l-2 border-stone-200 ml-1">{children}</li>;
  },
  hr: () => <hr className="my-8 border-stone-200" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-4 rounded-lg border border-stone-200">
      <table className="min-w-full divide-y divide-stone-200 text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-stone-50">{children}</thead>,
  th: ({ children }) => (
    <th className="px-3 py-2.5 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">{children}</th>
  ),
  td: ({ children }) => {
    const text = String(children).trim();
    const badge = styleBadges(text);
    if (badge) return <td className="px-3 py-2.5 border-t border-stone-100">{badge}</td>;
    return <td className="px-3 py-2.5 text-stone-600 border-t border-stone-100">{children}</td>;
  },
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-stone-300 pl-4 py-1 my-3 text-stone-500 italic text-sm">{children}</blockquote>
  ),
};

const ANALYZE_STEPS = [
  "Reading document...",
  "Extracting key data points...",
  "Analyzing forward guidance...",
  "Identifying red flags...",
  "Drafting analyst verdict...",
  "Compiling final report...",
];

function EarningsAnalyzer() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [progressStep, setProgressStep] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) { setError("Please select at least one file."); return; }
    setLoading(true); setReport(null); setError(""); setProgressStep(0);
    const interval = setInterval(() => { setProgressStep((prev) => (prev < ANALYZE_STEPS.length - 1 ? prev + 1 : prev)); }, 4000);
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to analyze document."); }
      const data = await res.json();
      setReport(data.report);
    } catch (err) {
      setError(err.message || "An error occurred during analysis.");
    } finally { clearInterval(interval); setLoading(false); }
  };

  const handleCopy = async () => {
    if (!report) return;
    try { await navigator.clipboard.writeText(report); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { }
  };

  const handleReset = () => { setFiles([]); setReport(null); setError(""); setCopied(false); };

  return (
    <>
      <div className="bg-white border border-stone-200 rounded-lg p-6 mb-8">
        <form onSubmit={handleSubmit}>
          <FileUploadZone files={files} setFiles={setFiles} setError={setError} acceptHint="PDF or TXT · max 10 MB per file" />
          <div className="mt-4">
            <button type="submit" disabled={loading || files.length === 0}
              className={`w-full px-5 py-3 text-sm font-medium rounded-md transition-all duration-200 ${loading || files.length === 0
                ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                : "bg-stone-800 text-white hover:bg-stone-700 active:scale-[0.98]"}`}>
              {loading ? "Analyzing..." : files.length > 1 ? `Analyze ${files.length} Documents` : "Analyze"}
            </button>
          </div>
          {error && (
            <div className="flex items-center gap-2 mt-3 text-rose-600 text-xs">
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
              {error}
            </div>
          )}
        </form>
      </div>

      {loading && <LoadingSkeleton steps={ANALYZE_STEPS} progressStep={progressStep} />}

      {report && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-stone-400 uppercase tracking-wide font-medium">Analysis Report</p>
            <div className="flex items-center gap-2">
              <button onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-500 bg-white border border-stone-200 rounded-md hover:bg-stone-50 hover:text-stone-700 transition-colors">
                {copied ? (
                  <><svg className="h-3.5 w-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied</>
                ) : (
                  <><svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>
                )}
              </button>
              <button onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-500 bg-white border border-stone-200 rounded-md hover:bg-stone-50 hover:text-stone-700 transition-colors">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download PDF
              </button>
              <button onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-500 bg-white border border-stone-200 rounded-md hover:bg-stone-50 hover:text-stone-700 transition-colors">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                New Analysis
              </button>
            </div>
          </div>
          <div className="bg-white border border-stone-200 rounded-lg px-8 py-6 report-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{report}</ReactMarkdown>
          </div>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════
   TOOL B: FINANCIAL STATEMENT EXTRACTOR (new)
   ══════════════════════════════════════════════ */

const EXTRACT_STEPS = [
  "Reading document...",
  "Identifying financial tables...",
  "Extracting line items...",
  "Matching standard labels...",
  "Validating numbers...",
  "Generating spreadsheet data...",
];

function formatNumber(val) {
  if (val === null || val === undefined || val === "") return "—";
  const num = Number(val);
  if (isNaN(num)) return String(val);
  return num.toLocaleString("en-IN");
}

function FinancialExtractor() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { data, csv }
  const [error, setError] = useState("");
  const [progressStep, setProgressStep] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) { setError("Please select at least one file."); return; }
    setLoading(true); setResult(null); setError(""); setProgressStep(0);
    const interval = setInterval(() => { setProgressStep((prev) => (prev < EXTRACT_STEPS.length - 1 ? prev + 1 : prev)); }, 3500);
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    try {
      const res = await fetch("/api/extract", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to extract financial data.");
      setResult(json);
    } catch (err) {
      setError(err.message || "An error occurred during extraction.");
    } finally { clearInterval(interval); setLoading(false); }
  };

  const handleDownloadExcel = () => {
    if (!result?.excel) return;
    const byteCharacters = atob(result.excel);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const companyName = result.data?.metadata?.company_name?.replace(/\s+/g, "_") || "extraction";
    a.href = url;
    a.download = `${companyName}_financial_data.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => { setFiles([]); setResult(null); setError(""); };

  const data = result?.data;
  const periods = data?.metadata?.reporting_periods || [];

  return (
    <>
      <div className="bg-white border border-stone-200 rounded-lg p-6 mb-8">
        <form onSubmit={handleSubmit}>
          <FileUploadZone files={files} setFiles={setFiles} setError={setError} acceptHint="Annual report or financial statement · PDF or TXT · max 10 MB" />
          <div className="mt-4">
            <button type="submit" disabled={loading || files.length === 0}
              className={`w-full px-5 py-3 text-sm font-medium rounded-md transition-all duration-200 ${loading || files.length === 0
                ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                : "bg-stone-800 text-white hover:bg-stone-700 active:scale-[0.98]"}`}>
              {loading ? "Extracting..." : "Extract Financial Data"}
            </button>
          </div>
          {error && (
            <div className="flex items-center gap-2 mt-3 text-rose-600 text-xs">
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
              {error}
            </div>
          )}
        </form>
      </div>

      {loading && <LoadingSkeleton steps={EXTRACT_STEPS} progressStep={progressStep} />}

      {data && (
        <div className="animate-fade-in space-y-6">
          {/* Metadata banner */}
          <div className="bg-white border border-stone-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-stone-400 uppercase tracking-wide font-medium">Extracted Data</p>
              <div className="flex items-center gap-2">
                <button onClick={handleDownloadExcel}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download Excel
                </button>
                <button onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-500 bg-white border border-stone-200 rounded-md hover:bg-stone-50 hover:text-stone-700 transition-colors">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                  New Extraction
                </button>
              </div>
            </div>

            {/* Metadata chips */}
            <div className="flex flex-wrap gap-2 mb-5">
              {data.metadata?.company_name && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-stone-800 text-white">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>
                  {data.metadata.company_name}
                </span>
              )}
              {data.metadata?.currency && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
                  {data.metadata.currency}
                </span>
              )}
              {data.metadata?.units && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
                  {data.metadata.units}
                </span>
              )}
              {data.metadata?.statement_type && data.metadata.statement_type !== "Unknown" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
                  {data.metadata.statement_type}
                </span>
              )}
            </div>

            {/* Data table */}
            <div className="overflow-x-auto rounded-lg border border-stone-200">
              <table className="min-w-full divide-y divide-stone-200 text-sm">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider w-[40%]">Line Item</th>
                    {periods.map((p) => (
                      <th key={p} className="px-4 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">{p}</th>
                    ))}
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {data.line_items?.map((item, idx) => {
                    const isTotal = item.is_total === true;
                    const depth = item.depth || 0;
                    const paddingLeft = depth === 0 ? "pl-4" : depth === 1 ? "pl-8" : "pl-12";
                    const hasValues = periods.some((p) => item.values?.[p] !== null && item.values?.[p] !== undefined);
                    const isSectionHeading = !hasValues && item.notes === "Section heading";
                    return (
                      <tr key={idx} className={`${isTotal ? "bg-stone-50/80 border-t border-stone-300" : isSectionHeading ? "bg-stone-100/60" : "hover:bg-stone-50/50"} transition-colors`}>
                        <td className={`${paddingLeft} py-2.5 text-stone-700`}>
                          <div className="flex flex-col">
                            <span className={`${isTotal || isSectionHeading ? "font-semibold text-stone-800" : ""}`}>{item.original_label || item.standard_label}</span>
                            {item.original_label && item.standard_label !== item.original_label && !isSectionHeading && (
                              <span className="text-[10px] text-stone-400 mt-0.5">{item.standard_label}</span>
                            )}
                          </div>
                        </td>
                        {periods.map((p) => (
                          <td key={p} className={`px-4 py-2.5 text-right tabular-nums ${item.values?.[p] === null ? "text-stone-300 italic" : item.values?.[p] < 0 ? "text-rose-600" : "text-stone-700"} ${isTotal ? "font-semibold" : ""}`}>
                            {formatNumber(item.values?.[p])}
                          </td>
                        ))}
                        <td className="px-4 py-2.5 text-xs text-stone-400 italic max-w-[200px]">
                          {item.notes || ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Analyst notes */}
          {data.analyst_notes?.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-lg p-5">
              <p className="text-xs text-stone-400 uppercase tracking-wide font-medium mb-3">Analyst Notes</p>
              <div className="space-y-2">
                {data.analyst_notes.map((note, i) => (
                  <div key={i} className="flex gap-2 items-start bg-stone-50 border border-stone-200 rounded-md px-3 py-2.5">
                    <span className="text-stone-400 text-xs mt-0.5 shrink-0">💡</span>
                    <p className="text-xs text-stone-500 leading-relaxed">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE — TOOL SELECTOR
   ══════════════════════════════════════════════ */

const TOOLS = [
  {
    id: "analyzer",
    label: "Earnings Analyzer",
    description: "AI-driven equity research reports from earnings call transcripts",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: "extractor",
    label: "Financial Extractor",
    description: "Extract income statement data from annual reports to CSV",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function Home() {
  const [activeTool, setActiveTool] = useState("analyzer");

  return (
    <main className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-800 tracking-tight">Research Portal</h1>
          <p className="mt-1.5 text-sm text-stone-400">AI-powered financial analysis and data extraction</p>
        </div>

        {/* Tool Selector */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all duration-200 ${activeTool === tool.id
                ? "border-stone-800 bg-white shadow-sm"
                : "border-stone-200 bg-white/60 hover:border-stone-300 hover:bg-white"
                }`}
            >
              <div className={`mt-0.5 ${activeTool === tool.id ? "text-stone-800" : "text-stone-400"}`}>
                {tool.icon}
              </div>
              <div>
                <p className={`text-sm font-medium ${activeTool === tool.id ? "text-stone-800" : "text-stone-500"}`}>
                  {tool.label}
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5 leading-snug">{tool.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Active Tool */}
        {activeTool === "analyzer" ? <EarningsAnalyzer /> : <FinancialExtractor />}

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-stone-200 text-center">
          <p className="text-xs text-stone-400">
            Built by <span className="text-blue-500 hover:underline cursor-pointer"><a href="https://harshchauhan1610.vercel.app/">Harsh Chauhan</a></span>
          </p>
        </footer>
      </div>
    </main>
  );
}
