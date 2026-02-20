import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { EXTRACTION_PROMPT } from "./prompt";
import { generateExcel } from "./excel";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB per file (Vercel Hobby limit)
const ALLOWED_TYPES = ["application/pdf", "text/plain"];

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
                const base64Data = buffer.toString("base64");
                contentParts.push({ inlineData: { mimeType: "application/pdf", data: base64Data } });
            } else {
                const text = buffer.toString("utf-8").slice(0, 500000);
                textChunks.push(`--- Document: ${file.name} ---\n${text}`);
            }
        }

        if (textChunks.length > 0) {
            contentParts.push({ text: textChunks.join("\n\n") });
        }

        // Add the extraction prompt
        contentParts.push({ text: EXTRACTION_PROMPT });

        const result = await genAI.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: contentParts,
            config: {
                temperature: 0.1,
                responseMimeType: "application/json",
            },
        });

        const rawText = result.text || "";
        console.log(`Extraction complete for ${files.length} file(s). Response (first 300 chars):`, rawText.slice(0, 300));

        // Parse the JSON response
        let extractedData;
        try {
            extractedData = JSON.parse(rawText);
        } catch (parseErr) {
            console.error("JSON parse failed:", parseErr);
            // Try to extract JSON from potential markdown code fences
            const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
                extractedData = JSON.parse(jsonMatch[1].trim());
            } else {
                return NextResponse.json(
                    { error: "AI returned invalid data format. Please try again." },
                    { status: 500 }
                );
            }
        }

        // Check for extraction errors
        if (extractedData.error) {
            return NextResponse.json(
                { error: extractedData.error, analyst_notes: extractedData.analyst_notes || [] },
                { status: 422 }
            );
        }

        // Generate Excel file
        const excelBase64 = await generateExcel(extractedData);

        return NextResponse.json({
            data: extractedData,
            excel: excelBase64,
        });

    } catch (error) {
        console.error("Extraction failed:", error);
        return NextResponse.json(
            { error: "Failed to extract financial data. Please try again." },
            { status: 500 }
        );
    }
}
