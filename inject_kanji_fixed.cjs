const fs = require('fs');
let code = fs.readFileSync('d:\\jp\\src\\App.jsx', 'utf8');

// 1. Add isFetchingKanji state
if (!code.includes('const [isFetchingKanji, setIsFetchingKanji] = useState({});')) {
    code = code.replace(
        "const [importText, setImportText] = useState('');",
        "const [importText, setImportText] = useState('');\n  const [isFetchingKanji, setIsFetchingKanji] = useState({});"
    );
}

// 2. Add handleFetchKanji function
const fetchKanjiFunc = `
  const handleFetchKanji = async (idx) => {
      const reading = batchInputs[idx].reading.trim();
      if (!reading) {
          alert('請先輸入平假名讀音！');
          return;
      }
      setIsFetchingKanji(prev => ({ ...prev, [idx]: true }));
      try {
          const res = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://jisho.org/api/v1/search/words?keyword=' + reading));
          const data = await res.json();
          const jishoData = JSON.parse(data.contents);
          
          if (jishoData && jishoData.data && jishoData.data.length > 0) {
              const bestMatch = jishoData.data[0];
              const japanese = bestMatch.japanese[0];
              const kanji = japanese.word || '';
              const meaning = bestMatch.senses && bestMatch.senses[0] && bestMatch.senses[0].english_definitions ? bestMatch.senses[0].english_definitions.join(', ') : '';
              
              const newInputs = [...batchInputs];
              if (kanji) newInputs[idx].word = kanji;
              if (!newInputs[idx].meaning && meaning) newInputs[idx].meaning = meaning;
              
              setBatchInputs(newInputs);
              if (!kanji) alert('辭典中找不到對應的漢字。');
          } else {
              alert('找不到此單字！');
          }
      } catch (err) {
          console.error(err);
          alert('查詢失敗，請檢查網路連線或稍後再試。');
      } finally {
          setIsFetchingKanji(prev => ({ ...prev, [idx]: false }));
      }
  };
`;
if (!code.includes('const handleFetchKanji')) {
    code = code.replace('const handleSmartImport = () => {', fetchKanjiFunc + '\n  const handleSmartImport = () => {');
}

// 3. Add Kanji button in UI
const oldBatchInputRow = `<input type="text" placeholder="平假名 (例: たべる)" value={item.reading} onChange={e => {const n=[...batchInputs]; n[idx].reading=e.target.value; setBatchInputs(n);}} className="flex-1 p-3 rounded-xl border border-slate-200 outline-none focus:border-amber-500 text-sm font-bold"/>`;
const newBatchInputRow = `<div className="flex-1 relative flex items-center">
                              <input type="text" placeholder="平假名 (例: たべる)" value={item.reading} onChange={e => {const n=[...batchInputs]; n[idx].reading=e.target.value; setBatchInputs(n);}} className="w-full p-3 pr-10 rounded-xl border border-slate-200 outline-none focus:border-amber-500 text-sm font-bold"/>
                              <button onClick={() => handleFetchKanji(idx)} disabled={isFetchingKanji[idx]} title="自動查漢字" className={\`absolute right-2 p-1.5 rounded-lg transition-colors \${isFetchingKanji[idx] ? 'text-slate-300' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}\`}>
                                  <Search className={\`w-4 h-4 \${isFetchingKanji[idx] ? 'animate-spin' : ''}\`}/>
                              </button>
                          </div>`;
if (code.includes(oldBatchInputRow)) {
    code = code.replace(oldBatchInputRow, newBatchInputRow);
}

// 4. Add Kanji input mode button
const oldKeyboardModeBtn = `<span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full mt-1">時間獎勵+15秒</span>\n                    </label>`;
const kanjiModeBtn = `\n                    <label className={\`flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all \${inputMode === 'kanji' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-indigo-200'}\`}>\n                      <input type="radio" value="kanji" checked={inputMode === 'kanji'} onChange={(e) => setInputMode(e.target.value)} className="hidden"/><PenTool className="w-5 h-5" /> <span className="font-medium text-sm">考漢字</span><span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full mt-1">需鍵盤</span>\n                    </label>`;
if (code.includes(oldKeyboardModeBtn) && !code.includes('value="kanji"')) {
    code = code.replace(oldKeyboardModeBtn, oldKeyboardModeBtn + kanjiModeBtn);
}

// 5. Update startVocabSession to filter for kanji
const startVocabFilterRegex = /(if \(queue\.length === 0\) \{ alert\('這個模式目前沒有題目喔！'\); return; \})/;
const kanjiFilter = `\n    if (inputMode === 'kanji') {\n      queue = queue.filter(v => v.word && v.word.trim() !== '' && v.word !== v.reading);\n      if (queue.length === 0) { alert('目前的單字範圍內沒有包含漢字的單字，無法進行漢字測驗！'); return; }\n    }\n    `;
if (code.match(startVocabFilterRegex) && !code.includes(`inputMode === 'kanji'`)) {
    code = code.replace(startVocabFilterRegex, kanjiFilter + '$1');
}

// 6. Update processVocabAnswer logic
const answerRegex = /} else {\n\s*correctAnswerStr = currentVocab\.reading;\n\s*}/;
const answerReplacement = `} else if (inputMode === 'kanji') {
        correctAnswerStr = currentVocab.word;
    } else {
        correctAnswerStr = currentVocab.reading;
    }`;
if (code.match(answerRegex) && !code.includes(`inputMode === 'kanji'`)) {
    code = code.replace(answerRegex, answerReplacement);
}

// 7. Update roundHistory saving logic
const historyRegex = /question: \(vocabTestMode === 'sentence_srs' \|\| vocabTestMode === 'sentence_infinite'\) \?\s*\(currentQuestionDirection === 'j2c' \? \(parseExample\(currentVocab\.example \|\| currentVocab\.word \|\| currentVocab\.reading\)\.plainSentence \|\| currentVocab\.word \|\| currentVocab\.reading\) : \(parseExample\(currentVocab\.example \|\| currentVocab\.word \|\| currentVocab\.reading\)\.translation \|\| currentVocab\.meaning\)\)\s*: currentVocab\.meaning,/;
const historyReplacement = `question: (vocabTestMode === 'sentence_srs' || vocabTestMode === 'sentence_infinite') ? 
        (currentQuestionDirection === 'j2c' ? (parseExample(currentVocab.example || currentVocab.word || currentVocab.reading).plainSentence || currentVocab.word || currentVocab.reading) : (parseExample(currentVocab.example || currentVocab.word || currentVocab.reading).translation || currentVocab.meaning)) 
        : (inputMode === 'kanji' ? \`\${currentVocab.reading} (\${currentVocab.meaning})\` : currentVocab.meaning),`;
if (code.match(historyRegex) && !code.includes(`inputMode === 'kanji' ? \`\${currentVocab`)) {
    code = code.replace(historyRegex, historyReplacement);
}

// 8. Update vocab test UI for kanji mode
const uiRegex = /<div className="text-sm text-slate-500 mb-2">請問這個中文意思的平假名發音是？<\/div>\s*<div className="text-5xl font-black text-slate-800 tracking-wide mb-8 py-6">\{currentVocab\.meaning\}<\/div>/;
const uiReplacement = `<>
                       {inputMode === 'kanji' ? (
                         <>
                           <div className="text-sm text-slate-500 mb-2">請打出這個單字的日文漢字：</div>
                           <div className="text-5xl font-black text-slate-800 tracking-wide mb-4 py-4">{currentVocab.reading}</div>
                           <div className="text-xl font-bold text-amber-600 mb-8">{currentVocab.meaning}</div>
                         </>
                       ) : (
                         <>
                           <div className="text-sm text-slate-500 mb-2">請問這個中文意思的平假名發音是？</div>
                           <div className="text-5xl font-black text-slate-800 tracking-wide mb-8 py-6">{currentVocab.meaning}</div>
                         </>
                       )}
                     </>`;
if (code.match(uiRegex)) {
    code = code.replace(uiRegex, uiReplacement);
}

fs.writeFileSync('d:\\jp\\src\\App.jsx', code, 'utf8');
console.log("Success");
