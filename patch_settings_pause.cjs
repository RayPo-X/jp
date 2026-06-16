const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(
  '<button onClick={() => setShowSettingsModal(true)} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"><Settings className="w-5 h-5" /></button>',
  '<button onClick={() => { setIsPaused(true); setShowSettingsModal(true); }} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"><Settings className="w-5 h-5" /></button>'
);

fs.writeFileSync('src/App.jsx', c);
console.log('done patch_settings_pause');
