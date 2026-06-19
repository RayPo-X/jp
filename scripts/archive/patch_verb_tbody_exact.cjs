const fs = require('fs');
let lines = fs.readFileSync('src/App.jsx', 'utf8').split('\n');

const newTbodyStr = `                          {verbTableColumnOrder.map(colId => {
    if (colId === 'isImportant') {
        return <td key={colId} className="p-4 text-center">
            <button onClick={() => setVerbDB(prev => prev.map(x => x.id === v.id ? { ...x, isImportant: !x.isImportant } : x))} className={\`p-2 rounded-lg transition-colors \${v.isImportant ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}\`} title="標記為重要"><Star className={\`w-4 h-4 \${v.isImportant ? 'fill-current' : ''}\`}/></button>
        </td>;
    }
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
    if (colId === 'masu' && (v.type === 'adj_i' || v.type === 'adj_na')) {
        return <td key={colId} className="p-4 font-bold text-slate-300 whitespace-nowrap">-</td>;
    }
    return <td key={colId} className="p-4 font-bold text-slate-700 whitespace-nowrap">{renderRuby(v[colId])}</td>;
})}`;

lines.splice(3219, 45, newTbodyStr);
fs.writeFileSync('src/App.jsx', lines.join('\n'));
console.log('done patch verb tbody exact');
