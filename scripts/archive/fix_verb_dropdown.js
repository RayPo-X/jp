import fs from 'fs';
let content = fs.readFileSync('src/App.jsx', 'utf8');

const target = `<td className="p-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{v.tag || '無'}</span></td>`;
const repl = `<td className="p-4">
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
    <span onClick={() => setEditingTagId(v.id)} className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold cursor-pointer hover:bg-indigo-100 hover:text-indigo-700 transition-colors">
      {v.tag || '無'}
    </span>
  )}
</td>`;

content = content.replace(target, repl);
fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('Verb dropdown patch applied');
