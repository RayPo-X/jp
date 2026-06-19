const fs = require('fs');
let lines = fs.readFileSync('src/App.jsx', 'utf8').split(/\r?\n/);
let changes = 0;

// === 1. Update VocabDB Initialization ===
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const [vocabDB, setVocabDB] = useState(() => {')) {
        for (let j = i; j < i + 20; j++) {
            if (lines[j].includes('let updatedV = { ...v, learnStatus: v.learnStatus || \'new\', correctDates: v.correctDates || [] };')) {
                lines.splice(j, 4,
                    "            let updatedV = { ...v, correctDates: v.correctDates || [] };",
                    "            if (updatedV.learnStatus === 'learned' && updatedV.status === 'new') updatedV.status = 'learning';",
                    "            if (updatedV.repetitions >= 5 && updatedV.status !== 'mastered' && updatedV.status !== 'learning') updatedV.status = 'learning';",
                    "            if (!updatedV.status) updatedV.status = 'new';",
                    "            if (updatedV.status === 'mastered' && (updatedV.interval || 0) < 60) updatedV.status = 'learning';",
                    "            delete updatedV.learnStatus;",
                    "            return updatedV;"
                );
                changes++;
                break;
            }
        }
        break;
    }
}
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('return INITIAL_VOCAB_DB.map(v => ({ ...v, status: \'new\', learnStatus: \'new\', correctDates: [] }));')) {
        lines[i] = "      return INITIAL_VOCAB_DB.map(v => ({ ...v, status: 'new', correctDates: [] }));";
        changes++;
    }
    if (lines[i].includes('} catch { return INITIAL_VOCAB_DB.map(v => ({ ...v, status: \'new\', learnStatus: \'new\', correctDates: [] })); }')) {
        lines[i] = "    } catch { return INITIAL_VOCAB_DB.map(v => ({ ...v, status: 'new', correctDates: [] })); }";
        changes++;
    }
}

// === 2. Update VocabDB Answer Logic ===
for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === 'const processVocabAnswer = () => {') {
        let startIndex = -1;
        let endIndex = -1;
        for (let j = i; j < i + 100; j++) {
            if (lines[j].includes('setVocabDB(prevDB => prevDB.map(v => {')) && startIndex === -1) {
                startIndex = j;
            }
            if (startIndex !== -1 && lines[j].includes('}));') && lines[j-1].includes('return v;')) {
                endIndex = j;
                break;
            }
        }
        if (startIndex !== -1 && endIndex !== -1) {
            const newBlock = [
                "        setVocabDB(prevDB => prevDB.map(v => {",
                "            if (v.id === currentVocab.id) {",
                "                let newDates = v.correctDates || [];",
                "                if (isCorrect) {",
                "                    const todayStr = new Date().toLocaleDateString('en-CA');",
                "                    newDates = Array.from(new Set([...newDates, todayStr]));",
                "                }",
                "                let ef = v.ef || 2.5; let interval = v.interval || 0; let reps = v.repetitions || 0; let status = v.status || 'new';",
                "                if (status === 'new') {",
                "                    if (isCorrect) {",
                "                        if (newDates.length < 3) { interval = 1; reps = 0; }",
                "                        else { status = 'learning'; interval = 1; reps = 1; }",
                "                    } else { interval = 0; reps = 0; }",
                "                    return { ...v, correctDates: newDates, ef, interval, repetitions: reps, nextReview: Date.now() + interval * 86400000, status, lastReviewed: Date.now() };",
                "                } else {",
                "                    if (quality >= 3) {",
                "                        ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));",
                "                        if (ef < 1.3) ef = 1.3;",
                "                        if (reps === 0) interval = 1;",
                "                        else if (reps === 1) interval = 2;",
                "                        else if (reps === 2) interval = 4;",
                "                        else if (reps === 3) interval = 7;",
                "                        else if (reps === 4) interval = 14;",
                "                        else interval = Math.round(interval * ef);",
                "                        reps++;",
                "                        status = interval >= 60 ? 'mastered' : 'learning';",
                "                    } else {",
                "                        reps = 0; interval = 0; status = 'learning';",
                "                    }",
                "                    return { ...v, correctDates: newDates, ef, interval, repetitions: reps, nextReview: Date.now() + interval * 86400000, status, lastReviewed: Date.now() };",
                "                }",
                "            }",
                "            return v;",
                "        }));"
            ];
            lines.splice(startIndex, endIndex - startIndex + 1, ...newBlock);
            changes++;
        }
        break;
    }
}

// Remove the old setVocabDB (the one that updated correctCount / learnStatus separately)
for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === 'const processVocabAnswer = () => {') {
        for (let j = i; j < i + 50; j++) {
            if (lines[j].includes('setVocabDB(prev => prev.map(x => {')) && lines[j+1] && lines[j+1].includes('if (x.id !== currentVocab.id) return x;')) {
                lines.splice(j, 6);
                changes++;
                break;
            }
        }
        break;
    }
}

// === 3. Column Definitions Update ===
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("'learnStatus': { label: '學習狀態', sortable: true }")) {
        lines.splice(i, 1);
        changes++;
        break;
    }
}
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("if (!arr.includes('learnStatus')) arr.splice(1, 0, 'learnStatus');")) {
        lines.splice(i, 1);
        changes++;
        break;
    }
}
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("return ['isImportant', 'learnStatus', 'tag', 'type', 'word', 'meaning', 'status', 'dateAdded', 'nextReview', 'actions'];")) {
        lines[i] = "    return ['isImportant', 'status', 'tag', 'type', 'word', 'meaning', 'dateAdded', 'nextReview', 'actions'];";
        changes++;
        break;
    }
}
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("if (!arr.includes('status')) arr.push('status');")) {
        lines[i] = "         if (!arr.includes('status')) arr.splice(1, 0, 'status');";
        changes++;
        break;
    }
}

// === 4. Table UI Update ===
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("if (colId === 'learnStatus') {")) {
        lines.splice(i, 8); // remove the old learnStatus block
        changes++;
        break;
    }
}
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("if (colId === 'status') {")) {
        let endIndex = i;
        while (!lines[endIndex].includes("</td>;")) endIndex++;
        const newBlock = [
            "                             if (colId === 'status') {",
            "                                const isNew = v.status === 'new';",
            "                                const isMastered = v.status === 'mastered';",
            "                                return <td key={colId} className=\"p-4 text-center\">",
            "                                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${isNew ? 'bg-slate-50 text-slate-400 border-slate-200' : isMastered ? 'bg-amber-50 text-amber-600 border-amber-300' : 'bg-blue-50 text-blue-600 border-blue-300'}`}>",
            "                                    {isNew ? '📚 待學習' : isMastered ? '🏆 精通' : '🎯 已學習'}",
            "                                  </span>",
            "                                  <div className=\"text-[10px] text-slate-400 mt-1 font-mono\">",
            "                                    {isNew ? `${(v.correctDates || []).length} / 3 天` : `間隔 ${v.interval || 0} 天`}",
            "                                  </div>",
            "                                </td>;"
        ];
        lines.splice(i, endIndex - i + 1, ...newBlock);
        changes++;
        break;
    }
}

// === 5. Home Page Stats Cards ===
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('className="grid grid-cols-2 sm:grid-cols-5 gap-3"')) {
        let endIdx = i;
        while (!lines[endIdx].includes('{/* Primary Action */}')) endIdx++;
        
        const newBlock = [
            "              {/* Status Stats Cards */}",
            "              <div className=\"grid grid-cols-3 gap-3 mb-3\">",
            "                <div className=\"bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center\">",
            "                  <div className=\"text-3xl font-black text-slate-500 leading-none mb-1.5\">{vocabDB.filter(v => v.status === 'new').length}</div>",
            "                  <div className=\"text-xs font-bold text-slate-500/70\">📚 待學習</div>",
            "                </div>",
            "                <div className=\"bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center\">",
            "                  <div className=\"text-3xl font-black text-blue-600 leading-none mb-1.5\">{vocabDB.filter(v => v.status === 'learning').length}</div>",
            "                  <div className=\"text-xs font-bold text-blue-700/70\">🎯 已學習</div>",
            "                </div>",
            "                <div className=\"bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center\">",
            "                  <div className=\"text-3xl font-black text-amber-600 leading-none mb-1.5\">{vocabDB.filter(v => v.status === 'mastered').length}</div>",
            "                  <div className=\"text-xs font-bold text-amber-700/70\">🏆 精通</div>",
            "                </div>",
            "              </div>",
            "              {/* SRS Queue Stats Cards */}",
            "              <div className=\"grid grid-cols-3 gap-3\">",
            "                <div className=\"bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center\">",
            "                  <div className=\"text-3xl font-black text-orange-600 leading-none mb-1.5\">{todayQueue.length}</div>",
            "                  <div className=\"text-xs font-bold text-orange-700/70\">單字待複習</div>",
            "                </div>",
            "                <div className=\"bg-fuchsia-50 border border-fuchsia-100 rounded-2xl p-4 text-center\">",
            "                  <div className=\"text-3xl font-black text-fuchsia-600 leading-none mb-1.5\">{todaySentenceQueue.length}</div>",
            "                  <div className=\"text-xs font-bold text-fuchsia-700/70\">例句待複習</div>",
            "                </div>",
            "                <div className=\"bg-red-50 border border-red-100 rounded-2xl p-4 text-center\">",
            "                  <div className=\"text-3xl font-black text-red-500 leading-none mb-1.5\">{Object.keys(vocabMistakes).length}</div>",
            "                  <div className=\"text-xs font-bold text-red-400\">累積錯題</div>",
            "                </div>",
            "              </div>",
            ""
        ];
        lines.splice(i, endIdx - i, ...newBlock);
        changes++;
        break;
    }
}

console.log(`Made ${changes} changes`);
fs.writeFileSync('src/App.jsx', lines.join('\r\n'));
