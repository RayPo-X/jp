import fs from 'fs';
let content = fs.readFileSync('src/App.jsx', 'utf8');

const target = `  // One-time migration: Change all timestamps to June 12, 2026
  useEffect(() => {
    const hasMigrated = localStorage.getItem('migrated_to_june_12_v2');
    if (!hasMigrated && vocabDB.length > 0) {
       const june12 = new Date('2026-06-12T00:00:00').getTime();
       let changed = false;
       const newVocabDB = vocabDB.map(v => {
           let newId = v.id;
           const parts = v.id.split('_');
           let found = false;
           const newParts = parts.map(p => {
               if (Number(p) > 1000000000000) { found = true; return june12; }
               return p;
           });
           if (!found) {
               newId = \`\${v.id}_\${june12}\`;
           } else {
               newId = newParts.join('_');
           }
           if (newId !== v.id) changed = true;
           return { ...v, id: newId };
       });

       if (changed) {
           setVocabDB(newVocabDB);
           setVocabMistakes(prev => {
              const newM = {};
              Object.values(prev).forEach(mistake => {
                  const newVocab = newVocabDB.find(nv => nv.word === mistake.word);
                  if (newVocab) newM[newVocab.id] = newVocab;
              });
              return newM;
           });
       }
       localStorage.setItem('migrated_to_june_12_v2', 'true');
    }
  }, [vocabDB]);`;

const repl = `  // One-time migration: Change all timestamps to June 12, 2026
  useEffect(() => {
    const hasMigrated = localStorage.getItem('migrated_to_june_12_v3');
    if (!hasMigrated) {
       const june12 = new Date('2026-06-12T00:00:00').getTime();
       let vocabChanged = false;
       let verbChanged = false;

       const newVocabDB = vocabDB.map(v => {
           let newId = String(v.id);
           const parts = newId.split('_');
           let found = false;
           const newParts = parts.map(p => {
               if (Number(p) > 1000000000000) { found = true; return june12; }
               return p;
           });
           if (!found) {
               newId = \`\${newId}_\${june12}\`;
           } else {
               newId = newParts.join('_');
           }
           if (newId !== String(v.id)) vocabChanged = true;
           return { ...v, id: newId };
       });

       const newVerbDB = verbDB.map(v => {
           let newId = String(v.id);
           const parts = newId.split('_');
           let found = false;
           const newParts = parts.map(p => {
               if (Number(p) > 1000000000000) { found = true; return june12; }
               return p;
           });
           if (!found) {
               newId = \`\${newId}_\${june12}\`;
           } else {
               newId = newParts.join('_');
           }
           if (newId !== String(v.id)) verbChanged = true;
           return { ...v, id: newId };
       });

       if (vocabChanged) {
           setVocabDB(newVocabDB);
           setVocabMistakes(prev => {
              const newM = {};
              Object.values(prev).forEach(mistake => {
                  const newVocab = newVocabDB.find(nv => nv.word === mistake.word);
                  if (newVocab) newM[newVocab.id] = newVocab;
              });
              return newM;
           });
       }

       if (verbChanged) {
           setVerbDB(newVerbDB);
       }

       if (vocabChanged || verbChanged || vocabDB.length === 0) {
           localStorage.setItem('migrated_to_june_12_v3', 'true');
       }
    }
  }, [vocabDB, verbDB]);`;

content = content.replace(target, repl);
fs.writeFileSync('src/App.jsx', content, 'utf8');
