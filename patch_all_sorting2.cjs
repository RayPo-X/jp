const fs = require('fs');
const file = 'd:/jp/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

const sortingLogic = `
  const [vocabSortConfig, setVocabSortConfig] = useState({ key: 'dateAdded', direction: 'desc' });
  const sortedVocabDB = useMemo(() => {
    let sorted = [...vocabDB];
    sorted.sort((a, b) => {
      let aVal, bVal;
      switch (vocabSortConfig.key) {
        case 'tag': aVal = a.tag || ''; bVal = b.tag || ''; break;
        case 'word': aVal = a.word || a.reading || ''; bVal = b.word || b.reading || ''; break;
        case 'meaning': aVal = a.meaning || ''; bVal = b.meaning || ''; break;
        case 'status': aVal = a.repetitions || 0; bVal = b.repetitions || 0; break;
        case 'nextReview': aVal = a.nextReview || 0; bVal = b.nextReview || 0; break;
        case 'dateAdded':
        default:
          const getTs = (id) => { const p = (id||'').split('_'); return (p.length >= 3 && !isNaN(Number(p[p.length-1]))) ? Number(p[p.length-1]) : 0; };
          aVal = getTs(a.id); bVal = getTs(b.id); break;
      }
      if (aVal < bVal) return vocabSortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return vocabSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [vocabDB, vocabSortConfig]);

  const handleSort = (key) => {
    setVocabSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const renderSortIcon = (key) => {
    if (vocabSortConfig.key !== key) return null;
    return <span className="ml-1 text-amber-500">{vocabSortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

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

if (!content.includes('vocabSortConfig')) {
    content = content.replace('const [editingTagId, setEditingTagId] = useState(null);', 'const [editingTagId, setEditingTagId] = useState(null);' + '\n' + sortingLogic);
} else {
    console.log("vocabSortConfig already exists");
}

const targetVocabTable = '<thead className="bg-slate-50 text-slate-600"><tr><th className="p-4 rounded-tl-xl">主題標籤</th><th className="p-4">單字 (平假名)</th><th className="p-4">中文 / 例句</th><th className="p-4">熟練度</th><th className="p-4">加入日期</th><th className="p-4">下次複習</th><th className="p-4 rounded-tr-xl">操作</th></tr></thead>';
const replacementVocabTable = `<thead className="bg-slate-50 text-slate-600"><tr>
                    <th className="p-4 rounded-tl-xl cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('tag')}>主題標籤{renderSortIcon('tag')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('word')}>單字 (平假名){renderSortIcon('word')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('meaning')}>中文 / 例句{renderSortIcon('meaning')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('status')}>熟練度{renderSortIcon('status')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('dateAdded')}>加入日期{renderSortIcon('dateAdded')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('nextReview')}>下次複習{renderSortIcon('nextReview')}</th>
                    <th className="p-4 rounded-tr-xl">操作</th>
                 </tr></thead>`;
if (content.includes(targetVocabTable)) {
    content = content.replace(targetVocabTable, replacementVocabTable);
} else {
    console.log("Failed to find vocab table header");
}

content = content.replace('{vocabDB.map(v => (', '{sortedVocabDB.map(v => (');

const targetVerbTable = '<thead className="bg-slate-50 text-slate-600"><tr><th className="p-4 rounded-tl-xl">類型/群組</th><th className="p-4">ます形</th><th className="p-4">辭書/て形</th><th className="p-4">中文意思</th><th className="p-4">難易度</th><th className="p-4 rounded-tr-xl">操作</th></tr></thead>';
const replacementVerbTable = `<thead className="bg-slate-50 text-slate-600"><tr>
                    <th className="p-4 rounded-tl-xl cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleVerbSort('type')}>類型/群組{renderVerbSortIcon('type')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleVerbSort('tag')}>標籤/主題{renderVerbSortIcon('tag')}</th>
                    <th className="p-4">ます形</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleVerbSort('word')}>辭書/て形{renderVerbSortIcon('word')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleVerbSort('meaning')}>中文意思{renderVerbSortIcon('meaning')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleVerbSort('dateAdded')}>加入日期{renderVerbSortIcon('dateAdded')}</th>
                    <th className="p-4 rounded-tr-xl">操作</th>
                 </tr></thead>`;
if (content.includes(targetVerbTable)) {
    content = content.replace(targetVerbTable, replacementVerbTable);
} else {
    console.log("Failed to find verb table header");
}
content = content.replace('{verbDB.map(v => (', '{sortedVerbDB.map(v => (');

const targetVerbRow = `<td className="p-4"><span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold whitespace-nowrap">{v.type} ({v.group})</span></td>
                          <td className="p-4 font-bold text-slate-800">{renderRuby(v.masu)}</td>
                          <td className="p-4 text-slate-600">{renderRuby(v.jisho)} / {renderRuby(v.te)}</td>
                          <td className="p-4 font-bold text-slate-700">{v.meaning}</td>
                          <td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-500 uppercase">{v.difficulty}</span></td>`;
const replacementVerbRow = `<td className="p-4"><span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold whitespace-nowrap">{v.type === 'verb' ? '動詞' : v.type === 'adj_i' ? 'i形' : 'na形'} ({v.group})</span></td>
                          <td className="p-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{v.tag || '無'}</span></td>
                          <td className="p-4 font-bold text-slate-800">{renderRuby(v.masu)}</td>
                          <td className="p-4 text-slate-600">{renderRuby(v.jisho)} / {renderRuby(v.te)}</td>
                          <td className="p-4 font-bold text-slate-700">{v.meaning}</td>
                          <td className="p-4 text-xs text-slate-400 whitespace-nowrap">{(() => { const p = (v.id||'').split('_'); const ts = (p.length >= 3 && !isNaN(Number(p[p.length-1]))) ? Number(p[p.length-1]) : 0; return ts ? new Date(ts).toLocaleDateString() : '系統內建'; })()}</td>`;
if (content.includes(targetVerbRow)) {
    content = content.replace(targetVerbRow, replacementVerbRow);
} else {
    console.log("Failed to find verb table row");
}

fs.writeFileSync(file, content, 'utf8');
console.log('Done script');
