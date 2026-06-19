const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add "Only Important" to Settings Modal
const settingsRegex = /<div>\s*<h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">自動換題<\/h3>\s*<label className="flex items-center gap-2 cursor-pointer p-2"><input type="checkbox" checked={autoAdvance} onChange={\(e\)=>setAutoAdvance\(e\.target\.checked\)} className="w-5 h-5 text-blue-600 rounded"\/><span>答對時自動進入下一題 \(無縫體驗\)<\/span><\/label>\s*<\/div>/;

const newSettings = `<div>
                    <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">自動換題</h3>
                    <label className="flex items-center gap-2 cursor-pointer p-2"><input type="checkbox" checked={autoAdvance} onChange={(e)=>setAutoAdvance(e.target.checked)} className="w-5 h-5 text-blue-600 rounded"/><span>答對時自動進入下一題 (無縫體驗)</span></label>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">⭐ 專屬特訓</h3>
                    {(appState === 'vocab_playing' || appState === 'home') && (
                      <label className="flex items-center gap-2 cursor-pointer p-2"><input type="checkbox" checked={onlyImportantVocabTest} onChange={(e)=>setOnlyImportantVocabTest(e.target.checked)} className="w-5 h-5 text-amber-500 rounded border-slate-300"/><span>僅針對標記為「重要」的單字出題</span></label>
                    )}
                    {(appState === 'verb_playing' || appState === 'home') && (
                      <label className="flex items-center gap-2 cursor-pointer p-2"><input type="checkbox" checked={onlyImportantVerbTest} onChange={(e)=>setOnlyImportantVerbTest(e.target.checked)} className="w-5 h-5 text-amber-500 rounded border-slate-300"/><span>僅針對標記為「重要」的動詞/形容詞出題</span></label>
                    )}
                </div>`;
c = c.replace(settingsRegex, newSettings);

// 2. Add Filter Toggle to vocab_manage
const vocabManageTitleRegex = /<h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><BookType className="w-6 h-6 text-amber-500"\/> 管理單字記憶庫<\/h2>/;
const newVocabManageTitle = `<h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><BookType className="w-6 h-6 text-amber-500"/> 管理單字記憶庫</h2>
  <div className="flex items-center gap-4 ml-4">
      <label className="flex items-center gap-2 cursor-pointer select-none bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl font-bold border border-amber-200 hover:bg-amber-100 transition-colors">
          <input type="checkbox" checked={showOnlyImportantVocab} onChange={(e)=>setShowOnlyImportantVocab(e.target.checked)} className="hidden"/>
          <Star className={\`w-4 h-4 \${showOnlyImportantVocab ? 'fill-amber-500 text-amber-500' : 'text-amber-500/50'}\`}/>
          只顯示重要
      </label>
  </div>`;
c = c.replace(vocabManageTitleRegex, newVocabManageTitle);

// 3. Vocab manage row Star button
const vocabRowButtonsRegex = /<button onClick=\{\(\)=>\{if\(window\.confirm\('確定刪除？'\)\)\{createVocabBackup\(\); setVocabDB\(vocabDB\.filter\(x=>x\.id!==v\.id\)\);\}\}\} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="刪除"><Trash2 className="w-4 h-4"\/><\/button>/g;
const newVocabRowButtons = `<button onClick={() => {createVocabBackup(); setVocabDB(prev => prev.map(x => x.id === v.id ? { ...x, isImportant: !x.isImportant } : x))}} className={\`p-2 rounded-lg transition-colors \${v.isImportant ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}\`} title="標記為重要"><Star className={\`w-4 h-4 \${v.isImportant ? 'fill-current' : ''}\`}/></button>
                             <button onClick={()=>{if(window.confirm('確定刪除？')){createVocabBackup(); setVocabDB(vocabDB.filter(x=>x.id!==v.id));}}} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="刪除"><Trash2 className="w-4 h-4"/></button>`;
c = c.replace(vocabRowButtonsRegex, newVocabRowButtons);

// 4. Vocab Manage List Filtering
const vocabListMapRegex = /vocabDB\s*\n\s*\.filter\(v => \{\s*if \(!vocabSearchQuery\) return true;\s*const q = vocabSearchQuery\.toLowerCase\(\);\s*return \(v\.word && v\.word\.toLowerCase\(\)\.includes\(q\)\) \|\| \(v\.reading && v\.reading\.toLowerCase\(\)\.includes\(q\)\) \|\| \(v\.meaning && v\.meaning\.includes\(q\)\);\s*\}\)\s*\.sort\(\(a, b\) => b\.id\.localeCompare\(a\.id\)\)\s*\.map\(v => \(/;

const newVocabListMap = `vocabDB
                      .filter(v => {
                          if (showOnlyImportantVocab && !v.isImportant) return false;
                          if (!vocabSearchQuery) return true;
                          const q = vocabSearchQuery.toLowerCase();
                          return (v.word && v.word.toLowerCase().includes(q)) || (v.reading && v.reading.toLowerCase().includes(q)) || (v.meaning && v.meaning.includes(q));
                      })
                      .sort((a, b) => b.id.localeCompare(a.id))
                      .map(v => (`

c = c.replace(vocabListMapRegex, newVocabListMap);

fs.writeFileSync('src/App.jsx', c);
console.log('done patch phase 2');
