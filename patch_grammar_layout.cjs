const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

let lines = c.split('\n');

// Find the line with the grammar card
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('className="p-5 bg-white border border-slate-200 rounded-2xl flex justify-between items-center shadow-sm hover:border-emerald-300 transition-colors"')) {
    // The very next line is `<div>`
    if (lines[i+1].includes('<div>')) {
      lines[i+1] = lines[i+1].replace('<div>', '<div className="flex-1 min-w-0 pr-4">');
    }
  }
  
  if (lines[i].includes('<div className="text-[15px] bg-blue-50/80 border border-blue-100 text-blue-900 px-4 py-2.5 rounded-xl font-bold tracking-wide mt-2">')) {
     lines[i] = lines[i].replace('className="', 'className="w-full ');
  }
}

fs.writeFileSync('src/App.jsx', lines.join('\n'));
console.log('done');
