const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const searchStr = `<div className="flex flex-wrap gap-2">
                                 <input type="text" value={verbEditForm.masu || ''} onChange={e=>setVerbEditForm({...verbEditForm, masu: e.target.value})} placeholder="ます形" className="flex-1 min-w-[120px] p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 font-bold text-sm"/>
                                 {verbForms.map(f => (
                                   <input key={f.id} type="text" value={verbEditForm[f.id] || ''} onChange={e=>setVerbEditForm({...verbEditForm, [f.id]: e.target.value})} placeholder={f.label} className="flex-1 min-w-[120px] p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 font-bold text-sm"/>
                                 ))}
                                 <input type="text" value={verbEditForm.meaning || ''} onChange={e=>setVerbEditForm({...verbEditForm, meaning: e.target.value})} placeholder="中文意思" className="flex-1 min-w-[120px] p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 text-sm"/>
                               </div>`;

const replaceStr = `<div className="flex flex-wrap gap-3">
                                 <div className="flex-1 min-w-[120px]">
                                   <label className="block text-xs font-bold text-indigo-600 mb-1 ml-1">ます形</label>
                                   <input type="text" value={verbEditForm.masu || ''} onChange={e=>setVerbEditForm({...verbEditForm, masu: e.target.value})} placeholder="ます形" className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 font-bold text-sm"/>
                                 </div>
                                 {verbForms.map(f => (
                                   <div key={f.id} className="flex-1 min-w-[120px]">
                                     <label className="block text-xs font-bold text-indigo-600 mb-1 ml-1">{f.label}</label>
                                     <input type="text" value={verbEditForm[f.id] || ''} onChange={e=>setVerbEditForm({...verbEditForm, [f.id]: e.target.value})} placeholder={f.label} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 font-bold text-sm"/>
                                   </div>
                                 ))}
                                 <div className="flex-1 min-w-[120px]">
                                   <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">中文意思</label>
                                   <input type="text" value={verbEditForm.meaning || ''} onChange={e=>setVerbEditForm({...verbEditForm, meaning: e.target.value})} placeholder="中文意思" className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 text-sm"/>
                                 </div>
                               </div>`;

c = c.replace(searchStr, replaceStr);
c = c.replace(searchStr.replace(/\n/g, '\r\n'), replaceStr);

fs.writeFileSync('src/App.jsx', c);
console.log('done');
