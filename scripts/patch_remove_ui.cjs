const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Remove handleExportBackup and handleImportBackup
const backupRegex = /const handleExportBackup = \(\) => \{[\s\S]*?e\.target\.value = ''; \/\/ reset\n  \};\n/g;
c = c.replace(backupRegex, '');

// 2. Remove the redundant UI from SettingsModal
const redundantUIRegex = /<div>\s*<h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider mt-6 pt-6 border-t border-slate-100">跨裝置同步 \(本機備份與還原\)<\/h3>[\s\S]*?<\/div>\s*<\/div>/;

// The UI has two such blocks (backup and github). Let's remove them carefully.
const blockToRemoveStr = `                 <div>
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
                 </div>`;

c = c.replace(blockToRemoveStr, '');

// 3. Update handleExportData
const oldExportData = `  const handleExportData = () => {
    const data = {
      vocabDB,
      customGrammars,
      grammarProgress,
      exportDate: new Date().toISOString()
    };`;

const newExportData = `  const handleExportData = () => {
    const data = {
      vocabDB,
      verbDB,
      verbForms,
      verbTableColumnOrder,
      customGrammars,
      grammarProgress,
      exportDate: new Date().toISOString()
    };`;

c = c.replace(oldExportData, newExportData);

// 4. Update handleImportData
const oldImportDataRestored = `        let restored = false;
        if (data.vocabDB && Array.isArray(data.vocabDB)) {
          setVocabDB(data.vocabDB);
          restored = true;
        }
        if (data.customGrammars && Array.isArray(data.customGrammars)) {
          setCustomGrammars(data.customGrammars);
          restored = true;
        }
        if (data.grammarProgress && typeof data.grammarProgress === 'object') {
          setGrammarProgress(data.grammarProgress);
          restored = true;
        }`;

const newImportDataRestored = `        let restored = false;
        if (data.vocabDB && Array.isArray(data.vocabDB)) {
          setVocabDB(data.vocabDB);
          restored = true;
        }
        if (data.verbDB && Array.isArray(data.verbDB)) {
          setVerbDB(data.verbDB);
          restored = true;
        }
        if (data.verbForms && Array.isArray(data.verbForms)) {
          setVerbForms(data.verbForms);
          restored = true;
        }
        if (data.verbTableColumnOrder && Array.isArray(data.verbTableColumnOrder)) {
          setVerbTableColumnOrder(data.verbTableColumnOrder);
          restored = true;
        }
        if (data.customGrammars && Array.isArray(data.customGrammars)) {
          setCustomGrammars(data.customGrammars);
          restored = true;
        }
        if (data.grammarProgress && typeof data.grammarProgress === 'object') {
          setGrammarProgress(data.grammarProgress);
          restored = true;
        }`;

c = c.replace(oldImportDataRestored, newImportDataRestored);

fs.writeFileSync('src/App.jsx', c);
console.log('done removing redundant ui and patching home screen sync');
