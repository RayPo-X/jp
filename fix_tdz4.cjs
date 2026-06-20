const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');
code = code.replace(/vocabManageTab\]\);\\n\\n  const grammarStats/g, "vocabManageTab]);\\n\\n  const grammarStats");
fs.writeFileSync('src/App.jsx', code);
