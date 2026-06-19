const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');
const searchString = `{/* Stats Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-amber-600 leading-none mb-1.5">{todayQueue.length}</div>
                  <div className="text-xs font-bold text-amber-700/70">今日待複習</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-slate-700 leading-none mb-1.5">{vocabDB.length}</div>
                  <div className="text-xs font-bold text-slate-400">單字總數</div>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-red-500 leading-none mb-1.5">{Object.keys(vocabMistakes).length}</div>
                  <div className="text-xs font-bold text-red-400">累積錯題</div>
                </div>
              </div>`;
              
const replaceString = `{/* Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-amber-600 leading-none mb-1.5">{todayQueue.length}</div>
                  <div className="text-xs font-bold text-amber-700/70">單字待複習</div>
                </div>
                <div className="bg-fuchsia-50 border border-fuchsia-100 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-fuchsia-600 leading-none mb-1.5">{todaySentenceQueue.length}</div>
                  <div className="text-xs font-bold text-fuchsia-700/70">例句待複習</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-slate-700 leading-none mb-1.5">{vocabDB.length}</div>
                  <div className="text-xs font-bold text-slate-400">總單字數</div>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-red-500 leading-none mb-1.5">{Object.keys(vocabMistakes).length}</div>
                  <div className="text-xs font-bold text-red-400">累積錯題</div>
                </div>
              </div>`;

c = c.replace(searchString, replaceString);
// Let's also handle CRLF just in case
c = c.replace(searchString.replace(/\n/g, '\r\n'), replaceString);

fs.writeFileSync('src/App.jsx', c);
console.log('done');
