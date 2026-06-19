const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// 1. vocabColDefinitions
const colDefStr = `const colDefinitions = {`;
const newVocabColDefStr = `const vocabColDefinitions = {
    'isImportant': { label: '重要(⭐)', sortable: true },
    'tag': { label: '主題標籤', sortable: true },
    'type': { label: '類型', sortable: true },
    'word': { label: '單字(平假名)', sortable: true },
    'meaning': { label: '中文/例句', sortable: true },
    'status': { label: '熟練度', sortable: true },
    'dateAdded': { label: '加入日期', sortable: true },
    'nextReview': { label: '下次複習', sortable: true },
    'actions': { label: '操作', sortable: false }
  };
  const colDefinitions = {`;
c = c.replace(colDefStr, newVocabColDefStr);

// 2. State variables
const vocabStatesStr = `const [verbTableColumnOrder, setVerbTableColumnOrder] = useState(() => {`;
const newVocabStatesStr = `const [vocabTableColumnOrder, setVocabTableColumnOrder] = useState(() => {
    const saved = localStorage.getItem('verbApp_vocabTableColumnOrder');
    if (saved) {
       let arr = JSON.parse(saved);
       if (!arr.includes('isImportant')) arr = ['isImportant', ...arr];
       return arr;
    }
    return ['isImportant', 'tag', 'type', 'word', 'meaning', 'status', 'dateAdded', 'nextReview', 'actions'];
  });
  const [dragVocabColIdx, setDragVocabColIdx] = useState(null);
  const [dragOverVocabColIdx, setDragOverVocabColIdx] = useState(null);
  
  const [verbTableColumnOrder, setVerbTableColumnOrder] = useState(() => {`;
c = c.replace(vocabStatesStr, newVocabStatesStr);

// 3. useEffect for saving vocabTableColumnOrder
const verbUseEffectStr = `if (verbTableColumnOrder.length > 0) {
      localStorage.setItem('verbApp_verbTableColumnOrder', JSON.stringify(verbTableColumnOrder));
    }
  }, [verbTableColumnOrder]);`;
const newVerbUseEffectStr = `if (verbTableColumnOrder.length > 0) {
      localStorage.setItem('verbApp_verbTableColumnOrder', JSON.stringify(verbTableColumnOrder));
    }
  }, [verbTableColumnOrder]);

  useEffect(() => {
    if (vocabTableColumnOrder.length > 0) {
      localStorage.setItem('verbApp_vocabTableColumnOrder', JSON.stringify(vocabTableColumnOrder));
    }
  }, [vocabTableColumnOrder]);`;
c = c.replace(verbUseEffectStr, newVerbUseEffectStr);

// 4. Update the thead in vocab_manage
const vocabTheadStr = `<thead className="bg-slate-50 text-slate-600"><tr>
                    <th className="p-4 rounded-tl-xl cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('tag')}>主題標籤{renderSortIcon('tag')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('type')}>類型{renderSortIcon('type')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('word')}>單字 (平假名){renderSortIcon('word')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('meaning')}>中文 / 例句{renderSortIcon('meaning')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('status')}>熟練度{renderSortIcon('status')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('dateAdded')}>加入日期{renderSortIcon('dateAdded')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('nextReview')}>下次複習{renderSortIcon('nextReview')}</th>
                    <th className="p-4 rounded-tr-xl">操作</th>
                 </tr></thead>`;
const newVocabTheadStr = `<thead className="bg-slate-50 text-slate-600"><tr>
                    {vocabTableColumnOrder.map((colId, idx) => {
                        const def = vocabColDefinitions[colId];
                        if (!def) return null;
                        return (
                            <th key={colId} 
                                draggable
                                onDragStart={(e) => { setDragVocabColIdx(idx); e.dataTransfer.effectAllowed = 'move'; }}
                                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverVocabColIdx(idx); }}
                                onDragEnd={() => {
                                    if (dragVocabColIdx !== null && dragOverVocabColIdx !== null && dragVocabColIdx !== dragOverVocabColIdx) {
                                        const newOrder = [...vocabTableColumnOrder];
                                        const item = newOrder.splice(dragVocabColIdx, 1)[0];
                                        newOrder.splice(dragOverVocabColIdx, 0, item);
                                        setVocabTableColumnOrder(newOrder);
                                    }
                                    setDragVocabColIdx(null);
                                    setDragOverVocabColIdx(null);
                                }}
                                className={\`p-4 whitespace-nowrap cursor-grab active:cursor-grabbing hover:bg-slate-100 transition-colors select-none \${dragVocabColIdx === idx ? 'opacity-30' : ''} \${dragOverVocabColIdx === idx && dragVocabColIdx !== idx ? (dragVocabColIdx < dragOverVocabColIdx ? 'border-r-4 border-r-amber-500' : 'border-l-4 border-l-amber-500') : ''}\`}
                                onClick={() => def.sortable && handleSort(colId)}
                            >
                                <div className="flex items-center gap-1">
                                   <GripHorizontal className="w-3 h-3 text-slate-300 shrink-0"/>
                                   {def.label}{def.sortable && renderSortIcon(colId)}
                                </div>
                            </th>
                        );
                    })}
                 </tr></thead>`;
c = c.replace(vocabTheadStr, newVocabTheadStr);

// 5. Update tbody and colSpan
c = c.replace(/colSpan=\{5 \+ verbForms\.length\}/, "colSpan={vocabTableColumnOrder.length}");

const vocabTbodyRowsRegex = /<tr key=\{v\.id\} className="border-b border-slate-50 hover:bg-slate-50\/50 transition-colors">[\s\S]*?<\/tr>/;
const newVocabTbodyRowsStr = `<tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          {vocabTableColumnOrder.map(colId => {
                             if (colId === 'isImportant') {
                                return <td key={colId} className="p-4 text-center">
                                    <button onClick={() => {createVocabBackup(); setVocabDB(prev => prev.map(x => x.id === v.id ? { ...x, isImportant: !x.isImportant } : x))}} className={\`p-2 rounded-lg transition-colors \${v.isImportant ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}\`} title="標記為重要"><Star className={\`w-4 h-4 \${v.isImportant ? 'fill-current' : ''}\`}/></button>
                                </td>;
                             }
                             if (colId === 'tag') {
                                return <td key={colId} className="p-4">
                                  <div className="flex items-center gap-1.5">
                                   {editingTagId === v.id ? (
                                     <input
                                       type="text"
                                       autoFocus
                                       defaultValue={v.tag}
                                       list="db-theme-suggestions"
                                       onBlur={(e) => {
                                         const newTag = e.target.value.trim();
                                         if (newTag && newTag !== v.tag) {
                                           setVocabDB(prev => prev.map(x => x.id === v.id ? { ...x, tag: newTag } : x));
                                         }
                                         setEditingTagId(null);
                                       }}
                                       onKeyDown={(e) => {
                                         if (e.key === 'Enter') e.target.blur();
                                         if (e.key === 'Escape') setEditingTagId(null);
                                       }}
                                       className="w-28 px-2 py-1 text-xs font-bold rounded-lg border-2 border-amber-400 outline-none bg-amber-50"
                                     />
                                   ) : (
                                     <span
                                       onClick={() => setEditingTagId(v.id)}
                                       className={\`inline-block px-2.5 py-1 text-xs font-bold rounded-lg border whitespace-nowrap cursor-pointer hover:ring-2 hover:ring-amber-300 transition-all \${getTagStyle(v.tag)}\`}
                                       title="點擊編輯主題標籤"
                                     >{v.tag}</span>
                                   )}
                                   <button onClick={() => handleRematchDbTheme(v.id, v.meaning)} title="根據中文重新自動配對主題" className="p-1 text-slate-300 hover:text-amber-500 transition-colors"><Sparkles className="w-4 h-4"/></button>
                                 </div>
                                </td>;
                             }
                             if (colId === 'type') {
                                return <td key={colId} className="p-4">
                                  {v.isSentence ? <span className="inline-block px-2.5 py-1 bg-fuchsia-100 text-fuchsia-700 rounded-lg text-xs font-bold whitespace-nowrap" title="這是一句例句">📝 例句</span> : <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold whitespace-nowrap">單字</span>}
                                </td>;
                             }
                             if (colId === 'word') {
                                return <td key={colId} className="p-4"><div className="font-bold text-slate-800 text-base">{v.word || v.reading}</div>{v.word && <div className="text-slate-500 text-xs mt-0.5">{v.reading}</div>}</td>;
                             }
                             if (colId === 'meaning') {
                                return <td key={colId} className="p-4"><div className="font-bold text-slate-700">{v.meaning}</div>{v.example && <div className="text-slate-500 text-xs mt-1 bg-slate-100 p-1.5 rounded inline-block">{renderRuby(v.example)}</div>}</td>;
                             }
                             if (colId === 'status') {
                                return <td key={colId} className="p-4">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-base">{getVocabBadge(v).emoji}</span>
                                    <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg font-mono text-xs border border-emerald-100">EF {v.ef.toFixed(1)}</span>
                                  </div>
                                </td>;
                             }
                             if (colId === 'dateAdded') {
                                return <td key={colId} className="p-4 text-slate-500 font-medium whitespace-nowrap">{getAddedDate(v.id)}</td>;
                             }
                             if (colId === 'nextReview') {
                                return <td key={colId} className="p-4 text-slate-500 font-medium whitespace-nowrap">{v.interval === 0 ? '今天' : \`\${v.interval} 天後\`}</td>;
                             }
                             if (colId === 'actions') {
                                return <td key={colId} className="p-4 flex gap-1">
                                   <button onClick={()=>{setEditingVocabId(v.id); setVocabEditForm({word: v.word||'', reading: v.reading||'', meaning: v.meaning||'', example: v.example||''});}} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="編輯"><Edit3 className="w-4 h-4"/></button>
                                   <button onClick={()=>{if(window.confirm('確定刪除？')){createVocabBackup(); setVocabDB(vocabDB.filter(x=>x.id!==v.id));}}} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="刪除"><Trash2 className="w-4 h-4"/></button>
                                </td>;
                             }
                             return null;
                          })}
                       </tr>`;
c = c.replace(vocabTbodyRowsRegex, newVocabTbodyRowsStr);

fs.writeFileSync('src/App.jsx', c);
console.log('done patch vocab part');
