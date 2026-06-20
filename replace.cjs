const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(/<div className="text-xs font-bold text-slate-500\/70">.*?<\/div>/, '<div className="text-xs font-bold text-slate-500/70">📚 待學習</div>');
c = c.replace(/<div className="text-xs font-bold text-blue-700\/70">.*?<\/div>/, '<div className="text-xs font-bold text-blue-700/70">🎯 已學習</div>');
c = c.replace(/<div className="text-xs font-bold text-amber-700\/70">.*?<\/div>/, '<div className="text-xs font-bold text-amber-700/70">🏆 精通</div>');
c = c.replace(/<div className="text-xs font-bold text-orange-700\/70">.*?<\/div>/, '<div className="text-xs font-bold text-orange-700/70">🗓️ 單字待複習</div>');
c = c.replace(/<div className="text-xs font-bold text-fuchsia-700\/70">.*?<\/div>/, '<div className="text-xs font-bold text-fuchsia-700/70">💬 例句待複習</div>');
c = c.replace(/<div className="text-xs font-bold text-red-400">.*?<\/div>/, '<div className="text-xs font-bold text-red-400">📒 錯題本</div>');

fs.writeFileSync('src/App.jsx', c);
console.log("Done");
