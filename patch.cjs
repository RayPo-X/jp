const fs = require('fs');
const file = 'd:/jp/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

const s1 = "const [batchInputs, setBatchInputs] = useState(Array.from({ length: 5 }, () => ({ word: '', reading: '', meaning: '', tag: '自訂', example: '' })));";
const r1 = s1 + '\n  const [obsidianDirHandle, setObsidianDirHandle] = useState(null);\n  const [obsidianScannedWords, setObsidianScannedWords] = useState([]);\n  const [isScanningObsidian, setIsScanningObsidian] = useState(false);';
content = content.replace(s1, r1);

const s2 = "  const handleBatchSave = () => {";
const obsidianLogic = `
  const parseObsidianNotes = (text) => {
      const vocabSectionMatch = text.match(/(?:🟡【單字】|## 2️⃣ 📖 單字)[\\s\\S]*?(?=## 3️⃣|━━━━━━━━━━━━━━━━━━━|$)/);
      if (!vocabSectionMatch) return [];
      const vocabText = vocabSectionMatch[0];
      const results = [];
      let currentTag = '自訂';
      const lines = vocabText.split('\\n');
      let currentVocab = null;

      for (let i = 0; i < lines.length; i++) {
         const line = lines[i].trim();
         if (line.startsWith('### ')) {
            const rawTag = line.replace(/^###\\s+/, '').trim();
            currentTag = rawTag.replace(/^[\\s\\S]*?(?=[a-zA-Z\\u4e00-\\u9fa5\\u3040-\\u309F\\u30A0-\\u30FF])/, '').trim() || rawTag;
            continue;
         }
         if (line.startsWith('- ')) {
            if (currentVocab) results.push({...currentVocab});
            const rawWord = line.substring(2).trim();
            if (!rawWord) { currentVocab = null; continue; }
            let word = rawWord;
            let reading = rawWord;
            const bracketMatch = rawWord.match(/^(.+?)（(.+?)）$/) || rawWord.match(/^(.+?)\\((.+?)\\)$/);
            if (bracketMatch) {
                const part1 = bracketMatch[1].trim();
                const part2 = bracketMatch[2].trim();
                word = part2 + '[' + part1 + ']';
                reading = part1;
            }
            currentVocab = {
               id: 'obs_' + Date.now() + '_' + Math.random().toString(36).substring(2,9),
               word, reading, meaning: '', tag: currentTag, example: '',
               ef: 2.5, interval: 0, repetitions: 0, nextReview: Date.now(), status: 'learning'
            };
            continue;
         }
         if (currentVocab && (line.startsWith('➜ ') || line.startsWith('-> ') || line.startsWith('=> '))) {
             currentVocab.meaning = line.replace(/^(➜|->|=>)\\s*/, '').trim();
             results.push({...currentVocab});
             currentVocab = null;
         }
      }
      if (currentVocab) results.push(currentVocab);
      return results;
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
          const allExtracted = [];
          async function scanDirectory(handle) {
              for await (const entry of handle.values()) {
                  if (entry.kind === 'file' && entry.name.endsWith('.md')) {
                      const file = await entry.getFile();
                      const text = await file.text();
                      allExtracted.push(...parseObsidianNotes(text));
                  } else if (entry.kind === 'directory' && !entry.name.startsWith('.')) {
                      await scanDirectory(entry);
                  }
              }
          }
          await scanDirectory(dirHandle);
          
          const existingWords = new Set(vocabDB.map(v => v.word));
          const newWords = allExtracted.filter(v => !existingWords.has(v.word));
          
          const uniqueNewWords = [];
          const seen = new Set();
          for (const w of newWords) {
              if (!seen.has(w.word) && w.meaning.trim() !== '') {
                  seen.add(w.word);
                  uniqueNewWords.push(w);
              }
          }

          setObsidianScannedWords(uniqueNewWords);
          if (uniqueNewWords.length === 0) alert('掃描完成！沒有找到新單字，或所有單字均已在字庫中。');
          else alert('掃描完成！共找到 ' + uniqueNewWords.length + ' 個新單字！');
      } catch (err) {
          console.error(err);
          alert('掃描失敗或已取消授權。');
          setObsidianDirHandle(null);
      } finally {
          setIsScanningObsidian(false);
      }
  };

  const handleImportObsidian = () => {
      if (obsidianScannedWords.length === 0) return;
      setVocabDB(prev => [...prev, ...obsidianScannedWords]);
      setObsidianScannedWords([]);
      alert('匯入成功！所有單字已加入今日複習。');
  };
`;
content = content.replace(s2, obsidianLogic + '\n' + s2);

const s3 = '<div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 mb-8">';
const obsidianUI = `
             <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 mb-8 shadow-lg">
                <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-white text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-400"/> Obsidian 智慧同步</h3></div>
                <div className="bg-slate-700/50 p-5 rounded-2xl border border-slate-600">
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed">一鍵掃描您的 Obsidian 資料夾，系統會自動找出 🟡【單字】 區塊並過濾重複字詞，直接匯入學習佇列。</p>
                  
                  {obsidianScannedWords.length > 0 ? (
                      <div className="mb-4">
                        <div className="text-green-400 font-bold mb-2">🎉 找到 {obsidianScannedWords.length} 個新單字！</div>
                        <div className="max-h-40 overflow-y-auto bg-slate-800 rounded-xl p-3 border border-slate-600 text-sm text-slate-300 space-y-1">
                           {obsidianScannedWords.map((w, i) => (
                              <div key={i} className="flex justify-between"><span>{w.word} {w.reading !== w.word && '('+w.reading+')'}</span><span className="text-slate-400">{w.meaning} [{w.tag}]</span></div>
                           ))}
                        </div>
                        <div className="flex gap-3 mt-4">
                           <button onClick={handleImportObsidian} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">📥 一鍵匯入全部</button>
                           <button onClick={() => setObsidianScannedWords([])} className="py-3 px-6 bg-slate-600 text-white rounded-xl font-bold hover:bg-slate-500 transition-colors">取消</button>
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
content = content.replace(s3, obsidianUI + '\n             ' + s3);

fs.writeFileSync(file, content, 'utf8');
console.log('Success');
