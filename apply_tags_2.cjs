const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// --- 1. Vocab Batch Add ---
code = code.replace(
    /setBatchInputs\(\[\.\.\.batchInputs, \{word:'', reading:'', meaning:'', tag: '未知', example: '', isSentence: false\}\]\)/g,
    "setBatchInputs([...batchInputs, {word:'', reading:'', meaning:'', tag: '未知', tags: [], example: '', isSentence: false}])"
);

code = code.replace(
    /<div><label className="block text-xs font-bold text-slate-500 mb-1">標籤主?<\/label><input type="text" value=\{item\.tag\} onChange=\{e => setBatchInputs\(batchInputs\.map\(\(x,i\) => i === idx \? \{\.\.\.x, tag: e\.target\.value\} : x\)\)\} list="theme-suggestions" placeholder="例如: 學校" className="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-amber-500"\/><\/div>/,
    `<div><label className="block text-xs font-bold text-slate-500 mb-1">標籤 (逗號分隔)</label><input type="text" value={(item.tags||[]).join(', ')} onChange={e => setBatchInputs(batchInputs.map((x,i) => i === idx ? {...x, tags: e.target.value.split(',')} : x))} onBlur={e => setBatchInputs(batchInputs.map((x,i) => i === idx ? {...x, tags: processTags(e.target.value)} : x))} placeholder="例如: N5, 學校" className="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-amber-500"/></div>`
);

// --- 2. Verb Add ---
code = code.replace(
    /const getInitialVerbInputs = \(\) => \(\{ type: 'v1', jisho: '', masu: '', meaning: '', tag: '未知' \}\);/,
    "const getInitialVerbInputs = () => ({ type: 'v1', jisho: '', masu: '', meaning: '', tag: '未知', tags: [] });"
);

// Wait, the actual text in the code might be slightly different. Let's use simple splits.
// It seems the regex for label might have encoding issues (標籤主題 vs 標籤主?).
// Let me just write a safer replacement function using .split().join() on specific substrings.
