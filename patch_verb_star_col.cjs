const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// 1. colDefinitions update
const colDefRegex = /const colDefinitions = \{/;
c = c.replace(colDefRegex, `const colDefinitions = {\n    'isImportant': { label: '重要(⭐)', sortable: true },`);

// 2. verbTableColumnOrder state initialization
const verbTableOrderRegex = /const \[verbTableColumnOrder, setVerbTableColumnOrder\] = useState\(\(\) => \{\s*const saved = localStorage\.getItem\('verbApp_verbTableColumnOrder'\);\s*if \(saved\) return JSON\.parse\(saved\);\s*return \['type', 'tag', 'jisho', 'meaning', 'dateAdded', 'actions'\];\s*\}\);/;
const verbTableOrderReplace = `const [verbTableColumnOrder, setVerbTableColumnOrder] = useState(() => {
    const saved = localStorage.getItem('verbApp_verbTableColumnOrder');
    if (saved) {
       let arr = JSON.parse(saved);
       if (!arr.includes('isImportant')) arr = ['isImportant', ...arr];
       return arr;
    }
    return ['isImportant', 'type', 'tag', 'jisho', 'meaning', 'dateAdded', 'actions'];
  });`;
c = c.replace(verbTableOrderRegex, verbTableOrderReplace);

// 3. verbSortConfig logic update
const verbSortRegex = /case 'tag': aVal = a\.tag \|\| ''; bVal = b\.tag \|\| ''; break;/;
const verbSortReplace = `case 'tag': aVal = a.tag || ''; bVal = b.tag || ''; break;
        case 'isImportant': aVal = a.isImportant ? 1 : 0; bVal = b.isImportant ? 1 : 0; break;`;
c = c.replace(verbSortRegex, verbSortReplace);

// 4. verb td rendering updates
const verbActionsRegex = /if \(colId === 'actions'\) \{\s*return <td key=\{colId\} className="p-4 flex gap-1">\s*<button onClick=\{\(\)=>\{setEditingVerbId\(v\.id\); setVerbEditForm(\{ \.\.\.v \}\);\}\} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="編輯"><Edit3 className="w-4 h-4"\/><\/button>\s*<button onClick=\{\(\) => setVerbDB\(prev => prev\.map\(x => x\.id === v\.id \? \{ \.\.\.x, isImportant: !x\.isImportant \} : x\)\)\} className=\{`p-2 rounded-lg transition-colors \$\{v\.isImportant \? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'\}`\} title="標記為重要"><Star className=\{`w-4 h-4 \$\{v\.isImportant \? 'fill-current' : ''\}`\}\/><\/button>\s*<button onClick=\{\(\)=>\{if\(window\.confirm\('確定刪除？'\)\) setVerbDB\(verbDB\.filter\(x=>x\.id!==v\.id\)\)\}\} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="刪除"><Trash2 className="w-4 h-4"\/><\/button>\s*<\/td>;\s*\}/;

const verbActionsReplace = `if (colId === 'isImportant') {
        return <td key={colId} className="p-4 text-center">
            <button onClick={() => setVerbDB(prev => prev.map(x => x.id === v.id ? { ...x, isImportant: !x.isImportant } : x))} className={\`p-2 rounded-lg transition-colors \${v.isImportant ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}\`} title="標記為重要"><Star className={\`w-4 h-4 \${v.isImportant ? 'fill-current' : ''}\`}/></button>
        </td>;
    }
    if (colId === 'actions') {
        return <td key={colId} className="p-4 flex gap-1">
            <button onClick={()=>{setEditingVerbId(v.id); setVerbEditForm({ ...v });}} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="編輯"><Edit3 className="w-4 h-4"/></button>
            <button onClick={()=>{if(window.confirm('確定刪除？')) setVerbDB(verbDB.filter(x=>x.id!==v.id))}} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="刪除"><Trash2 className="w-4 h-4"/></button>
        </td>;
    }`;
c = c.replace(verbActionsRegex, verbActionsReplace);

fs.writeFileSync('src/App.jsx', c);
console.log('done patch phase 1');
