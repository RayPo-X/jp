const fs = require('fs');
// Read with CRLF awareness
let lines = fs.readFileSync('src/App.jsx', 'utf8').split(/\r?\n/);

let changes = 0;

// === 1. verbDB init: Line 474 ===
// Line 473: "          const parsed = JSON.parse(saved);"
// Line 474: "          if (Array.isArray(parsed)) return parsed;"
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("const [verbDB, setVerbDB]")) {
        // Find the specific line
        for (let j = i; j < i + 15; j++) {
            if (lines[j].trim() === 'if (Array.isArray(parsed)) return parsed;') {
                lines[j] = "          if (Array.isArray(parsed)) return parsed.map(v => ({ ...v, learnStatus: v.learnStatus || 'new', correctCount: v.correctCount || 0 }));";
                changes++;
                // Fix the fallback
                for (let k = j; k < j + 5; k++) {
                    if (lines[k].trim() === 'return INITIAL_VERB_DB;') {
                        lines[k] = "      return INITIAL_VERB_DB.map(v => ({ ...v, learnStatus: 'new', correctCount: 0 }));";
                        changes++;
                        break;
                    }
                }
                break;
            }
        }
        break;
    }
}

// === 2. customGrammars init: add learnStatus ===
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("localStorage.getItem('verbApp_customGrammars')")) {
        for (let j = i; j < i + 20; j++) {
            if (lines[j].trim() === "parsed = parsed.map(g => {") {
                // Insert learnStatus mapping before the name replacement
                lines.splice(j, 4,
                    "            parsed = parsed.map(g => {",
                    "                let ng = { ...g, learnStatus: g.learnStatus || 'new' };",
                    "                if (ng && ng.name && ng.name.includes('〜')) {",
                    "                    ng = { ...ng, name: ng.name.replace(/〜/g, ' ＿') };",
                    "                }",
                    "                return ng;",
                    "            });"
                );
                changes++;
                break;
            }
        }
        break;
    }
}

// === 3. colDefinitions add learnStatus ===
for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "const colDefinitions = {") {
        // insert learnStatus after isImportant line
        for (let j = i; j < i + 10; j++) {
            if (lines[j].includes("'isImportant': { label: '重要(⭐)'")) {
                lines.splice(j + 1, 0, "    'learnStatus': { label: '學習狀態', sortable: true },");
                changes++;
                break;
            }
        }
        break;
    }
}

// === 4. verbTableColumnOrder: add learnStatus after isImportant ===
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("if (!newOrder.includes('isImportant')) newOrder.splice(0, 0, 'isImportant');")) {
        // insert learnStatus line after
        lines.splice(i + 1, 0, "       if (!newOrder.includes('learnStatus')) newOrder.splice(1, 0, 'learnStatus');");
        // Adjust subsequent isImportant splices
        for (let j = i + 2; j < i + 10; j++) {
            if (lines[j].includes("if (!newOrder.includes('type')) newOrder.splice(1, 0, 'type');")) {
                lines[j] = "       if (!newOrder.includes('type')) newOrder.splice(2, 0, 'type');";
                break;
            }
        }
        changes++;
        break;
    }
}

console.log(`Made ${changes} changes`);
fs.writeFileSync('src/App.jsx', lines.join('\r\n'));
