const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// Use regex to properly replace the code regardless of \r\n
const genVerbRegex = /else if \(mode === 'custom'\) \{[\s\S]*?if \(availablePool\.length === 0\) return;/;

const newGenVerb = `else {
      const processWord = (word) => {
        validTargets.forEach(target => {
          const customDef = customGrammars.find(g => g.id === target);
          if (customDef) {
             if (customDef.appliesTo.includes(word.type) && word[customDef.baseForm]) {
               availablePool.push({ word, target: customDef.id, grammarDef: customDef });
             }
          } else {
             if (word[target]) availablePool.push({ word, target, grammarDef: null });
          }
        });
      };

      if (mode === 'custom') {
        if (customWordIds.length === 0) { alert('請先到設定勾選自訂單字！'); goHome(); return; }
        verbDB.filter(w => customWordIds.includes(w.id)).forEach(processWord);
      } else {
        const filteredWords = verbDB.filter(w => activeWordTypes.includes(w.type));
        if (filteredWords.length === 0) return;
        filteredWords.forEach(processWord);
      }
    }

    if (availablePool.length === 0) {
      alert('找不到符合條件的單字，請檢查您的出題基準與變化目標設定是否衝突！');
      return;
    }`;

c = c.replace(genVerbRegex, newGenVerb);

const oldBtnRegex = /<button onClick=\{\(\)=>setShowSettingsModal\(false\)\} className="w-full mt-8 py-3 bg-slate-800 text-white rounded-xl font-bold">完成設定<\/button>/;
const newBtn = `<button onClick={() => { setShowSettingsModal(false); if(appState === 'verb_playing') { generateVerbQuestion(verbTestMode); } }} className="w-full mt-8 py-3 bg-slate-800 text-white rounded-xl font-bold">完成設定</button>`;

c = c.replace(oldBtnRegex, newBtn);

fs.writeFileSync('src/App.jsx', c);
console.log('done real patch');
