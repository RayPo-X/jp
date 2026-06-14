const fs = require('fs');
let code = fs.readFileSync('d:\\jp\\src\\App.jsx', 'utf8');

const regex = /(<div className="p-6 overflow-y-auto space-y-8 text-slate-700">)[\s\S]*?(<\/div>\s*<div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl text-center">)/;

const newContent = `
               <section>
                 <h3 className="text-xl font-bold text-slate-800 mb-4 border-b-2 border-amber-200 pb-2 flex items-center gap-2"><Home className="w-6 h-6 text-amber-500"/> 一、首頁：學習的起點</h3>
                 <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl">
                       <h4 className="font-bold text-amber-700 mb-2">1. 每日新詞解鎖 (Daily Unlock)</h4>
                       <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
                          <li><strong>用途</strong>：每天開始時，先從這裡獲取新的單字。</li>
                          <li><strong>操作</strong>：拉桿選擇解鎖數量（最高 10 個），選定主題。</li>
                          <li><strong>邏輯</strong>：系統會從您「完全沒背過」的資料庫中抽出新詞，解鎖後立刻進入預習狀態。</li>
                       </ul>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl">
                       <h4 className="font-bold text-amber-700 mb-2">2. 今日複習任務 (SRS Review)</h4>
                       <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
                          <li><strong>用途</strong>：系統根據遺忘曲線，自動安排今天需要複習的任務。</li>
                          <li><strong>內容</strong>：包含「字卡測驗」與「文法測驗」，精準對付您最容易忘記的部分。</li>
                       </ul>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl">
                       <h4 className="font-bold text-amber-700 mb-2">3. 智慧單字庫與公式庫</h4>
                       <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
                          <li>可以查看您所有的學習進度，並能快速進入「動詞與形容詞庫」或建立「文法公式庫」。</li>
                       </ul>
                    </div>
                 </div>
               </section>

               <section>
                 <h3 className="text-xl font-bold text-slate-800 mb-4 border-b-2 border-blue-200 pb-2 flex items-center gap-2"><Swords className="w-6 h-6 text-blue-500"/> 二、測驗模式介紹</h3>
                 <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-2xl">
                       <h4 className="font-bold text-blue-700 mb-2">1. 單字字卡測驗 (Vocab Test)</h4>
                       <p className="mb-2">主要考驗您對<strong>單字本身</strong>的理解。支援選擇題與打字輸入。</p>
                       <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
                          <li><strong>一般模式</strong>：看日文選中文。</li>
                          <li><strong>例句填空測驗</strong>：若單字有例句，系統會將單字挖空，讓您依上下文選出正確讀音。</li>
                       </ul>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl">
                       <h4 className="font-bold text-blue-700 mb-2">2. 文法測驗 (Grammar Dojo)</h4>
                       <p className="mb-2"><strong>不考單字意思</strong>，專門訓練大腦的<strong>文法變形反應速度</strong>！</p>
                       <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
                          <li>畫面上出現動詞或形容詞原形（如：食べる），您必須回答指定的變化形態（如：食べて）。</li>
                          <li>考題會自動從您的「文法公式庫」中隨機抽取。</li>
                       </ul>
                    </div>
                 </div>
               </section>

               <section>
                 <h3 className="text-xl font-bold text-slate-800 mb-4 border-b-2 border-indigo-200 pb-2 flex items-center gap-2"><Settings className="w-6 h-6 text-indigo-500"/> 三、進階管理功能</h3>
                 <div className="space-y-4">
                    <div className="bg-indigo-50 p-4 rounded-2xl">
                       <h4 className="font-bold text-indigo-700 mb-2">1. 動詞與形容詞庫 (Verbs & Adjectives DB)</h4>
                       <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
                          <li><strong>自動變形</strong>：存入單字時，系統自動幫您算出十二種以上的時態與變化（ます形、て形、使役被動等）！支援動詞、い形容詞、な形容詞。</li>
                          <li><strong>智慧貼上區</strong>：直接貼上一大串日文文本，系統會自動分析出裡面的動詞和形容詞，讓您一鍵加入資料庫。</li>
                       </ul>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-2xl">
                       <h4 className="font-bold text-indigo-700 mb-2">2. 文法公式庫 (Custom Grammar)</h4>
                       <p className="mb-2">將「文法句型」模組化，把規則教給系統，它就會自動幫您出題！</p>
                       <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
                          <li><strong>自由建立公式</strong>：設定接續的「基礎形」（如接在 て形 後），以及要刪除或「加上的字尾」（如加上 ください）。</li>
                          <li><strong>動態示範單字</strong>：在畫面上方隨意選擇您資料庫中的任何一個單字（🏃動詞 或 ✨形容詞），底下所有的公式範例都會瞬間跟著變身！</li>
                       </ul>
                    </div>
                 </div>
               </section>
             `;

if (regex.test(code)) {
    code = code.replace(regex, '$1' + newContent + '$2');
    fs.writeFileSync('d:\\jp\\src\\App.jsx', code, 'utf8');
    console.log("Success");
} else {
    console.log("Regex not matched");
}
