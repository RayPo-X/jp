const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');
let lines = c.split('\n');

for (let i = 0; i < lines.length; i++) {
  // 1. Add state variables
  if (lines[i].includes('const [editingVocabId, setEditingVocabId] = useState(null);') && !c.includes('setEditingVerbId')) {
    lines.splice(i + 2, 0, `  const [editingVerbId, setEditingVerbId] = useState(null);`, `  const [verbEditForm, setVerbEditForm] = useState({ masu: '', jisho: '', te: '', meaning: '' });`);
    i += 2; // skip added lines
  }
  
  // 2. Modify map start
  if (lines[i].includes('{sortedVerbDB.map(v => (')) {
    lines[i] = `                    {sortedVerbDB.map(v => editingVerbId === v.id ? (
                       <tr key={'edit-'+v.id} className="border-b border-indigo-200 bg-indigo-50">
                          <td colSpan={7} className="p-4">
                             <div className="flex flex-col gap-2">
                               <div className="flex gap-2">
                                 <input type="text" value={verbEditForm.masu} onChange={e=>setVerbEditForm({...verbEditForm, masu: e.target.value})} placeholder="ます形" className="flex-1 p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 font-bold text-sm"/>
                                 <input type="text" value={verbEditForm.jisho} onChange={e=>setVerbEditForm({...verbEditForm, jisho: e.target.value})} placeholder="辭書形" className="flex-1 p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 font-bold text-sm"/>
                                 <input type="text" value={verbEditForm.te} onChange={e=>setVerbEditForm({...verbEditForm, te: e.target.value})} placeholder="て形" className="flex-1 p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 font-bold text-sm"/>
                               </div>
                               <div className="flex gap-2">
                                 <input type="text" value={verbEditForm.meaning} onChange={e=>setVerbEditForm({...verbEditForm, meaning: e.target.value})} placeholder="中文意思" className="flex-1 p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 text-sm"/>
                                 <button onClick={()=>{
                                     setVerbDB(prev => prev.map(x => x.id === v.id ? { ...x, ...verbEditForm } : x));
                                     setEditingVerbId(null);
                                 }} className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-bold text-sm hover:bg-indigo-600 transition-colors flex items-center gap-1"><Save className="w-4 h-4"/> 儲存</button>
                                 <button onClick={()=>setEditingVerbId(null)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-300 transition-colors">取消</button>
                               </div>
                             </div>
                          </td>
                       </tr>
                     ) : (`;
  }

  // 3. Modify map end (Trash button)
  if (lines[i].includes('setVerbDB(verbDB.filter(x=>x.id!==v.id))') && lines[i].includes('<Trash2')) {
    lines[i] = `                          <td className="p-4 flex gap-1">
                             <button onClick={()=>{setEditingVerbId(v.id); setVerbEditForm({masu: v.masu||'', jisho: v.jisho||'', te: v.te||'', meaning: v.meaning||''});}} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="編輯"><Edit3 className="w-4 h-4"/></button>
                             <button onClick={()=>{if(window.confirm('確定刪除？')) setVerbDB(verbDB.filter(x=>x.id!==v.id))}} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="刪除"><Trash2 className="w-4 h-4"/></button>
                           </td>`;
  }
}

fs.writeFileSync('src/App.jsx', lines.join('\n'));
console.log('done');
