const fs = require('fs');
let lines = fs.readFileSync('src/App.jsx', 'utf8').split('\n');

const targetLine = "                    {customGrammars.filter(g => !grammarFilterTag || g.tag === grammarFilterTag).map(g => (";
const newLine = "                    {customGrammars.filter(g => !grammarFilterTag || g.tag === grammarFilterTag).sort((a, b) => (a.isImportant === b.isImportant ? 0 : a.isImportant ? -1 : 1)).map(g => (";

let found = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i] === targetLine) {
        lines[i] = newLine;
        found = true;
        break;
    }
}

if (found) {
    fs.writeFileSync('src/App.jsx', lines.join('\n'));
    console.log('done patching grammar sort');
} else {
    console.log('failed to find target string');
}
