const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// 1. colDefinitions update
const colDefStr = `const colDefinitions = {
    'type': { label: '類型/群組', sortable: true },
    'tag': { label: '標籤/主題', sortable: true },
    'meaning': { label: '中文意思', sortable: true },
    'dateAdded': { label: '加入日期', sortable: true },
    'actions': { label: '操作', sortable: false }
  };`;
const newColDefStr = `const colDefinitions = {
    'isImportant': { label: '重要(⭐)', sortable: true },
    'type': { label: '類型/群組', sortable: true },
    'tag': { label: '標籤/主題', sortable: true },
    'meaning': { label: '中文意思', sortable: true },
    'dateAdded': { label: '加入日期', sortable: true },
    'actions': { label: '操作', sortable: false }
  };`;
c = c.replace(colDefStr, newColDefStr);

// 2. verbTableColumnOrder state initialization
const verbTableOrderStr = `const [verbTableColumnOrder, setVerbTableColumnOrder] = useState(() => {
    const saved = localStorage.getItem('verbApp_verbTableColumnOrder');
    if (saved) return JSON.parse(saved);
    return ['type', 'tag', 'jisho', 'meaning', 'dateAdded', 'actions'];
  });`;
const newVerbTableOrderStr = `const [verbTableColumnOrder, setVerbTableColumnOrder] = useState(() => {
    const saved = localStorage.getItem('verbApp_verbTableColumnOrder');
    if (saved) {
       let arr = JSON.parse(saved);
       if (!arr.includes('isImportant')) arr = ['isImportant', ...arr];
       return arr;
    }
    return ['isImportant', 'type', 'tag', 'jisho', 'meaning', 'dateAdded', 'actions'];
  });`;
c = c.replace(verbTableOrderStr, newVerbTableOrderStr);

// 3. verbSortConfig logic update
const verbSortStr = `case 'tag': aVal = a.tag || ''; bVal = b.tag || ''; break;`;
const newVerbSortStr = `case 'tag': aVal = a.tag || ''; bVal = b.tag || ''; break;
        case 'isImportant': aVal = a.isImportant ? 1 : 0; bVal = b.isImportant ? 1 : 0; break;`;
c = c.replace(verbSortStr, newVerbSortStr);

// 4. verb td rendering updates
const verbActionsStr = `if (colId === 'actions') {
        return <td key={colId} className="p-4 flex gap-1">
            <button onClick={()=>{setEditingVerbId(v.id); setVerbEditForm({ ...v });}} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="編輯"><Edit3 className="w-4 h-4"/></button>
            <button onClick={() => setVerbDB(prev => prev.map(x => x.id === v.id ? { ...x, isImportant: !x.isImportant } : x))} className={\`p-2 rounded-lg transition-colors \${v.isImportant ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}\`} title="標記為重要"><Star className={\`w-4 h-4 \${v.isImportant ? 'fill-current' : ''}\`}/></button>
                             <button onClick={()=>{if(window.confirm('確定刪除？')) setVerbDB(verbDB.filter(x=>x.id!==v.id))}} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="刪除"><Trash2 className="w-4 h-4"/></button>
        </td>;
    }`;
const newVerbActionsStr = `if (colId === 'isImportant') {
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
c = c.replace(verbActionsStr, newVerbActionsStr);

fs.writeFileSync('src/App.jsx', c);
console.log('done patch verb part');
