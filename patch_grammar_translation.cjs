const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Update initial state and reset state
c = c.replace(
  "example: '', processExample: '', note: '', tag: '' }",
  "example: '', exampleTranslation: '', processExample: '', note: '', tag: '' }"
);
c = c.replace(
  "example: '', processExample: '', note: '', tag: '' }",
  "example: '', exampleTranslation: '', processExample: '', note: '', tag: '' }"
);
c = c.replace(
  "example: '', processExample: '', note: '', tag: '' }",
  "example: '', exampleTranslation: '', processExample: '', note: '', tag: '' }"
);
// replace all remaining occurrences just in case
c = c.replace(/example: '', processExample: '', note: '', tag: '' \}/g, "example: '', exampleTranslation: '', processExample: '', note: '', tag: '' }");


// 2. Add input field
const exampleInputRegex = /<div><label className="block text-sm font-bold text-emerald-700 mb-1\.5">例句 \(選填\)<\/label><input type="text" value=\{newGrammar\.example\} onChange=\{e => setNewGrammar\(p => \(\{\.\.\.p, example: e\.target\.value\}\)\)\} placeholder="例：ここでタバコを吸わないでください" className="w-full p-4 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500"\/><\/div>/;

const newInputs = `<div><label className="block text-sm font-bold text-emerald-700 mb-1.5">例句 (選填)</label><input type="text" value={newGrammar.example || ''} onChange={e => setNewGrammar(p => ({...p, example: e.target.value}))} placeholder="例：ここでタバコを吸わないでください" className="w-full p-4 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500"/></div>
                      <div><label className="block text-sm font-bold text-emerald-700 mb-1.5">例句中文翻譯 (選填)</label><input type="text" value={newGrammar.exampleTranslation || ''} onChange={e => setNewGrammar(p => ({...p, exampleTranslation: e.target.value}))} placeholder="例：請不要在這裡吸菸" className="w-full p-4 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500"/></div>`;

c = c.replace(exampleInputRegex, newInputs);


// 3. Render in the card
const renderExampleRegex = /\{g\.example && \(\s*<div className="w-full text-\[15px\] bg-blue-50\/80 border border-blue-100 text-blue-900 px-4 py-2\.5 rounded-xl font-bold tracking-wide mt-2">\s*💬 例句：\{renderTextWithStrikethrough\(g\.example\)\}\s*<\/div>\s*\)\}/;

const newRenderExample = `{g.example && (
                              <div className="w-full text-[15px] bg-blue-50/80 border border-blue-100 text-blue-900 px-4 py-2.5 rounded-xl font-bold tracking-wide mt-2">
                                💬 例句：{renderTextWithStrikethrough(g.example)}
                                {g.exampleTranslation && <div className="text-sm font-medium text-blue-700 mt-1 pl-6">{g.exampleTranslation}</div>}
                              </div>
                           )}`;

c = c.replace(renderExampleRegex, newRenderExample);

fs.writeFileSync('src/App.jsx', c);
console.log('done patch_grammar_translation');
