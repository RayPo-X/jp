const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

let lines = c.split('\n');

let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<span className="ml-1 text-slate-600 font-bold flex items-center flex-wrap gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 shadow-sm">')) {
    startIdx = i;
  }
  if (startIdx !== -1 && i > startIdx && lines[i].includes('</span>')) {
    endIdx = i;
    break;
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  const replaceStr = `                                <div className="ml-1 w-full mt-2 text-slate-600 font-bold flex flex-col gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm">
                                   <div className="text-[13px] text-slate-400 font-normal mb-1">變化過程範例：</div>
                                   {(() => {
                                       const selectedVerb = verbDB.find(v => v.jisho === exampleVerbId) || verbDB[0];
                                       const baseWord = selectedVerb && selectedVerb[g.baseForm] ? stripRuby(selectedVerb[g.baseForm]) : '〇〇';
                                       const jishoStr = selectedVerb && selectedVerb.jisho ? stripRuby(selectedVerb.jisho) : '〇〇';
                                       const baseLabel = verbForms.find(f=>f.id===g.baseForm)?.label || '基礎';
                                       
                                       let displayStr = baseWord;
                                       let resultStr = baseWord;
                                       if (g.removeStr) {
                                           if (baseWord.endsWith(g.removeStr)) {
                                               displayStr = baseWord.slice(0, -g.removeStr.length) + \`~~\${g.removeStr}~~\`;
                                               resultStr = baseWord.slice(0, -g.removeStr.length);
                                           } else {
                                               displayStr = baseWord + \`~~\${g.removeStr}~~\`;
                                           }
                                       }
                                       resultStr += (g.appendStr || '');
                                       return (
                                         <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                           <div className="flex items-center gap-2">
                                             <span className="text-slate-500 font-medium text-xs bg-slate-200 px-1.5 py-0.5 rounded">原形</span>
                                             <span>{jishoStr}</span>
                                           </div>
                                           <ArrowRight className="w-4 h-4 text-slate-300 hidden sm:block mx-1" />
                                           <div className="flex items-center gap-2">
                                             <span className="text-slate-500 font-medium text-xs bg-slate-200 px-1.5 py-0.5 rounded">{baseLabel}</span>
                                             <span>{renderTextWithStrikethrough(displayStr)}</span>
                                           </div>
                                           <ArrowRight className="w-4 h-4 text-emerald-300 hidden sm:block mx-1" />
                                           <div className="flex items-center gap-2 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 shadow-sm">
                                             <span className="text-emerald-600 font-black text-xs">完成</span>
                                             <span className="text-emerald-700 font-black text-[15px]">{resultStr}</span>
                                           </div>
                                         </div>
                                       );
                                   })()}
                                </div>`;

  lines.splice(startIdx, endIdx - startIdx + 1, replaceStr);
  fs.writeFileSync('src/App.jsx', lines.join('\n'));
  console.log('done replacement');
} else {
  console.log('could not find block');
  console.log('start', startIdx);
  console.log('end', endIdx);
}
