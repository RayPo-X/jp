const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const searchStr = `{sortedVerbDB.map(v => editingVerbId === v.id ? (
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

const replaceStr = `{sortedVerbDB.map(v => editingVerbId === v.id ? (
                       <tr key={'edit-'+v.id} className="border-b border-indigo-200 bg-indigo-50">
                          <td colSpan={7} className="p-4">
                             <div className="flex flex-col gap-2">
                               <div className="flex flex-wrap gap-2">
                                 <input type="text" value={verbEditForm.masu || ''} onChange={e=>setVerbEditForm({...verbEditForm, masu: e.target.value})} placeholder="ます形" className="flex-1 min-w-[120px] p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 font-bold text-sm"/>
                                 {verbForms.map(f => (
                                   <input key={f.id} type="text" value={verbEditForm[f.id] || ''} onChange={e=>setVerbEditForm({...verbEditForm, [f.id]: e.target.value})} placeholder={f.label} className="flex-1 min-w-[120px] p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 font-bold text-sm"/>
                                 ))}
                                 <input type="text" value={verbEditForm.meaning || ''} onChange={e=>setVerbEditForm({...verbEditForm, meaning: e.target.value})} placeholder="中文意思" className="flex-1 min-w-[120px] p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 text-sm"/>
                               </div>
                               <div className="flex justify-end gap-2 mt-1">
                                 <button onClick={()=>{
                                     setVerbDB(prev => prev.map(x => x.id === v.id ? { ...x, ...verbEditForm } : x));
                                     setEditingVerbId(null);
                                 }} className="px-5 py-2 bg-indigo-500 text-white rounded-lg font-bold text-sm hover:bg-indigo-600 transition-colors flex items-center gap-1"><Save className="w-4 h-4"/> 儲存</button>
                                 <button onClick={()=>setEditingVerbId(null)} className="px-5 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-300 transition-colors">取消</button>
                               </div>
                             </div>
                          </td>
                       </tr>
                     ) : (`;

c = c.replace(searchStr, replaceStr);
c = c.replace(searchStr.replace(/\n/g, '\r\n'), replaceStr);

// Now we need to update the button onClick handler to pass ALL fields
// Currently it is setVerbEditForm({masu: v.masu||'', jisho: v.jisho||'', te: v.te||'', meaning: v.meaning||''})
// Let's replace it with setVerbEditForm({ ...v })
// That way, any custom properties added dynamically will also be populated in the form!

const btnSearchStr = `setVerbEditForm({masu: v.masu||'', jisho: v.jisho||'', te: v.te||'', meaning: v.meaning||''});`;
const btnReplaceStr = `setVerbEditForm({ ...v });`;

c = c.replace(btnSearchStr, btnReplaceStr);
c = c.replace(btnSearchStr.replace(/\n/g, '\r\n'), btnReplaceStr);

fs.writeFileSync('src/App.jsx', c);
console.log('done');
