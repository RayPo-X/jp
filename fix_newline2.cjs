const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');
code = code.replace("vocabManageTab]);\\n  const", "vocabManageTab]);\n  const");
fs.writeFileSync('src/App.jsx', code);
