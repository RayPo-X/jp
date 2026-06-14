const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

let lines = c.split('\n');

// Delete the processExample input field on line 2770 (0-indexed 2769)
// It looks like: <div><label className="block text-sm font-bold text-emerald-700 mb-1.5">變化過程範例 (選填)</label><input type="text" value={newGrammar.processExample || ''} onChange={e => setNewGrammar(p => ({...p, processExample: e.target.value}))} placeholder="自由輸入，例如：飲む ➔ 飲んで ➔ 飲んでください" className="w-full p-4 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500"/></div>
lines.splice(2769, 1);

// Delete the grammar card process example block (lines 2703 to 2743, 0-indexed 2702 to 2742)
// Since we deleted a line below it, the indices for this block haven't changed yet
// Number of lines to remove = 2743 - 2703 + 1 = 41 lines
lines.splice(2702, 41);

c = lines.join('\n');

// Also cleanup processExample from the state initializations
c = c.replace(
  "const [newGrammar, setNewGrammar] = useState({ name: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '', processExample: '' });",
  "const [newGrammar, setNewGrammar] = useState({ name: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '' });"
);

c = c.replace(
  "example: g.example || '',\n      processExample: g.processExample || ''",
  "example: g.example || ''"
);
c = c.replace(
  "example: g.example || '',\r\n      processExample: g.processExample || ''",
  "example: g.example || ''"
);

c = c.replace(
  "setNewGrammar({ name: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '', processExample: '' });",
  "setNewGrammar({ name: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '' });"
);

fs.writeFileSync('src/App.jsx', c);
console.log('done');
