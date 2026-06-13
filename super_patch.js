import fs from 'fs';
let content = fs.readFileSync('src/App.jsx', 'utf8');

// === patch_vocab_display ===
const speechTarget = `question: vocabTestMode === 'sentence' ? (parseExample(currentVocab.example).plainSentence || currentVocab.word) : (vocabTestMode === 'reverse' ? currentVocab.word : currentVocab.meaning),`;
const speechRepl = `question: vocabTestMode === 'sentence' ? (parseExample(currentVocab.example).plainSentence || currentVocab.word || currentVocab.reading) : (vocabTestMode === 'reverse' ? (currentVocab.word || currentVocab.reading || currentVocab.example) : currentVocab.meaning),`;
content = content.replace(speechTarget, speechRepl);

const uiTarget = `                        <div className="text-sm text-slate-500 mb-2">請問這句日文的中文意思是？</div>
                        <div className="text-4xl sm:text-5xl font-black text-slate-800 tracking-wide mb-8 py-6">{currentVocab.word}</div>`;
const uiRepl = `                        <div className="text-sm text-slate-500 mb-2">請問這句日文的中文意思是？</div>
                        <div className="text-4xl sm:text-5xl font-black text-slate-800 tracking-wide mb-8 py-6">{currentVocab.word || currentVocab.reading || currentVocab.example}</div>`;
content = content.replace(uiTarget, uiRepl);

// === patch_vocab_all ===
const allTarget = `    if (mode === 'srs') queue = [...todayQueue];
    else if (mode === 'today_extra') queue = [...reviewedTodayQueue];
    else if (mode === 'mistakes') queue = Object.values(vocabMistakes);`;
const allRepl = `    if (mode === 'srs') queue = [...todayQueue];
    else if (mode === 'today_extra') queue = [...reviewedTodayQueue];
    else if (mode === 'mistakes') queue = Object.values(vocabMistakes);
    else if (mode === 'all') queue = [...vocabDB];`;
content = content.replace(allTarget, allRepl);

const btnTarget = `                <button onClick={() => setAppState('vocab_manage')}
                  className="py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all text-sm flex flex-col items-center gap-1.5">
                  <BookType className="w-5 h-5"/>管理記憶庫
                </button>`;
const btnRepl = `                <button onClick={() => startVocabSession('all')}
                  className="py-4 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-2xl font-bold hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all text-sm flex flex-col items-center gap-1.5">
                  <span className="text-xl">🌟</span>全部單字綜合測驗
                </button>
                <button onClick={() => setAppState('vocab_manage')}
                  className="py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all text-sm flex flex-col items-center gap-1.5">
                  <BookType className="w-5 h-5"/>管理記憶庫
                </button>`;
content = content.replace(btnTarget, btnRepl);

// === patch_vocab_fill ===
content = content.replace(`setBatchInputs(Array(5).fill({ word: '', reading: '', meaning: '', tag: '自訂', example: '' }));`, `setBatchInputs(Array.from({ length: 5 }, () => ({ word: '', reading: '', meaning: '', tag: '自訂', example: '' })));`);
content = content.replace(`if (updatedList.length < 5) updatedList = [...updatedList, ...Array(5 - updatedList.length).fill({ word: '', reading: '', meaning: '', tag: '自訂', example: '' })];`, `if (updatedList.length < 5) updatedList = [...updatedList, ...Array.from({ length: 5 - updatedList.length }, () => ({ word: '', reading: '', meaning: '', tag: '自訂', example: '' }))];`);

const hkTarget = `            if (bracketMatch) {
                const outside = bracketMatch[1].trim(); const inside = bracketMatch[2].trim();
                if (!hasKanji(outside)) { reading = outside; word = ''; } 
                else { word = outside; reading = inside; }
            } else {
                if (!hasKanji(trimmed)) { reading = trimmed; word = ''; } 
                else { word = trimmed; reading = ''; }
            }`;
const hkRepl = `            if (bracketMatch) {
                const outside = bracketMatch[1].trim(); const inside = bracketMatch[2].trim();
                if (!hasKanji(outside)) { reading = outside; word = ''; } 
                else { word = outside; reading = inside; }
            } else {
                if (!hasKanji(trimmed) && trimmed.length < 15 && !trimmed.includes('。') && !trimmed.includes('、')) { reading = trimmed; word = ''; } 
                else { word = trimmed; reading = ''; }
            }`;
content = content.replace(hkTarget, hkRepl);

// === patch4 ===
const arrowTarget = `        const arrowMatch = trimmed.match(/^(?:➜|➡️|➡|->|=>|-->|==>|>)\\s*(.*)$/);
        if (arrowMatch) {
            const meaning = arrowMatch[1].trim();
            if (newItems.length === 0 || newItems[newItems.length - 1].meaning) return;
            newItems[newItems.length - 1].meaning = meaning;
            
            if (!currentTheme) {
               newItems[newItems.length - 1].tag = guessThemeByMeaning(meaning, vocabDB);
            }
            return;
        }`;
const arrowRepl = `        const arrowMatch = trimmed.match(/^(?:➜|➡️|➡|->|=>|-->|==>|>)\\s*(.*)$/);
        if (arrowMatch) {
            const meaning = arrowMatch[1].trim();
            if (newItems.length === 0 || newItems[newItems.length - 1].meaning) return;
            newItems[newItems.length - 1].meaning = meaning;
            
            if (!currentTheme) {
               newItems[newItems.length - 1].tag = guessThemeByMeaning(meaning, vocabDB);
            }
            return;
        }

        const isJp = /[\\u3040-\\u309F\\u30A0-\\u30FF]/.test(trimmed);
        if (newItems.length > 0 && newItems[newItems.length - 1].meaning === '' && !isJp) {
             newItems[newItems.length - 1].meaning = trimmed;
             if (!currentTheme) {
                newItems[newItems.length - 1].tag = guessThemeByMeaning(trimmed, vocabDB);
             }
             return;
        }`;
content = content.replace(arrowTarget, arrowRepl);
content = content.replace(`const validNewItems = newItems.filter(item => (item.reading || item.example) && item.meaning);`, `const validNewItems = newItems.filter(item => (item.word || item.reading || item.example) && item.meaning);`);

// === patch3 ===
const vTarget = `        if (newVerbs.length === 0 || (newVerbs[newVerbs.length - 1].meaning !== '' && !exampleMatch)) {
             const verbObj = getInitialVerbInputs();
             verbObj.type = currentType;
             verbObj.group = currentGroup;
             verbObj.jisho = trimmed;
             if (currentType === 'verb') {
                 const forms = autoConjugate(trimmed, currentGroup);
                 if (forms && Object.keys(forms).length > 0) Object.assign(verbObj, forms);
             }
             newVerbs.push(verbObj);`;
const vRepl = `        const isVerbOrAdj = /([うくすつぬふむゆる]|[いな]|です)$/.test(trimmed.replace(/\\[.*?\\]/g, '')) && /[\\u3040-\\u309F]/.test(trimmed);

        if (newVerbs.length === 0 || (newVerbs[newVerbs.length - 1].meaning !== '' && !exampleMatch) || isVerbOrAdj) {
             const verbObj = getInitialVerbInputs();
             verbObj.type = currentType;
             verbObj.group = currentGroup;
             verbObj.jisho = trimmed;
             if (currentType === 'verb') {
                 const forms = autoConjugate(trimmed, currentGroup);
                 if (forms && Object.keys(forms).length > 0) Object.assign(verbObj, forms);
             }
             newVerbs.push(verbObj);`;
content = content.replace(vTarget, vRepl);
content = content.replace(`setBatchVerbInputs(validVerbs.map`, `setBatchVerbInputs(prev => [...prev, ...validVerbs.map`);

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('Super patch applied!');
