"use strict";
"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/* Custom renderers for clean, muted report styling */
const markdownComponents = {
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold text-stone-800 border-b border-stone-200 pb-2 mt-10 mb-4 tracking-tight">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-stone-700 mt-7 mb-2.5 tracking-tight">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-sm font-semibold text-stone-600 mt-4 mb-1.5 uppercase tracking-wide">
      {children}
    </h4>
  ),
  p: ({ children }) => {
    const text = typeof children === "string" ? children : "";
    if (text.startsWith("(Analyst note:") || text.startsWith("(analyst note:")) {
      return (
        <p className="text-xs text-stone-500 bg-stone-50 border-l-2 border-stone-300 pl-3 py-1.5 my-2 rounded-r italic leading-relaxed">
          {children}
        </p>
      );
    }
    if (text.includes("Not discussed in this call")) {
      return (
        <p className="text-stone-400 italic text-sm my-2">{children}</p>
      );
    }
    return <p className="text-stone-600 leading-relaxed my-2 text-[0.9rem]">{children}</p>;
  },
  strong: ({ children }) => (
    <strong className="font-semibold text-stone-800">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="space-y-1.5 my-3">{children}</ul>
  ),
  li: ({ children }) => (
    <li className="text-stone-600 leading-relaxed text-[0.9rem] pl-3 border-l border-stone-200 ml-1">
      {children}
    </li>
  ),
  hr: () => <hr className="my-6 border-stone-150" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-4 rounded border border-stone-200">
      <table className="min-w-full divide-y divide-stone-200 text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-stone-50">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2.5 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({ children }) => {
    const text = String(children);
    let extraClass = "";
    if (text === "Credible" || text === "High") extraClass = "text-emerald-700";
    else if (text === "Vague" || text === "Medium" || text === "Med") extraClass = "text-amber-700";
    else if (text === "Unverifiable" || text === "Low") extraClass = "text-rose-700";
    return (
      <td className={`px-3 py-2.5 text-stone-600 border-t border-stone-100 ${extraClass}`}>
        {children}
      </td>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-stone-300 pl-4 py-1 my-3 text-stone-500 italic text-sm">
      {children}
    </blockquote>
  ),
};

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setReport(null);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to analyze document");
      }

      const data = await res.json();
      setReport(data.report);
    } catch (err) {
      setError(err.message || "An error occurred during analysis. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-stone-800 tracking-tight">
            Research Portal
          </h1>
          <p className="mt-1.5 text-sm text-stone-400">
            Upload earnings call transcripts for AI-driven analysis
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white border border-stone-200 rounded-lg p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="file-upload"
              className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-3"
            >
              Document
            </label>
            <div className="flex items-center gap-4">
              <label
                htmlFor="file-upload"
                className="flex-1 flex items-center justify-center px-4 py-3.5 border border-dashed border-stone-300 rounded-md cursor-pointer hover:border-stone-400 hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-3 text-sm">
                  <svg className="h-5 w-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16V4m0 0l-4 4m4-4l4 4M4 18h16" />
                  </svg>
                  {file ? (
                    <span className="text-stone-700">{file.name}</span>
                  ) : (
                    <span className="text-stone-400">Choose PDF or TXT file</span>
                  )}
                </div>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  accept=".pdf,.txt"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className={`px-5 py-3.5 text-sm font-medium rounded-md transition-colors ${loading
                    ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                    : "bg-stone-800 text-white hover:bg-stone-700"
                  }`}
              >
                {loading ? "Analyzing..." : "Analyze"}
              </button>
            </div>
            {error && (
              <p className="text-rose-600 text-xs mt-3">{error}</p>
            )}
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center gap-3 py-8 justify-center">
            <div className="h-4 w-4 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
            <p className="text-sm text-stone-400">Generating report...</p>
          </div>
        )}

        {/* Report Output */}
        {report && (
          <div className="bg-white border border-stone-200 rounded-lg px-8 py-6">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {report}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </main>
  );
}
