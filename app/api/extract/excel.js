import ExcelJS from "exceljs";

/**
 * Generate a styled Excel (.xlsx) workbook from extracted financial data.
 * Returns a base64-encoded string of the workbook.
 *
 * @param {Object} data — The extracted data object with metadata and line_items
 * @returns {Promise<string>} — Base64-encoded .xlsx file
 */
export async function generateExcel(data) {
    const { metadata, line_items } = data;
    const periods = metadata?.reporting_periods || [];

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "AI Research Portal";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Financial Data", {
        views: [{ state: "frozen", ySplit: 7 }], // freeze header rows
    });

    /* ── Color palette (matching the reference screenshot) ── */
    const headerFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4A154B" } }; // deep purple
    const headerFont = { bold: true, color: { argb: "FFFFFFFF" }, size: 11, name: "Calibri" };
    const totalFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2E8F2" } }; // light purple
    const totalFont = { bold: true, size: 11, name: "Calibri", color: { argb: "FF4A154B" } };
    const sectionFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF8E1" } }; // light yellow
    const sectionFont = { bold: true, size: 11, name: "Calibri", color: { argb: "FF5D4037" } };
    const normalFont = { size: 11, name: "Calibri" };
    const metaLabelFont = { bold: true, size: 11, name: "Calibri", color: { argb: "FF4A154B" } };
    const metaValueFont = { size: 11, name: "Calibri" };
    const thinBorder = {
        top: { style: "thin", color: { argb: "FFD0D0D0" } },
        bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
        left: { style: "thin", color: { argb: "FFD0D0D0" } },
        right: { style: "thin", color: { argb: "FFD0D0D0" } },
    };

    /* ── Metadata rows ── */
    const metaRows = [
        ["Company", metadata?.company_name || "Unknown"],
        ["Currency", metadata?.currency || "N/A"],
        ["Units", metadata?.units || "N/A"],
        ["Statement Type", metadata?.statement_type || "N/A"],
    ];

    metaRows.forEach((row, i) => {
        const r = sheet.addRow(row);
        r.getCell(1).font = metaLabelFont;
        r.getCell(2).font = metaValueFont;
    });

    // Blank separator row
    sheet.addRow([]);

    /* ── Column headers ── */
    const headerValues = ["Particulars", ...periods];
    const headerRow = sheet.addRow(headerValues);
    headerRow.eachCell((cell) => {
        cell.fill = headerFill;
        cell.font = headerFont;
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = thinBorder;
    });
    // Left-align the "Particulars" column
    headerRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    headerRow.height = 28;

    /* ── Data rows ── */
    for (const item of line_items) {
        const label = item.original_label || item.standard_label || "Unknown";
        const depth = item.depth || 0;
        const isTotal = item.is_total === true;
        const hasValues = periods.some((p) => item.values?.[p] !== null && item.values?.[p] !== undefined);
        const isSectionHeading = !hasValues && (item.notes === "Section heading" || (!hasValues && depth === 0 && !isTotal));

        // Build row with indent via spaces for hierarchy
        const indent = depth > 0 ? "  ".repeat(depth) : "";
        const values = periods.map((p) => {
            const val = item.values?.[p];
            return val !== null && val !== undefined ? val : "";
        });

        const row = sheet.addRow([`${indent}${label}`, ...values]);

        // Style the label cell
        const labelCell = row.getCell(1);
        labelCell.alignment = { horizontal: "left", vertical: "middle", indent: depth * 2 };

        if (isTotal) {
            // Total/subtotal rows — bold purple
            row.eachCell((cell, colNumber) => {
                cell.font = totalFont;
                cell.fill = totalFill;
                cell.border = thinBorder;
            });
        } else if (isSectionHeading) {
            // Section headings — bold on light yellow
            row.eachCell((cell) => {
                cell.font = sectionFont;
                cell.fill = sectionFill;
                cell.border = thinBorder;
            });
        } else {
            // Normal rows
            row.eachCell((cell, colNumber) => {
                cell.font = normalFont;
                cell.border = thinBorder;
                if (colNumber > 1 && typeof cell.value === "number" && cell.value < 0) {
                    cell.font = { ...normalFont, color: { argb: "FFC62828" } }; // red for negatives
                }
            });
        }

        // Right-align and format number cells
        for (let i = 2; i <= periods.length + 1; i++) {
            const cell = row.getCell(i);
            cell.alignment = { horizontal: "right", vertical: "middle" };
            if (typeof cell.value === "number") {
                cell.numFmt = "#,##0.00";
            }
        }
    }

    /* ── Analyst notes section ── */
    if (data.analyst_notes?.length > 0) {
        sheet.addRow([]);
        const notesHeader = sheet.addRow(["Analyst Notes"]);
        notesHeader.getCell(1).font = metaLabelFont;
        for (const note of data.analyst_notes) {
            const r = sheet.addRow([note]);
            r.getCell(1).font = { ...normalFont, italic: true, color: { argb: "FF757575" } };
        }
    }

    /* ── Auto-fit column widths ── */
    sheet.columns.forEach((column, colIndex) => {
        let maxLength = 10;
        column.eachCell({ includeEmpty: false }, (cell) => {
            const cellLength = cell.value ? String(cell.value).length : 0;
            if (cellLength > maxLength) maxLength = cellLength;
        });
        // Cap at reasonable max, add padding
        column.width = Math.min(maxLength + 4, 45);
    });

    // Ensure the "Particulars" column is wide enough
    if (sheet.columns[0]) {
        sheet.columns[0].width = Math.max(sheet.columns[0].width, 38);
    }

    /* ── Generate buffer ── */
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer).toString("base64");
}
