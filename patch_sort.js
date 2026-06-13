import fs from 'fs';
let content = fs.readFileSync('src/App.jsx', 'utf8');

// Add sort state
const stateTarget = const [editingTagId, setEditingTagId] = useState(null);;
const stateRepl = const [editingTagId, setEditingTagId] = useState(null);
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
          const getTs = (id) => { const p = (id||'').split('_'); return (p.length >= 3 && !isNaN(Number(p[2]))) ? Number(p[2]) : 0; };
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
;
content = content.replace(stateTarget, stateRepl);

// Update table headers
const tableTarget = <thead className="bg-slate-50 text-slate-600"><tr><th className="p-4 rounded-tl-xl">主題標籤</th><th className="p-4">單字 (平假名)</th><th className="p-4">中文 / 例句</th><th className="p-4">熟練度</th><th className="p-4">加入日期</th><th className="p-4">下次複習</th><th className="p-4 rounded-tr-xl">操作</th></tr></thead>;
const tableRepl = <thead className="bg-slate-50 text-slate-600"><tr>
                    <th className="p-4 rounded-tl-xl cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('tag')}>主題標籤{renderSortIcon('tag')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('word')}>單字 (平假名){renderSortIcon('word')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('meaning')}>中文 / 例句{renderSortIcon('meaning')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>熟練度{renderSortIcon('status')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('dateAdded')}>加入日期{renderSortIcon('dateAdded')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('nextReview')}>下次複習{renderSortIcon('nextReview')}</th>
                    <th className="p-4 rounded-tr-xl">操作</th>
                  </tr></thead>;
content = content.replace(tableTarget, tableRepl);

// Update table map
const mapTarget = {vocabDB.map(v => (;
const mapRepl = {sortedVocabDB.map(v => (;
content = content.replace(mapTarget, mapRepl);

fs.writeFileSync('src/App.jsx', content, 'utf8');
