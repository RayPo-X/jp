const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');
const logs = [];

// ---------------------------------------------------------
// 1. Home Page UI Injection
// ---------------------------------------------------------
const heroStart = code.indexOf('{/* Hero Header */}');
const twoColStart = code.indexOf('{/* Two Column Layout */}');
if (heroStart !== -1 && twoColStart !== -1 && heroStart < twoColStart) {
    const newHeroHeader = `{/* Hero Header */}
            <div className="text-center mb-6 relative">
              <div className="inline-flex p-3 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-3xl mb-2">
                <Puzzle className="w-8 h-8"/>
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">日語記憶系統</h2>
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
                      placeholder="🔍 搜尋單字、動詞、文法、漢字、標籤..." 
                      className="w-full pl-14 pr-12 py-4 text-lg bg-transparent focus:outline-none placeholder:text-slate-400 font-bold"
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
                                 {recentSearches.length > 0 && <button onClick={() => setRecentSearches([])} className="text-xs text-slate-400 hover:text-red-500 font-medium border border-transparent hover:border-red-200 px-2 py-1 rounded">清空</button>}
                               </div>
                               {recentSearches.length === 0 ? (
                                  <div className="p-8 text-center text-slate-400 text-sm">目前沒有搜尋紀錄</div>
                               ) : (
                                  <div className="flex flex-wrap gap-2 px-2">
                                     {recentSearches.map((term, i) => (
                                        <button key={'hs'+i} onClick={() => { setGlobalSearchTerm(term); setShowGlobalSearch(true); }} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm font-bold text-slate-700 border border-slate-200 transition-colors shadow-sm">{term}</button>
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
                                           <button key={'s_v_'+i} onClick={() => handleGlobalSearchClick('vocab', res.item.word || res.item.reading)} className="w-full text-left p-3 hover:bg-blue-50 rounded-xl flex items-center justify-between group transition-colors">
                                              <div className="flex items-center gap-3">
                                                 <div className="font-bold text-slate-800 text-lg group-hover:text-blue-700">{res.item.word || res.item.reading}</div>
                                                 {res.item.word && <div className="text-sm text-slate-500">{res.item.reading}</div>}
                                                 {renderTags(res.item.tags)}
                                              </div>
                                              <div className="text-sm text-slate-500 line-clamp-1 text-right max-w-[40%] font-medium">{res.item.meaning}</div>
                                           </button>
                                        ))}
                                        {globalSearchResults.vocab.length > 10 && <div className="text-center text-xs font-bold text-slate-400 p-2">還有 {globalSearchResults.vocab.length - 10} 筆符合</div>}
                                     </div>
                                  </div>
                               )}
                               {globalSearchResults.verb.length > 0 && (
                                  <div>
                                     <h3 className="font-bold text-slate-500 mb-2 px-2 flex items-center gap-2"><Layers className="w-4 h-4"/> 動詞庫 ({globalSearchResults.verb.length})</h3>
                                     <div className="space-y-1">
                                        {globalSearchResults.verb.slice(0, 10).map((res, i) => (
                                           <button key={'s_vb_'+i} onClick={() => handleGlobalSearchClick('verb', res.item.jisho)} className="w-full text-left p-3 hover:bg-indigo-50 rounded-xl flex items-center justify-between group transition-colors">
                                              <div className="flex items-center gap-3">
                                                <div className="font-bold text-slate-800 text-lg group-hover:text-indigo-700">{res.item.jisho}</div>
                                                {renderTags(res.item.tags)}
                                              </div>
                                              <div className="text-sm text-slate-500 line-clamp-1 text-right max-w-[50%] font-medium">{res.item.meaning}</div>
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
                                           <button key={'s_g_'+i} onClick={() => handleGlobalSearchClick('grammar', res.item.name)} className="w-full text-left p-3 hover:bg-emerald-50 rounded-xl flex items-center justify-between group transition-colors">
                                              <div className="flex items-center gap-3">
                                                <div className="font-bold text-slate-800 text-lg group-hover:text-emerald-700">{res.item.name}</div>
                                                {renderTags(res.item.tags)}
                                              </div>
                                              <div className="text-sm text-slate-500 font-medium">{res.item.suffix}</div>
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
                                           <button key={'s_k_'+i} onClick={() => handleGlobalSearchClick('kanji', res.item.kanji)} className="text-left p-3 hover:bg-rose-50 rounded-xl flex items-center justify-between group transition-colors">
                                              <div className="flex items-center gap-3">
                                                <div className="text-3xl font-black text-slate-800 group-hover:text-rose-700 leading-none">{res.item.kanji}</div>
                                                {renderTags(res.item.tags)}
                                              </div>
                                              <div className="text-sm font-bold text-slate-500">{res.item.meaning}</div>
                                           </button>
                                        ))}
                                     </div>
                                  </div>
                               )}
                               {globalSearchResults.vocab.length === 0 && globalSearchResults.verb.length === 0 && globalSearchResults.grammar.length === 0 && globalSearchResults.kanji.length === 0 && (
                                  <div className="p-8 text-center font-bold text-slate-400">找不到任何符合的資料</div>
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
            </div>
            
            `;
    code = code.substring(0, heroStart) + newHeroHeader + code.substring(twoColStart);
    logs.push("Injected Home UI!");
}

// ---------------------------------------------------------
// 2. Insert Tag System Component
// ---------------------------------------------------------
const tagHelpers = `
const DEFAULT_TAG_SUGGESTIONS = ['N5', 'N4', 'N3', 'N2', 'N1', '重要', '易錯', '必背', '留學', '生活', '學校', '打工'];

const processTags = (tagStrOrArray) => {
    let arr = [];
    if (typeof tagStrOrArray === 'string') {
        arr = tagStrOrArray.split(/[,，、]/);
    } else if (Array.isArray(tagStrOrArray)) {
        arr = tagStrOrArray;
    }
    const uniqueTags = new Set();
    arr.forEach(t => {
        let clean = t.trim();
        if (!clean) return;
        clean = clean.replace(/^[nｎＮ]\\s*([1-5])$/i, 'N$1');
        uniqueTags.add(clean);
    });
    return Array.from(uniqueTags);
};

const TagEditor = ({ tags, onChange, tagStats }) => {
    const allExistingTags = Object.keys(tagStats).sort((a,b) => tagStats[b] - tagStats[a]);
    const suggestions = Array.from(new Set([...DEFAULT_TAG_SUGGESTIONS, ...allExistingTags]));
    const [inputValue, setInputValue] = React.useState(tags ? tags.join(', ') : '');

    React.useEffect(() => {
        setInputValue(tags ? tags.join(', ') : '');
    }, [tags]);

    const handleBlur = () => {
        const newTags = processTags(inputValue);
        onChange(newTags);
        setInputValue(newTags.join(', '));
    };

    const toggleTag = (t) => {
        let current = processTags(inputValue);
        if (current.includes(t)) current = current.filter(x => x !== t);
        else current.push(t);
        const newStr = current.join(', ');
        setInputValue(newStr);
        onChange(current);
    };

    return (
        <div className="mt-2 mb-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <label className="block text-xs font-bold text-slate-500 mb-1">標籤 (可用半形逗號分隔)</label>
            <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onBlur={handleBlur} onKeyDown={e => e.key === 'Enter' && handleBlur()} placeholder="例如: N4, 重要, 學校" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none mb-2"/>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
               {suggestions.map(t => {
                   const isActive = processTags(inputValue).includes(t);
                   return <button key={t} onClick={(e) => { e.preventDefault(); toggleTag(t); }} className={\`px-2 py-1 text-[11px] font-bold rounded-lg border transition-colors \${isActive ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}\`}>{t} {tagStats[t] ? <span className="opacity-70 font-normal ml-1">({tagStats[t]})</span> : ''}</button>
               })}
            </div>
        </div>
    );
};

const renderTags = (tags) => {
    if (!tags || !Array.isArray(tags) || tags.length === 0) return null;
    return (
        <div className="flex flex-wrap gap-1 mt-1">
            {tags.map(t => <span key={t} className="px-1.5 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-200 rounded-md border border-slate-300">{t}</span>)}
        </div>
    );
};
`;
if (!code.includes("const TagEditor =")) {
    const helperStart = code.indexOf('const getTagStyle =');
    if (helperStart !== -1) {
        code = code.substring(0, helperStart) + tagHelpers + "\n" + code.substring(helperStart);
        logs.push("Injected TagHelpers");
    }
}

// ---------------------------------------------------------
// 3. Fix Search Scoring Engine
// ---------------------------------------------------------
const newSearchScoring = `  const globalTagStats = React.useMemo(() => {
      const stats = {};
      const addTags = (tags) => {
          if (!Array.isArray(tags)) return;
          tags.forEach(t => { stats[t] = (stats[t] || 0) + 1; });
      };
      vocabDB.forEach(v => addTags(v.tags));
      verbDB.forEach(v => addTags(v.tags));
      customGrammars.forEach(g => addTags(g.tags));
      kanjiDB.forEach(k => addTags(k.tags));
      return stats;
  }, [vocabDB, verbDB, customGrammars, kanjiDB]);

  const globalSearchResults = React.useMemo(() => {
     if (!globalSearchTerm.trim()) return null;
     const q = globalSearchTerm.trim().toLowerCase();
     
     const scoreField = (val, query) => {
         if (!val) return 0;
         const v = val.toLowerCase();
         if (v === query) return 3;
         if (v.startsWith(query)) return 2;
         if (v.includes(query)) return 1;
         return 0;
     };

     const scoreTags = (tags, query) => {
         if (!Array.isArray(tags)) return 0;
         let max = 0;
         tags.forEach(t => {
             const lower = t.toLowerCase();
             if (lower === query) max = Math.max(max, 3);
             else if (lower.startsWith(query)) max = Math.max(max, 2);
             else if (lower.includes(query)) max = Math.max(max, 1);
         });
         return max;
     };

     const calculateScore = (titleFields, contentFields, tags) => {
         let titleScore = 0;
         for (let text of titleFields) { titleScore = Math.max(titleScore, scoreField(text, q)); }
         
         let tagScore = scoreTags(tags, q);

         let contentScore = 0;
         for (let text of contentFields) { contentScore = Math.max(contentScore, scoreField(text, q)); }

         if (titleScore > 0) return 100 + titleScore;
         if (tagScore > 0) return 50 + tagScore;
         if (contentScore > 0) return 10 + contentScore;
         return 0;
     };

     const results = { vocab: [], verb: [], grammar: [], kanji: [] };

     vocabDB.forEach(v => {
         let s = calculateScore([v.word, v.reading], [v.meaning, v.notes, v.example], v.tags);
         if (s > 0) results.vocab.push({ item: v, score: s });
     });
     verbDB.forEach(v => {
         let s = calculateScore([v.jisho], [v.meaning, v.notes], v.tags);
         if (s > 0) results.verb.push({ item: v, score: s });
     });
     customGrammars.forEach(g => {
         let s = calculateScore([g.name], [g.suffix], g.tags);
         if (s > 0) results.grammar.push({ item: g, score: s });
     });
     kanjiDB.forEach(k => {
         let s = calculateScore([k.kanji], [k.meaning], k.tags);
         if (s > 0) results.kanji.push({ item: k, score: s });
     });

     results.vocab.sort((a, b) => b.score - a.score);
     results.verb.sort((a, b) => b.score - a.score);
     results.grammar.sort((a, b) => b.score - a.score);
     results.kanji.sort((a, b) => b.score - a.score);

     return results;
  }, [globalSearchTerm, vocabDB, verbDB, customGrammars, kanjiDB]);`;

const startGS = code.indexOf('const globalSearchResults = React.useMemo(() => {');
const endGS = code.indexOf('}, [globalSearchTerm, vocabDB, verbDB, customGrammars, kanjiDB]);');
if (startGS !== -1 && endGS !== -1) {
    code = code.substring(0, startGS) + newSearchScoring + code.substring(endGS + 67);
    logs.push("globalSearchResults updated to 3-tier scoring.");
}

// ---------------------------------------------------------
// 4. Update Click Handler Navigation (include Verb and Grammar)
// ---------------------------------------------------------
const oldClickStart = code.indexOf("const handleGlobalSearchClick = (type, term) => {");
const oldClickEnd = code.indexOf("};", oldClickStart + 100);
if (oldClickStart !== -1 && oldClickEnd !== -1) {
    const oldClickFunc = code.substring(oldClickStart, oldClickEnd + 2);
    if (!oldClickFunc.includes("type === 'verb'")) {
        const newClickFunc = `const handleGlobalSearchClick = (type, term) => {
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
  };`;
        code = code.substring(0, oldClickStart) + newClickFunc + code.substring(oldClickEnd + 2);
        logs.push("Added grammar and verb routing to handleGlobalSearchClick.");
    }
}

// ---------------------------------------------------------
// 5. Update Form State Init
// ---------------------------------------------------------
code = code.replace(/useState\(\{ word: '', reading: '', meaning: '', example: '' \}\);/g, `useState({ word: '', reading: '', meaning: '', example: '', tags: [] });`);
code = code.replace(/useState\(\{ masu: '', jisho: '', te: '', meaning: '' \}\);/g, `useState({ masu: '', jisho: '', te: '', meaning: '', tags: [] });`);
code = code.replace(/useState\(\{name: '', baseForm: 'masu', suffix: '', appliesTo: \['verb'\], isImportant: false\}\);/g, `useState({name: '', baseForm: 'masu', suffix: '', appliesTo: ['verb'], isImportant: false, tags: []});`);

code = code.replace(/setVocabEditForm\(\{word: v\.word\|\|'', reading: v\.reading\|\|'', meaning: v\.meaning\|\|'', example: v\.example\|\|''\}\);/g, `setVocabEditForm({word: v.word||'', reading: v.reading||'', meaning: v.meaning||'', example: v.example||'', tags: v.tags||[]});`);
code = code.replace(/setVerbEditForm\(\{masu: v\.masu\|\|'', jisho: v\.jisho\|\|'', te: v\.te\|\|'', meaning: v\.meaning\|\|''\}\);/g, `setVerbEditForm({masu: v.masu||'', jisho: v.jisho||'', te: v.te||'', meaning: v.meaning||'', tags: v.tags||[]});`);
code = code.replace(/setGrammarEditForm\(\{ \.\.\.g \}\);/g, `setGrammarEditForm({ ...g, tags: g.tags || [] });`);

// ---------------------------------------------------------
// 6. Inject UI components into forms
// ---------------------------------------------------------
// 6.1 Vocab Table
const vocabExampleStr = '<input type="text" value={vocabEditForm.example}';
let vocabIndex = code.indexOf(vocabExampleStr);
if (vocabIndex !== -1 && !code.includes('tags={vocabEditForm.tags}')) {
    let divEndIndex = code.indexOf('</div>', vocabIndex) + 6;
    let original = code.substring(code.lastIndexOf('<div', vocabIndex), divEndIndex);
    code = code.replace(original, original + '\\n<div className="w-full mt-2 col-span-full"><TagEditor tags={vocabEditForm.tags} onChange={tags => setVocabEditForm({...vocabEditForm, tags})} tagStats={globalTagStats} /></div>');
    logs.push("Added TagEditor to Vocab");
}

// 6.2 Verb Table
const verbMeaningStr = '<input type="text" value={verbEditForm.meaning}';
let verbIndex = code.indexOf(verbMeaningStr);
if (verbIndex !== -1 && !code.includes('tags={verbEditForm.tags}')) {
    let divEndIndex = code.indexOf('</div>', verbIndex) + 6;
    let original = code.substring(code.lastIndexOf('<div', verbIndex), divEndIndex);
    // Actually insert right AFTER the div.
    code = code.substring(0, divEndIndex) + '\\n<div className="w-full mt-2 col-span-full"><TagEditor tags={verbEditForm.tags} onChange={tags => setVerbEditForm({...verbEditForm, tags})} tagStats={globalTagStats} /></div>' + code.substring(divEndIndex);
    logs.push("Added TagEditor to Verb");
}

// 6.3 Grammar Add
code = code.replace(
  /<label className="flex items-center gap-2 cursor-pointer p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">/g,
  (match, offset, str) => {
     if (str.substring(0, offset).includes("newGrammar.isImportant") && !str.substring(0, offset + 100).includes("newGrammar.tags")) {
        return `<div className="w-full mb-3"><TagEditor tags={newGrammar.tags} onChange={tags => setNewGrammar({...newGrammar, tags})} tagStats={globalTagStats} /></div>\n${match}`;
     }
     return match;
  }
);

// 6.4 Grammar Edit
code = code.replace(
  /<label className="flex items-center gap-2 cursor-pointer p-2 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors">/,
  (match) => {
     if (!code.includes("tags={grammarEditForm.tags}")) {
         return `<div className="w-full mb-3"><TagEditor tags={grammarEditForm.tags} onChange={tags => setGrammarEditForm({...grammarEditForm, tags})} tagStats={globalTagStats} /></div>\n${match}`;
     }
     return match;
  }
);

// ---------------------------------------------------------
// 7. Render Tag Pills
// ---------------------------------------------------------
if (!code.includes('{renderTags(v.tags)}')) {
    code = code.replace(
      /\{v\.word && <div className="text-slate-500 text-xs mt-0\.5 mb-1\.5">\{v\.reading\}<\/div>\}/g,
      `$&\n{renderTags(v.tags)}`
    );

    code = code.replace(
      /<div className="text-indigo-600 font-bold mb-3 pb-3 border-b border-indigo-100 flex items-center justify-between">/g,
      `{renderTags(v.tags)}\n$&`
    );

    code = code.replace(
      /<div className="text-xl font-black text-slate-800 mb-1 leading-tight">\{g\.name\}<\/div>/g,
      `$&\n{renderTags(g.tags)}`
    );

    code = code.replace(
      /<div className="text-5xl font-black text-slate-800 leading-none">\{kanji\.kanji\}<\/div>/g,
      `$&\n<div className="mt-2"><input type="text" value={(kanji.tags||[]).join(', ')} onChange={e => setKanjiDB(prev => prev.map(k => k.id === kanji.id ? {...k, tags: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)} : k))} onBlur={e => setKanjiDB(prev => prev.map(k => k.id === kanji.id ? {...k, tags: processTags(e.target.value)} : k))} placeholder="標籤(逗號分隔)" className="text-xs font-bold text-slate-400 bg-transparent outline-none w-24 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 mt-2 placeholder:text-slate-300"/></div>{renderTags(kanji.tags)}`
    );
    logs.push("Added Tag Pills.");
}

// ---------------------------------------------------------
// 8. Update List Filters for search
// ---------------------------------------------------------
const oldGrammarFilter = '{customGrammars.filter(g => !grammarFilterTag || g.tag === grammarFilterTag).sort(';
const newGrammarFilter = `{customGrammars.filter(g => {
    if (grammarFilterTag && g.tag !== grammarFilterTag) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (g.name && g.name.toLowerCase().includes(q)) || 
           (g.suffix && g.suffix.toLowerCase().includes(q)) || 
           (g.tags && g.tags.some(t => t.toLowerCase().includes(q)));
  }).sort(`;
if (code.includes(oldGrammarFilter)) {
    code = code.replace(oldGrammarFilter, newGrammarFilter);
    logs.push("Updated grammar filter.");
}

const oldVocabFilter = 'list = list.filter(v => (v.word && v.word.toLowerCase().includes(q)) || (v.reading && v.reading.toLowerCase().includes(q)) || (v.meaning && v.meaning.toLowerCase().includes(q)));';
const newVocabFilter = 'list = list.filter(v => (v.word && v.word.toLowerCase().includes(q)) || (v.reading && v.reading.toLowerCase().includes(q)) || (v.meaning && v.meaning.toLowerCase().includes(q)) || (v.tags && v.tags.some(t => t.toLowerCase().includes(q))));';
if (code.includes(oldVocabFilter)) {
    code = code.replace(oldVocabFilter, newVocabFilter);
    logs.push("Updated vocab filter.");
}

const oldVerbFilterIdx = code.indexOf('{verbDB.filter(v => !searchTerm.trim() || (v.jisho && v.jisho.toLowerCase().includes(searchTerm.toLowerCase())) || (v.meaning && v.meaning.toLowerCase().includes(searchTerm.toLowerCase()))).map((v, i) => {');
if (oldVerbFilterIdx !== -1) {
    const oldStr = '{verbDB.filter(v => !searchTerm.trim() || (v.jisho && v.jisho.toLowerCase().includes(searchTerm.toLowerCase())) || (v.meaning && v.meaning.toLowerCase().includes(searchTerm.toLowerCase()))).map((v, i) => {';
    const newStr = '{verbDB.filter(v => !searchTerm.trim() || (v.jisho && v.jisho.toLowerCase().includes(searchTerm.toLowerCase())) || (v.meaning && v.meaning.toLowerCase().includes(searchTerm.toLowerCase())) || (v.tags && v.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))).map((v, i) => {';
    code = code.replace(oldStr, newStr);
    logs.push("Updated verb filter.");
}

const oldKanjiFilter = '{kanjiDB.filter(k => k.kanji.includes(searchTerm) || (k.meaning && k.meaning.includes(searchTerm))).map(kanji => {';
const newKanjiFilter = '{kanjiDB.filter(k => k.kanji.includes(searchTerm) || (k.meaning && k.meaning.includes(searchTerm)) || (k.tags && k.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))).map(kanji => {';
if (code.includes(oldKanjiFilter)) {
    code = code.replace(oldKanjiFilter, newKanjiFilter);
    logs.push("Updated kanji filter.");
}

fs.writeFileSync('src/App.jsx', code);
console.log('MASTER SCRIPT FINISHED: \\n' + logs.join('\\n'));
