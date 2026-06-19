const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const handlersCode = `  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleExportBackup = () => {
    const backupData = {
      vocabDB,
      verbDB,
      verbForms,
      verbTableColumnOrder,
      customGrammars,
      grammarProgress
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,"");
    downloadAnchorNode.setAttribute("download", \`jp_verb_dojo_backup_\${dateStr}.json\`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (importedData.vocabDB) setVocabDB(importedData.vocabDB);
        if (importedData.verbDB) setVerbDB(importedData.verbDB);
        if (importedData.verbForms) setVerbForms(importedData.verbForms);
        if (importedData.verbTableColumnOrder) setVerbTableColumnOrder(importedData.verbTableColumnOrder);
        if (importedData.customGrammars) setCustomGrammars(importedData.customGrammars);
        if (importedData.grammarProgress) setGrammarProgress(importedData.grammarProgress);
        
        alert('匯入成功！系統將為您套用備份檔中的資料。');
        setShowSettingsModal(false);
      } catch (err) {
        alert('檔案格式錯誤，無法讀取備份資料！');
        console.error(err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
`;

c = c.replace("  const [showSettingsModal, setShowSettingsModal] = useState(false);", handlersCode);


// Replace Title
c = c.replace(
  '<h2 className="text-xl font-bold flex items-center gap-2"><Settings className="w-6 h-6 text-slate-600"/> 測驗設定</h2>',
  '<h2 className="text-xl font-bold flex items-center gap-2"><Settings className="w-6 h-6 text-slate-600"/> 系統與測驗設定</h2>'
);

// Add UI at the end of settings space-y-6
const uiCode = `
                 <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider mt-6 pt-6 border-t border-slate-100">跨裝置同步 (本機備份與還原)</h3>
                    <div className="flex flex-col gap-3">
                        <button onClick={handleExportBackup} className="w-full py-3 px-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
                            匯出資料 (下載備份檔)
                        </button>
                        <label className="w-full py-3 px-4 bg-orange-50 text-orange-700 border border-orange-200 rounded-xl font-bold text-sm hover:bg-orange-100 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                            匯入資料 (覆蓋當前裝置)
                            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                        </label>
                        <p className="text-xs text-slate-500 leading-relaxed text-center mt-1">您可以將匯出的檔案傳送到手機上，然後在手機網頁中進行匯入，藉此達成跨裝置的資料同步。</p>
                    </div>
                 </div>
              </div>
              <button onClick={()=>setShowSettingsModal(false)} className="w-full mt-8 py-3 bg-slate-800 text-white rounded-xl font-bold">完成設定</button>
`;

c = c.replace(
  `             </div>\n             <button onClick={()=>setShowSettingsModal(false)} className="w-full mt-8 py-3 bg-slate-800 text-white rounded-xl font-bold">完成設定</button>`,
  uiCode
);

fs.writeFileSync('src/App.jsx', c);
console.log('done patch_backup');
