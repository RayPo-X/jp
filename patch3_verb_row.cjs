const fs = require('fs');
const file = 'd:/jp/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<td className="p-4"><span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold whitespace-nowrap">\{v\.type\} \(\{v\.group\}\)<\/span><\/td>[\s\S]*?<td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-500 uppercase">\{v\.difficulty\}<\/span><\/td>/;

const replacement = `<td className="p-4"><span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold whitespace-nowrap">{v.type === 'verb' ? '動詞' : v.type === 'adj_i' ? 'i形' : 'na形'} ({v.group})</span></td>
                          <td className="p-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{v.tag || '無'}</span></td>
                          <td className="p-4 font-bold text-slate-800">{renderRuby(v.masu)}</td>
                          <td className="p-4 text-slate-600">{renderRuby(v.jisho)} / {renderRuby(v.te)}</td>
                          <td className="p-4 font-bold text-slate-700">{v.meaning}</td>
                          <td className="p-4 text-xs text-slate-400 whitespace-nowrap">{(() => { const p = (v.id||'').split('_'); const ts = (p.length >= 3 && !isNaN(Number(p[p.length-1]))) ? Number(p[p.length-1]) : 0; return ts ? new Date(ts).toLocaleDateString() : '系統內建'; })()}</td>`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Success replacing row');
} else {
    console.log('Failed to match row');
}
