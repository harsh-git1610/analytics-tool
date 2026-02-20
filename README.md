# AI Earnings Call Analyzer

A web application that transforms raw earnings call transcripts into structured, institutional-grade equity research reports using AI.

Upload a PDF or text transcript → receive a comprehensive analyst report with sentiment analysis, key metrics, forward guidance assessment, red flags, and an independent analyst verdict.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **AI Engine:** Google Gemini 2.5 Flash via `@google/genai`
- **Styling:** Tailwind CSS 4 with custom design tokens
- **Rendering:** React Markdown with GFM support and custom styled components
- **Runtime:** React 19

## How It Works

```
┌──────────────┐     ┌──────────────────┐     ┌────────────────────┐
│  Upload PDF  │────▶│  Next.js API      │────▶│  Gemini 2.5 Flash  │
│  or TXT file │     │  Route Handler    │     │  (Analyst Prompt)  │
└──────────────┘     └──────────────────┘     └────────┬───────────┘
                                                       │
                     ┌──────────────────┐              │
                     │  Structured      │◀─────────────┘
                     │  Research Report │
                     └──────────────────┘
```

1. **File Upload** — User uploads an earnings call transcript (PDF or TXT)
2. **AI Processing** — The API route sends the document to Gemini 2.5 Flash with a detailed analyst prompt covering 10 mandatory report sections
3. **Report Rendering** — The structured markdown response is rendered with custom-styled components (color-coded credibility ratings, analyst annotations, financial tables)

## Key Features

- **Institutional-Grade Prompt** — 10-section report template covering sentiment, key positives/concerns, forward guidance (revenue, margins, capex), capacity utilization, growth initiatives, segment mix, management commitments, red flags, and analyst verdict
- **Critical Annotations** — AI adds independent analyst notes distinguishing data from assertions, flagging vague guidance, and tracking management omissions
- **Smart Rendering** — Custom markdown components with color-coded credibility ratings (Credible/Vague/Unverifiable), styled analyst notes, and responsive financial tables
- **Native PDF Support** — PDFs are sent directly to Gemini as base64, handling both text-based and scanned documents without client-side parsing

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
│   ├── api/analyze/
│   │   └── route.js        # Gemini API integration & analyst prompt
│   ├── globals.css          # Design tokens & custom styles
│   ├── layout.js            # Root layout with Inter font & metadata
│   └── page.js              # Upload UI & report renderer
├── public/                  # Static assets
└── package.json
```

## Deployment

Deploy on [Vercel](https://vercel.com) — add `GEMINI_API_KEY` as an environment variable in Project Settings.
