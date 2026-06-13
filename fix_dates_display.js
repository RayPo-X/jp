import fs from 'fs';
let content = fs.readFileSync('src/App.jsx', 'utf8');

const targetAddedDate = `  const getAddedDate = (id) => {
    if (!id) return '-';
    const parts = String(id).split('_');
    if (parts.length >= 3 && !isNaN(Number(parts[parts.length-1]))) {
      const date = new Date(Number(parts[parts.length-1]));
      return \`\${date.getMonth() + 1}/\${date.getDate()}\`;
    }
    return '內建';
  };`;

const replAddedDate = `  const getAddedDate = (id) => {
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
    return '系統內建';
  };`;
content = content.replace(targetAddedDate, replAddedDate);

const targetGetTs = `          const getTs = (id) => { const p = String(id||'').split('_'); return (p.length >= 3 && !isNaN(Number(p[p.length-1]))) ? Number(p[p.length-1]) : 0; };`;
const replGetTs = `          const getTs = (id) => { const p = String(id||'').split('_'); for (const x of p) { const n = Number(x); if (!isNaN(n) && n > 1000000000000) return n; } return 0; };`;
content = content.replace(targetGetTs, replGetTs); // Replace first occurrence
content = content.replace(targetGetTs, replGetTs); // Replace second occurrence

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('Fixed date display and sorting logic');
