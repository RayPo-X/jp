const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Insert handleExportBackup and handleImportBackup
if (!c.includes('handleExportBackup')) {
  const syncToGitHubStr = 'const syncToGitHub = async () => {';
  const backupCode = `
  const handleExportBackup = () => {
    const data = { vocabDB, verbDB, verbForms, verbTableColumnOrder, customGrammars, grammarProgress, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`jp-dojo-backup-\${new Date().toISOString().split('T')[0]}.json\`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        let restored = false;
        if (data.vocabDB && Array.isArray(data.vocabDB)) { setVocabDB(data.vocabDB); restored = true; }
        if (data.verbDB && Array.isArray(data.verbDB)) { setVerbDB(data.verbDB); restored = true; }
        if (data.verbForms && Array.isArray(data.verbForms)) { setVerbForms(data.verbForms); restored = true; }
        if (data.verbTableColumnOrder && Array.isArray(data.verbTableColumnOrder)) { setVerbTableColumnOrder(data.verbTableColumnOrder); restored = true; }
        if (data.customGrammars && Array.isArray(data.customGrammars)) { setCustomGrammars(data.customGrammars); restored = true; }
        if (data.grammarProgress && typeof data.grammarProgress === 'object') { setGrammarProgress(data.grammarProgress); restored = true; }
        
        if (restored) alert('本機備份還原成功！');
        else alert('檔案格式不正確。');
      } catch (err) {
        alert('讀取失敗，請確認這是一個有效的 JSON 備份檔。');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset
  };

  `;
  c = c.replace(syncToGitHubStr, backupCode + syncToGitHubStr);
}

// 2. Insert UI before "完成設定"
if (!c.includes('出題基準')) {
  const targetStr = '<button onClick={()=>setShowSettingsModal(false)} className="w-full mt-8 py-3 bg-slate-800 text-white rounded-xl font-bold">完成設定</button>';
  
  const uiCode = `
                 {appState === 'verb_playing' && (
                  <>
                    <div className="pt-6 border-t border-slate-100 mt-6">
                      <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">出題基準 (看到什麼形)</h3>
                      <select value={sourceForm} onChange={(e) => setSourceForm(e.target.value)} className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors">
                        {verbForms.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center justify-between mt-6">變化練習目標 (要變成什麼形) <span className="text-xs font-normal text-slate-500">可複選</span></h3>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-50 rounded-xl border-2 border-slate-100">
                        {verbForms.map(f => {
                           if (f.id === sourceForm) return null;
                           return (
                             <label key={f.id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
                               <input type="checkbox" checked={targetForms.includes(f.id)} onChange={(e) => {
                                 if (e.target.checked) setTargetForms(prev => [...prev, f.id]);
                                 else setTargetForms(prev => prev.filter(x => x !== f.id));
                               }} className="w-4 h-4 text-blue-600 rounded"/>
                               <span className="text-sm truncate text-slate-700">{f.label}</span>
                             </label>
                           );
                        })}
                        {customGrammars.map(g => {
                           return (
                             <label key={\`g_\${g.id}\`} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100">
                               <input type="checkbox" checked={targetForms.includes(g.id)} onChange={(e) => {
                                 if (e.target.checked) setTargetForms(prev => [...prev, g.id]);
                                 else setTargetForms(prev => prev.filter(x => x !== g.id));
                               }} className="w-4 h-4 text-emerald-600 rounded"/>
                               <span className="text-sm truncate text-emerald-700 font-medium">{g.name}</span>
                             </label>
                           );
                        })}
                      </div>
                    </div>
                  </>
                 )}
                 
                 <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider mt-6 pt-6 border-t border-slate-100">跨裝置同步 (本機備份與還原)</h3>
                    <div className="flex gap-2">
                      <button onClick={handleExportBackup} className="flex-1 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-medium border border-slate-200 transition-colors text-sm">💾 匯出備份 (下載)</button>
                      <label className="flex-1 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-medium border border-slate-200 transition-colors text-sm cursor-pointer text-center">
                        <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                        📂 匯入備份 (還原)
                      </label>
                    </div>
                 </div>
                 
                 <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider mt-6 pt-6 border-t border-slate-100">進階雲端同步 (GitHub Gist)</h3>
                    <div className="space-y-3">
                      <div>
                         <label className="block text-xs font-medium text-slate-500 mb-1">GitHub Token (需具備 gist 權限)</label>
                         <input type="password" value={githubToken} onChange={e => setGithubToken(e.target.value)} placeholder="ghp_..." className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors" />
                      </div>
                      <div>
                         <label className="block text-xs font-medium text-slate-500 mb-1">Gist ID (首次上傳可留空)</label>
                         <input type="text" value={gistId} onChange={e => setGistId(e.target.value)} placeholder="留空以建立新進度..." className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors" />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button onClick={syncToGitHub} disabled={isSyncing} className="flex-1 py-2 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors disabled:opacity-50 text-sm">
                          {isSyncing ? '...' : '↑ 覆蓋雲端進度 (上傳)'}
                        </button>
                        <button onClick={syncFromGitHub} disabled={isSyncing} className="flex-1 py-2 bg-white text-slate-800 border-2 border-slate-800 rounded-xl font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 text-sm">
                          {isSyncing ? '...' : '↓ 載入雲端進度 (下載)'}
                        </button>
                      </div>
                    </div>
                 </div>

  `;
  c = c.replace(targetStr, uiCode + targetStr);
}

// 3. Update generateVerbQuestion body using RegExp
const genRegex = /else if \\(mode === 'custom'\\) \\{[\\s\\S]*?else \\{[\\s\\S]*?filteredWords\\.forEach\\(word => validTargets\\.forEach\\(target => \\{ if \\(word\\[target\\]\\) availablePool\\.push\\(\\{ word, target, grammarDef: null \\}\\); \\}\\)\\);\\s*\\}/;

const newGenBody = `else {
      const processWord = (word) => validTargets.forEach(target => {
        const customDef = customGrammars.find(g => g.id === target);
        if (customDef) {
           if (customDef.appliesTo.includes(word.type) && word[customDef.baseForm]) {
             availablePool.push({ word, target: customDef.id, grammarDef: customDef });
           }
        } else {
           if (word[target]) availablePool.push({ word, target, grammarDef: null });
        }
      });

      if (mode === 'custom') {
        if (customWordIds.length === 0) { alert('請先到設定勾選自訂單字！'); goHome(); return; }
        verbDB.filter(w => customWordIds.includes(w.id)).forEach(processWord);
      } else {
        const filteredWords = verbDB.filter(w => activeWordTypes.includes(w.type));
        if (filteredWords.length === 0) return;
        filteredWords.forEach(processWord);
      }
    }`;

c = c.replace(genRegex, newGenBody);

fs.writeFileSync('src/App.jsx', c);
console.log('done fixing all missing ui');
