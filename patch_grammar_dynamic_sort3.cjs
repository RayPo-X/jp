const fs = require('fs');
let lines = fs.readFileSync('src/App.jsx', 'utf8').split(/\r?\n/);

let changed = 0;

// Target 1: Render Map Sort
const targetRenderLine = "                    {customGrammars.filter(g => !grammarFilterTag || g.tag === grammarFilterTag).sort((a, b) => (a.isImportant === b.isImportant ? 0 : a.isImportant ? -1 : 1)).map(g => (";
const newRenderLine = `                    {customGrammars.filter(g => !grammarFilterTag || g.tag === grammarFilterTag).sort((a, b) => {
                        if (grammarSortConfig.key === 'isImportant') {
                            const valA = a.isImportant ? 1 : 0;
                            const valB = b.isImportant ? 1 : 0;
                            if (valA !== valB) {
                                return grammarSortConfig.direction === 'desc' ? valB - valA : valA - valB;
                            }
                        }
                        return 0;
                    }).map(g => (`;

for (let i = 0; i < lines.length; i++) {
    if (lines[i] === targetRenderLine) {
        lines[i] = newRenderLine;
        changed++;
        break;
    }
}

// Target 2: Filter and Sort UI
const targetUiBlockStartLine = `                         <select value={grammarFilterTag} onChange={e => setGrammarFilterTag(e.target.value)} className="p-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-emerald-400 text-slate-600">`;
for (let i = 0; i < lines.length; i++) {
    if (lines[i] === targetUiBlockStartLine) {
        const newUiBlock = `                         <div className="flex items-center gap-2">
                           <select value={grammarFilterTag} onChange={e => setGrammarFilterTag(e.target.value)} className="p-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-emerald-400 text-slate-600">
                             <option value="">所有分類</option>
                             {Array.from(new Set(customGrammars.map(g => g.tag))).filter(Boolean).map(tag => <option key={tag} value={tag}>{tag}</option>)}
                           </select>
                           <button 
                             onClick={() => {
                                 setGrammarSortConfig(prev => {
                                     if (prev.key !== 'isImportant') return { key: 'isImportant', direction: 'desc' };
                                     if (prev.direction === 'desc') return { key: 'isImportant', direction: 'asc' };
                                     return { key: null, direction: null };
                                 });
                             }} 
                             className={\`p-2 border rounded-lg text-sm font-bold flex items-center gap-1 transition-colors \${grammarSortConfig.key === 'isImportant' ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-600'}\`}
                             title="依照重要標記排序"
                           >
                             <Star className={\`w-4 h-4 \${grammarSortConfig.key === 'isImportant' ? 'fill-current' : ''}\`}/> 
                             {grammarSortConfig.key === 'isImportant' ? (grammarSortConfig.direction === 'desc' ? '遞減' : '遞增') : '排序'}
                           </button>
                         </div>`;
        lines.splice(i, 4, newUiBlock);
        changed++;
        break;
    }
}

// Target 3: State Declaration
const stateTargetLine = "  const [grammarFilterTag, setGrammarFilterTag] = useState('');";
for (let i = 0; i < lines.length; i++) {
    if (lines[i] === stateTargetLine) {
        lines.splice(i, 0, "  const [grammarSortConfig, setGrammarSortConfig] = useState({ key: null, direction: null });");
        changed++;
        break;
    }
}

console.log("Made " + changed + " changes.");
fs.writeFileSync('src/App.jsx', lines.join('\r\n'));
