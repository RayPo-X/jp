const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const targetDef = `  const colDefinitions = {
    'type': { label: '類型/群組', sortable: true },
    'tag': { label: '標籤/主題', sortable: true },
    'meaning': { label: '中文意思', sortable: true },
    'dateAdded': { label: '加入日期', sortable: true },
    'actions': { label: '操作', sortable: false }
  };`;

const newDef = `  const colDefinitions = {
    'isImportant': { label: '重要(⭐)', sortable: true },
    'type': { label: '類型/群組', sortable: true },
    'tag': { label: '標籤/主題', sortable: true },
    'meaning': { label: '中文意思', sortable: true },
    'dateAdded': { label: '加入日期', sortable: true },
    'actions': { label: '操作', sortable: false }
  };`;

c = c.replace(targetDef, newDef);
fs.writeFileSync('src/App.jsx', c);
console.log('done patching colDefinitions');
