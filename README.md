# AI Research Portal

A web application with two AI-powered financial analysis tools:

1. **Earnings Call Analyzer** — Upload earnings call transcripts and receive institutional-grade equity research reports with sentiment analysis, key metrics, forward guidance assessment, red flags, and an independent analyst verdict.

2. **Financial Statement Extractor** — Upload annual reports or financial statements and extract income statement line items into a styled, downloadable Excel file (.xlsx) ready for analysis.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **AI Engine:** Google Gemini 2.5 Flash via `@google/genai`
- **Styling:** Tailwind CSS 4 with custom design tokens
- **Rendering:** React Markdown with GFM support and custom styled components
- **Excel Export:** ExcelJS for generating styled .xlsx files
- **Runtime:** React 19

## How It Works

### Tool A: Earnings Call Analyzer

```
┌──────────────┐     ┌──────────────────┐     ┌────────────────────┐
│  Upload PDF  │────▶│  Next.js API      │────▶│  Gemini 2.5 Flash  │
│  or TXT file │     │  /api/analyze     │     │  (Analyst Prompt)  │
└──────────────┘     └──────────────────┘     └────────┬───────────┘
                                                       │
                     ┌──────────────────┐              │
                     │  Structured      │◀─────────────┘
                     │  Research Report │
                     └──────────────────┘
```

1. **File Upload** — User uploads an earnings call transcript (PDF or TXT)
2. **AI Processing** — The API route sends the document to Gemini with a detailed analyst prompt covering 10 mandatory report sections
3. **Report Rendering** — The structured markdown response is rendered with custom-styled components (color-coded credibility ratings, analyst annotations, financial tables)

### Tool B: Financial Statement Extractor

```
┌──────────────┐     ┌──────────────────┐     ┌────────────────────┐
│  Upload PDF  │────▶│  Next.js API      │────▶│  Gemini 2.5 Flash  │
│  Annual Rpt  │     │  /api/extract     │     │  (Extraction Prompt│
└──────────────┘     └──────────────────┘     └────────┬───────────┘
                                                       │
                     ┌──────────────────┐              │
                     │  Structured JSON │◀─────────────┘
                     │  + Excel (.xlsx) │
                     └──────────────────┘
```

1. **File Upload** — User uploads an annual report or financial statement (PDF or TXT)
2. **AI Extraction** — The API route sends the document to Gemini with a strict JSON extraction prompt that captures every income statement line item across multiple fiscal years
3. **Preview & Download** — Extracted data is shown in a styled preview table with metadata chips, then downloadable as a formatted Excel file with auto-fitted columns, colored headers, and bold subtotals

## Key Features

### Earnings Call Analyzer
- **Institutional-Grade Prompt** — 10-section report template covering sentiment, key positives/concerns, forward guidance, capacity utilization, growth initiatives, segment mix, management commitments, red flags, and analyst verdict
- **Critical Annotations** — AI adds independent analyst notes distinguishing data from assertions, flagging vague guidance, and tracking management omissions
- **Smart Rendering** — Custom markdown components with color-coded credibility ratings (Credible/Vague/Unverifiable), styled analyst notes, and responsive financial tables

### Financial Statement Extractor
- **Exhaustive Extraction** — Captures 30–60+ line items including sub-categories (individual expenses, cost breakdowns, employee benefit details)
- **Multi-Year Support** — Handles 2–6+ fiscal years from a single document
- **Hierarchical Structure** — Preserves indent levels, section headings, and subtotal rows
- **Styled Excel Export** — Auto-fitted columns, purple headers, bold totals, red negatives, number formatting, and frozen header rows
- **Analyst Notes** — AI flags missing/ambiguous data so analysts can spot gaps

### Shared
- **Native PDF Support** — PDFs are sent directly to Gemini as base64, handling both text-based and scanned documents
- **Tool Selector** — Clean tab interface to switch between tools

## Getting Started

### Prerequisites

- Node.js 18+
- A [Google AI Studio](https://aistudio.google.com/apikey) API key (free tier)

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd analytics-tool

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env
# Add your Gemini API key to .env

# Start the development server
pnpm dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key from [AI Studio](https://aistudio.google.com/apikey) |

## Project Structure

```
analytics-tool/
├── app/
│   ├── api/
│   │   ├── analyze/
│   │   │   ├── route.js        # Gemini API — earnings call analysis
│   │   │   └── prompt.js       # 10-section analyst prompt
│   │   └── extract/
│   │       ├── route.js        # Gemini API — financial data extraction
│   │       ├── prompt.js       # JSON extraction prompt
│   │       └── excel.js        # Styled Excel file generator
│   ├── globals.css             # Design tokens & custom styles
│   ├── layout.js               # Root layout with Inter font & metadata
│   └── page.js                 # Tool selector, upload UI & renderers
├── public/                     # Static assets
└── package.json
```

## Deployment

Deploy on [Vercel](https://vercel.com) — add `GEMINI_API_KEY` as an environment variable in Project Settings.
