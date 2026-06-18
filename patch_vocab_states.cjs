const fs = require('fs');
let lines = fs.readFileSync('src/App.jsx', 'utf8').split('\n');

const toInsert = `  const [vocabTableColumnOrder, setVocabTableColumnOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('verbApp_vocabTableColumnOrder');
      if (saved) {
         let arr = JSON.parse(saved);
         if (!arr.includes('isImportant')) arr = ['isImportant', ...arr];
         return arr;
      }
    } catch {}
    return ['isImportant', 'tag', 'type', 'word', 'meaning', 'status', 'dateAdded', 'nextReview', 'actions'];
  });
  const [dragVocabColIdx, setDragVocabColIdx] = useState(null);
  const [dragOverVocabColIdx, setDragOverVocabColIdx] = useState(null);
  
  useEffect(() => {
    if (vocabTableColumnOrder.length > 0) {
      localStorage.setItem('verbApp_vocabTableColumnOrder', JSON.stringify(vocabTableColumnOrder));
    }
  }, [vocabTableColumnOrder]);

  const vocabColDefinitions = {
    'isImportant': { label: '重要(⭐)', sortable: true },
    'tag': { label: '主題標籤', sortable: true },
    'type': { label: '類型', sortable: true },
    'word': { label: '單字 (平假名)', sortable: true },
    'meaning': { label: '中文 / 例句', sortable: true },
    'status': { label: '熟練度', sortable: true },
    'dateAdded': { label: '加入日期', sortable: true },
    'nextReview': { label: '下次複習', sortable: true },
    'actions': { label: '操作', sortable: false }
  };`;

// Also fix verbTableColumnOrder initialization in useEffect!
let useEffectIdxStart = -1;
let useEffectIdxEnd = -1;
for (let i = 500; i < 550; i++) {
    if (lines[i] && lines[i].includes("const defaultCols = ['type', 'tag', 'meaning', 'dateAdded', 'actions'];")) {
        lines[i] = "    const defaultCols = ['isImportant', 'type', 'tag', 'meaning', 'dateAdded', 'actions'];";
    }
    if (lines[i] && lines[i].includes("if (!newOrder.includes('type')) newOrder.splice(0, 0, 'type');")) {
        lines[i] = "       if (!newOrder.includes('isImportant')) newOrder.splice(0, 0, 'isImportant');\n       if (!newOrder.includes('type')) newOrder.splice(1, 0, 'type');";
    }
}

// Find dragTableColIdx
for (let i = 500; i < 580; i++) {
    if (lines[i] && lines[i].includes("const [dragTableColIdx, setDragTableColIdx] = useState(null);")) {
        lines.splice(i, 0, toInsert);
        break;
    }
}

fs.writeFileSync('src/App.jsx', lines.join('\n'));
console.log('done patch vocab and verb states');
