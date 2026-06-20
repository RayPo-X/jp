const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Add searchTerm filter to sortedVerbDB
const sortedVerbStart = code.indexOf('const sortedVerbDB = useMemo(() => {');
if (sortedVerbStart !== -1) {
    const letSortedMatch = 'let sorted = [...verbDB];';
    const letSortedIndex = code.indexOf(letSortedMatch, sortedVerbStart);
    if (letSortedIndex !== -1 && !code.substring(sortedVerbStart, sortedVerbStart + 500).includes('searchTerm.toLowerCase()')) {
        const newLetSorted = `let sorted = [...verbDB];
      if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          sorted = sorted.filter(v => 
              (v.jisho && v.jisho.toLowerCase().includes(q)) || 
              (v.meaning && v.meaning.toLowerCase().includes(q)) ||
              (v.tags && v.tags.some(t => t.toLowerCase().includes(q)))
          );
      }`;
        code = code.substring(0, letSortedIndex) + newLetSorted + code.substring(letSortedIndex + letSortedMatch.length);
        console.log("Added searchTerm filter to sortedVerbDB.");
    } else {
        console.log("sortedVerbDB already filters searchTerm.");
    }
}

// Add search bar UI to verb_manage header
const verbHeaderBar = '<div className="flex justify-between items-center mb-6">';
const verbHeaderIndex = code.indexOf(verbHeaderBar, code.indexOf("appState === 'verb_manage'"));

if (verbHeaderIndex !== -1 && !code.substring(verbHeaderIndex, verbHeaderIndex + 1000).includes('placeholder="搜尋動詞"')) {
    const h2End = code.indexOf('</h2>', verbHeaderIndex) + 5;
    const searchBarHTML = `
           <div className="relative flex-1 max-w-md mx-4">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input type="text" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="搜尋動詞/形容詞..." className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"/>
             {searchTerm && <button onClick={()=>setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><XCircle className="w-4 h-4"/></button>}
           </div>`;
    code = code.substring(0, h2End) + searchBarHTML + code.substring(h2End);
    console.log("Added search bar to verb_manage.");
} else {
    console.log("verb_manage search bar already exists or header not found.");
}

fs.writeFileSync('src/App.jsx', code);
