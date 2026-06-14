const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const searchStr = `<div className="flex gap-2">
                                 <input type="text" value={vocabEditForm.reading} onChange={e=>setVocabEditForm({...vocabEditForm, reading: e.target.value})} placeholder="平假名" className="flex-1 p-2 border border-slate-300 rounded-lg outline-none focus:border-amber-500 font-bold text-sm"/>
                                 <input type="text" value={vocabEditForm.word} onChange={e=>setVocabEditForm({...vocabEditForm, word: e.target.value})} placeholder="漢字/原形" className="flex-1 p-2 border border-slate-300 rounded-lg outline-none focus:border-amber-500 font-bold text-sm"/>
                                 <input type="text" value={vocabEditForm.meaning} onChange={e=>setVocabEditForm({...vocabEditForm, meaning: e.target.value})} placeholder="中文意思" className="flex-1 p-2 border border-slate-300 rounded-lg outline-none focus:border-amber-500 font-bold text-sm"/>
                               </div>
                               <div className="flex gap-2">
                                 <input type="text" value={vocabEditForm.example} onChange={e=>setVocabEditForm({...vocabEditForm, example: e.target.value})} placeholder="例句" className="flex-1 p-2 border border-slate-300 rounded-lg outline-none focus:border-amber-500 text-sm"/>`;

const replaceStr = `<div className="flex gap-3">
                                 <div className="flex-1">
                                   <label className="block text-xs font-bold text-amber-600 mb-1 ml-1">平假名</label>
                                   <input type="text" value={vocabEditForm.reading} onChange={e=>setVocabEditForm({...vocabEditForm, reading: e.target.value})} placeholder="平假名" className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-amber-500 font-bold text-sm"/>
                                 </div>
                                 <div className="flex-1">
                                   <label className="block text-xs font-bold text-amber-600 mb-1 ml-1">漢字/原形</label>
                                   <input type="text" value={vocabEditForm.word} onChange={e=>setVocabEditForm({...vocabEditForm, word: e.target.value})} placeholder="漢字/原形" className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-amber-500 font-bold text-sm"/>
                                 </div>
                                 <div className="flex-1">
                                   <label className="block text-xs font-bold text-amber-600 mb-1 ml-1">中文意思</label>
                                   <input type="text" value={vocabEditForm.meaning} onChange={e=>setVocabEditForm({...vocabEditForm, meaning: e.target.value})} placeholder="中文意思" className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-amber-500 font-bold text-sm"/>
                                 </div>
                               </div>
                               <div className="flex gap-3">
                                 <div className="flex-1">
                                   <label className="block text-xs font-bold text-amber-600 mb-1 ml-1">例句 (選填)</label>
                                   <input type="text" value={vocabEditForm.example} onChange={e=>setVocabEditForm({...vocabEditForm, example: e.target.value})} placeholder="例句" className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-amber-500 text-sm"/>
                                 </div>`;

c = c.replace(searchStr, replaceStr);
c = c.replace(searchStr.replace(/\n/g, '\r\n'), replaceStr);

fs.writeFileSync('src/App.jsx', c);
console.log('done');
