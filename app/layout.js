import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "AI Earnings Call Analyzer — Research Portal",
  description: "Upload earnings call transcripts and receive institutional-grade equity research reports powered by Gemini AI.",
  openGraph: {
    title: "AI Earnings Call Analyzer",
    description: "Transform raw earnings call transcripts into structured analyst reports with AI-driven sentiment analysis, guidance assessment, and red flag detection.",
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
