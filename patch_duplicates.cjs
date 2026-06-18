const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// Patch handleBatchSave
const handleBatchSaveRegex = /const handleBatchSave = \(\) => \{[\s\S]*?\}\)\);\s+if \(newVocabs\.length > 0\) \{/;
const newHandleBatchSave = `const handleBatchSave = () => {
    createVocabBackup();
    const newVocabs = batchInputs
      .filter(v => (v.word.trim() || v.reading.trim() || v.example.trim()) && v.meaning.trim())
      .map((v, i) => ({
        id: \`v_custom_\${Date.now()}_\${i}\`, 
        word: v.word.trim(), 
        reading: v.reading.trim() || v.word.trim(), 
        meaning: v.meaning.trim(), 
        tag: v.tag || '自訂', 
        example: v.example.trim(),
        isSentence: !!v.isSentence,
        ef: 2.5, interval: 0, repetitions: 0, nextReview: 0, status: addToReviewNow ? 'learning' : 'new'
    }));

    const isDuplicate = (nv) => vocabDB.some(ev => {
        if (nv.word) return ev.word === nv.word;
        return ev.reading === nv.reading && !ev.word;
    });
    const duplicates = newVocabs.filter(isDuplicate);
    if (duplicates.length > 0) {
        const dupWords = duplicates.map(d => d.word || d.reading).join(', ');
        alert(\`批次新增失敗！發現重複的單字：\\n\${dupWords}\\n\\n請手動刪除重複項目後再試一次！\`);
        return;
    }

    if (newVocabs.length > 0) {`;
c = c.replace(handleBatchSaveRegex, newHandleBatchSave);


// Patch handleVerbSmartImport
const handleVerbSmartImportRegex = /const validVerbs = newVerbs\.filter\(v => v\.jisho && v\.meaning\);\s+if \(validVerbs\.length > 0\) \{/;
const newHandleVerbSmartImport = `const validVerbs = newVerbs.filter(v => v.jisho && v.meaning);
    if (validVerbs.length > 0) {
        const isVerbDuplicate = (nv) => verbDB.some(ev => (ev.jisho && ev.jisho === nv.jisho) || (ev.masu && ev.masu === nv.masu));
        const duplicates = validVerbs.filter(isVerbDuplicate);
        if (duplicates.length > 0) {
            const dupWords = duplicates.map(d => d.jisho || d.masu).join(', ');
            alert(\`批次新增失敗！發現重複的動詞/形容詞：\\n\${dupWords}\\n\\n請手動刪除重複項目後再試一次！\`);
            return;
        }`;
c = c.replace(handleVerbSmartImportRegex, newHandleVerbSmartImport);


// Patch handleAddVerb
const handleAddVerbRegex = /const handleAddVerb = \(\) => \{\s+if \(!verbInputs\.masu \|\| !verbInputs\.meaning\) return alert\('請填寫至少 masu, meaning'\);/;
const newHandleAddVerb = `const handleAddVerb = () => {
    if (!verbInputs.masu || !verbInputs.meaning) return alert('請填寫至少 masu, meaning');
    const isVerbDuplicate = verbDB.some(ev => (ev.jisho && ev.jisho === verbInputs.jisho) || (ev.masu && ev.masu === verbInputs.masu));
    if (isVerbDuplicate) {
        alert('此動詞/形容詞已存在於題庫中（辭書形或ます形重複），禁止重複新增！');
        return;
    }`;
c = c.replace(handleAddVerbRegex, newHandleAddVerb);

fs.writeFileSync('src/App.jsx', c);
console.log('done patch duplicates');
