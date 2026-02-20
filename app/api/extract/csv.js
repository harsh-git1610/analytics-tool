/**
 * Escape a CSV cell value — handles commas, quotes, and newlines.
 */
function escapeCSV(value) {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

/**
 * Convert structured extraction data to a CSV string.
 *
 * @param {Object} data — The extracted data object with metadata and line_items
 * @returns {string} — CSV content as a string
 */
export function generateCSV(data) {
    const { metadata, line_items } = data;
    const periods = metadata?.reporting_periods || [];

    const rows = [];

    // Metadata header rows
    rows.push(`Company,${escapeCSV(metadata?.company_name || "Unknown")}`);
    rows.push(`Currency,${escapeCSV(metadata?.currency || "N/A")}`);
    rows.push(`Units,${escapeCSV(metadata?.units || "N/A")}`);
    rows.push(`Statement Type,${escapeCSV(metadata?.statement_type || "N/A")}`);
    rows.push(""); // blank separator

    // Column headers
    const header = ["Line Item", ...periods, "Notes"];
    rows.push(header.map(escapeCSV).join(","));

    // Data rows
    for (const item of line_items) {
        const label = item.original_label || item.standard_label || "Unknown";
        const values = periods.map((p) => {
            const val = item.values?.[p];
            return val !== null && val !== undefined ? val : "";
        });
        const notes = item.notes || "";
        const row = [label, ...values, notes];
        rows.push(row.map(escapeCSV).join(","));
    }

    // Analyst notes section
    if (data.analyst_notes && data.analyst_notes.length > 0) {
        rows.push("");
        rows.push("Analyst Notes");
        for (const note of data.analyst_notes) {
            rows.push(escapeCSV(note));
        }
    }

    return rows.join("\n");
}
