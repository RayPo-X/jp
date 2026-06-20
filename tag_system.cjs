const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. ProcessTags and TagEditor definition
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
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
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
            {tags.map(t => <span key={t} className="px-1.5 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-200 rounded-md">{t}</span>)}
        </div>
    );
};
`;
code = code.replace(/const getTagStyle = \(tag\) => \{/, tagHelpers + "\nconst getTagStyle = (tag) => {");

// 2. Global Tag Stats and update globalSearchResults
const newSearchStats = `const globalTagStats = React.useMemo(() => {
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

code = code.replace(/const globalSearchResults = React\.useMemo\(\(\) => \{[\s\S]*?\}, \[globalSearchTerm, vocabDB, verbDB, customGrammars, kanjiDB\]\);/, newSearchStats);

// 3. Edit Form State Initialization
code = code.replace(/const \[vocabEditForm, setVocabEditForm\] = useState\(\{ word: '', reading: '', meaning: '', example: '' \}\);/, `const [vocabEditForm, setVocabEditForm] = useState({ word: '', reading: '', meaning: '', example: '', tags: [] });`);
code = code.replace(/const \[verbEditForm, setVerbEditForm\] = useState\(\{ masu: '', jisho: '', te: '', meaning: '' \}\);/, `const [verbEditForm, setVerbEditForm] = useState({ masu: '', jisho: '', te: '', meaning: '', tags: [] });`);
code = code.replace(/const \[newGrammar, setNewGrammar\] = useState\(\{name: '', baseForm: 'masu', suffix: '', appliesTo: \['verb'\], isImportant: false\}\);/, `const [newGrammar, setNewGrammar] = useState({name: '', baseForm: 'masu', suffix: '', appliesTo: ['verb'], isImportant: false, tags: []});`);
code = code.replace(/const \[grammarEditForm, setGrammarEditForm\] = useState\(null\);/, `const [grammarEditForm, setGrammarEditForm] = useState(null);`);

// 4. Vocab Edit populating
code = code.replace(/setVocabEditForm\(\{word: v\.word\|\|'', reading: v\.reading\|\|'', meaning: v\.meaning\|\|'', example: v\.example\|\|''\}\);/, `setVocabEditForm({word: v.word||'', reading: v.reading||'', meaning: v.meaning||'', example: v.example||'', tags: v.tags||[]});`);

// 5. Verb Edit populating
code = code.replace(/setVerbEditForm\(\{masu: v\.masu\|\|'', jisho: v\.jisho\|\|'', te: v\.te\|\|'', meaning: v\.meaning\|\|''\}\);/, `setVerbEditForm({masu: v.masu||'', jisho: v.jisho||'', te: v.te||'', meaning: v.meaning||'', tags: v.tags||[]});`);

// 6. Grammar Edit populating
code = code.replace(/setGrammarEditForm\(\{ \.\.\.g \}\);/, `setGrammarEditForm({ ...g, tags: g.tags || [] });`);


// 7. Inject TagEditor UI in Vocab
code = code.replace(
  /<div className="flex-1">\r?\n\s*<label className="block text-xs font-bold text-amber-600 mb-1 ml-1">例句 \(選填\)<\/label>\r?\n\s*<input type="text" value=\{vocabEditForm\.example\}[\s\S]*?<\/div>/,
  `$&
                                 <div className="w-full mt-2">
                                    <TagEditor tags={vocabEditForm.tags} onChange={tags => setVocabEditForm({...vocabEditForm, tags})} tagStats={globalTagStats} />
                                 </div>`
);

// 8. Inject TagEditor UI in Verb
code = code.replace(
  /<div className="flex-1 min-w-\[120px\]">\r?\n\s*<label className="block text-xs font-bold text-indigo-600 mb-1 ml-1">中文解釋<\/label>\r?\n\s*<input type="text" value=\{verbEditForm\.meaning\}[\s\S]*?<\/div>/,
  `$&
                                 <div className="w-full mt-2">
                                    <TagEditor tags={verbEditForm.tags} onChange={tags => setVerbEditForm({...verbEditForm, tags})} tagStats={globalTagStats} />
                                 </div>`
);

// 9. Inject TagEditor UI in Grammar Add
code = code.replace(
  /<label className="flex items-center gap-2 cursor-pointer p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">/,
  `<div className="mb-4">
                        <TagEditor tags={newGrammar.tags} onChange={tags => setNewGrammar({...newGrammar, tags})} tagStats={globalTagStats} />
                    </div>\n                    $&`
);

// 10. Inject TagEditor UI in Grammar Edit
code = code.replace(
  /<label className="flex items-center gap-2 cursor-pointer p-2 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors">/,
  `<div className="mb-4">
                        <TagEditor tags={grammarEditForm.tags} onChange={tags => setGrammarEditForm({...grammarEditForm, tags})} tagStats={globalTagStats} />
                    </div>\n                    $&`
);

// 11. Add display pills to lists
// Vocab
code = code.replace(
  /\{v\.word && <div className="text-slate-500 text-xs mt-0\.5 mb-1\.5">\{v\.reading\}<\/div>\}/,
  `$&
                                  {renderTags(v.tags)}`
);

// Verb
code = code.replace(
  /<div className="text-indigo-600 font-bold mb-3 pb-3 border-b border-indigo-100 flex items-center justify-between">/,
  `{renderTags(v.tags)}\n$&`
);

// Grammar
code = code.replace(
  /<div className="text-xl font-black text-slate-800 mb-1 leading-tight">\{g\.name\}<\/div>/,
  `$&
                    {renderTags(g.tags)}`
);

// Kanji card
code = code.replace(
  /<div className="text-5xl font-black text-slate-800 leading-none">\{kanji\.kanji\}<\/div>/,
  `$&
                                 <div className="mt-2">
                                    <input type="text" value={(kanji.tags||[]).join(', ')} onChange={e => setKanjiDB(prev => prev.map(k => k.id === kanji.id ? {...k, tags: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)} : k))} onBlur={e => setKanjiDB(prev => prev.map(k => k.id === kanji.id ? {...k, tags: processTags(e.target.value)} : k))} placeholder="標籤(逗號分隔)" className="text-xs font-bold text-slate-400 bg-transparent outline-none w-24 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 mt-2 placeholder:text-slate-300"/>
                                 </div>
                                 {renderTags(kanji.tags)}`
);

// 12. Update search filters to include tags
// Vocab Manage
code = code.replace(
  /list = list\.filter\(v => \(v\.word && v\.word\.toLowerCase\(\)\.includes\(q\)\) \|\| \(v\.reading && v\.reading\.toLowerCase\(\)\.includes\(q\)\) \|\| \(v\.meaning && v\.meaning\.toLowerCase\(\)\.includes\(q\)\)\);/,
  `list = list.filter(v => (v.word && v.word.toLowerCase().includes(q)) || (v.reading && v.reading.toLowerCase().includes(q)) || (v.meaning && v.meaning.toLowerCase().includes(q)) || (v.tags && v.tags.some(t => t.toLowerCase().includes(q))));`
);
// Verb Manage
code = code.replace(
  /\{verbDB\.filter\(v => !searchTerm\.trim\(\) \|\| \(v\.jisho && v\.jisho\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\)\) \|\| \(v\.meaning && v\.meaning\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\)\)\)\.map\(\(v, i\) => \{/,
  `{verbDB.filter(v => !searchTerm.trim() || (v.jisho && v.jisho.toLowerCase().includes(searchTerm.toLowerCase())) || (v.meaning && v.meaning.toLowerCase().includes(searchTerm.toLowerCase())) || (v.tags && v.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))).map((v, i) => {`
);
// Grammar Manage
code = code.replace(
  /\{customGrammars\.filter\(g => !searchTerm\.trim\(\) \|\| \(g\.name && g\.name\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\)\) \|\| \(g\.suffix && g\.suffix\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\)\)\)\.map\(\(g, idx\) => \{/,
  `{customGrammars.filter(g => !searchTerm.trim() || (g.name && g.name.toLowerCase().includes(searchTerm.toLowerCase())) || (g.suffix && g.suffix.toLowerCase().includes(searchTerm.toLowerCase())) || (g.tags && g.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))).map((g, idx) => {`
);
// Kanji Manage
code = code.replace(
  /\{kanjiDB\.filter\(k => k\.kanji\.includes\(searchTerm\) \|\| \(k\.meaning && k\.meaning\.includes\(searchTerm\)\)\)\.map\(kanji => \{/,
  `{kanjiDB.filter(k => k.kanji.includes(searchTerm) || (k.meaning && k.meaning.includes(searchTerm)) || (k.tags && k.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))).map(kanji => {`
);


fs.writeFileSync('src/App.jsx', code);
console.log('Update tag script prepared.');
