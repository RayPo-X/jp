const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const regex = /\{\/\* Grammar SRS Primary Action \*\/\}[\s\S]*?\{\/\* Divider \*\/\}/;

const newBlock = `{/* Grammar SRS Primary Action */}
              <button
                onClick={startGrammarSRS}
                disabled={todayGrammarQueue.length === 0}
                className={\`w-full py-5 rounded-2xl font-bold text-lg flex justify-center items-center gap-2 transition-all \${
                  todayGrammarQueue.length > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md active:scale-[0.98]'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }\`}
              >
                {todayGrammarQueue.length > 0 ? \`📝 今日變化複習 (SRS) - 剩餘 \${Math.min(todayGrammarQueue.length, 20)} 題\` : '🎉 今日變化複習完成！'}
              </button>

              {/* Practice Modes */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button onClick={() => startVerbRound('normal')}
                  className="p-5 bg-white border-2 border-slate-100 hover:border-blue-300 hover:bg-blue-50 rounded-2xl transition-all text-left group active:scale-[0.97]">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl w-fit mb-3 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <RotateCcw className="w-5 h-5"/>
                  </div>
                  <div className="font-bold text-slate-800 mb-1 leading-tight">自訂綜合特訓</div>
                  <div className="text-xs text-slate-400 mt-1 leading-relaxed">嚴格依照右上角「設定」的勾選項目隨機出題</div>
                </button>

                <button onClick={() => startVerbRound('grammar')}
                  className="p-5 bg-white border-2 border-slate-100 hover:border-emerald-300 hover:bg-emerald-50 rounded-2xl transition-all text-left group active:scale-[0.97]">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl w-fit mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Puzzle className="w-5 h-5"/>
                  </div>
                  <div className="font-bold text-slate-800 mb-1 leading-tight">文法測驗</div>
                  <div className="text-xs text-slate-400 mt-1 leading-relaxed">專門集中練習您建立的「自訂文法公式」</div>
                </button>
              </div>

              {/* Game Mode */}
              <button onClick={() => startVerbRound('rpg')}
                className="w-full mt-3 p-5 bg-white border-2 border-slate-100 hover:border-red-300 hover:bg-red-50 rounded-2xl transition-all group active:scale-[0.97]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 text-red-500 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-colors flex-shrink-0">
                    <Swords className="w-6 h-6"/>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-800 text-lg">RPG 極限生存戰</div>
                    <div className="text-sm text-slate-500 mt-1">3 滴血挑戰（依照您的設定出題）</div>
                  </div>
                </div>
              </button>

              <div className="mb-6"></div>

              {/* Divider */}`;

c = c.replace(regex, newBlock);

fs.writeFileSync('src/App.jsx', c);
console.log('done patch layout');
