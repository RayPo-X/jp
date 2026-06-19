const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Update generateVerbQuestion
const oldGenBody = `    else if (mode === 'custom') {
      if (customWordIds.length === 0) { alert('請先到設定勾選自訂單字！'); goHome(); return; }
      const customWords = verbDB.filter(w => customWordIds.includes(w.id));
      customWords.forEach(word => validTargets.forEach(target => { if (word[target]) availablePool.push({ word, target, grammarDef: null }); }));
    }
    else {
      let filteredWords = verbDB.filter(w => activeWordTypes.includes(w.type));
      if (filteredWords.length === 0) return;
      filteredWords.forEach(word => validTargets.forEach(target => { if (word[target]) availablePool.push({ word, target, grammarDef: null }); }));
    }`;

const newGenBody = `    else {
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

c = c.replace(oldGenBody, newGenBody);


// 2. Update SettingsModal UI
const oldUI = `                 <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider mt-6 pt-6 border-t border-slate-100">跨裝置同步 (本機備份與還原)</h3>`;

const newUI = `                 {appState === 'verb_playing' && (
                  <>
                    <div className="pt-6 border-t border-slate-100">
                      <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">出題基準 (看到什麼形)</h3>
                      <select value={sourceForm} onChange={(e) => setSourceForm(e.target.value)} className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors">
                        {verbForms.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center justify-between">變化練習目標 (要變成什麼形) <span className="text-xs font-normal text-slate-500">可複選</span></h3>
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
                    <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider mt-6 pt-6 border-t border-slate-100">跨裝置同步 (本機備份與還原)</h3>`;

c = c.replace(oldUI, newUI);

fs.writeFileSync('src/App.jsx', c);
console.log('done patch_verb_settings');
