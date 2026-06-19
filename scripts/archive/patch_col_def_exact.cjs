const fs = require('fs');
let lines = fs.readFileSync('src/App.jsx', 'utf8').split('\n');

const newDef = `  const colDefinitions = {
    'isImportant': { label: '重要(⭐)', sortable: true },
    'type': { label: '類型/群組', sortable: true },
    'tag': { label: '標籤/主題', sortable: true },
    'meaning': { label: '中文意思', sortable: true },
    'dateAdded': { label: '加入日期', sortable: true },
    'actions': { label: '操作', sortable: false }
  };`;

lines.splice(571, 7, newDef);
fs.writeFileSync('src/App.jsx', lines.join('\n'));
console.log('done patching colDefinitions exact');
