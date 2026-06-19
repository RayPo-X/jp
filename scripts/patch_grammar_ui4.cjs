const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Remove required validation for appendStr
c = c.replace(
  "if (!newGrammar.name || !newGrammar.appendStr) { alert('請填寫文法名稱與加上字尾！'); return; }",
  "if (!newGrammar.name) { alert('請填寫文法名稱！'); return; }"
);

// 2. Add (選填) to 加上字尾 label
c = c.replace(
  '<div><label className="block text-sm font-bold text-emerald-700 mb-1.5">加上字尾</label><input type="text" value={newGrammar.appendStr || \'\'}',
  '<div><label className="block text-sm font-bold text-emerald-700 mb-1.5">加上字尾 (選填)</label><input type="text" value={newGrammar.appendStr || \'\'}'
);

// 3. Make the edit form sticky
c = c.replace(
  '<div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 h-fit">',
  '<div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 h-fit sticky top-6">'
);

fs.writeFileSync('src/App.jsx', c);
console.log('done patch_grammar_ui4');
