const fs = require('fs');
const file = 'd:/jp/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace learnStatus with status and accuracy in colDefinitions
content = content.replace(
  /'learnStatus': { label: '.*?', sortable: true },/,
  "'status': { label: '學習狀態', sortable: true },\\n    'accuracy': { label: '整體準確率', sortable: true },"
);

// Replace learnStatus with status and accuracy in defaultCols
content = content.replace(
  /const defaultCols = \['isImportant', 'type', 'tag', 'meaning', 'dateAdded', 'actions'\];/,
  "const defaultCols = ['isImportant', 'status', 'accuracy', 'type', 'tag', 'meaning', 'dateAdded', 'actions'];"
);

// We should also replace 'learnStatus' with 'status' in VERB_DEFAULT_WIDTHS
content = content.replace(
  /learnStatus: 110,/,
  "status: 110,\\n  accuracy: 110,"
);

fs.writeFileSync(file, content, 'utf8');
console.log('App.jsx table columns updated.');
