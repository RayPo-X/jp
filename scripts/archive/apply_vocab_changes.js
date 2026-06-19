import fs from 'fs';
let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add autoUnlock state
const batchStateTarget = `  const [batchInputs, setBatchInputs] = useState(Array.from({ length: 5 }, () => ({ word: '', reading: '', meaning: '', tag: '自訂', example: '' })));`;
const batchStateRepl = `  const [batchInputs, setBatchInputs] = useState(Array.from({ length: 5 }, () => ({ word: '', reading: '', meaning: '', tag: '自訂', example: '' })));\n  const [autoUnlock, setAutoUnlock] = useState(false);`;
content = content.replace(batchStateTarget, batchStateRepl);

// 2. Add Reset Button in Vocab Manage
const titleTarget = `<div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><BookType className="w-6 h-6 text-amber-500"/> 管理單字記憶庫</h2></div>`;
const titleRepl = `<div className="flex justify-between items-center mb-6">
  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><BookType className="w-6 h-6 text-amber-500"/> 管理單字記憶庫</h2>
  <button onClick={() => {
    if(window.confirm('確定要將所有單字的複習進度重置為今天嗎？這將會讓所有單字出現在今日待複習清單中！')) {
      setVocabDB(vocabDB.map(v => (v.status === 'learning' || v.status === 'mastered') ? { ...v, status: 'learning', interval: 0, repetitions: 0, nextReview: Date.now() } : v));
      alert('已重置所有單字複習進度！請回首頁開始複習。');
      setAppState('home');
    }
  }} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2 text-sm shadow-sm">
    <RefreshCcw className="w-4 h-4"/> 從今天重新計算
  </button>
</div>`;
content = content.replace(titleTarget, titleRepl);

// 3. handleBatchSave autoUnlock
const batchSaveTarget = `                 status: 'learning',
                 interval: 0,
                 repetitions: 0,
                 ef: 2.5,
                 nextReview: Date.now()`;
const batchSaveRepl = `                 status: autoUnlock ? 'learning' : 'new',
                 interval: 0,
                 repetitions: 0,
                 ef: 2.5,
                 nextReview: Date.now()`;
content = content.replace(batchSaveTarget, batchSaveRepl);
// Do it twice because it's also in handleSmartImport
content = content.replace(batchSaveTarget, batchSaveRepl);

// 4. Checkbox in Smart Import
const smartImportBtnTarget = `                  <button onClick={handleSmartImport} className="mt-3 w-full py-3 bg-amber-100 text-amber-800 rounded-xl font-bold hover:bg-amber-200 transition-colors flex items-center justify-center gap-2">解析字串並匯入清單</button>`;
const smartImportBtnRepl = `                  <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
                    <input type="checkbox" checked={autoUnlock} onChange={(e) => setAutoUnlock(e.target.checked)} className="w-4 h-4 accent-amber-500" />
                    <span className="text-sm text-amber-800 font-bold">匯入後直接解鎖開始學習 (若不勾選，將進入待解鎖池由系統每日抽出)</span>
                  </label>
                  <button onClick={handleSmartImport} className="mt-3 w-full py-3 bg-amber-100 text-amber-800 rounded-xl font-bold hover:bg-amber-200 transition-colors flex items-center justify-center gap-2">解析字串並匯入清單</button>`;
content = content.replace(smartImportBtnTarget, smartImportBtnRepl);

// 5. Checkbox in Batch Save
const batchSaveBtnTarget = `                <button onClick={handleBatchSave} className="w-full py-4 bg-amber-600 text-white rounded-2xl font-bold text-lg hover:bg-amber-700 transition-colors shadow-sm">批次寫入資料庫</button>`;
const batchSaveBtnRepl = `                <label className="flex items-center gap-2 mt-4 mb-4 cursor-pointer select-none">
                  <input type="checkbox" checked={autoUnlock} onChange={(e) => setAutoUnlock(e.target.checked)} className="w-4 h-4 accent-amber-500" />
                  <span className="text-sm text-slate-600 font-bold">新增後直接解鎖開始學習 (若不勾選，將進入待解鎖池由系統每日抽出)</span>
                </label>
                <button onClick={handleBatchSave} className="w-full py-4 bg-amber-600 text-white rounded-2xl font-bold text-lg hover:bg-amber-700 transition-colors shadow-sm">批次寫入資料庫</button>`;
content = content.replace(batchSaveBtnTarget, batchSaveBtnRepl);

// 6. Update getVocabBadge
const badgeTarget = `  // 單字熟練度徽章
  const getVocabBadge = (vocab) => {
    if (!vocab || vocab.repetitions === 0) return { emoji: '🌱', label: '新手' };`;
const badgeRepl = `  // 單字熟練度徽章
  const getVocabBadge = (vocab) => {
    if (!vocab) return { emoji: '🌱', label: '新手' };
    if (vocab.status === 'new') return { emoji: '🔒', label: '未解鎖' };
    if (vocab.repetitions === 0) return { emoji: '🌱', label: '新手' };`;
content = content.replace(badgeTarget, badgeRepl);

// 7. Update handleUnlockNewWords
const unlockTarget = `    let poolFromUser = vocabDB.filter(v => v.status === 'new');
    if (unlockTheme !== 'random') {
       poolFromUser = poolFromUser.filter(v => v.tag === unlockTheme);
    }

    const pool = [...poolFromSys, ...poolFromUser];

    if (pool.length === 0) return alert('這個主題的單字已經全部解鎖完畢囉！請選擇其他主題，或去「動詞與單字庫管理」自行新增。');
    
    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, unlockAmount);`;
const unlockRepl = `    let poolFromUser = vocabDB.filter(v => v.status === 'new');
    if (unlockTheme !== 'random') {
       poolFromUser = poolFromUser.filter(v => v.tag === unlockTheme);
    }

    // Prioritize user's own locked words, then fill with system words if needed
    let selected = [];
    const shuffledUser = [...poolFromUser].sort(() => 0.5 - Math.random());
    selected.push(...shuffledUser.slice(0, unlockAmount));

    if (selected.length < unlockAmount) {
       const needed = unlockAmount - selected.length;
       const shuffledSys = [...poolFromSys].sort(() => 0.5 - Math.random());
       selected.push(...shuffledSys.slice(0, needed));
    }

    if (selected.length === 0) return alert('這個主題的單字已經全部解鎖完畢囉！請選擇其他主題，或去「動詞與單字庫管理」自行新增。');`;
content = content.replace(unlockTarget, unlockRepl);

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('Done modifying App.jsx');
