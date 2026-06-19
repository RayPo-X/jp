const fs = require('fs');
let code = fs.readFileSync('d:\\jp\\src\\App.jsx', 'utf8');

const target = '<div className="font-bold text-slate-800">套用自訂文法測驗</div>';
const replacement = '<div className="font-bold text-slate-800">文法測驗</div>';

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('d:\\jp\\src\\App.jsx', code, 'utf8');
    console.log("Success");
} else {
    console.log("Target not found.");
}
