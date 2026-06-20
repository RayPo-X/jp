const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');
code = code.split("vocabManageTab]);\\n\\n  const grammarStats").join("vocabManageTab]);\\n\\n  const grammarStats");
fs.writeFileSync('src/App.jsx', code);
