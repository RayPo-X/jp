const fs = require('fs');
const file = 'd:/jp/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix Table classes (change w-full to min-w-full)
content = content.replace(/<table className="w-full text-left text-sm table-fixed">/g, '<table className="min-w-full text-left text-sm table-fixed">');

const vocabThOld = `                            <th key={colId} 
                                className={\`p-0 relative bg-slate-50 text-slate-600 select-none \${dragVocabColIdx === idx ? 'opacity-30' : ''} \${dragOverVocabColIdx === idx && dragVocabColIdx !== idx ? (dragVocabColIdx < dragOverVocabColIdx ? 'border-r-4 border-r-amber-500' : 'border-l-4 border-l-amber-500') : ''}\`}
                                style={{ width: vocabColWidths[colId] || (['isImportant', 'actions'].includes(colId) ? 80 : undefined) }}
                            >
                                <div 
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
                                  className="p-4 whitespace-nowrap cursor-grab active:cursor-grabbing hover:bg-slate-100 transition-colors flex items-center gap-1 w-full h-full overflow-hidden"
                                  onClick={() => { if(!resizingRef.current) { def.sortable && handleSort(colId); } }}
                                >
                                   <GripHorizontal className="w-3 h-3 text-slate-300 shrink-0"/>
                                   {def.label}{def.sortable && renderSortIcon(colId)}
                                </div>
                                <div 
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const startWidth = e.currentTarget.parentElement.getBoundingClientRect().width;
                                    resizingRef.current = { tableType: 'vocab', colId, startX: e.clientX, startWidth };
                                  }}
                                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-amber-400 z-10"
                                  title="拖曳縮放"
                                />
                            </th>`;

const vocabThNew = `                            <th key={colId} 
                                className={\`p-0 relative bg-slate-50 text-slate-600 select-none \${dragVocabColIdx === idx ? 'opacity-30' : ''} \${dragOverVocabColIdx === idx && dragVocabColIdx !== idx ? (dragVocabColIdx < dragOverVocabColIdx ? 'border-r-4 border-r-amber-500' : 'border-l-4 border-l-amber-500') : ''}\`}
                                style={{ width: vocabColWidths[colId] || (['isImportant', 'actions'].includes(colId) ? 80 : undefined) }}
                            >
                                <div 
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
                                  className="p-4 whitespace-nowrap cursor-grab active:cursor-grabbing hover:bg-slate-100 transition-colors flex items-center gap-1 w-full h-full overflow-hidden"
                                  onClick={() => { if(!resizingRef.current) { def.sortable && handleSort(colId); } }}
                                >
                                   <GripHorizontal className="w-3 h-3 text-slate-300 shrink-0"/>
                                   {def.label}{def.sortable && renderSortIcon(colId)}
                                </div>
                                <div 
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const startWidth = e.currentTarget.parentElement.getBoundingClientRect().width;
                                    resizingRef.current = { tableType: 'vocab', colId, startX: e.clientX, startWidth };
                                  }}
                                  className="absolute -right-2 top-0 bottom-0 w-4 cursor-col-resize hover:bg-amber-400/50 z-20 flex items-center justify-center group"
                                  title="拖曳縮放"
                                >
                                  <div className="w-0.5 h-1/2 bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
                                </div>
                            </th>`;

const verbThOld = `            <th key={colId} 
                className={\`p-0 relative bg-slate-50 text-slate-600 select-none \${dragTableColIdx === idx ? 'opacity-30' : ''} \${dragOverTableColIdx === idx && dragTableColIdx !== idx ? (dragTableColIdx < dragOverTableColIdx ? 'border-r-4 border-r-indigo-500' : 'border-l-4 border-l-indigo-500') : ''}\`}
                style={{ width: verbColWidths[colId] || (['isImportant', 'actions'].includes(colId) ? 80 : undefined) }}
            >
                <div 
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
                  className="p-4 whitespace-nowrap cursor-grab active:cursor-grabbing hover:bg-slate-100 transition-colors flex items-center gap-1 w-full h-full overflow-hidden"
                  onClick={() => { if(!resizingRef.current) { sortable && handleVerbSort(colId); } }}
                >
                   <GripHorizontal className="w-3 h-3 text-slate-300 shrink-0"/>
                   {label}{sortable && renderVerbSortIcon(colId)}
                </div>
                <div 
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const startWidth = e.currentTarget.parentElement.getBoundingClientRect().width;
                    resizingRef.current = { tableType: 'verb', colId, startX: e.clientX, startWidth };
                  }}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-indigo-400 z-10"
                  title="拖曳縮放"
                />
            </th>`;

const verbThNew = `            <th key={colId} 
                className={\`p-0 relative bg-slate-50 text-slate-600 select-none \${dragTableColIdx === idx ? 'opacity-30' : ''} \${dragOverTableColIdx === idx && dragTableColIdx !== idx ? (dragTableColIdx < dragOverTableColIdx ? 'border-r-4 border-r-indigo-500' : 'border-l-4 border-l-indigo-500') : ''}\`}
                style={{ width: verbColWidths[colId] || (['isImportant', 'actions'].includes(colId) ? 80 : undefined) }}
            >
                <div 
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
                  className="p-4 whitespace-nowrap cursor-grab active:cursor-grabbing hover:bg-slate-100 transition-colors flex items-center gap-1 w-full h-full overflow-hidden"
                  onClick={() => { if(!resizingRef.current) { sortable && handleVerbSort(colId); } }}
                >
                   <GripHorizontal className="w-3 h-3 text-slate-300 shrink-0"/>
                   {label}{sortable && renderVerbSortIcon(colId)}
                </div>
                <div 
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const startWidth = e.currentTarget.parentElement.getBoundingClientRect().width;
                    resizingRef.current = { tableType: 'verb', colId, startX: e.clientX, startWidth };
                  }}
                  className="absolute -right-2 top-0 bottom-0 w-4 cursor-col-resize hover:bg-indigo-400/50 z-20 flex items-center justify-center group"
                  title="拖曳縮放"
                >
                  <div className="w-0.5 h-1/2 bg-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
                </div>
            </th>`;

let foundVocab = false;
let foundVerb = false;

content = content.replace(/<th key=\{colId\}[\s\S]*?<\/th>/g, (match) => {
  if (!foundVocab && match.includes('dragVocabColIdx')) {
      foundVocab = true;
      return vocabThNew;
  }
  if (!foundVerb && match.includes('dragTableColIdx')) {
      foundVerb = true;
      return verbThNew;
  }
  return match;
});

fs.writeFileSync(file, content);
console.log('App.jsx patched! Vocab:', foundVocab, 'Verb:', foundVerb);
