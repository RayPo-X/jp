const fs = require('fs');
const file = 'd:/jp/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

const regexVocab = /const getTs = \(id\) => \{ const p = \(id\|\|''\)\.split\('_'\); return \(p\.length >= 3 && !isNaN\(Number\(p\[p\.length-1\]\)\)\) \? Number\(p\[p\.length-1\]\) : 0; \};/;
const replacementVocab = `const getTs = (id) => { const p = String(id||'').split('_'); return (p.length >= 3 && !isNaN(Number(p[p.length-1]))) ? Number(p[p.length-1]) : 0; };`;

const regexVocabSort = /let sorted = \[\.\.\.vocabDB\];\s*sorted\.sort\(\(a, b\) => \{/;
const replacementVocabSort = `let sorted = [...vocabDB];\n    sorted.sort((a, b) => {\n      if (!a) return 1; if (!b) return -1;`;

const regexVerbSort = /let sorted = \[\.\.\.verbDB\];\s*sorted\.sort\(\(a, b\) => \{/;
const replacementVerbSort = `let sorted = [...verbDB];\n    sorted.sort((a, b) => {\n      if (!a) return 1; if (!b) return -1;`;

const regexVerbType = /case 'type': aVal = a\.type \+ a\.group; bVal = b\.type \+ b\.group; break;/;
const replacementVerbType = `case 'type': aVal = (a.type || '') + (a.group || ''); bVal = (b.type || '') + (b.group || ''); break;`;

if (regexVocab.test(content)) {
    // replace all occurrences of getTs
    content = content.replace(new RegExp(regexVocab, 'g'), replacementVocab);
    console.log('Success replacing getTs');
}
if (regexVocabSort.test(content)) {
    content = content.replace(regexVocabSort, replacementVocabSort);
    console.log('Success replacing vocab sort null check');
}
if (regexVerbSort.test(content)) {
    content = content.replace(regexVerbSort, replacementVerbSort);
    console.log('Success replacing verb sort null check');
}
if (regexVerbType.test(content)) {
    content = content.replace(regexVerbType, replacementVerbType);
    console.log('Success replacing verb type concatenation');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Done sort logic patches');
