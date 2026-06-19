const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const theadStart = '<thead className="bg-slate-50 text-slate-600"><tr>';
const theadEnd = '</tr></thead>';

const idx1 = c.indexOf(theadStart);
const idx2 = c.indexOf(theadEnd, idx1);

if (idx1 !== -1 && idx2 !== -1) {
    const theadFull = c.substring(idx1, idx2 + theadEnd.length);
    const newThead = \`<thead className="bg-slate-50 text-slate-600"><tr>
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
                                className={\\\`p-4 whitespace-nowrap cursor-grab active:cursor-grabbing hover:bg-slate-100 transition-colors select-none \\\${dragVocabColIdx === idx ? 'opacity-30' : ''} \\\${dragOverVocabColIdx === idx && dragVocabColIdx !== idx ? (dragVocabColIdx < dragOverVocabColIdx ? 'border-r-4 border-r-amber-500' : 'border-l-4 border-l-amber-500') : ''}\\\`}
                                onClick={() => def.sortable && handleSort(colId)}
                            >
                                <div className="flex items-center gap-1">
                                   <GripHorizontal className="w-3 h-3 text-slate-300 shrink-0"/>
                                   {def.label}{def.sortable && renderSortIcon(colId)}
                                </div>
                            </th>
                        );
                    })}
                 </tr></thead>\`;
    c = c.substring(0, idx1) + newThead + c.substring(idx2 + theadEnd.length);
    fs.writeFileSync('src/App.jsx', c);
    console.log('done patch vocab thead');
} else {
    console.log('failed to find thead', idx1, idx2);
}
