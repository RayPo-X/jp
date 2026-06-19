const fs = require('fs');
const file = 'd:/jp/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Inject sorting logic
const s1 = "  const renderSortIcon = (key) => {\n    if (vocabSortConfig.key !== key) return null;\n    return <span className=\"ml-1 text-amber-500\">{vocabSortConfig.direction === 'asc' ? '↑' : '↓'}</span>;\n  };";

const verbSortingLogic = `
  const [verbSortConfig, setVerbSortConfig] = useState({ key: 'dateAdded', direction: 'desc' });
  const sortedVerbDB = useMemo(() => {
    let sorted = [...verbDB];
    sorted.sort((a, b) => {
      let aVal, bVal;
      switch (verbSortConfig.key) {
        case 'tag': aVal = a.tag || ''; bVal = b.tag || ''; break;
        case 'type': aVal = a.type + a.group; bVal = b.type + b.group; break;
        case 'word': aVal = a.jisho || ''; bVal = b.jisho || ''; break;
        case 'meaning': aVal = a.meaning || ''; bVal = b.meaning || ''; break;
        case 'difficulty': aVal = a.difficulty || 'easy'; bVal = b.difficulty || 'easy'; break;
        case 'dateAdded':
        default:
          const getTs = (id) => { const p = (id||'').split('_'); return (p.length >= 3 && !isNaN(Number(p[p.length-1]))) ? Number(p[p.length-1]) : 0; };
          aVal = getTs(a.id); bVal = getTs(b.id); break;
      }
      if (aVal < bVal) return verbSortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return verbSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [verbDB, verbSortConfig]);
  
  const handleVerbSort = (key) => {
    setVerbSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const renderVerbSortIcon = (key) => {
    if (verbSortConfig.key !== key) return null;
    return <span className="ml-1 text-indigo-500">{verbSortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };
`;

content = content.replace(s1, s1 + '\n' + verbSortingLogic);

// 2. Replace the table rendering
const s2 = `                 <thead className="bg-slate-50 text-slate-600"><tr><th className="p-4 rounded-tl-xl">類型/群組</th><th className="p-4">ます形</th><th className="p-4">辭書/て形</th><th className="p-4">中文意思</th><th className="p-4">難易度</th><th className="p-4 rounded-tr-xl">操作</th></tr></thead>
                 <tbody>
                    {verbDB.map(v => (`

const r2 = `                 <thead className="bg-slate-50 text-slate-600"><tr>
                    <th className="p-4 rounded-tl-xl cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleVerbSort('type')}>類型/群組{renderVerbSortIcon('type')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleVerbSort('tag')}>標籤/主題{renderVerbSortIcon('tag')}</th>
                    <th className="p-4">ます形</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleVerbSort('word')}>辭書/て形{renderVerbSortIcon('word')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleVerbSort('meaning')}>中文意思{renderVerbSortIcon('meaning')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleVerbSort('dateAdded')}>加入日期{renderVerbSortIcon('dateAdded')}</th>
                    <th className="p-4 rounded-tr-xl">操作</th>
                 </tr></thead>
                 <tbody>
                    {sortedVerbDB.map(v => (`

content = content.replace(s2, r2);

// 3. Replace the row rendering
const s3 = `                          <td className="p-4"><span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold whitespace-nowrap">{v.type} ({v.group})</span></td>
                          <td className="p-4 font-bold text-slate-800">{renderRuby(v.masu)}</td>
                          <td className="p-4 text-slate-600">{renderRuby(v.jisho)} / {renderRuby(v.te)}</td>
                          <td className="p-4 font-bold text-slate-700">{v.meaning}</td>
                          <td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-500 uppercase">{v.difficulty}</span></td>
                          <td className="p-4"><button onClick={()=>{if(window.confirm('確定刪除？')) setVerbDB(verbDB.filter(x=>x.id!==v.id))}} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button></td>`

const r3 = `                          <td className="p-4"><span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold whitespace-nowrap">{v.type === 'verb' ? '動詞' : v.type === 'adj_i' ? 'i形' : 'na形'} ({v.group})</span></td>
                          <td className="p-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{v.tag || '無'}</span></td>
                          <td className="p-4 font-bold text-slate-800">{renderRuby(v.masu)}</td>
                          <td className="p-4 text-slate-600">{renderRuby(v.jisho)} / {renderRuby(v.te)}</td>
                          <td className="p-4 font-bold text-slate-700">{v.meaning}</td>
                          <td className="p-4 text-xs text-slate-400 whitespace-nowrap">{(() => { const p = (v.id||'').split('_'); const ts = (p.length >= 3 && !isNaN(Number(p[p.length-1]))) ? Number(p[p.length-1]) : 0; return ts ? new Date(ts).toLocaleDateString() : '系統內建'; })()}</td>
                          <td className="p-4"><button onClick={()=>{if(window.confirm('確定刪除？')) setVerbDB(verbDB.filter(x=>x.id!==v.id))}} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button></td>`

content = content.replace(s3, r3);

fs.writeFileSync(file, content, 'utf8');
console.log('Success');
