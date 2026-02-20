import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { ANALYST_PROMPT } from "./prompt";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB per file (Vercel Hobby limit)
const ALLOWED_TYPES = [
  "application/pdf",
  "text/plain",
];

export async function POST(req) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded." }, { status: 400 });
    }

    // Validate each file
    for (const file of files) {
      const fileType = file.type || "";
      const fileName = file.name || "";
      const ext = fileName.split(".").pop()?.toLowerCase();

      if (!ALLOWED_TYPES.includes(fileType) && !["pdf", "txt"].includes(ext)) {
        return NextResponse.json(
          { error: `Unsupported file type "${ext}" in "${fileName}". Please upload PDF or TXT files only.` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        return NextResponse.json(
          { error: `"${fileName}" is too large (${sizeMB} MB). Maximum allowed size is 4 MB per file.` },
          { status: 400 }
        );
      }
    }

    // Build content parts for Gemini
    const contentParts = [];
    let textChunks = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (file.type === "application/pdf") {
        // PDF → send as inline data
        const base64Data = buffer.toString("base64");
        contentParts.push({ inlineData: { mimeType: "application/pdf", data: base64Data } });
      } else {
        // Text → accumulate with a document separator
        const text = buffer.toString("utf-8").slice(0, 500000);
        textChunks.push(`--- Document: ${file.name} ---\n${text}`);
      }
    }

    // Combine all text documents into one part
    if (textChunks.length > 0) {
      contentParts.push({ text: textChunks.join("\n\n") });
    }

    // Add the analysis prompt as the final part
    contentParts.push({ text: ANALYST_PROMPT });

    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contentParts,
      config: {
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 5000 },
      },
    });

    const report = result.text || "";
    console.log(`Analyzed ${files.length} file(s). Report (first 200 chars):`, report.slice(0, 200));

    return NextResponse.json({ report });

  } catch (error) {
    console.error("Analysis failed:", error);
    return NextResponse.json(
      { error: "Failed to process documents. Please try again." },
      { status: 500 }
    );
  }
}
