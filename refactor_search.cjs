const fs = require('fs');

let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Extract Global Search and remove it from App.jsx, inject <GlobalSearch ... />
const heroStart = code.indexOf('{/* Hero Header */}');
const twoColStart = code.indexOf('{/* Two Column Layout */}');
const searchComponentImport = "import GlobalSearch from './components/GlobalSearch/GlobalSearch';\\n";

if (!code.includes('import GlobalSearch from')) {
    const importPos = code.indexOf('import {');
    code = code.substring(0, importPos) + searchComponentImport + code.substring(importPos);
}

if (heroStart !== -1 && twoColStart !== -1) {
    const originalHeroSection = code.substring(heroStart, twoColStart);
    // Remove the Global Search inline code.
    const newHeroSection = `            {/* Hero Header */}
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
              <GlobalSearch 
                  globalSearchTerm={globalSearchTerm} 
                  setGlobalSearchTerm={setGlobalSearchTerm} 
                  showGlobalSearch={showGlobalSearch} 
                  setShowGlobalSearch={setShowGlobalSearch} 
                  recentSearches={recentSearches} 
                  setRecentSearches={setRecentSearches} 
                  globalSearchResults={globalSearchResults} 
                  handleGlobalSearchClick={handleGlobalSearchClick} 
                  renderTags={renderTags} 
              />

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
    code = code.replace(originalHeroSection, newHeroSection);
}

// 2. Add targetId state and logic
if (!code.includes('const [targetId, setTargetId]')) {
    code = code.replace("const [globalSearchTerm, setGlobalSearchTerm] = useState('');", "const [globalSearchTerm, setGlobalSearchTerm] = useState('');\\n  const [targetId, setTargetId] = useState(null);");
}

if (!code.includes('useEffect(() => { if (targetId) {')) {
    const effectInjection = `  useEffect(() => {
    if (targetId) {
        const timer = setTimeout(() => {
            const el = document.getElementById('item-' + targetId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [targetId, appState, vocabManageTab]);`;
    code = code.replace("const [appState, setAppState] = useState('home');", effectInjection + "\\n  const [appState, setAppState] = useState('home');");
}

// 3. Update handleGlobalSearchClick
const oldClickHandlerRegex = /const handleGlobalSearchClick = \\(type, term\\) => \\{[\\s\\S]*?if \\(type === 'grammar'\\) \\{[\\s\\S]*?setAppState\\('grammar_manage'\\);\\s*\\}\\s*\\};/m;
const newClickHandler = `const handleGlobalSearchClick = (type, term, id) => {
      setRecentSearches(prev => [term, ...prev.filter(t => t !== term)].slice(0, 10));
      setShowGlobalSearch(false);
      setGlobalSearchTerm('');
      
      setSearchTerm(term);
      setTargetId(id);

      if (type === 'vocab') {
         setVocabManageTab('vocab');
         setAppState('vocab_manage');
      } else if (type === 'kanji') {
         setVocabManageTab('kanji');
         setAppState('vocab_manage');
      } else if (type === 'verb') {
         setAppState('verb_manage');
      } else if (type === 'grammar') {
         setAppState('grammar_manage');
      }
  };`;
// Actually, earlier the click handler had signature (type, term). Let's use string indexOf to be safe!
const oldClickStart = code.indexOf("const handleGlobalSearchClick = (type, term) => {");
if (oldClickStart !== -1) {
    const oldClickEnd = code.indexOf("};", oldClickStart + 100);
    code = code.substring(0, oldClickStart) + newClickHandler + code.substring(oldClickEnd + 2);
} else {
    console.log("Could not find handleGlobalSearchClick to replace!");
}

// 4. Clear targetId on manual search
code = code.replace(/setSearchTerm\\(e.target.value\\)/g, "setSearchTerm(e.target.value); setTargetId(null);");
code = code.replace(/setSearchTerm\\(\\'\\'\\)/g, "setSearchTerm(''); setTargetId(null);");

// 5. Inject ID and Highlight into mapped elements using simple string replace with string primitives
code = code.replace(
    '<tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">', 
    '<tr key={v.id} id={"item-" + v.id} className={"border-b border-slate-50 hover:bg-slate-50/50 transition-colors " + (targetId === v.id ? "bg-amber-100 ring-2 ring-amber-400" : "")}>'
);

// We need a global replace since vocab_manage and verb_manage both use this TR structure
code = code.split('<tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">').join(
    '<tr key={v.id} id={"item-" + v.id} className={"border-b border-slate-50 hover:bg-slate-50/50 transition-colors " + (targetId === v.id ? "bg-amber-100 ring-2 ring-amber-400" : "")}>'
);

code = code.replace(
    '<div key={g.id} className="p-5 bg-white border border-slate-200 rounded-2xl flex justify-between items-center shadow-sm hover:border-emerald-300 transition-colors">',
    '<div key={g.id} id={"item-" + g.id} className={"p-5 bg-white border border-slate-200 rounded-2xl flex justify-between items-center shadow-sm hover:border-emerald-300 transition-colors " + (targetId === g.id ? "bg-emerald-100 ring-2 ring-emerald-500" : "")}>'
);

code = code.replace(
    '<div key={kanji.id} className="bg-slate-50 border border-slate-200 rounded-3xl p-5 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col h-72">',
    '<div key={kanji.id} id={"item-" + kanji.id} className={"bg-slate-50 border border-slate-200 rounded-3xl p-5 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col h-72 " + (targetId === kanji.id ? "bg-indigo-100 ring-2 ring-indigo-500" : "")}>'
);

fs.writeFileSync('src/App.jsx', code);
console.log("App.jsx refactoring completed.");
