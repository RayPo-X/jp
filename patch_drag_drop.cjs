const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

if (!c.includes('GripHorizontal')) {
  c = c.replace('Search\n} from \'lucide-react\';', 'Search, GripHorizontal\n} from \'lucide-react\';');
}

const stateTarget = `const [verbForms, setVerbForms] = useState(() => {`;
const stateInjection = `const [draggedFormIndex, setDraggedFormIndex] = useState(null);
  const [dragOverFormIndex, setDragOverFormIndex] = useState(null);
  const [verbForms, setVerbForms] = useState(() => {`;
if (!c.includes('setDraggedFormIndex')) {
  c = c.replace(stateTarget, stateInjection);
}

const mapInjection = `{verbForms.map((f, idx) => (
                        <div key={f.id}
                             draggable
                             onDragStart={(e) => { setDraggedFormIndex(idx); e.dataTransfer.effectAllowed = 'move'; }}
                             onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverFormIndex(idx); }}
                             onDragEnd={() => {
                                 if (draggedFormIndex !== null && dragOverFormIndex !== null && draggedFormIndex !== dragOverFormIndex) {
                                     const newForms = [...verbForms];
                                     const item = newForms.splice(draggedFormIndex, 1)[0];
                                     newForms.splice(dragOverFormIndex, 0, item);
                                     setVerbForms(newForms);
                                 }
                                 setDraggedFormIndex(null);
                                 setDragOverFormIndex(null);
                             }}
                             className={\`transition-all duration-200 \${draggedFormIndex === idx ? 'opacity-50 scale-95' : ''} \${dragOverFormIndex === idx && draggedFormIndex !== idx ? (draggedFormIndex < dragOverFormIndex ? 'border-r-4 border-r-indigo-500' : 'border-l-4 border-l-indigo-500') : ''} p-2 -m-2 rounded-xl border border-transparent cursor-grab active:cursor-grabbing hover:bg-indigo-50/50\`}
                        >
                          <label className="block text-sm font-bold text-indigo-700 mb-1 flex items-center gap-1 cursor-grab" title="拖曳以排序">
                             <GripHorizontal className="w-4 h-4 text-indigo-400" />
                             {f.label}
                          </label>
                          <input draggable="true" onDragStart={e => { e.preventDefault(); e.stopPropagation(); }} type="text" value={verbInputs[f.id] || ''} onChange={e=>handleVerbInputChange(f.id, e.target.value)} className="w-full p-3 rounded-xl border border-indigo-200 bg-white/80 focus:bg-white transition-colors outline-none focus:border-indigo-500 pointer-events-auto cursor-text"/>
                        </div>
                    ))}`;

if (!c.includes('setDraggedFormIndex(idx)')) {
  c = c.replace(/\{verbForms\.map\(f => \(\s*<div key=\{f\.id\}><label className="block text-sm font-bold text-indigo-700 mb-1">\{f\.label\}<\/label><input type="text" value=\{verbInputs\[f\.id\] \|\| ''\} onChange=\{e=>handleVerbInputChange\(f\.id, e\.target\.value\)\} className="w-full p-3 rounded-xl border border-indigo-200"\/><\/div>\s*\)\)\}/, mapInjection);
}

fs.writeFileSync('src/App.jsx', c);
console.log('done patch_drag_drop');
