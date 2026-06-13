import fs from 'fs';
let content = fs.readFileSync('src/App.jsx', 'utf8');

const target1 =     if (mode === 'srs') queue = [...todayQueue];
    else if (mode === 'today_extra') queue = [...reviewedTodayQueue];
    else if (mode === 'mistakes') queue = Object.values(vocabMistakes);;

const repl1 =     if (mode === 'srs') queue = [...todayQueue];
    else if (mode === 'today_extra') queue = [...reviewedTodayQueue];
    else if (mode === 'mistakes') queue = Object.values(vocabMistakes);
    else if (mode === 'all') queue = [...vocabDB];;

content = content.replace(target1, repl1);

const target2 =                 <button onClick={() => setAppState('vocab_manage')}
                  className="py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all text-sm flex flex-col items-center gap-1.5">
                  <BookType className="w-5 h-5"/>管理記憶庫
                </button>;

const repl2 =                 <button onClick={() => startVocabSession('all')}
                  className="py-4 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-2xl font-bold hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all text-sm flex flex-col items-center gap-1.5">
                  <span className="text-xl">🌟</span>全部單字綜合測驗
                </button>
                <button onClick={() => setAppState('vocab_manage')}
                  className="py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all text-sm flex flex-col items-center gap-1.5">
                  <BookType className="w-5 h-5"/>管理記憶庫
                </button>;

content = content.replace(target2, repl2);

fs.writeFileSync('src/App.jsx', content, 'utf8');
