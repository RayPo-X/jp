const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');
let lines = c.split('\n');

// 1. Add processExample back to state initialization
c = c.replace(
  "const [newGrammar, setNewGrammar] = useState({ name: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '' });",
  "const [newGrammar, setNewGrammar] = useState({ name: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '', processExample: '' });"
);

c = c.replace(
  "example: g.example || ''",
  "example: g.example || '', processExample: g.processExample || ''"
);

c = c.replace(
  "setNewGrammar({ name: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '' });",
  "setNewGrammar({ name: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '', processExample: '' });"
);

// 2. Add processExample input back to the editor form
const exampleInputStr = '<div><label className="block text-sm font-bold text-emerald-700 mb-1.5">例句 (選填)</label><input type="text" value={newGrammar.example} onChange={e => setNewGrammar(p => ({...p, example: e.target.value}))} placeholder="例：ここでタバコを吸わないでください" className="w-full p-4 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500"/></div>';
const newInputsStr = `<div><label className="block text-sm font-bold text-emerald-700 mb-1.5">變化筆記 (選填)</label><input type="text" value={newGrammar.processExample || ''} onChange={e => setNewGrammar(p => ({...p, processExample: e.target.value}))} placeholder="自由輸入，例如：飲む ➔ 飲んで ➔ 飲んでください" className="w-full p-4 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500"/></div>\n                      ` + exampleInputStr;

c = c.replace(exampleInputStr, newInputsStr);

// 3. Add processExample display below "接在前面"
const baseFormDisplayStr = `                            <div className="text-sm text-slate-500 flex items-center gap-2 mb-2 flex-wrap">
                               接在前面：{verbForms.find(f=>f.id===g.baseForm)?.label && <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium border border-slate-200">{verbForms.find(f=>f.id===g.baseForm)?.label}</span>}
                            </div>`;
const baseFormDisplayStrNew = `                            <div className="text-sm text-slate-500 flex items-center gap-2 mb-2 flex-wrap">
                               接在前面：{verbForms.find(f=>f.id===g.baseForm)?.label && <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium border border-slate-200">{verbForms.find(f=>f.id===g.baseForm)?.label}</span>}
                            </div>
                            {g.processExample && (
                               <div className="w-full text-[14px] bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-lg font-medium mb-2 whitespace-pre-wrap">
                                  {g.processExample}
                               </div>
                            )}`;

c = c.replace(baseFormDisplayStr, baseFormDisplayStrNew);
c = c.replace(baseFormDisplayStr.replace(/\n/g, '\r\n'), baseFormDisplayStrNew);

fs.writeFileSync('src/App.jsx', c);
console.log('done patch script');
