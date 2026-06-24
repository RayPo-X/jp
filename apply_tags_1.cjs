const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. vocabDB migration
code = code.replace(
    /let updatedV = \{ \.\.\.v, correctDates: v\.correctDates \|\| \[\] \};/,
    "let updatedV = { ...v, correctDates: v.correctDates || [] };\n             if (!updatedV.tags) updatedV.tags = updatedV.tag ? [updatedV.tag] : [];"
);
code = code.replace(
    /return INITIAL_VOCAB_DB\.map\(v => \(\{ \.\.\.v, status: 'new', correctDates: \[\] \}\)\);/g,
    "return INITIAL_VOCAB_DB.map(v => ({ ...v, status: 'new', correctDates: [], tags: v.tag ? [v.tag] : [] }));"
);

// 2. migrateVerb
code = code.replace(
    /stats: v\.stats \|\| createDefaultVerbStats\(\)\r?\n\s*\};/,
    "stats: v.stats || createDefaultVerbStats(),\n      tags: v.tags || (v.tag ? [v.tag] : [])\n    };"
);

// 3. customGrammars migration
code = code.replace(
    /nextReview: g\.nextReview \|\| 0\r?\n\s*\};\r?\n\s*delete ng\.learnStatus;/,
    "nextReview: g.nextReview || 0,\n                    tags: g.tags || (g.tag ? [g.tag] : [])\n                  };\n                  delete ng.learnStatus;"
);
code = code.replace(
    /return DEFAULT_GRAMMARS\.map\(g => \(\{ \.\.\.g, status: 'new', ef: 2\.5, interval: 0, repetitions: 0, totalAttempts: 0, totalCorrect: 0, nextReview: 0 \}\)\);/g,
    "return DEFAULT_GRAMMARS.map(g => ({ ...g, status: 'new', ef: 2.5, interval: 0, repetitions: 0, totalAttempts: 0, totalCorrect: 0, nextReview: 0, tags: g.tag ? [g.tag] : [] }));"
);

// 4. kanjiDB migration
code = code.replace(
    /const kanjiDB = \[\];\s*return \[\];/, // wait, it says `if (saved) return JSON.parse(saved);`
    ""
); // I'll just do:
code = code.replace(
    /if \(saved\) return JSON\.parse\(saved\);/,
    "if (saved) return JSON.parse(saved).map(k => ({ ...k, tags: k.tags || [] }));"
);
code = code.replace(
    /newKanjiDB\.push\(\{[\s\S]*?kanji: k,[\s\S]*?meaning: '',/m,
    "newKanjiDB.push({\n            id: `k_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,\n            kanji: k,\n            meaning: '',\n            tags: [],"
);

// 5. Global Search Results Weighting
const oldSearchBlock = /kanjiDB\.forEach\(k => \{[\s\S]*?results\.kanji\.sort\(\(a, b\) => b\.score - a\.score\);/m;
const newSearchBlock = `kanjiDB.forEach(k => {
           let s = calculateScore([k.kanji], [k.meaning], k.tags);
           if (s > 0) results.kanji.push({ item: k, score: s });
       });
       
       // Override scoring to heavily prioritize Title > Tag > Content
       const adjustScore = (r, titleStr, tags) => {
           let finalScore = 0;
           const q = globalSearchTerm.trim().toLowerCase();
           if (!q) return;
           if (titleStr && titleStr.toLowerCase().includes(q)) finalScore += 100;
           if (tags && tags.some(t => t.toLowerCase().includes(q))) finalScore += 50;
           if (finalScore === 0) finalScore = r.score; // fallback to content match
           r.score = finalScore;
       };
       
       results.vocab.forEach(r => adjustScore(r, r.item.word || r.item.reading, r.item.tags));
       results.verb.forEach(r => adjustScore(r, r.item.jisho, r.item.tags));
       results.grammar.forEach(r => adjustScore(r, r.item.name, r.item.tags));
       results.kanji.forEach(r => adjustScore(r, r.item.kanji, r.item.tags));

       results.vocab.sort((a, b) => b.score - a.score);
       results.verb.sort((a, b) => b.score - a.score);
       results.grammar.sort((a, b) => b.score - a.score);
       results.kanji.sort((a, b) => b.score - a.score);`;
code = code.replace(oldSearchBlock, newSearchBlock);

fs.writeFileSync('src/App.jsx', code);
console.log('Script 1 complete');
