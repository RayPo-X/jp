import fs from 'fs';
let content = fs.readFileSync('src/App.jsx', 'utf8');

const targetDate = `  const getAddedDate = (id) => {
    if (!id) return '-';
    const parts = String(id).split('_');
    if (parts.length >= 3 && !isNaN(Number(parts[parts.length-1]))) {
      const date = new Date(Number(parts[parts.length-1]));
      return \`\${date.getMonth() + 1}/\${date.getDate()}\`;
    }
    return '內建';
  };`;

const replDate = `  const getAddedDate = (id) => {
    if (!id) return '-';
    const parts = String(id).split('_');
    let ts = 0;
    for (const p of parts) {
      const num = Number(p);
      if (!isNaN(num) && num > 1000000000000) { ts = num; break; }
    }
    if (ts > 0) {
      const date = new Date(ts);
      return \`\${date.getMonth() + 1}/\${date.getDate()}\`;
    }
    return '內建';
  };`;

content = content.replace(targetDate, replDate);

const targetSortVocab = `          const getTs = (id) => { const p = String(id||'').split('_'); return (p.length >= 3 && !isNaN(Number(p[p.length-1]))) ? Number(p[p.length-1]) : 0; };`;
const replSortVocab = `          const getTs = (id) => { const p = String(id||'').split('_'); for (const x of p) { const n = Number(x); if (!isNaN(n) && n > 1000000000000) return n; } return 0; };`;

content = content.replace(targetSortVocab, replSortVocab);
content = content.replace(targetSortVocab, replSortVocab); // Replace twice for vocab and verb sorting

const verbManageTableDateTarget = `<td className="p-4 text-xs text-slate-400 whitespace-nowrap">{(() => { const p = (v.id||'').split('_'); const ts = (p.length >= 3 && !isNaN(Number(p[p.length-1]))) ? Number(p[p.length-1]) : 0; return ts ? new Date(ts).toLocaleDateString() : '系統內建'; })()}</td>`;
const verbManageTableDateRepl = `<td className="p-4 text-xs text-slate-400 whitespace-nowrap">{getAddedDate(v.id)}</td>`;

content = content.replace(verbManageTableDateTarget, verbManageTableDateRepl);

fs.writeFileSync('src/App.jsx', content, 'utf8');
