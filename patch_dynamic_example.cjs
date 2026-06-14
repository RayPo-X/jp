const fs = require('fs');
let code = fs.readFileSync('d:\\jp\\src\\App.jsx', 'utf8');

// 1. Add state
code = code.replace(
    '  const [customGrammars, setCustomGrammars] = useState(() => {',
    '  const [exampleVerbId, setExampleVerbId] = useState(\'\');\n  const [customGrammars, setCustomGrammars] = useState(() => {'
);

// 2. Add Select UI
const selectUI = `<div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-slate-700 text-lg">已儲存的公式</h3>
                     <div className="flex items-center gap-2">
                       <span className="text-sm font-bold text-slate-500">💡 選擇示範單字：</span>
                       <select 
                         value={exampleVerbId}
                         onChange={e => setExampleVerbId(e.target.value)}
                         className="p-1.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 bg-slate-50 text-sm font-medium text-slate-700 max-w-[150px]"
                       >
                         {verbDB.map(v => (
                           <option key={v.id} value={v.id}>{stripRuby(v.jisho)}</option>
                         ))}
                       </select>
                     </div>
                   </div>`;

code = code.replace(
    '<h3 className="font-bold text-slate-700 mb-4 text-lg">已儲存的公式</h3>',
    selectUI
);

// 3. Update dynamic example logic
const oldMockLogic = `const mockVerbs = { masu: '食べます', te: '食べて', ta: '食べた', nai: '食べない', nakatta: '食べなかった', ba: '食べれば', volitional: '食べよう', jisho: '食べる', potential: '食べられる', passive: '食べられる', causative: '食べさせる', causative_passive: '食べさせられる' };
                                      const baseWord = mockVerbs[g.baseForm] || '〇〇';`;

const newMockLogic = `const selectedVerb = verbDB.find(v => v.id === exampleVerbId) || verbDB[0];
                                      const baseWord = selectedVerb && selectedVerb[g.baseForm] ? stripRuby(selectedVerb[g.baseForm]) : '〇〇';`;

code = code.replace(oldMockLogic, newMockLogic);

fs.writeFileSync('d:\\jp\\src\\App.jsx', code, 'utf8');
console.log('Success');
