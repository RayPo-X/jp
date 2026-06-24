const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Grammars Add/Edit Initialization
code = code.split(
    "const [newGrammar, setNewGrammar] = useState({ name: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '', exampleTranslation: '', processExample: '', note: '', tag: '' });"
).join(
    "const [newGrammar, setNewGrammar] = useState({ name: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '', exampleTranslation: '', processExample: '', note: '', tag: '', tags: [] });"
);

code = code.split(
    "example: g.example || '', processExample: g.processExample || '', note: g.note || '', tag: g.tag || ''"
).join(
    "example: g.example || '', processExample: g.processExample || '', note: g.note || '', tag: g.tag || '', tags: g.tags || []"
);

code = code.split(
    "exampleTranslation: '', processExample: '', note: '', tag: '' });"
).join(
    "exampleTranslation: '', processExample: '', note: '', tag: '', tags: [] });"
);

// 2. Grammars Add UI
// Old: 
// <div className="flex-1"><label className="block text-sm font-bold text-emerald-700 mb-1.5">主?標籤</label><input type="text" value={newGrammar.tag} onChange={e => setNewGrammar({...newGrammar, tag: e.target.value})} list="grammar-tags-list" placeholder="例如: JLPT N5" className="w-full p-3 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500"/></div>
// We can just replace it entirely using substring search.
const oldGrammarUI = `<div className="flex-1"><label className="block text-sm font-bold text-emerald-700 mb-1.5">主`;
// Actually, it's safer to use regex that matches the whole line up to the closing div
code = code.replace(
    /<div className="flex-1"><label className="block text-sm font-bold text-emerald-700 mb-1\.5">[^<]+<\/label><input type="text" value=\{newGrammar\.tag\} onChange=\{e => setNewGrammar\(\{\.\.\.newGrammar, tag: e\.target\.value\}\)\} list="grammar-tags-list" placeholder="[^"]+" className="w-full p-3 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500"\/><\/div>/g,
    ""
);
// And insert TagEditor right below
code = code.replace(
    /<\/div>\s*<div><label className="block text-sm font-bold text-emerald-700 mb-1\.5">備註 \(/g,
    `</div>\n                        <div className="mt-4"><label className="block text-sm font-bold text-emerald-700 mb-1.5">標籤</label><TagEditor tags={newGrammar.tags} onChange={tags => setNewGrammar({...newGrammar, tags})} tagStats={globalTagStats} /></div>\n                        <div><label className="block text-sm font-bold text-emerald-700 mb-1.5">備註 (`
);

// 3. Verb Add UI
code = code.replace(
    /<div className="flex-1"><label className="block text-sm font-bold text-indigo-700 mb-1\.5">[^<]+<\/label><input type="text" value=\{verbInputs\.tag\} onChange=\{e => setVerbInputs\(\{\.\.\.verbInputs, tag: e\.target\.value\}\)\} list="verb-theme-suggestions" placeholder="[^"]+" className="w-full p-4 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500"\/><\/div>/g,
    `<div className="w-full mt-4"><label className="block text-sm font-bold text-indigo-700 mb-1.5">標籤</label><TagEditor tags={verbInputs.tags} onChange={tags => setVerbInputs({...verbInputs, tags})} tagStats={globalTagStats} /></div>`
);

// 4. Vocab Batch Add State
code = code.replace(
    /\{word:'', reading:'', meaning:'', tag: '[^']+', example: '', isSentence: false\}/g,
    "{word:'', reading:'', meaning:'', tag: '未知', tags: [], example: '', isSentence: false}"
);

// 5. Vocab Batch Add UI
code = code.replace(
    /<div><label className="block text-xs font-bold text-slate-500 mb-1">[^<]+<\/label><input type="text" value=\{item\.tag\} onChange=\{e => setBatchInputs\(batchInputs\.map\(\(x,i\) => i === idx \? \{\.\.\.x, tag: e\.target\.value\} : x\)\)\} list="theme-suggestions" placeholder="[^"]+" className="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-amber-500"\/><\/div>/g,
    `<div><label className="block text-xs font-bold text-slate-500 mb-1">標籤 (逗號分隔)</label><input type="text" value={(item.tags||[]).join(', ')} onChange={e => setBatchInputs(batchInputs.map((x,i) => i === idx ? {...x, tags: e.target.value.split(',')} : x))} onBlur={e => setBatchInputs(batchInputs.map((x,i) => i === idx ? {...x, tags: processTags(e.target.value)} : x))} placeholder="例如: N5, 學校" className="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-amber-500"/></div>`
);

// 6. Badges UI rendering replacements
// Remove old verb tag rendering
code = code.replace(
    /\{v\.tag \&\& <span className=\{`text-xs px-2 py-0\.5 rounded font-bold \$\{getTagStyle\(v\.tag\)\}`\}>\{v\.tag\}<\/span>\}/g,
    "{renderTags(v.tags)}"
);
// Replace verb manage list tag render
code = code.replace(
    /<span onClick=\{[\s\S]*?className=\{`inline-block px-2\.5 py-1 text-xs font-bold rounded-lg border whitespace-nowrap cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all \$\{getTagStyle\(v\.tag\)\}`\}>[\s\S]*?<\/span>/m,
    "{renderTags(v.tags)}"
);

// Replace vocab manage list tag render
code = code.replace(
    /<span\s*onClick=\{[\s\S]*?className=\{`inline-block px-2\.5 py-1 text-xs font-bold rounded-lg border whitespace-nowrap cursor-pointer hover:ring-2 hover:ring-amber-300 transition-all \$\{getTagStyle\(v\.tag\)\}`\}[\s\S]*?>\{v\.tag\}<\/span>/m,
    "{renderTags(v.tags)}"
);
// Actually, for Vocab/Verb manage list, there is already an inline edit for tags logic which was conditionally rendering an input or a span. Let me just leave the inline tag editor alone if it edits v.tag, or remove the entire block and just use `{renderTags(v.tags)}`?
// The user says "編輯單字時可修改 Tags", which is already handled by `vocabEditForm` and `verbEditForm` which both have `TagEditor`. We can safely replace the old inline tag column with `{renderTags(v.tags)}`. Let's just do it cleanly via direct search in script 4.

fs.writeFileSync('src/App.jsx', code);
console.log('Script 3 complete');
