const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const stateDefTarget = `  const [onlyImportantVerbTest, setOnlyImportantVerbTest] = useState(false);`;
const stateDefNew = `  const [onlyImportantVerbTest, setOnlyImportantVerbTest] = useState(false);
  const [onlyImportantGrammarTest, setOnlyImportantGrammarTest] = useState(false);`;
c = c.replace(stateDefTarget, stateDefNew);

const testGenTarget = `        customGrammars.forEach(grammar => { if (onlyImportantVerbTest && !word.isImportant) return;
          const grammarTags = selectedGrammarTags;
          if (grammarTags.length > 0 && !grammarTags.includes(grammar.tag)) return;
          
          if (grammar.id.startsWith('g_custom_')) {`;

const testGenNew = `        customGrammars.forEach(grammar => { if (onlyImportantVerbTest && !word.isImportant) return;
          if (onlyImportantGrammarTest && !grammar.isImportant) return;
          const grammarTags = selectedGrammarTags;
          if (grammarTags.length > 0 && !grammarTags.includes(grammar.tag)) return;
          
          if (grammar.id.startsWith('g_custom_')) {`;
c = c.replace(testGenTarget, testGenNew);

const uiOptionTarget = `                    {(appState === 'verb_playing' || appState === 'home') && (
                      <label className="flex items-center gap-2 cursor-pointer p-2"><input type="checkbox" checked={onlyImportantVerbTest} onChange={(e)=>setOnlyImportantVerbTest(e.target.checked)} className="w-5 h-5 text-amber-500 rounded border-slate-300"/><span>僅針對標記為「重要」的動詞/形容詞出題</span></label>
                    )}
                </div>`;

const uiOptionNew = `                    {(appState === 'verb_playing' || appState === 'home') && (
                      <>
                        <label className="flex items-center gap-2 cursor-pointer p-2"><input type="checkbox" checked={onlyImportantVerbTest} onChange={(e)=>setOnlyImportantVerbTest(e.target.checked)} className="w-5 h-5 text-amber-500 rounded border-slate-300"/><span>僅針對標記為「重要」的動詞/形容詞出題</span></label>
                        <label className="flex items-center gap-2 cursor-pointer p-2"><input type="checkbox" checked={onlyImportantGrammarTest} onChange={(e)=>setOnlyImportantGrammarTest(e.target.checked)} className="w-5 h-5 text-emerald-500 rounded border-slate-300"/><span>僅針對標記為「重要」的文法公式出題</span></label>
                      </>
                    )}
                </div>`;
c = c.replace(uiOptionTarget, uiOptionNew);

const cardTarget = `                           <button onClick={() => handleEditGrammar(g)} className="p-3 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="編輯公式"><Pencil className="w-5 h-5"/></button>
                           <button onClick={() => {if(window.confirm('確定刪除？')) setCustomGrammars(customGrammars.filter(x=>x.id!==g.id))}} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="刪除公式"><Trash2 className="w-5 h-5"/></button>`;

const cardNew = `                           <button onClick={() => setCustomGrammars(prev => prev.map(x => x.id === g.id ? { ...x, isImportant: !x.isImportant } : x))} className={\`p-3 rounded-xl transition-colors \${g.isImportant ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}\`} title="標記為重要"><Star className={\`w-5 h-5 \${g.isImportant ? 'fill-current' : ''}\`}/></button>
                           <button onClick={() => handleEditGrammar(g)} className="p-3 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="編輯公式"><Pencil className="w-5 h-5"/></button>
                           <button onClick={() => {if(window.confirm('確定刪除？')) setCustomGrammars(customGrammars.filter(x=>x.id!==g.id))}} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="刪除公式"><Trash2 className="w-5 h-5"/></button>`;
c = c.replace(cardTarget, cardNew);

fs.writeFileSync('src/App.jsx', c);
console.log('done patching grammar isImportant');
