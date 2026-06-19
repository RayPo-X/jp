const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// Replace 1: the mapping start
const mapStartSearch = `{sortedVocabDB.map(v => (
                       <tr key={v.id}`;
const mapStartReplace = `{sortedVocabDB.map(v => editingVocabId === v.id ? (
                       <tr key={'edit-'+v.id} className="border-b border-amber-200 bg-amber-50">
                          <td colSpan={7} className="p-4">
                             <div className="flex flex-col gap-2">
                               <div className="flex gap-2">
                                 <input type="text" value={vocabEditForm.reading} onChange={e=>setVocabEditForm({...vocabEditForm, reading: e.target.value})} placeholder="平假名" className="flex-1 p-2 border border-slate-300 rounded-lg outline-none focus:border-amber-500 font-bold text-sm"/>
                                 <input type="text" value={vocabEditForm.word} onChange={e=>setVocabEditForm({...vocabEditForm, word: e.target.value})} placeholder="漢字/原形" className="flex-1 p-2 border border-slate-300 rounded-lg outline-none focus:border-amber-500 font-bold text-sm"/>
                                 <input type="text" value={vocabEditForm.meaning} onChange={e=>setVocabEditForm({...vocabEditForm, meaning: e.target.value})} placeholder="中文意思" className="flex-1 p-2 border border-slate-300 rounded-lg outline-none focus:border-amber-500 font-bold text-sm"/>
                               </div>
                               <div className="flex gap-2">
                                 <input type="text" value={vocabEditForm.example} onChange={e=>setVocabEditForm({...vocabEditForm, example: e.target.value})} placeholder="例句" className="flex-1 p-2 border border-slate-300 rounded-lg outline-none focus:border-amber-500 text-sm"/>
                                 <button onClick={()=>{
                                     setVocabDB(prev => prev.map(x => x.id === v.id ? { ...x, ...vocabEditForm, isSentence: (vocabEditForm.example && vocabEditForm.example.trim().length > 0) || (vocabEditForm.reading && vocabEditForm.reading.includes('。')) } : x));
                                     setEditingVocabId(null);
                                 }} className="px-4 py-2 bg-amber-500 text-white rounded-lg font-bold text-sm hover:bg-amber-600 transition-colors flex items-center gap-1"><Save className="w-4 h-4"/> 儲存</button>
                                 <button onClick={()=>setEditingVocabId(null)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-300 transition-colors">取消</button>
                               </div>
                             </div>
                          </td>
                       </tr>
                     ) : (
                       <tr key={v.id}`;
c = c.replace(mapStartSearch, mapStartReplace);
c = c.replace(mapStartSearch.replace(/\n/g, '\r\n'), mapStartReplace);


// Replace 2: the delete button block, and properly close the map
const trashSearch = `<td className="p-4"><button onClick={()=>{if(window.confirm('確定刪除？')){createVocabBackup(); setVocabDB(vocabDB.filter(x=>x.id!==v.id));}}} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button></td>
                       </tr>
                     ))}
                  </tbody>`;
const trashReplace = `<td className="p-4 flex gap-1">
                             <button onClick={()=>{setEditingVocabId(v.id); setVocabEditForm({word: v.word||'', reading: v.reading||'', meaning: v.meaning||'', example: v.example||''});}} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="編輯"><Edit3 className="w-4 h-4"/></button>
                             <button onClick={()=>{if(window.confirm('確定刪除？')){createVocabBackup(); setVocabDB(vocabDB.filter(x=>x.id!==v.id));}}} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="刪除"><Trash2 className="w-4 h-4"/></button>
                           </td>
                       </tr>
                     ))}
                  </tbody>`;
c = c.replace(trashSearch, trashReplace);
c = c.replace(trashSearch.replace(/\n/g, '\r\n'), trashReplace);

fs.writeFileSync('src/App.jsx', c);
console.log('done');
