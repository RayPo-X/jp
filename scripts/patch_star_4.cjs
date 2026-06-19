const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const cardHeaderRegex = /<div className="flex justify-between items-start mb-8 gap-2">\s*<div className="flex flex-col gap-2">\s*<button onClick=\{goHome\} className="flex items-center justify-center gap-1\.5 px-3 py-1\.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 transition-colors" title="中斷目前測驗，已答對的進度會保留">\s*<Save className="w-3\.5 h-3\.5" \/> 中斷儲存並離開\s*<\/button>\s*\{appState === 'verb_playing' && verbTestMode === 'rpg' \? \(\s*<div className="flex items-center gap-3 bg-red-50 px-4 py-1\.5 rounded-full border border-red-100"><Heart className=\{`w-5 h-5 text-red-500 \$\{hp > 0 \? 'fill-current animate-pulse' : ''\}`\} \/><span className="font-black text-red-600">HP: \{hp\}<\/span><div className="ml-2 pl-3 border-l-2 border-red-200 flex gap-3 text-sm font-bold"><span className="text-slate-700">總答對: \{score\}<\/span><span className="text-amber-600">連擊: \{combo\}<\/span><\/div><\/div>\s*\) : \(\s*<div className="bg-slate-100 px-4 py-1\.5 rounded-full text-sm font-bold text-slate-600 w-fit">\{appState === 'vocab_playing' && vocabTestMode === 'srs' \? `SRS 待處理: \$\{activeVocabQueue\.length\}` : `題目: \$\{questionCount\} \/ \$\{TOTAL_QUESTIONS\}`\}<\/div>\s*\)\}\s*<\/div>\s*\{actualTimeLimit > 0 && \(\s*<div className="flex items-center gap-2 mt-1"><button onClick=\{\(\) => setIsPaused\(true\)\} className="p-1\.5 text-slate-400 hover:text-slate-600 rounded-lg bg-slate-50 border border-slate-200"><Pause className="w-4 h-4" \/><\/button><div className=\{`flex items-center gap-1\.5 px-4 py-1\.5 rounded-full text-sm font-bold \$\{timeLeft <= 3 && !feedback \? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600'\}`\}><Timer className="w-4 h-4" \/> \{timeLeft\}s<\/div><\/div>\s*\)\}\s*<\/div>/;

const newCardHeader = `<div className="flex justify-between items-start mb-8 gap-2">
               <div className="flex flex-col gap-2">
                  <button onClick={goHome} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 transition-colors" title="中斷目前測驗，已答對的進度會保留">
                    <Save className="w-3.5 h-3.5" /> 中斷儲存並離開
                  </button>
                  {appState === 'verb_playing' && verbTestMode === 'rpg' ? (
                     <div className="flex items-center gap-3 bg-red-50 px-4 py-1.5 rounded-full border border-red-100"><Heart className={\`w-5 h-5 text-red-500 \${hp > 0 ? 'fill-current animate-pulse' : ''}\`} /><span className="font-black text-red-600">HP: {hp}</span><div className="ml-2 pl-3 border-l-2 border-red-200 flex gap-3 text-sm font-bold"><span className="text-slate-700">總答對: {score}</span><span className="text-amber-600">連擊: {combo}</span></div></div>
                  ) : (
                     <div className="bg-slate-100 px-4 py-1.5 rounded-full text-sm font-bold text-slate-600 w-fit">{appState === 'vocab_playing' && vocabTestMode === 'srs' ? \`SRS 待處理: \${activeVocabQueue.length}\` : \`題目: \${questionCount} / \${TOTAL_QUESTIONS}\`}</div>
                  )}
               </div>
               <div className="flex items-start gap-2 mt-1">
                 <button onClick={() => {
                     if (appState === 'vocab_playing' && currentVocab) setVocabDB(prev => prev.map(x => x.id === currentVocab.id ? { ...x, isImportant: !x.isImportant } : x));
                     if (appState === 'verb_playing' && currentVerb) setVerbDB(prev => prev.map(x => x.id === currentVerb.id ? { ...x, isImportant: !x.isImportant } : x));
                 }} className={\`p-1.5 rounded-lg transition-colors border \${(appState === 'vocab_playing' ? currentVocab?.isImportant : currentVerb?.isImportant) ? 'bg-amber-50 text-amber-500 border-amber-200' : 'bg-slate-50 text-slate-300 hover:text-amber-500 border-slate-200'}\`} title="標記為重要">
                    <Star className={\`w-5 h-5 \${(appState === 'vocab_playing' ? currentVocab?.isImportant : currentVerb?.isImportant) ? 'fill-current' : ''}\`}/>
                 </button>
                 {actualTimeLimit > 0 && (
                    <div className="flex items-center gap-2"><button onClick={() => setIsPaused(true)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg bg-slate-50 border border-slate-200"><Pause className="w-4 h-4" /></button><div className={\`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold \${timeLeft <= 3 && !feedback ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600'}\`}><Timer className="w-4 h-4" /> {timeLeft}s</div></div>
                 )}
               </div>
            </div>`;

c = c.replace(cardHeaderRegex, newCardHeader);

fs.writeFileSync('src/App.jsx', c);
console.log('done patch phase 4');
