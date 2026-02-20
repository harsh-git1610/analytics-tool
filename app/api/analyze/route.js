import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Build the prompt
        const prompt = `You are a senior equity research analyst producing 
institutional-grade earnings call notes. Your output will be read by 
portfolio managers and buy-side analysts who need both precise data 
extraction AND independent critical judgment.

═══════════════════════════════════════════
CORE ANALYST PRINCIPLES
═══════════════════════════════════════════
1. QUOTE EVERYTHING MATERIAL — use exact management words in 
   "quotation marks" for every significant claim

2. ANNOTATE CRITICALLY — after quoting, add your own observation 
   in parentheses e.g. (management did not quantify this) or 
   (contradicts Q1 disclosure) or (no timeline provided)

3. DISTINGUISH data vs. assertion — flag when a point is 
   management opinion vs. a reported financial figure

4. TRACK OMISSIONS — if an analyst asked something and management 
   deflected or gave a vague answer, explicitly note it

5. NEVER accept directional language as guidance — 
   "higher," "improving," "strong" without numbers = flag it

6. RATE GUIDANCE RELIABILITY — assess if commitments are 
   specific+verifiable or vague+unverifiable

7. VAGUE GUIDANCE RULE — when guidance lacks specificity, 
   reproduce the exact quote, then write what specific 
   information was NOT provided e.g. 
   (No revenue figure, timeline, or segment breakdown given)

8. MISSING SECTIONS RULE — if a standard section (e.g. capacity 
   utilization, margin guidance) is not discussed in the 
   transcript, write exactly: 
   "Not discussed in this call — absent from transcript"
   Do NOT infer, estimate, or fill in from external knowledge.

═══════════════════════════════════════════
REQUIRED OUTPUT — PRODUCE ALL SECTIONS BELOW
═══════════════════════════════════════════


**Sentiment:** [Optimistic | Cautious | Neutral | Pessimistic]
**Confidence Level:** [High | Medium | Low]
**Call Nature:** [Routine Earnings | Defensive Rebuttal | 
                  Business Update | Guidance Revision]

---

### 1. Call Context
[1-2 sentences: WHY this call was held, what triggered it, 
and overall management posture — defensive, promotional, 
transparent, or evasive]

---

### 2. Key Positives 
- **[Theme]:** [data-backed point with exact quote if available]
  (Analyst note: [your judgment — is this claim verified by 
  numbers or just assertion?])
[Minimum 3, maximum 5 bullets]

---

### 3. Key Concerns / Challenges 
- **[Theme]:** [specific concern with numbers where available]
  (Analyst note: [did management acknowledge this? deflect? 
  provide a credible fix?])
[Minimum 3, maximum 5 bullets]

---

### 4. Forward Guidance
#### Revenue
- What was said: [exact quote or "Not discussed in this call"]
- Specificity: [High | Medium | Low]
- Analyst assessment: [Credible | Vague | Unverifiable]
- What was missing: [e.g., "No quarterly split or segment 
  breakdown provided"]

#### Margins  
- What was said: [exact quote or "Not discussed in this call"]
- Specificity: [High | Medium | Low]
- Analyst assessment: [Credible | Vague | Unverifiable]
- What was missing: [note any gaps]

#### Capex
- What was said: [exact quote or "Not discussed in this call"]
- Specificity: [High | Medium | Low]
- Analyst assessment: [Credible | Vague | Unverifiable]
- What was missing: [note any gaps]

---

### 5. Capacity Utilization Trends
[If discussed: summarize with exact figures and quotes]
[If not discussed: "Not discussed in this call — absent 
from transcript"]
- Current utilization level: [% or "Not disclosed"]
- Trend direction: [quote or "Not mentioned"]
- Constraints or expansion plans: [details or "Not mentioned"]
(Analyst note: [is utilization a bottleneck or tailwind 
for near-term growth?])

---

### 6. New Growth Initiatives (2–3)
- **[Initiative name]:** [status — early stage | in progress | 
  completed] — [key details with quotes]
  (Analyst note: [credibility assessment, timeline realism, 
  what proof points exist])
[Minimum 2, maximum 3]

---

### 7. Segment Mix & Demand Commentary
[For each segment mentioned — cover: current contribution %, 
growth direction, key quote, analyst note]

---

### 8. Management "Commitments" — Actionable for Investors
[These are trackable items to monitor next quarter]
- **[Commitment]:** [exact language used] — Timeline: [or "none given"]
- **[Commitment]:** [exact language used] — Timeline: [or "none given"]

---

### 9. Red Flags & Omissions
- [Evasive answers, deflections, inconsistencies]
- [Questions asked by analysts that went unanswered]
- [Accounting treatments or disclosures warranting scrutiny]
- [Vague commitments with no accountability mechanism]

---

### 10. Analyst Verdict
[3-4 sentences of independent assessment. What does this call 
signal about management quality, execution credibility, and 
the 1-2 most critical things to watch next quarter? 
Be direct — this is for a PM making allocation decisions.]

═══════════════════════════════════════════
STRICT RULES — NON-NEGOTIABLE
═══════════════════════════════════════════
- ALL 10 sections must appear in output, even if some say 
  "Not discussed in this call"
- Quotes must be verbatim — never paraphrase inside quote marks
- Analyst notes must be YOUR independent judgment, not a 
  restatement of management
- Numbers must always include: period, metric name, and basis
- If guidance is vague: quote it + state exactly what is missing
- Do not skip capacity utilization — it is a required section

═══════════════════════════════════════════
FORMATTING RULES
═══════════════════════════════════════════
- Bold ONLY genuinely important terms — not every number or keyword
- Bold sparingly: key financial figures that drive the thesis 
  (e.g. **INR840 crore** capex, **~10%** margin expansion)
- Bold critical conclusions that an investor would scan for
  (e.g. **positive OCF by year-end**, **order book up 40% YoY**)
- Do NOT bold generic words, section labels, or routine context
- Use "quotation marks" for all verbatim management quotes
- Keep paragraphs short — prefer bullet points over long text
- Use sub-bullets (indented) for supporting details under main points`;
        let contents;

        if (file.type === "application/pdf") {
            // Send PDF bytes directly to Gemini — handles both text-based and scanned PDFs
            const base64Data = buffer.toString("base64");
            contents = [
                { inlineData: { mimeType: "application/pdf", data: base64Data } },
                { text: prompt }
            ];
        } else {
            // Plain text files — read as string and send as text
            const text = buffer.toString("utf-8");
            contents = `${prompt}\n\nDocument Content:\n${text.slice(0, 500000)}`;
        }

        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                temperature: 0.2,
                thinkingConfig: { thinkingBudget: 5000 },
            },
        });

        const report = result.text || "";
        console.log("Gemini Report (first 200 chars):", report.slice(0, 200));

        return NextResponse.json({ report });

    } catch (error) {
        console.error("Analysis failed:", error);
        return NextResponse.json(
            { error: "Failed to process document" },
            { status: 500 }
        );
    }
}
