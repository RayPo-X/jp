import fs from 'fs';
let content = fs.readFileSync('src/App.jsx', 'utf8');

const target = `  useEffect(() => { localStorage.setItem('verbApp_githubToken', githubToken); }, [githubToken]);
  useEffect(() => { localStorage.setItem('verbApp_gistId', gistId); }, [gistId]);`;

const repl = `  useEffect(() => { localStorage.setItem('verbApp_githubToken', githubToken); }, [githubToken]);
  useEffect(() => { localStorage.setItem('verbApp_gistId', gistId); }, [gistId]);

  // One-time migration: Change all timestamps to June 12, 2026
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

content = content.replace(target, repl);
fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('Migration applied');
