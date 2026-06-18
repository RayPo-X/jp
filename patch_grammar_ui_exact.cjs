const fs = require('fs');
let lines = fs.readFileSync('src/App.jsx', 'utf8').split('\n');

const testGenNewStr = `      verbDB.forEach(word => {
        customGrammars.forEach(grammar => { 
          if (onlyImportantVerbTest && !word.isImportant) return;
          if (onlyImportantGrammarTest && !grammar.isImportant) return;
          if (grammar.appliesTo.includes(word.type) && word[grammar.baseForm]) { availablePool.push({ word, target: grammar.id, grammarDef: grammar }); } 
        });
      });`;

const testOptNewStr = `                    {(appState === 'verb_playing' || appState === 'home') && (
                      <>
                        <label className="flex items-center gap-2 cursor-pointer p-2"><input type="checkbox" checked={onlyImportantVerbTest} onChange={(e)=>setOnlyImportantVerbTest(e.target.checked)} className="w-5 h-5 text-amber-500 rounded border-slate-300"/><span>僅針對標記為「重要」的動詞/形容詞出題</span></label>
                        <label className="flex items-center gap-2 cursor-pointer p-2"><input type="checkbox" checked={onlyImportantGrammarTest} onChange={(e)=>setOnlyImportantGrammarTest(e.target.checked)} className="w-5 h-5 text-emerald-500 rounded border-slate-300"/><span>僅針對標記為「重要」的文法公式出題</span></label>
                      </>
                    )}`;

const cardBtnNewStr = `                         <div className="flex items-center gap-2 shrink-0">
                           <button onClick={() => setCustomGrammars(prev => prev.map(x => x.id === g.id ? { ...x, isImportant: !x.isImportant } : x))} className={\`p-3 rounded-xl transition-colors \${g.isImportant ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}\`} title="標記為重要"><Star className={\`w-5 h-5 \${g.isImportant ? 'fill-current' : ''}\`}/></button>
                           <button onClick={() => handleEditGrammar(g)} className="p-3 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="編輯公式"><Pencil className="w-5 h-5"/></button>
                           <button onClick={() => {if(window.confirm('確定刪除？')) setCustomGrammars(customGrammars.filter(x=>x.id!==g.id))}} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="刪除公式"><Trash2 className="w-5 h-5"/></button>
                         </div>`;

lines.splice(3036, 4, cardBtnNewStr);
lines.splice(2061, 3, testOptNewStr);
lines.splice(1138, 4, testGenNewStr);

fs.writeFileSync('src/App.jsx', lines.join('\n'));
console.log('done patching grammar ui exactly');
