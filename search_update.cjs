const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add History to imports
code = code.replace(
  /Star,\r?\n  Target,\r?\n  BarChart2\r?\n\} from 'lucide-react';/,
  "Star,\n  Target,\n  BarChart2,\n  History\n} from 'lucide-react';"
);

// 2. Add state
code = code.replace(
  /const \[searchTerm, setSearchTerm\] = useState\(''\);/,
  `const [searchTerm, setSearchTerm] = useState('');
  
  // ==== 全域搜尋 State ====
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
     try { return JSON.parse(localStorage.getItem('verbApp_recentSearches')) || []; } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('verbApp_recentSearches', JSON.stringify(recentSearches)); }, [recentSearches]);`
);

// 3. Clear searchTerm on goHome
code = code.replace(
  /const goHome = \(\) => \{[\s\S]*?setAppState\('home'\);/,
  `const goHome = () => {
    if (window.confirm && (appState === 'vocab_playing' || appState === 'verb_playing')) {
      if (!window.confirm('確定要回首頁嗎？目前的測驗進度將會遺失。')) return;
    }
    setSearchTerm('');
    setAppState('home');`
);

// 4. Add dashboardStats and globalSearchResults before renderView starts
code = code.replace(
  /const grammarStats = React\.useMemo\(\(\) => \{/,
  `const dashboardStats = React.useMemo(() => {
     const now = Date.now();
     const vocabDue = vocabDB.filter(v => v.status !== 'new' && (v.nextReview || 0) <= now).length;
     const grammarDue = customGrammars.filter(g => g.status !== 'new' && (g.nextReview || 0) <= now).length;
     const totalDue = vocabDue + todayQueue.length + grammarDue;

     const vocabMistakesCount = Object.keys(vocabMistakes).length;
     const otherMistakesCount = Object.keys(mistakeBank).length;
     const totalMistakes = vocabMistakesCount + otherMistakesCount;

     return {
        totalDue, totalMistakes,
        vocabTotal: vocabDB.length, verbTotal: verbDB.length, grammarTotal: customGrammars.length, kanjiTotal: kanjiDB.length
     };
  }, [vocabDB, verbDB, customGrammars, kanjiDB, vocabMistakes, mistakeBank, todayQueue]);

  const globalSearchResults = React.useMemo(() => {
     if (!globalSearchTerm.trim()) return null;
     const q = globalSearchTerm.trim().toLowerCase();
     
     const scoreMatch = (target, query) => {
         if (!target) return 0;
         const t = target.toLowerCase();
         if (t === query) return 100;
         if (t.startsWith(query)) return 50;
         if (t.includes(query)) return 10;
         return 0;
     };

     const results = { vocab: [], verb: [], grammar: [], kanji: [] };

     vocabDB.forEach(v => {
         let maxScore = Math.max(scoreMatch(v.word, q), scoreMatch(v.reading, q), scoreMatch(v.meaning, q));
         if (maxScore > 0) results.vocab.push({ item: v, score: maxScore });
     });
     verbDB.forEach(v => {
         let maxScore = Math.max(scoreMatch(v.jisho, q), scoreMatch(v.meaning, q));
         if (maxScore > 0) results.verb.push({ item: v, score: maxScore });
     });
     customGrammars.forEach(g => {
         let maxScore = Math.max(scoreMatch(g.name, q), scoreMatch(g.suffix, q));
         if (maxScore > 0) results.grammar.push({ item: g, score: maxScore });
     });
     kanjiDB.forEach(k => {
         let maxScore = Math.max(scoreMatch(k.kanji, q), scoreMatch(k.meaning, q));
         if (maxScore > 0) results.kanji.push({ item: k, score: maxScore });
     });

     results.vocab.sort((a, b) => b.score - a.score);
     results.verb.sort((a, b) => b.score - a.score);
     results.grammar.sort((a, b) => b.score - a.score);
     results.kanji.sort((a, b) => b.score - a.score);

     return results;
  }, [globalSearchTerm, vocabDB, verbDB, customGrammars, kanjiDB]);

  const handleGlobalSearchClick = (type, term) => {
      setRecentSearches(prev => {
          const newArr = [term, ...prev.filter(t => t !== term)].slice(0, 10);
          return newArr;
      });
      setShowGlobalSearch(false);
      setGlobalSearchTerm('');

      if (type === 'vocab') {
         setVocabManageTab('vocab');
         setSearchTerm(term);
         setAppState('vocab_manage');
      } else if (type === 'kanji') {
         setVocabManageTab('kanji');
         setSearchTerm(term);
         setAppState('vocab_manage');
      } else if (type === 'verb') {
         setSearchTerm(term);
         setAppState('verb_manage');
      } else if (type === 'grammar') {
         setSearchTerm(term);
         setAppState('grammar_manage');
      }
  };

  const grammarStats = React.useMemo(() => {`
);

// 5. Update UI for Home Page (Global Search + Dashboard Lite)
// Replace Hero Header section
code = code.replace(
  /\{\/\* Hero Header \*\/\}\r?\n\s*<div className="text-center mb-10 relative">[\s\S]*?<Puzzle className="w-10 h-10"\/>\r?\n\s*<\/div>\r?\n\s*<h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">日語動詞道場<\/h2>\r?\n\s*<p className="text-slate-500 font-medium max-w-lg mx-auto">專注於動詞變化的極簡學習系統<\/p>\r?\n\s*<\/div>/,
  `{/* Hero Header */}
            <div className="text-center mb-6 relative">
              <div className="inline-flex p-3 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-3xl mb-2">
                <Puzzle className="w-8 h-8"/>
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">日語記憶系統</h2>
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
            </div>`
);

// 6. Update sortedVocabDB for filtering
code = code.replace(
  /const sortedVocabDB = useMemo\(\(\) => \{\r?\n\s*let sorted = \[\.\.\.vocabDB\];/,
  `const sortedVocabDB = useMemo(() => {
    let list = [...vocabDB];
    if (vocabManageTab === 'vocab' && searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        list = list.filter(v => (v.word && v.word.toLowerCase().includes(q)) || (v.reading && v.reading.toLowerCase().includes(q)) || (v.meaning && v.meaning.toLowerCase().includes(q)));
    }
    let sorted = list;`
);

// 7. Update verb_manage filtering
code = code.replace(
  /\{verbDB\.map\(\(v, i\) => \{/,
  `{verbDB.filter(v => !searchTerm.trim() || (v.jisho && v.jisho.toLowerCase().includes(searchTerm.toLowerCase())) || (v.meaning && v.meaning.toLowerCase().includes(searchTerm.toLowerCase()))).map((v, i) => {`
);

// 8. Add verb_manage search bar
code = code.replace(
  /\{\/\* Header \*\/\}\r?\n\s*<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">/,
  `{/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
             <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <input type="text" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="搜尋動詞..." className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"/>
                {searchTerm && <button onClick={()=>setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><XCircle className="w-4 h-4"/></button>}
             </div>`
);

// 9. Update grammar_manage filtering
code = code.replace(
  /\{customGrammars\.map\(\(g, idx\) => \{/,
  `{customGrammars.filter(g => !searchTerm.trim() || (g.name && g.name.toLowerCase().includes(searchTerm.toLowerCase())) || (g.suffix && g.suffix.toLowerCase().includes(searchTerm.toLowerCase()))).map((g, idx) => {`
);

// 10. Add grammar_manage search bar
code = code.replace(
  /<h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6"><Puzzle className="w-6 h-6 text-emerald-600"\/> 文法公式庫<\/h2>/,
  `<div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Puzzle className="w-6 h-6 text-emerald-600"/> 文法公式庫</h2>
                <div className="relative w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                   <input type="text" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="搜尋文法公式..." className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"/>
                   {searchTerm && <button onClick={()=>setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><XCircle className="w-4 h-4"/></button>}
                </div>
              </div>`
);

// 11. Add vocab_manage search bar to `vocab` tab (kanji tab already has one)
code = code.replace(
  /<div className="flex items-center gap-4">\r?\n\s*<div className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1\.5 rounded-xl border border-slate-100">\r?\n\s*單字:/,
  `<div className="flex flex-1 max-w-xs relative ml-4">
                        {vocabManageTab === 'vocab' && (
                           <>
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                             <input type="text" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="搜尋單字..." className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all outline-none"/>
                             {searchTerm && <button onClick={()=>setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><XCircle className="w-4 h-4"/></button>}
                           </>
                        )}
                    </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 hidden lg:block">
                        單字:`
);

fs.writeFileSync('src/App.jsx', code);
console.log('Update script prepared.');
