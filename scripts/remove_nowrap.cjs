const fs = require('fs');
const file = 'd:/jp/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

// The main tables use these strings:
// VocabDB Headers
content = content.replace(/className=\"p-4 whitespace-nowrap cursor-grab/g, 'className=\"p-4 cursor-grab');

// VocabDB Cells
content = content.replace(/className=\"p-4 text-slate-500 font-medium whitespace-nowrap\"/g, 'className=\"p-4 text-slate-500 font-medium\"');
content = content.replace(/className=\"font-bold text-slate-700 whitespace-nowrap\"/g, 'className=\"font-bold text-slate-700\"');

// VerbDB Headers
content = content.replace(/className=\"p-4 whitespace-nowrap cursor-grab/g, 'className=\"p-4 cursor-grab');

// VerbDB Cells
content = content.replace(/className=\"p-4 text-xs text-slate-400 whitespace-nowrap\"/g, 'className=\"p-4 text-xs text-slate-400\"');
content = content.replace(/className=\"p-4 font-bold text-slate-300 whitespace-nowrap\"/g, 'className=\"p-4 font-bold text-slate-300\"');
content = content.replace(/className=\"p-4 font-bold text-slate-700 whitespace-nowrap\"/g, 'className=\"p-4 font-bold text-slate-700\"');
content = content.replace(/className=\"inline-block px-2.5 py-1 text-xs font-bold rounded-lg whitespace-nowrap/g, 'className=\"inline-block px-2.5 py-1 text-xs font-bold rounded-lg');


fs.writeFileSync(file, content, 'utf8');
console.log('App.jsx whitespace-nowrap removed.');
