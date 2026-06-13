const text = `
### 1️⃣ [[～ときに～]]

👉 在～的時候～

#### 🧩 結構

- 動詞辭書形 + ときに～
- 動詞た形 + ときに～

#### 📝 例句

- くににかえるときに、おみやげをかいます。  
    👉 回國之前買伴手禮。

### 5️⃣ [[～つもりです]]

👉 打算～、預定～

#### 🧩 結構

- 動詞辭書形 + つもりです

#### 📝 例句

- くににかえるつもりです。  
    👉 打算回國。
`;

function parseMarkdown(text) {
    const vocabResults = [];
    const grammarResults = [];

    let currentMode = 'vocab'; 
    let currentTag = '自訂';
    let currentGrammarName = '';
    
    let currentVocab = null;

    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
         const line = lines[i].trim();
         if (!line) continue;

         if (line.includes('💬 對話') || line.includes('3️⃣ 💬')) {
             currentMode = 'skip';
             continue;
         }

         if (line.startsWith('### ')) {
             const rawHeader = line.replace(/^###\s+/, '').trim();
             if (rawHeader.includes('[[') && rawHeader.includes(']]')) {
                 currentMode = 'grammar_desc';
                 currentGrammarName = rawHeader; 
             } else {
                 currentMode = 'vocab';
                 currentTag = rawHeader.replace(/^[\s\S]*?(?=[a-zA-Z\u4e00-\u9fa5\u3040-\u309F\u30A0-\u30FF])/, '').trim() || rawHeader;
             }
             continue;
         }

         if (currentMode === 'skip') {
             // If we see a new header that is not dialog, we stop skipping
             if (line.startsWith('### ') || line.startsWith('## ')) {
                 // But we already caught it in the above if. 
                 // So if it's not a header, we just skip it.
             } else {
                 continue;
             }
         }

         if (currentMode === 'grammar_desc' && line.startsWith('👉 ')) {
             currentGrammarName = line.replace(/^👉\s*/, '').trim();
             continue;
         }

         if (line.startsWith('#### 🧩 結構')) {
             currentMode = 'grammar_struct';
             continue;
         }

         if (line.startsWith('#### 📝 例句')) {
             currentMode = 'sentence';
             currentTag = currentGrammarName || '例句'; 
             continue;
         }

         if (line.startsWith('- ')) {
             const rawContent = line.substring(2).trim();
             
             if (currentMode === 'grammar_struct') {
                 const parts = rawContent.split('+').map(s => s.trim());
                 if (parts.length >= 2 && parts[0].includes('動詞')) {
                     let baseForm = 'dic'; 
                     if (parts[0].includes('辭書形') || parts[0].includes('辞書形')) baseForm = 'dic';
                     else if (parts[0].includes('た形')) baseForm = 'ta';
                     else if (parts[0].includes('て形')) baseForm = 'te';
                     else if (parts[0].includes('ない形')) baseForm = 'nai';
                     
                     let appendStr = parts.slice(1).join('').replace(/～/g, ''); 
                     grammarResults.push({
                         name: currentGrammarName || appendStr,
                         baseForm: baseForm,
                         removeStr: '',
                         appendStr: appendStr,
                         appliesTo: ['verb']
                     });
                 }
             } else if (currentMode === 'vocab') {
                 if (currentVocab) vocabResults.push({...currentVocab});
                 
                 let word = rawContent;
                 let reading = rawContent;
                 const bracketMatch = rawContent.match(/^(.+?)（(.+?)）$/) || rawContent.match(/^(.+?)\((.+?)\)$/);
                 if (bracketMatch) {
                     word = bracketMatch[2].trim() + '[' + bracketMatch[1].trim() + ']';
                     reading = bracketMatch[1].trim();
                 }
                 currentVocab = {
                    word, reading, meaning: '', tag: currentTag, example: ''
                 };
             } else if (currentMode === 'sentence') {
                 if (currentVocab) vocabResults.push({...currentVocab});
                 currentVocab = {
                    word: rawContent, reading: rawContent, meaning: '', tag: currentTag, example: ''
                 };
             }
             continue;
         }

         if (currentVocab && (line.startsWith('➜ ') || line.startsWith('-> ') || line.startsWith('=> ') || line.startsWith('👉 '))) {
             currentVocab.meaning = line.replace(/^(➜|->|=>|👉)\s*/, '').trim();
             vocabResults.push({...currentVocab});
             currentVocab = null;
         }
    }
    if (currentVocab) vocabResults.push(currentVocab);

    return { vocabResults, grammarResults };
}

console.log(JSON.stringify(parseMarkdown(text), null, 2));
