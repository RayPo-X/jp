const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Update roundHistory to include id and isVocab
const roundHistoryVocabRegex = /setRoundHistory\(prev => \[\.\.\.prev, \{/;
const newRoundHistoryVocab = `setRoundHistory(prev => [...prev, { id: currentVocab.id, isVocab: true,`;
c = c.replace(roundHistoryVocabRegex, newRoundHistoryVocab);

const roundHistoryVerbRegex = /setRoundHistory\(prev => \[\.\.\.prev, \{ question: qTitle, userAnswer: finalAnswer, correctAnswer: currentCorrectPlain, userIsCorrect: isCorrect, explanation: exp \}\]\);/;
const newRoundHistoryVerb = `setRoundHistory(prev => [...prev, { id: currentVerb.id, isVocab: false, question: qTitle, userAnswer: finalAnswer, correctAnswer: currentCorrectPlain, userIsCorrect: isCorrect, explanation: exp }]);`;
c = c.replace(roundHistoryVerbRegex, newRoundHistoryVerb);

// 2. Add Star to Verb Management Rows
const verbRowButtonsRegex = /<button onClick=\{\(\)=>\{if\(window\.confirm\('確定刪除？'\)\) setVerbDB\(verbDB\.filter\(x=>x\.id!==v\.id\)\)\}\} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="刪除"><Trash2 className="w-4 h-4"\/><\/button>/g;
const newVerbRowButtons = `<button onClick={() => setVerbDB(prev => prev.map(x => x.id === v.id ? { ...x, isImportant: !x.isImportant } : x))} className={\`p-2 rounded-lg transition-colors \${v.isImportant ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}\`} title="標記為重要"><Star className={\`w-4 h-4 \${v.isImportant ? 'fill-current' : ''}\`}/></button>
                             <button onClick={()=>{if(window.confirm('確定刪除？')) setVerbDB(verbDB.filter(x=>x.id!==v.id))}} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="刪除"><Trash2 className="w-4 h-4"/></button>`;
c = c.replace(verbRowButtonsRegex, newVerbRowButtons);

// 3. Add Filter Toggle to verb_manage
const verbManageTitleRegex = /<h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Library className="w-6 h-6 text-indigo-600"\/> 動詞與形容詞庫<\/h2>/;
const newVerbManageTitle = `<h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Library className="w-6 h-6 text-indigo-600"/> 動詞與形容詞庫</h2>
                 <div className="flex items-center gap-4 ml-4">
                     <label className="flex items-center gap-2 cursor-pointer select-none bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl font-bold border border-amber-200 hover:bg-amber-100 transition-colors">
                         <input type="checkbox" checked={showOnlyImportantVerb} onChange={(e)=>setShowOnlyImportantVerb(e.target.checked)} className="hidden"/>
                         <Star className={\`w-4 h-4 \${showOnlyImportantVerb ? 'fill-amber-500 text-amber-500' : 'text-amber-500/50'}\`}/>
                         只顯示重要
                     </label>
                 </div>`;
c = c.replace(verbManageTitleRegex, newVerbManageTitle);

// 4. Verb Manage List Filtering
const verbListMapRegex = /verbDB\s*\n\s*\.filter\(v => \{\s*if \(!verbSearchQuery\) return true;\s*const q = verbSearchQuery\.toLowerCase\(\);\s*return \(v\.jisho && v\.jisho\.toLowerCase\(\)\.includes\(q\)\) \|\| \(v\.meaning && v\.meaning\.includes\(q\)\);\s*\}\)\s*\.sort\(\(a, b\) => b\.id\.localeCompare\(a\.id\)\)\s*\.map\(\(v, idx\) => \(/;

const newVerbListMap = `verbDB
                     .filter(v => {
                         if (showOnlyImportantVerb && !v.isImportant) return false;
                         if (!verbSearchQuery) return true;
                         const q = verbSearchQuery.toLowerCase();
                         return (v.jisho && v.jisho.toLowerCase().includes(q)) || (v.meaning && v.meaning.includes(q));
                     })
                     .sort((a, b) => b.id.localeCompare(a.id))
                     .map((v, idx) => (`

c = c.replace(verbListMapRegex, newVerbListMap);

// 5. Update roundHistory items in Result Card to show Star
const resultItemRegex = /<div key=\{idx\} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm"><div className="text-sm text-slate-600 mb-2 font-bold">\{item\.question\}<\/div>/g;
const newResultItem = `<div key={idx} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm relative">
                          <button 
                            onClick={() => {
                               if(item.isVocab) {
                                  setVocabDB(prev => prev.map(x => x.id === item.id ? { ...x, isImportant: !x.isImportant } : x));
                               } else {
                                  setVerbDB(prev => prev.map(x => x.id === item.id ? { ...x, isImportant: !x.isImportant } : x));
                               }
                            }}
                            className={\`absolute top-3 right-3 p-2 rounded-lg transition-colors \${(item.isVocab ? vocabDB.find(x=>x.id===item.id)?.isImportant : verbDB.find(x=>x.id===item.id)?.isImportant) ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-500 hover:bg-amber-50'}\`} 
                            title="標記為重要">
                            <Star className={\`w-5 h-5 \${(item.isVocab ? vocabDB.find(x=>x.id===item.id)?.isImportant : verbDB.find(x=>x.id===item.id)?.isImportant) ? 'fill-current' : ''}\`}/>
                          </button>
                          <div className="text-sm text-slate-600 mb-2 font-bold pr-10">{item.question}</div>`;
c = c.replace(resultItemRegex, newResultItem);


fs.writeFileSync('src/App.jsx', c);
console.log('done patch phase 3');
