const pdf = require("pdf-parse/lib/pdf-parse.js");
const fs = require("fs");

async function test() {
    try {
        console.log("Import successful!");
        // Create a dummy PDF buffer (not a real PDF, just to test function call doesn't crash on import)
        // Real parsing might fail on invalid data, but we just want to ensure NO ENOENT on import.

        // To test parsing, we'd need a valid PDF. 
        // But the error was "ENOENT ... test/data/05-versions-space.pdf" during IMPORT/Evaluation.
        // So just running this script successfully proves the fix.
        console.log("PDF Parse function:", typeof pdf);
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
