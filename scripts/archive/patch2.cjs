const fs = require('fs');
const file = 'd:/jp/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. First, we need to find and replace the OLD parseObsidianNotes and handleScanObsidian
// Since it's a big block, we'll just use regex to replace everything from `const parseObsidianNotes = (text) => {`
// to `const handleImportObsidian = () => { ... };`

const regex = /const parseObsidianNotes = \(text\) => \{[\s\S]*?alert\('匯入成功！所有單字已加入今日複習。'\);\s*\};/m;

const newLogic = `
  const [obsidianScannedGrammar, setObsidianScannedGrammar] = useState([]);

  const parseObsidianNotes = (text) => {
    const vocabResults = [];
    const grammarResults = [];

    let currentMode = 'vocab'; 
    let currentTag = '自訂';
    let currentGrammarName = '';
    
    let currentVocab = null;

    const lines = text.split('\\n');
    for (let i = 0; i < lines.length; i++) {
         const line = lines[i].trim();
         if (!line) continue;

         if (line.includes('💬 對話') || line.includes('3️⃣ 💬')) {
             currentMode = 'skip';
             continue;
         }

         if (line.startsWith('### ')) {
             const rawHeader = line.replace(/^###\\s+/, '').trim();
             if (rawHeader.includes('[[') && rawHeader.includes(']]')) {
                 currentMode = 'grammar_desc';
                 currentGrammarName = rawHeader.replace(/\\[\\[|\\]\\]/g, '').trim(); 
             } else {
                 currentMode = 'vocab';
                 currentTag = rawHeader.replace(/^[\\s\\S]*?(?=[a-zA-Z\\u4e00-\\u9fa5\\u3040-\\u309F\\u30A0-\\u30FF])/, '').trim() || rawHeader;
             }
             continue;
         }

         if (currentMode === 'skip') {
             if (line.startsWith('### ') || line.startsWith('## ')) {
             } else {
                 continue;
             }
         }

         if (currentMode === 'grammar_desc' && line.startsWith('👉 ')) {
             currentGrammarName = line.replace(/^👉\\s*/, '').trim();
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
                         id: 'g_obs_' + Date.now() + '_' + Math.random().toString(36).substring(2,9),
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
                 const bracketMatch = rawContent.match(/^(.+?)（(.+?)）$/) || rawContent.match(/^(.+?)\\((.+?)\\)$/);
                 if (bracketMatch) {
                     word = bracketMatch[2].trim() + '[' + bracketMatch[1].trim() + ']';
                     reading = bracketMatch[1].trim();
                 }
                 currentVocab = {
                    id: 'obs_' + Date.now() + '_' + Math.random().toString(36).substring(2,9),
                    word, reading, meaning: '', tag: currentTag, example: '',
                    ef: 2.5, interval: 0, repetitions: 0, nextReview: Date.now(), status: 'learning'
                 };
             } else if (currentMode === 'sentence') {
                 if (currentVocab) vocabResults.push({...currentVocab});
                 currentVocab = {
                    id: 'obs_' + Date.now() + '_' + Math.random().toString(36).substring(2,9),
                    word: rawContent, reading: rawContent, meaning: '', tag: currentTag, example: '',
                    ef: 2.5, interval: 0, repetitions: 0, nextReview: Date.now(), status: 'learning'
                 };
             }
             continue;
         }

         if (currentVocab && (line.startsWith('➜ ') || line.startsWith('-> ') || line.startsWith('=> ') || line.startsWith('👉 '))) {
             currentVocab.meaning = line.replace(/^(➜|->|=>|👉)\\s*/, '').trim();
             vocabResults.push({...currentVocab});
             currentVocab = null;
         }
    }
    if (currentVocab) vocabResults.push(currentVocab);

    return { vocabResults, grammarResults };
  };

  const handleScanObsidian = async () => {
      try {
          setIsScanningObsidian(true);
          let dirHandle = obsidianDirHandle;
          if (!dirHandle) {
              dirHandle = await window.showDirectoryPicker({ mode: 'read' });
              setObsidianDirHandle(dirHandle);
          } else {
             const permission = await dirHandle.queryPermission({ mode: 'read' });
             if (permission !== 'granted') {
                 const newPermission = await dirHandle.requestPermission({ mode: 'read' });
                 if (newPermission !== 'granted') throw new Error('Permission denied');
             }
          }
          const allVocabs = [];
          const allGrammars = [];
          
          async function scanDirectory(handle) {
              for await (const entry of handle.values()) {
                  if (entry.kind === 'file' && entry.name.endsWith('.md')) {
                      const file = await entry.getFile();
                      const text = await file.text();
                      const { vocabResults, grammarResults } = parseObsidianNotes(text);
                      allVocabs.push(...vocabResults);
                      allGrammars.push(...grammarResults);
                  } else if (entry.kind === 'directory' && !entry.name.startsWith('.')) {
                      await scanDirectory(entry);
                  }
              }
          }
          await scanDirectory(dirHandle);
          
          // Deduplicate Vocabs
          const existingWords = new Set(vocabDB.map(v => v.word));
          const newWords = allVocabs.filter(v => !existingWords.has(v.word));
          const uniqueNewWords = [];
          const seen = new Set();
          for (const w of newWords) {
              if (!seen.has(w.word) && w.meaning.trim() !== '') {
                  seen.add(w.word);
                  uniqueNewWords.push(w);
              }
          }

          // Deduplicate Grammars
          const existingGrammars = new Set(customGrammars.map(g => g.name + '_' + g.appendStr));
          const newGrammarsList = allGrammars.filter(g => !existingGrammars.has(g.name + '_' + g.appendStr));
          const uniqueNewGrammars = [];
          const seenGrammar = new Set();
          for (const g of newGrammarsList) {
              const key = g.name + '_' + g.appendStr;
              if (!seenGrammar.has(key)) {
                  seenGrammar.add(key);
                  uniqueNewGrammars.push(g);
              }
          }

          setObsidianScannedWords(uniqueNewWords);
          setObsidianScannedGrammar(uniqueNewGrammars);
          
          if (uniqueNewWords.length === 0 && uniqueNewGrammars.length === 0) {
              alert('掃描完成！沒有找到新單字與文法，或均已在字庫中。');
          } else {
              alert('掃描完成！共找到 ' + uniqueNewWords.length + ' 個新單字/例句，' + uniqueNewGrammars.length + ' 條新文法規則！');
          }
      } catch (err) {
          console.error(err);
          alert('掃描失敗或已取消授權。');
          setObsidianDirHandle(null);
      } finally {
          setIsScanningObsidian(false);
      }
  };

  const handleImportObsidian = () => {
      if (obsidianScannedWords.length === 0 && obsidianScannedGrammar.length === 0) return;
      if (obsidianScannedWords.length > 0) setVocabDB(prev => [...prev, ...obsidianScannedWords]);
      if (obsidianScannedGrammar.length > 0) setCustomGrammars(prev => [...prev, ...obsidianScannedGrammar]);
      
      setObsidianScannedWords([]);
      setObsidianScannedGrammar([]);
      alert('匯入成功！資料已同步。');
  };
`;

content = content.replace(regex, newLogic.trim());

// 2. Replace UI block.
const uiRegex = /<div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 mb-8 shadow-lg">[\s\S]*?<\/div>\s*<\/div>/;

const newUI = `
             <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 mb-8 shadow-lg">
                <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-white text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-400"/> Obsidian 智慧同步 (支援文法與例句)</h3></div>
                <div className="bg-slate-700/50 p-5 rounded-2xl border border-slate-600">
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed">一鍵掃描資料夾，系統會自動轉換 🟡【單字】、#### 📝 例句 與 #### 🧩 結構，並過濾重複項目直接匯入。</p>
                  
                  {(obsidianScannedWords.length > 0 || obsidianScannedGrammar.length > 0) ? (
                      <div className="mb-4">
                        <div className="text-green-400 font-bold mb-2">🎉 找到 {obsidianScannedWords.length} 個新單字/例句，{obsidianScannedGrammar.length} 條新文法規則！</div>
                        <div className="max-h-48 overflow-y-auto bg-slate-800 rounded-xl p-3 border border-slate-600 text-sm text-slate-300 space-y-1">
                           {obsidianScannedGrammar.map((g, i) => (
                              <div key={'g'+i} className="flex justify-between text-amber-300"><span>🧩 {g.name}</span><span className="text-slate-400">({g.baseForm} + {g.appendStr})</span></div>
                           ))}
                           {obsidianScannedWords.map((w, i) => (
                              <div key={'w'+i} className="flex justify-between"><span>{w.word} {w.reading !== w.word && '('+w.reading+')'}</span><span className="text-slate-400">{w.meaning} [{w.tag}]</span></div>
                           ))}
                        </div>
                        <div className="flex gap-3 mt-4">
                           <button onClick={handleImportObsidian} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">📥 一鍵匯入全部</button>
                           <button onClick={() => {setObsidianScannedWords([]); setObsidianScannedGrammar([]);}} className="py-3 px-6 bg-slate-600 text-white rounded-xl font-bold hover:bg-slate-500 transition-colors">取消</button>
                        </div>
                      </div>
                  ) : (
                      <button onClick={handleScanObsidian} disabled={isScanningObsidian} className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
                        {isScanningObsidian ? '掃描中...' : (obsidianDirHandle ? '🔄 重新掃描 Obsidian 資料夾' : '📁 授權並掃描 Obsidian 資料夾')}
                      </button>
                  )}
                </div>
             </div>
`;

content = content.replace(uiRegex, newUI.trim());

fs.writeFileSync(file, content, 'utf8');
console.log('Success');
