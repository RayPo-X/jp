const fs = require('fs');
let code = fs.readFileSync('d:\\jp\\src\\App.jsx', 'utf8');

// fix the select options
const selectRegex = /<option key=\{v\.id\} value=\{v\.id\}>\{stripRuby\(v\.jisho\)\}<\/option>/g;
code = code.replace(selectRegex, '<option key={v.jisho} value={v.jisho}>{stripRuby(v.jisho)}</option>');

// fix the find logic
const findRegex = /const selectedVerb = verbDB\.find\(v => v\.id === exampleVerbId\) \|\| verbDB\[0\];/g;
code = code.replace(findRegex, 'const selectedVerb = verbDB.find(v => v.jisho === exampleVerbId) || verbDB[0];');

fs.writeFileSync('d:\\jp\\src\\App.jsx', code, 'utf8');
console.log('Success');
