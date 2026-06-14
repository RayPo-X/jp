const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');
let lines = c.split('\n');

const injectBlock = `                            {g.processExample && (
                               <div className="w-full text-[14px] bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-lg font-medium mb-2 whitespace-pre-wrap">
                                  {g.processExample}
                               </div>
                            )}`;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{g.example && (')) {
     if (lines[i-1].includes('接在前面')) {
         // This is the target block for rendering!
         // wait, lines[i-1] is the closing </div> of the '接在前面' block
         if (!lines[i-1].includes('processExample')) {
            lines.splice(i, 0, injectBlock);
         }
         break;
     } else if (lines[i-2].includes('接在前面')) {
         if (!lines[i-1].includes('processExample')) {
            lines.splice(i, 0, injectBlock);
         }
         break;
     }
  }
}

fs.writeFileSync('src/App.jsx', lines.join('\n'));
console.log('done exact inject');
