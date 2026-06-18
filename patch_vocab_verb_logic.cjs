const fs = require('fs');
let lines = fs.readFileSync('src/App.jsx', 'utf8').split(/\r?\n/);
let changes = 0;

// === 1. verbDB 初始化: 改用 correctDates ===
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('verbDB, setVerbDB')) {
        for (let j = i; j < i + 15; j++) {
            if (lines[j].includes('if (Array.isArray(parsed)) return parsed.map(v => ({ ...v, learnStatus: v.learnStatus || \'new\', correctCount: v.correctCount || 0 }));')) {
                lines[j] = "          if (Array.isArray(parsed)) return parsed.map(v => ({ ...v, learnStatus: v.learnStatus || 'new', correctDates: v.correctDates || [] }));";
                changes++;
            }
            if (lines[j].includes('return INITIAL_VERB_DB.map(v => ({ ...v, learnStatus: \'new\', correctCount: 0 }));')) {
                lines[j] = "      return INITIAL_VERB_DB.map(v => ({ ...v, learnStatus: 'new', correctDates: [] }));";
                changes++;
            }
        }
        break;
    }
}

// === 2. processVerbAnswer: 答對邏輯改為 correctDates ===
for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === 'const processVerbAnswer = (answerToCheck = null) => {') {
        for (let j = i; j < i + 100; j++) {
            if (lines[j].trim() === 'if (isCorrect) {' && lines[j+1] && lines[j+1].includes('setScore(prev => prev + 1);')) {
                // Find the verbDB update inside this block
                for(let k = j; k < j+20; k++) {
                    if (lines[k].includes('setVerbDB(prev => prev.map(x => {')) {
                        lines.splice(k, 5,
                            "      setVerbDB(prev => prev.map(x => {",
                            "        if (x.id !== currentVerb.id) return x;",
                            "        const todayStr = new Date().toLocaleDateString('en-CA'); // e.g. YYYY-MM-DD",
                            "        const newDates = Array.from(new Set([...(x.correctDates || []), todayStr]));",
                            "        return { ...x, correctDates: newDates, learnStatus: newDates.length >= 3 ? 'learned' : x.learnStatus };",
                            "      }));"
                        );
                        changes++;
                        break;
                    }
                }
                break;
            }
        }
        break;
    }
}

// === 3. vocabDB 初始化: 補上 learnStatus + correctDates ===
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const [vocabDB, setVocabDB] = useState(() => {')) {
        for (let j = i; j < i + 20; j++) {
            if (lines[j].includes('if (!v.status) return { ...v, status: v.repetitions >= 5 ? \'mastered\' : \'new\' };')) {
                lines[j] = "           let updatedV = { ...v, learnStatus: v.learnStatus || 'new', correctDates: v.correctDates || [] };\n           if (!updatedV.status) updatedV.status = updatedV.repetitions >= 5 ? 'mastered' : 'new';\n           return updatedV;";
                changes++;
            }
            if (lines[j].includes('return INITIAL_VOCAB_DB.map(v => ({ ...v, status: \'new\' }));')) {
                lines[j] = "      return INITIAL_VOCAB_DB.map(v => ({ ...v, status: 'new', learnStatus: 'new', correctDates: [] }));";
                changes++;
            }
        }
        break;
    }
}

// === 4. processVocabAnswer: 加入答對邏輯 ===
for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === 'const processVocabAnswer = () => {') {
        for (let j = i; j < i + 100; j++) {
            if (lines[j].trim() === 'if (isCorrect) {') {
                lines.splice(j + 1, 0,
                    "      setVocabDB(prev => prev.map(x => {",
                    "        if (x.id !== currentVocab.id) return x;",
                    "        const todayStr = new Date().toLocaleDateString('en-CA');",
                    "        const newDates = Array.from(new Set([...(x.correctDates || []), todayStr]));",
                    "        return { ...x, correctDates: newDates, learnStatus: newDates.length >= 3 ? 'learned' : x.learnStatus };",
                    "      }));"
                );
                changes++;
                break;
            }
        }
        break;
    }
}

console.log(`Made ${changes} changes`);
fs.writeFileSync('src/App.jsx', lines.join('\r\n'));
