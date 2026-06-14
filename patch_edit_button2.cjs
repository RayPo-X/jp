const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');
let lines = c.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('createVocabBackup(); setVocabDB(vocabDB.filter(x=>x.id!==v.id));') && lines[i].includes('<Trash2')) {
    lines[i] = `                          <td className="p-4 flex gap-1">
                             <button onClick={()=>{setEditingVocabId(v.id); setVocabEditForm({word: v.word||'', reading: v.reading||'', meaning: v.meaning||'', example: v.example||''});}} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="編輯"><Edit3 className="w-4 h-4"/></button>
                             <button onClick={()=>{if(window.confirm('確定刪除？')){createVocabBackup(); setVocabDB(vocabDB.filter(x=>x.id!==v.id));}}} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="刪除"><Trash2 className="w-4 h-4"/></button>
                           </td>`;
    break;
  }
}

fs.writeFileSync('src/App.jsx', lines.join('\n'));
console.log('done');
