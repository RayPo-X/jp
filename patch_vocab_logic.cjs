const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const vocabGenRegex = /if \(inputMode === 'kanji'\) \{/;
const newVocabGen = `if (onlyImportantVocabTest) {
      const impPool = queue.filter(w => w.isImportant);
      if (impPool.length > 0) queue = impPool;
      else alert('目前的單字範圍內沒有標記為「重要」的項目！將回到一般出題。');
    }
    
    if (inputMode === 'kanji') {`;

c = c.replace(vocabGenRegex, newVocabGen);
fs.writeFileSync('src/App.jsx', c);
console.log('done patch vocab logic');
