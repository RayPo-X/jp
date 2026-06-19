const fs = require('fs');
let lines = fs.readFileSync('src/App.jsx', 'utf8').split('\n');

const newTheadStr = `                 <thead className="bg-slate-50 text-slate-600"><tr>
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

// find the target thead (line 2820 roughly)
let startIdx = -1;
let endIdx = -1;
for (let i = 2700; i < 2900; i++) {
    if (lines[i] && lines[i].includes('<thead className="bg-slate-50 text-slate-600"><tr>')) {
        startIdx = i;
    }
    if (startIdx !== -1 && lines[i].includes('</tr></thead>')) {
        endIdx = i;
        break;
    }
}

if (startIdx !== -1 && endIdx !== -1) {
    lines.splice(startIdx, endIdx - startIdx + 1, newTheadStr);
    fs.writeFileSync('src/App.jsx', lines.join('\n'));
    console.log('done patch vocab thead via lines splice');
} else {
    console.log('failed to find thead', startIdx, endIdx);
}
