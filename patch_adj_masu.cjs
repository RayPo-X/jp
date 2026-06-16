const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Patch Add Form
const addFormTarget = `{verbForms.map((f, idx) => (`;
const addFormReplacement = `{verbForms.map((f, idx) => {
                       if ((verbInputs.type === 'adj_i' || verbInputs.type === 'adj_na') && f.id === 'masu') return null;
                       return (`;

const addFormEndTarget = `</label>
                          <input draggable="true" onDragStart={e => { e.preventDefault(); e.stopPropagation(); }} type="text" value={verbInputs[f.id] || ''} onChange={e=>handleVerbInputChange(f.id, e.target.value)} className="w-full p-3 rounded-xl border border-indigo-200 bg-white/80 focus:bg-white transition-colors outline-none focus:border-indigo-500 pointer-events-auto cursor-text"/>
                        </div>
                    ))}
                 </div>`;

const addFormEndReplacement = `</label>
                          <input draggable="true" onDragStart={e => { e.preventDefault(); e.stopPropagation(); }} type="text" value={verbInputs[f.id] || ''} onChange={e=>handleVerbInputChange(f.id, e.target.value)} className="w-full p-3 rounded-xl border border-indigo-200 bg-white/80 focus:bg-white transition-colors outline-none focus:border-indigo-500 pointer-events-auto cursor-text"/>
                        </div>
                    );})}
                 </div>`;

c = c.replace(addFormTarget, addFormReplacement);
c = c.replace(addFormEndTarget, addFormEndReplacement);


// 2. Patch Edit Form
const editFormTarget = `{verbForms.map(f => (`;
const editFormReplacement = `{verbForms.map(f => {
                                   if ((verbEditForm.type === 'adj_i' || verbEditForm.type === 'adj_na') && f.id === 'masu') return null;
                                   return (`;

const editFormEndTarget = `className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 font-bold text-sm"/>
                                   </div>
                                 ))}`;

const editFormEndReplacement = `className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 font-bold text-sm"/>
                                   </div>
                                 );})}`;

c = c.replace(editFormTarget, editFormReplacement);
c = c.replace(editFormEndTarget, editFormEndReplacement);


// 3. Patch Table Rendering (Optional but good UX: display "-" for masu if adjective)
const tableRenderTarget = `// Default to rendering verb form
    return <td key={colId} className="p-4 font-bold text-slate-700 whitespace-nowrap">{renderRuby(v[colId])}</td>;`;

const tableRenderReplacement = `// Default to rendering verb form
    if (colId === 'masu' && (v.type === 'adj_i' || v.type === 'adj_na')) {
        return <td key={colId} className="p-4 font-bold text-slate-400 whitespace-nowrap">-</td>;
    }
    return <td key={colId} className="p-4 font-bold text-slate-700 whitespace-nowrap">{renderRuby(v[colId])}</td>;`;

c = c.replace(tableRenderTarget, tableRenderReplacement);

fs.writeFileSync('src/App.jsx', c);
console.log('done patch_adj_masu');
