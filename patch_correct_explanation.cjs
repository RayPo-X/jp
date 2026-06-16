const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const newBlock = `            )}

            {/* 動詞特訓正確時的額外解析 */}
            {feedback === 'correct' && appState === 'verb_playing' && explanation && (
               <div className="mt-6 p-5 bg-green-50 border border-green-200 rounded-2xl text-left animate-in slide-in-from-bottom-4">
                 <div className="flex items-center gap-2 text-green-700 font-bold mb-3"><Sparkles className="w-5 h-5" /> 變化原理解析：</div>
                 <div className="space-y-3 text-green-900">
                   <div className="flex gap-2 bg-white/60 p-3 rounded-xl">
                       <span className="font-semibold text-green-800 whitespace-nowrap">重點提示：</span>
                       <span className="font-medium leading-relaxed">
                           {explanation}
                       </span>
                   </div>
                 </div>
               </div>
            )}

         </div>`;

c = c.replace(
  '            )}\r\n         </div>',
  newBlock
);

// Fallback if \r\n doesn't match
if (!c.includes('動詞特訓正確時的額外解析')) {
    c = c.replace(
      '            )}\n         </div>',
      newBlock
    );
}

fs.writeFileSync('src/App.jsx', c);
console.log('done patch_correct_explanation');
