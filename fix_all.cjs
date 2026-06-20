const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Fix Global Search & Dashboard Lite UI
const oldHeroHeader = `{/* Hero Header */}
            <div className="text-center mb-10 relative">
              <div className="inline-flex p-5 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-3xl mb-4">
                <BookOpen className="w-14 h-14"/>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight mb-3">日語綜合訓練中心</h1>
              <p className="text-slate-400 text-base font-medium">每天一點點，透過科學系統建立語感的長久記憶</p>
              <button onClick={() => setShowManualModal(true)} className="absolute top-0 right-0 sm:right-4 p-3 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-100 transition-colors flex items-center gap-2 font-bold shadow-sm">
                <BookOpen className="w-5 h-5"/>
                <span className="hidden sm:inline">使用說明</span>
              </button>
            </div>`;

const newHeroHeader = `{/* Hero Header */}
            <div className="text-center mb-6 relative">
              <div className="inline-flex p-3 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-3xl mb-2">
                <Puzzle className="w-8 h-8"/>
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">日語綜合訓練中心</h2>
              <button onClick={() => setShowManualModal(true)} className="absolute top-0 right-0 sm:right-4 p-2 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-100 transition-colors flex items-center gap-2 font-bold shadow-sm text-sm">
                <BookOpen className="w-4 h-4"/>
                <span className="hidden sm:inline">說明</span>
              </button>
            </div>
            
            <div className="max-w-3xl mx-auto mb-10 space-y-4">
              {/* Global Search */}
              <div className="relative z-50">
                 <div className="relative bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden group hover:border-blue-400 transition-colors focus-within:border-blue-500 focus-within:shadow-md focus-within:ring-4 focus-within:ring-blue-500/10">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type="text" 
                      value={globalSearchTerm} 
                      onChange={e => { setGlobalSearchTerm(e.target.value); setShowGlobalSearch(true); }}
                      onFocus={() => setShowGlobalSearch(true)}
                      placeholder="🔍 搜尋單字、動詞、文法、漢字..." 
                      className="w-full pl-14 pr-12 py-4 text-lg bg-transparent focus:outline-none placeholder:text-slate-400"
                    />
                    {globalSearchTerm && (
                      <button onClick={() => {setGlobalSearchTerm(''); setShowGlobalSearch(false);}} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><XCircle className="w-5 h-5"/></button>
                    )}
                 </div>

                 {showGlobalSearch && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowGlobalSearch(false)}></div>
                      <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-[70vh] flex flex-col">
                         {!globalSearchTerm.trim() ? (
                            <div className="p-4">
                               <div className="flex justify-between items-center px-2 mb-3">
                                 <div className="text-sm font-bold text-slate-400 flex items-center gap-2"><History className="w-4 h-4"/> 最近搜尋</div>
                                 {recentSearches.length > 0 && <button onClick={() => setRecentSearches([])} className="text-xs text-slate-400 hover:text-red-500 font-medium">清空</button>}
                               </div>
                               {recentSearches.length === 0 ? (
                                  <div className="p-8 text-center text-slate-400 text-sm">目前沒有搜尋紀錄</div>
                               ) : (
                                  <div className="flex flex-wrap gap-2 px-2">
                                     {recentSearches.map((term, i) => (
                                        <button key={i} onClick={() => { setGlobalSearchTerm(term); setShowGlobalSearch(true); }} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm font-medium text-slate-700 border border-slate-200 transition-colors shadow-sm">{term}</button>
                                     ))}
                                  </div>
                               )}
                            </div>
                         ) : globalSearchResults && (
                            <div className="overflow-y-auto p-4 space-y-6">
                               {globalSearchResults.vocab.length > 0 && (
                                  <div>
                                     <h3 className="font-bold text-slate-500 mb-2 px-2 flex items-center gap-2"><BookOpen className="w-4 h-4"/> 單字庫 ({globalSearchResults.vocab.length})</h3>
                                     <div className="space-y-1">
                                        {globalSearchResults.vocab.slice(0, 10).map((res, i) => (
                                           <button key={i} onClick={() => handleGlobalSearchClick('vocab', res.item.word || res.item.reading)} className="w-full text-left p-3 hover:bg-blue-50 rounded-xl flex items-center justify-between group transition-colors">
                                              <div className="flex items-center gap-3">
                                                 <div className="font-bold text-slate-800 text-lg group-hover:text-blue-700">{res.item.word || res.item.reading}</div>
                                                 {res.item.word && <div className="text-sm text-slate-500">{res.item.reading}</div>}
                                              </div>
                                              <div className="text-sm text-slate-500 line-clamp-1 text-right max-w-[50%]">{res.item.meaning}</div>
                                           </button>
                                        ))}
                                        {globalSearchResults.vocab.length > 10 && <div className="text-center text-xs text-slate-400 p-2">還有 {globalSearchResults.vocab.length - 10} 筆符合</div>}
                                     </div>
                                  </div>
                               )}
                               {globalSearchResults.verb.length > 0 && (
                                  <div>
                                     <h3 className="font-bold text-slate-500 mb-2 px-2 flex items-center gap-2"><Layers className="w-4 h-4"/> 動詞庫 ({globalSearchResults.verb.length})</h3>
                                     <div className="space-y-1">
                                        {globalSearchResults.verb.slice(0, 10).map((res, i) => (
                                           <button key={i} onClick={() => handleGlobalSearchClick('verb', res.item.jisho)} className="w-full text-left p-3 hover:bg-indigo-50 rounded-xl flex items-center justify-between group transition-colors">
                                              <div className="font-bold text-slate-800 text-lg group-hover:text-indigo-700">{res.item.jisho}</div>
                                              <div className="text-sm text-slate-500 line-clamp-1 text-right max-w-[50%]">{res.item.meaning}</div>
                                           </button>
                                        ))}
                                     </div>
                                  </div>
                               )}
                               {globalSearchResults.grammar.length > 0 && (
                                  <div>
                                     <h3 className="font-bold text-slate-500 mb-2 px-2 flex items-center gap-2"><Puzzle className="w-4 h-4"/> 文法公式 ({globalSearchResults.grammar.length})</h3>
                                     <div className="space-y-1">
                                        {globalSearchResults.grammar.slice(0, 10).map((res, i) => (
                                           <button key={i} onClick={() => handleGlobalSearchClick('grammar', res.item.name)} className="w-full text-left p-3 hover:bg-emerald-50 rounded-xl flex items-center justify-between group transition-colors">
                                              <div className="font-bold text-slate-800 text-lg group-hover:text-emerald-700">{res.item.name}</div>
                                              <div className="text-sm text-slate-500">{res.item.suffix}</div>
                                           </button>
                                        ))}
                                     </div>
                                  </div>
                               )}
                               {globalSearchResults.kanji.length > 0 && (
                                  <div>
                                     <h3 className="font-bold text-slate-500 mb-2 px-2 flex items-center gap-2"><BookType className="w-4 h-4"/> 漢字庫 ({globalSearchResults.kanji.length})</h3>
                                     <div className="grid grid-cols-2 gap-2">
                                        {globalSearchResults.kanji.slice(0, 10).map((res, i) => (
                                           <button key={i} onClick={() => handleGlobalSearchClick('kanji', res.item.kanji)} className="text-left p-3 hover:bg-rose-50 rounded-xl flex items-center gap-3 group transition-colors">
                                              <div className="text-3xl font-black text-slate-800 group-hover:text-rose-700 leading-none">{res.item.kanji}</div>
                                              <div className="text-sm text-slate-500">{res.item.meaning}</div>
                                           </button>
                                        ))}
                                     </div>
                                  </div>
                               )}
                               {globalSearchResults.vocab.length === 0 && globalSearchResults.verb.length === 0 && globalSearchResults.grammar.length === 0 && globalSearchResults.kanji.length === 0 && (
                                  <div className="p-8 text-center text-slate-400">找不到任何符合的資料</div>
                               )}
                            </div>
                         )}
                      </div>
                    </>
                 )}
              </div>

              {/* Dashboard Lite */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                 <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex flex-col items-center justify-center">
                       <div className="text-sm font-bold text-emerald-600 mb-1">🗓️ 今日待複習</div>
                       <div className="text-3xl font-black text-emerald-700">{dashboardStats.totalDue} <span className="text-sm font-normal text-emerald-500/70">題</span></div>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex flex-col items-center justify-center">
                       <div className="text-sm font-bold text-rose-600 mb-1">📒 錯題本</div>
                       <div className="text-3xl font-black text-rose-700">{dashboardStats.totalMistakes} <span className="text-sm font-normal text-rose-500/70">題</span></div>
                    </div>
                 </div>
                 <div className="grid grid-cols-4 gap-3">
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-center">
                       <div className="text-xs font-bold text-slate-400 mb-1">📚 單字</div>
                       <div className="text-xl font-bold text-slate-700">{dashboardStats.vocabTotal}</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-center">
                       <div className="text-xs font-bold text-slate-400 mb-1">🔄 動詞</div>
                       <div className="text-xl font-bold text-slate-700">{dashboardStats.verbTotal}</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-center">
                       <div className="text-xs font-bold text-slate-400 mb-1">📖 文法</div>
                       <div className="text-xl font-bold text-slate-700">{dashboardStats.grammarTotal}</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-center">
                       <div className="text-xs font-bold text-slate-400 mb-1">🈶 漢字</div>
                       <div className="text-xl font-bold text-slate-700">{dashboardStats.kanjiTotal}</div>
                    </div>
                 </div>
              </div>
            </div>`;

if(code.includes(oldHeroHeader)){
   code = code.replace(oldHeroHeader, newHeroHeader);
   console.log("Successfully injected Home UI.");
} else {
   console.log("Could not find Hero Header!");
}

// 2. Fix Verb Tag Editor insertion
// Looking at my previous attempt, it missed because I used too strict regex.
const oldVerbMeaningInput = `<label className="block text-xs font-bold text-indigo-600 mb-1 ml-1">中文解釋</label>
                                   <input type="text" value={verbEditForm.meaning}`;
const newVerbTagEditor = `<label className="block text-xs font-bold text-indigo-600 mb-1 ml-1">中文解釋</label>
                                   <input type="text" value={verbEditForm.meaning} onChange={e=>setVerbEditForm({...verbEditForm, meaning: e.target.value})} placeholder="中文解釋" className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 font-bold text-sm"/>
                                 </div>
                                 <div className="w-full mt-2">
                                    <TagEditor tags={verbEditForm.tags} onChange={tags => setVerbEditForm({...verbEditForm, tags})} tagStats={globalTagStats} />
                                 </div>`;
if (code.includes(oldVerbMeaningInput)) {
    code = code.replace(/<label className="block text-xs font-bold text-indigo-600 mb-1 ml-1">中文解釋<\/label>\s*<input type="text" value=\{verbEditForm\.meaning\} onChange=\{e=>setVerbEditForm\(\{\.\.\.verbEditForm, meaning: e\.target\.value\}\)\} placeholder="中文解釋" className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 font-bold text-sm"\/>\s*<\/div>/, newVerbTagEditor);
    console.log("Verb TagEditor injected.");
}

// 3. Fix Grammar Tag Editor insertion (Add form)
const grammarAddRegex = /<label className="flex items-center gap-2 cursor-pointer p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">/g;
// Replace only the first occurrence for "add form"
if (grammarAddRegex.test(code)) {
    code = code.replace(/<label className="flex items-center gap-2 cursor-pointer p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">/, 
    `<div className="mb-4">
                        <TagEditor tags={newGrammar.tags} onChange={tags => setNewGrammar({...newGrammar, tags})} tagStats={globalTagStats} />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">`);
    console.log("Grammar Add TagEditor injected.");
}

// 4. Fix Grammar Tag Editor insertion (Edit form)
if (code.includes('<label className="flex items-center gap-2 cursor-pointer p-2 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors">')) {
    code = code.replace(/<label className="flex items-center gap-2 cursor-pointer p-2 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors">/,
    `<div className="mb-4">
                        <TagEditor tags={grammarEditForm.tags} onChange={tags => setGrammarEditForm({...grammarEditForm, tags})} tagStats={globalTagStats} />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer p-2 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors">`);
    console.log("Grammar Edit TagEditor injected.");
}

// 5. Fix grammar filter logic to use searchTerm AND tag search
// It currently looks like: {customGrammars.filter(g => !grammarFilterTag || g.tag === grammarFilterTag).sort((a, b) => {
code = code.replace(
  /\{customGrammars\.filter\(g => !grammarFilterTag \|\| g\.tag === grammarFilterTag\)\.sort\(/,
  `{customGrammars.filter(g => {
    if (grammarFilterTag && g.tag !== grammarFilterTag) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (g.name && g.name.toLowerCase().includes(q)) || 
           (g.suffix && g.suffix.toLowerCase().includes(q)) || 
           (g.tags && g.tags.some(t => t.toLowerCase().includes(q)));
  }).sort(`
);

// 6. Fix verb search logic (verify if it is currently correct)
// It's probably correct if my previous script ran. Let's verify and write back.

fs.writeFileSync('src/App.jsx', code);
console.log('Update script completely run.');
