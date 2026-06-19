const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const targetStr = '<datalist id="grammar-tags-list">{Array.from(new Set(customGrammars.map(g => g.tag))).filter(Boolean).map(tag => <option key={tag} value={tag} />)}</datalist>';
const replaceStr = '<datalist id="grammar-tags-list">{Array.from(new Set([...customGrammars.map(g => g.tag), ...vocabDB.map(v => v.tag)])).filter(Boolean).map(tag => <option key={tag} value={tag} />)}</datalist>';

c = c.replace(targetStr, replaceStr);

fs.writeFileSync('src/App.jsx', c);
console.log('done patching datalist');
