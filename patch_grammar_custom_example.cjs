const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Update newGrammar initialization
c = c.replace(
  "const [newGrammar, setNewGrammar] = useState({ name: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '' });",
  "const [newGrammar, setNewGrammar] = useState({ name: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '', processExample: '' });"
);

// 2. Update handleEditGrammar
c = c.replace(
  "example: g.example || ''",
  "example: g.example || '',\n      processExample: g.processExample || ''"
);

// 3. Update cancel edit button to reset processExample
c = c.replace(
  "setNewGrammar({ name: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '' });",
  "setNewGrammar({ name: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '', processExample: '' });"
);

// 4. Add processExample input to the form
const exampleInputStr = '<div><label className="block text-sm font-bold text-emerald-700 mb-1.5">例句 (選填)</label><input type="text" value={newGrammar.example} onChange={e => setNewGrammar(p => ({...p, example: e.target.value}))} placeholder="例：ここでタバコを吸わないでください" className="w-full p-4 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500"/></div>';
const newInputsStr = `<div><label className="block text-sm font-bold text-emerald-700 mb-1.5">變化過程範例 (選填)</label><input type="text" value={newGrammar.processExample || ''} onChange={e => setNewGrammar(p => ({...p, processExample: e.target.value}))} placeholder="自由輸入，例如：飲む ➔ 飲んで ➔ 飲んでください" className="w-full p-4 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500"/></div>\n                      ` + exampleInputStr;

c = c.replace(exampleInputStr, newInputsStr);

// 5. Update display logic in grammar cards
const displayStrOld = `<div className="text-[13px] text-slate-400 font-normal mb-1">變化過程範例：</div>
                                   {(() => {`;
const displayStrNew = `<div className="text-[13px] text-slate-400 font-normal mb-1">變化過程範例：</div>
                                   {g.processExample ? (
                                      <div className="text-slate-700 font-bold text-[15px] px-2 py-1 bg-white rounded-lg border border-slate-100">{g.processExample}</div>
                                   ) : (() => {`;
c = c.replace(displayStrOld, displayStrNew);
c = c.replace(displayStrOld.replace(/\n/g, '\r\n'), displayStrNew);

// Make sure we close the conditional rendering correctly
const returnBlockEnd = `                                         </div>
                                       );
                                   })()}
                                </div>`;
const returnBlockEndNew = `                                         </div>
                                       );
                                   })()}
                                </div>`;

c = c.replace(returnBlockEnd, returnBlockEndNew);

fs.writeFileSync('src/App.jsx', c);
console.log('done patch script 5');
