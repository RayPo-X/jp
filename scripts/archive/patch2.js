import fs from 'fs';
let content = fs.readFileSync('src/App.jsx', 'utf8');

content = content.replace(
    /const validVerbs = newVerbs\.filter\(v => v\.jisho && v\.meaning\);\s*if \(validVerbs\.length > 0\) \{\s*setVerbDB\(prev => \[\.\.\.prev, \.\.\.validVerbs\.map\(\(v, i\) => \(\{ \.\.\.v, id: v\.type \+ '_custom_' \+ Date\.now\(\) \+ '_' \+ i \}\)\)\]\);\s*setVerbImportText\(''\);\s*alert\('成功匯入 ' \+ validVerbs\.length \+ ' 個詞彙！'\);\s*\} else \{\s*alert\('解析失敗，請確認格式是否為「辭書形」換行「中文意思」。'\);\s*\}/,
    `const validVerbs = newVerbs.filter(v => v.jisho);
    if (validVerbs.length > 0) {
        validVerbs.forEach(v => {
            if (!v.meaning) {
                const existing = verbDB.find(db => db.jisho === v.jisho) || INITIAL_VERB_DB.find(db => db.jisho === v.jisho);
                if (existing) v.meaning = existing.meaning;
                else v.meaning = '(未提供中文)';
            }
        });
        setBatchVerbInputs(validVerbs.map((v, i) => ({ ...v, id: v.type + '_custom_' + Date.now() + '_' + i })));
        setVerbImportText('');
    } else {
        alert('解析失敗，請確認格式。');
    }`
);

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('Patch 2 complete.');
