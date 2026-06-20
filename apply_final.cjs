const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');
const logs = [];

// ---------------------------------------------------------
// 2. Insert Tag System UI & Logic (TagEditor, renderTags)
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
if(!code.includes("const TagEditor =")) {
    code = code.replace(/const getTagStyle = \(tag\) => \{/, tagHelpers + "\nconst getTagStyle = (tag) => {");
    logs.push("Injected Tag helpers.");
}

// ---------------------------------------------------------
// 3. Fix globalSearchResults scoring (Title > Tag > Content)
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

code = code.replace(/const globalSearchResults = React\.useMemo\(\(\) => \{[\s\S]*?\}, \[globalSearchTerm, vocabDB, verbDB, customGrammars, kanjiDB\]\);/, newSearchScoring);
logs.push("globalSearchResults updated to 3-tier scoring.");

// ---------------------------------------------------------
// 4. Edit Form States
// ---------------------------------------------------------
code = code.replace(/const \[vocabEditForm, setVocabEditForm\] = useState\(\{ word: '', reading: '', meaning: '', example: '' \}\);/, `const [vocabEditForm, setVocabEditForm] = useState({ word: '', reading: '', meaning: '', example: '', tags: [] });`);
code = code.replace(/const \[verbEditForm, setVerbEditForm\] = useState\(\{ masu: '', jisho: '', te: '', meaning: '' \}\);/, `const [verbEditForm, setVerbEditForm] = useState({ masu: '', jisho: '', te: '', meaning: '', tags: [] });`);
code = code.replace(/const \[newGrammar, setNewGrammar\] = useState\(\{name: '', baseForm: 'masu', suffix: '', appliesTo: \['verb'\], isImportant: false\}\);/, `const [newGrammar, setNewGrammar] = useState({name: '', baseForm: 'masu', suffix: '', appliesTo: ['verb'], isImportant: false, tags: []});`);

// Update edit form assignments
code = code.replace(/setVocabEditForm\(\{word: v\.word\|\|'', reading: v\.reading\|\|'', meaning: v\.meaning\|\|'', example: v\.example\|\|''\}\);/, `setVocabEditForm({word: v.word||'', reading: v.reading||'', meaning: v.meaning||'', example: v.example||'', tags: v.tags||[]});`);
code = code.replace(/setVerbEditForm\(\{masu: v\.masu\|\|'', jisho: v\.jisho\|\|'', te: v\.te\|\|'', meaning: v\.meaning\|\|''\}\);/, `setVerbEditForm({masu: v.masu||'', jisho: v.jisho||'', te: v.te||'', meaning: v.meaning||'', tags: v.tags||[]});`);
code = code.replace(/setGrammarEditForm\(\{ \.\.\.g \}\);/, `setGrammarEditForm({ ...g, tags: g.tags || [] });`);

// ---------------------------------------------------------
// 5. Inject TagEditor UI in Tables
// ---------------------------------------------------------

// 5.1 Vocab Table
// Use index finding for absolute robustness instead of Regex since the HTML might vary in space chars.
const vocabExampleStr = '<input type="text" value={vocabEditForm.example}';
let vocabIndex = code.indexOf(vocabExampleStr);
if (vocabIndex !== -1) {
    let divEndIndex = code.indexOf('</div>', vocabIndex) + 6;
    let original = code.substring(code.lastIndexOf('<div', vocabIndex), divEndIndex);
    code = code.replace(original, original + '\n<div className="w-full mt-2 col-span-full"><TagEditor tags={vocabEditForm.tags} onChange={tags => setVocabEditForm({...vocabEditForm, tags})} tagStats={globalTagStats} /></div>');
}

// 5.2 Verb Table
const verbMeaningStr = '<input type="text" value={verbEditForm.meaning}';
let verbIndex = code.indexOf(verbMeaningStr);
if (verbIndex !== -1) {
    let divEndIndex = code.indexOf('</div>', verbIndex) + 6;
    let original = code.substring(code.lastIndexOf('<div', verbIndex), divEndIndex);
    code = code.replace(original, original + '\n<div className="w-full mt-2 col-span-full"><TagEditor tags={verbEditForm.tags} onChange={tags => setVerbEditForm({...verbEditForm, tags})} tagStats={globalTagStats} /></div>');
}

// 5.3 Grammar Add
code = code.replace(
  /<label className="flex items-center gap-2 cursor-pointer p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">/g,
  (match, offset, str) => {
     if (str.substring(0, offset).includes("newGrammar.isImportant") && !str.substring(0, offset).includes("newGrammar.tags")) {
        return `<div className="w-full mb-3"><TagEditor tags={newGrammar.tags} onChange={tags => setNewGrammar({...newGrammar, tags})} tagStats={globalTagStats} /></div>\n${match}`;
     }
     return match;
  }
);

// 5.4 Grammar Edit
code = code.replace(
  /<label className="flex items-center gap-2 cursor-pointer p-2 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors">/,
  `<div className="w-full mb-3"><TagEditor tags={grammarEditForm.tags} onChange={tags => setGrammarEditForm({...grammarEditForm, tags})} tagStats={globalTagStats} /></div>\n$&`
);

// ---------------------------------------------------------
// 6. Display Pills in Lists
// ---------------------------------------------------------
// Vocab
code = code.replace(
  /\{v\.word && <div className="text-slate-500 text-xs mt-0\.5 mb-1\.5">\{v\.reading\}<\/div>\}/g,
  `$&\n{renderTags(v.tags)}`
);

// Verb
code = code.replace(
  /<div className="text-indigo-600 font-bold mb-3 pb-3 border-b border-indigo-100 flex items-center justify-between">/g,
  `{renderTags(v.tags)}\n$&`
);

// Grammar
code = code.replace(
  /<div className="text-xl font-black text-slate-800 mb-1 leading-tight">\{g\.name\}<\/div>/g,
  `$&\n{renderTags(g.tags)}`
);

// Kanji card
code = code.replace(
  /<div className="text-5xl font-black text-slate-800 leading-none">\{kanji\.kanji\}<\/div>/g,
  `$&\n<div className="mt-2"><input type="text" value={(kanji.tags||[]).join(', ')} onChange={e => setKanjiDB(prev => prev.map(k => k.id === kanji.id ? {...k, tags: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)} : k))} onBlur={e => setKanjiDB(prev => prev.map(k => k.id === kanji.id ? {...k, tags: processTags(e.target.value)} : k))} placeholder="標籤(逗號分隔)" className="text-xs font-bold text-slate-400 bg-transparent outline-none w-24 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 mt-2 placeholder:text-slate-300"/></div>{renderTags(kanji.tags)}`
);

// ---------------------------------------------------------
// 7. Fix Grammar Search Filter to include tags and searchTerm properly
// ---------------------------------------------------------
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

// Vocab Search filter update
code = code.replace(
  /list = list\.filter\(v => \(v\.word && v\.word\.toLowerCase\(\)\.includes\(q\)\) \|\| \(v\.reading && v\.reading\.toLowerCase\(\)\.includes\(q\)\) \|\| \(v\.meaning && v\.meaning\.toLowerCase\(\)\.includes\(q\)\)\);/,
  `list = list.filter(v => (v.word && v.word.toLowerCase().includes(q)) || (v.reading && v.reading.toLowerCase().includes(q)) || (v.meaning && v.meaning.toLowerCase().includes(q)) || (v.tags && v.tags.some(t => t.toLowerCase().includes(q))));`
);

// Verb search filter update
code = code.replace(
  /\{verbDB\.filter\(v => !searchTerm\.trim\(\) \|\| \(v\.jisho && v\.jisho\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\)\) \|\| \(v\.meaning && v\.meaning\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\)\)\)\.map\(\(v, i\) => \{/,
  `{verbDB.filter(v => !searchTerm.trim() || (v.jisho && v.jisho.toLowerCase().includes(searchTerm.toLowerCase())) || (v.meaning && v.meaning.toLowerCase().includes(searchTerm.toLowerCase())) || (v.tags && v.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))).map((v, i) => {`
);

// Kanji search filter update
code = code.replace(
  /\{kanjiDB\.filter\(k => k\.kanji\.includes\(searchTerm\) \|\| \(k\.meaning && k\.meaning\.includes\(searchTerm\)\)\)\.map\(kanji => \{/,
  `{kanjiDB.filter(k => k.kanji.includes(searchTerm) || (k.meaning && k.meaning.includes(searchTerm)) || (k.tags && k.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))).map(kanji => {`
);


fs.writeFileSync('src/App.jsx', code);
console.log('Final fix applied: \n' + logs.join('\n'));
