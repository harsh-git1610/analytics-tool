import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "AI Research Portal — Earnings Analysis & Financial Extraction",
  description: "Upload earnings call transcripts for AI-driven research reports, or extract financial statement data into Excel-ready CSV files. Powered by Gemini AI.",
  openGraph: {
    title: "AI Research Portal",
    description: "AI-powered financial analysis: transform earnings call transcripts into analyst reports and extract income statement data from annual reports to spreadsheets.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
