const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add state for table columns
const stateInjection = `const [verbTableColumnOrder, setVerbTableColumnOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('verbApp_verbTableColumnOrder');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  
  useEffect(() => {
    const formIds = verbForms.map(f => f.id);
    const defaultCols = ['type', 'tag', 'meaning', 'dateAdded', 'actions'];
    setVerbTableColumnOrder(prev => {
       let newOrder = [...prev].filter(id => defaultCols.includes(id) || formIds.includes(id));
       
       if (!newOrder.includes('type')) newOrder.splice(0, 0, 'type');
       if (!newOrder.includes('tag')) newOrder.splice(1, 0, 'tag');
       
       let insertIdx = newOrder.indexOf('tag') + 1;
       formIds.forEach(id => {
         if (!newOrder.includes(id)) {
             newOrder.splice(insertIdx, 0, id);
             insertIdx++;
         }
       });
       
       if (!newOrder.includes('meaning')) newOrder.push('meaning');
       if (!newOrder.includes('dateAdded')) newOrder.push('dateAdded');
       if (!newOrder.includes('actions')) newOrder.push('actions');
       
       return newOrder;
    });
  }, [verbForms]);

  useEffect(() => {
    if (verbTableColumnOrder.length > 0) {
      localStorage.setItem('verbApp_verbTableColumnOrder', JSON.stringify(verbTableColumnOrder));
    }
  }, [verbTableColumnOrder]);

  const [dragTableColIdx, setDragTableColIdx] = useState(null);
  const [dragOverTableColIdx, setDragOverTableColIdx] = useState(null);

  const colDefinitions = {
    'type': { label: '類型/群組', sortable: true },
    'tag': { label: '標籤/主題', sortable: true },
    'meaning': { label: '中文意思', sortable: true },
    'dateAdded': { label: '加入日期', sortable: true },
    'actions': { label: '操作', sortable: false }
  };
`;

if (!c.includes('const [verbTableColumnOrder, setVerbTableColumnOrder] = useState')) {
  c = c.replace(/const \[draggedFormIndex, setDraggedFormIndex\] = useState\(null\);/, stateInjection + '\n  const [draggedFormIndex, setDraggedFormIndex] = useState(null);');
}

// 2. Replace thead mapping
const oldTheadRegex = /<thead className="bg-slate-50 text-slate-600"><tr>[\s\S]*?<\/tr><\/thead>/;
const newThead = `<thead className="bg-slate-50 text-slate-600"><tr>
    {verbTableColumnOrder.map((colId, idx) => {
        const isBuiltIn = colDefinitions[colId];
        const isVerbForm = verbForms.find(f => f.id === colId);
        if (!isBuiltIn && !isVerbForm) return null;
        
        const label = isBuiltIn ? isBuiltIn.label : isVerbForm.label;
        const sortable = isBuiltIn ? isBuiltIn.sortable : false;
        
        return (
            <th key={colId} 
                draggable
                onDragStart={(e) => { setDragTableColIdx(idx); e.dataTransfer.effectAllowed = 'move'; }}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverTableColIdx(idx); }}
                onDragEnd={() => {
                    if (dragTableColIdx !== null && dragOverTableColIdx !== null && dragTableColIdx !== dragOverTableColIdx) {
                        const newOrder = [...verbTableColumnOrder];
                        const item = newOrder.splice(dragTableColIdx, 1)[0];
                        newOrder.splice(dragOverTableColIdx, 0, item);
                        setVerbTableColumnOrder(newOrder);
                    }
                    setDragTableColIdx(null);
                    setDragOverTableColIdx(null);
                }}
                className={\`p-4 whitespace-nowrap cursor-grab active:cursor-grabbing hover:bg-slate-100 transition-colors select-none \${dragTableColIdx === idx ? 'opacity-30' : ''} \${dragOverTableColIdx === idx && dragTableColIdx !== idx ? (dragTableColIdx < dragOverTableColIdx ? 'border-r-4 border-r-indigo-500' : 'border-l-4 border-l-indigo-500') : ''}\`}
                onClick={() => sortable && handleVerbSort(colId)}
            >
                <div className="flex items-center gap-1">
                   <GripHorizontal className="w-3 h-3 text-slate-300 shrink-0"/>
                   {label}{sortable && renderVerbSortIcon(colId)}
                </div>
            </th>
        );
    })}
</tr></thead>`;

c = c.replace(oldTheadRegex, newThead);

// 3. Replace tbody cells mapping
const oldCellsRegex = /<td className="p-4"><span className=\{`inline-block[^>]*>\{formatVerbType\(v\.type, v\.group\)\}<\/span><\/td>[\s\S]*?<button onClick=\{\(\)=>\{if\(window\.confirm\('確定刪除？'\)\) setVerbDB\(verbDB\.filter\(x=>x\.id!==v\.id\)\)\}\}[\s\S]*?<\/td>/;

const newCells = `{verbTableColumnOrder.map(colId => {
    if (colId === 'type') {
        return <td key={colId} className="p-4"><span className={\`inline-block px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded border-2 border-b-4 transition-transform active:border-b-2 active:translate-y-[2px] whitespace-nowrap cursor-default \${getVerbTypeStyle(v.type, v.group)}\`}>{formatVerbType(v.type, v.group)}</span></td>;
    }
    if (colId === 'tag') {
        return <td key={colId} className="p-4">
            <div className="flex items-center gap-2">
              {editingTagId === v.id ? (
                <select autoFocus onBlur={() => setEditingTagId(null)} onChange={(e) => {
                  const newTag = e.target.value;
                  setVerbDB(verbDB.map(x => x.id === v.id ? { ...x, tag: newTag } : x));
                  setEditingTagId(null);
                }} className="bg-white border border-slate-200 rounded px-2 py-1 outline-none text-xs">
                  <option value="">選擇主題</option>
                  {getAvailableThemes().map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              ) : (
                <span onClick={() => setEditingTagId(v.id)} className={\`inline-block px-2.5 py-1 text-xs font-bold rounded-lg border whitespace-nowrap cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all \${getTagStyle(v.tag)}\`}>
                  {v.tag || '無'}
                </span>
              )}
              <button onClick={() => handleRematchVerbDbTheme(v.id, v.meaning)} title="自動配對主題" className="p-1 text-slate-300 hover:text-indigo-500 transition-colors"><Sparkles className="w-4 h-4"/></button>
            </div>
        </td>;
    }
    if (colId === 'meaning') {
        return <td key={colId} className="p-4 font-bold text-slate-700">{v.meaning}</td>;
    }
    if (colId === 'dateAdded') {
        return <td key={colId} className="p-4 text-xs text-slate-400 whitespace-nowrap">{getAddedDate(v.id)}</td>;
    }
    if (colId === 'actions') {
        return <td key={colId} className="p-4 flex gap-1">
            <button onClick={()=>{setEditingVerbId(v.id); setVerbEditForm({ ...v });}} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="編輯"><Edit3 className="w-4 h-4"/></button>
            <button onClick={()=>{if(window.confirm('確定刪除？')) setVerbDB(verbDB.filter(x=>x.id!==v.id))}} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="刪除"><Trash2 className="w-4 h-4"/></button>
        </td>;
    }
    
    // Default to rendering verb form
    return <td key={colId} className="p-4 font-bold text-slate-700 whitespace-nowrap">{renderRuby(v[colId])}</td>;
})}`;

c = c.replace(oldCellsRegex, newCells);

// 4. Update colSpan in edit mode
c = c.replace(/<td colSpan=\{5 \+ verbForms\.length\} className="p-4">/g, '<td colSpan={verbTableColumnOrder.length} className="p-4">');
c = c.replace(/<td colSpan=\{7\} className="p-4">/g, '<td colSpan={verbTableColumnOrder.length} className="p-4">');

fs.writeFileSync('src/App.jsx', c);
console.log('done patch_table_column_drag');
