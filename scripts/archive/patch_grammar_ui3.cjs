const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Update State Definitions
c = c.replace(
  "const [newGrammar, setNewGrammar] = useState({ name: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '', processExample: '' });",
  "const [newGrammar, setNewGrammar] = useState({ name: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '', processExample: '', note: '', tag: '' });"
);

c = c.replace(
  "example: g.example || '', processExample: g.processExample || ''",
  "example: g.example || '', processExample: g.processExample || '', note: g.note || '', tag: g.tag || ''"
);

c = c.replace(
  "setNewGrammar({ name: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '', processExample: '' });",
  "setNewGrammar({ name: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '', processExample: '', note: '', tag: '' });"
);

// Second occurrence of cancel button
c = c.replace(
  "setNewGrammar({ name: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '' });",
  "setNewGrammar({ name: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '', processExample: '', note: '', tag: '' });"
);

// 2. Add State for Tag Filter (find where to insert)
const stateInsertRegex = /const \[editingGrammarId, setEditingGrammarId\] = useState\(null\);/;
if (stateInsertRegex.test(c)) {
  c = c.replace(stateInsertRegex, "const [editingGrammarId, setEditingGrammarId] = useState(null);\n  const [grammarFilterTag, setGrammarFilterTag] = useState('');");
}

// 3. Update Edit Form UI
const processExampleInput = '<div><label className="block text-sm font-bold text-emerald-700 mb-1.5">變化筆記 (選填)</label><input type="text" value={newGrammar.processExample || \'\'} onChange={e => setNewGrammar(p => ({...p, processExample: e.target.value}))} placeholder="自由輸入，例如：飲む ➔ 飲んで ➔ 飲んでください" className="w-full p-4 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500"/></div>';
const newInputs = `<div><label className="block text-sm font-bold text-emerald-700 mb-1.5">分類標籤 (選填)</label><input type="text" value={newGrammar.tag || ''} onChange={e => setNewGrammar(p => ({...p, tag: e.target.value}))} placeholder="例：N5、接續詞" className="w-full p-4 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500" list="grammar-tags-list"/></div>\n                      <div><label className="block text-sm font-bold text-emerald-700 mb-1.5">個人備註 (選填)</label><input type="text" value={newGrammar.note || ''} onChange={e => setNewGrammar(p => ({...p, note: e.target.value}))} placeholder="記錄自己的心得或注意事項..." className="w-full p-4 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500"/></div>`;
c = c.replace(processExampleInput, processExampleInput + '\n                      ' + newInputs);

// 4. Update Card UI Display
const nameDisplay = '<div className="font-bold text-slate-800 text-lg whitespace-nowrap">{g.name}</div>';
const nameDisplayWithTag = '<div className="font-bold text-slate-800 text-lg whitespace-nowrap">{g.name}</div>\n                               {g.tag && <span className={`px-2 py-0.5 rounded-full text-[12px] font-bold border ${getTagStyle(g.tag)}`}>{g.tag}</span>}';
c = c.replace(nameDisplay, nameDisplayWithTag);

const processExampleDisplay = '{g.processExample && (\n                               <div className="w-full text-[14px] bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-lg font-medium mb-2 whitespace-pre-wrap">\n                                  {g.processExample}\n                               </div>\n                            )}';
const noteDisplay = processExampleDisplay + '\n                            {g.note && (\n                               <div className="w-full text-[14px] bg-amber-50/50 border border-amber-100 text-amber-800 px-3 py-2 rounded-lg font-medium mb-2 whitespace-pre-wrap flex gap-2">\n                                  <span className="shrink-0">📝</span> <span>{g.note}</span>\n                               </div>\n                            )}';
// replace carefully to account for spacing
const pLines = processExampleDisplay.split('\n');
let pIdx = c.indexOf('{g.processExample &&');
if (pIdx > -1) {
    let pEnd = c.indexOf(')}', pIdx + 50) + 2;
    if (pEnd > 1) {
        let block = c.substring(pIdx, pEnd);
        c = c.replace(block, block + '\n                            {g.note && (\n                               <div className="w-full text-[14px] bg-amber-50/50 border border-amber-100 text-amber-800 px-3 py-2 rounded-lg font-medium mb-2 whitespace-pre-wrap flex gap-2">\n                                  <span className="shrink-0">📝</span> <span>{g.note}</span>\n                               </div>\n                            )}');
    }
}

// 5. Add Filter Dropdown and Logic
const listHeader = '<h3 className="font-bold text-slate-700 text-lg">已儲存的公式</h3>';
const listHeaderWithFilter = `<h3 className="font-bold text-slate-700 text-lg">已儲存的公式</h3>\n                         <select value={grammarFilterTag} onChange={e => setGrammarFilterTag(e.target.value)} className="p-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-emerald-400 text-slate-600">\n                           <option value="">所有分類</option>\n                           {Array.from(new Set(customGrammars.map(g => g.tag))).filter(Boolean).map(tag => <option key={tag} value={tag}>{tag}</option>)}\n                         </select>`;
c = c.replace(listHeader, listHeaderWithFilter);

const mapStart = '{customGrammars.map(g => (';
const mapFilteredStart = '{customGrammars.filter(g => !grammarFilterTag || g.tag === grammarFilterTag).map(g => (';
c = c.replace(mapStart, mapFilteredStart);

// Add datalist for edit form
const datalist = '<datalist id="grammar-tags-list">{Array.from(new Set(customGrammars.map(g => g.tag))).filter(Boolean).map(tag => <option key={tag} value={tag} />)}</datalist>';
const mapStartWithDatalist = datalist + '\n                    ' + mapFilteredStart;
c = c.replace(mapFilteredStart, mapStartWithDatalist);

fs.writeFileSync('src/App.jsx', c);
console.log('done patch_grammar_ui3');
