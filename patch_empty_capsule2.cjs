const fs = require('fs');
let code = fs.readFileSync('d:\\jp\\src\\App.jsx', 'utf8');

const target = '{verbForms.find(f=>f.id===g.baseForm)?.label && <>接在前面：<span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium border border-slate-200">{verbForms.find(f=>f.id===g.baseForm)?.label}</span></>}';
const replacement = '接在前面：{verbForms.find(f=>f.id===g.baseForm)?.label && <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium border border-slate-200">{verbForms.find(f=>f.id===g.baseForm)?.label}</span>}';

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('d:\\jp\\src\\App.jsx', code, 'utf8');
    console.log("Success");
} else {
    console.log("Failed: Target string not found.");
}
