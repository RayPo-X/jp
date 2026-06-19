const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const targetStr = "{customGrammars.filter(g => !grammarFilterTag || g.tag === grammarFilterTag).map(g => (";
const newStr = "{customGrammars.filter(g => !grammarFilterTag || g.tag === grammarFilterTag).sort((a, b) => (a.isImportant === b.isImportant ? 0 : a.isImportant ? -1 : 1)).map(g => (";

if (c.includes(targetStr)) {
    c = c.replace(targetStr, newStr);
    fs.writeFileSync('src/App.jsx', c);
    console.log('done patching grammar sort');
} else {
    console.log('failed to find target string');
}
