const fs = require('fs');
let lines = fs.readFileSync('src/App.jsx', 'utf8').split(/\r?\n/);
let changes = 0;

// === 1. Add learnStatus rendering in verbDB tbody (after isImportant block) ===
for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "if (colId === 'isImportant') {") {
        // find end of isImportant block (closing "}")
        for (let j = i + 1; j < i + 10; j++) {
            if (lines[j].trim() === 'if (colId === \'type\') {') {
                // Insert learnStatus block before type block
                const learnStatusBlock = [
                    "    if (colId === 'learnStatus') {",
                    "        const isLearned = v.learnStatus === 'learned';",
                    "        return <td key={colId} className=\"p-4 text-center\">",
                    "            <button onClick={() => setVerbDB(prev => prev.map(x => x.id === v.id ? { ...x, learnStatus: isLearned ? 'new' : 'learned' } : x))} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${isLearned ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-600'}`} title={isLearned ? '點擊重設為待學習' : '手動標記為已學習'}>",
                    "                {isLearned ? '✓ 已學習' : '待學習'}",
                    "            </button>",
                    "        </td>;",
                    "    }"
                ];
                lines.splice(j, 0, ...learnStatusBlock);
                changes++;
                break;
            }
        }
        break;
    }
}

// === 2. Add processVerbAnswer correctCount update ===
for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === 'if (isCorrect) {' && lines[i + 1] && lines[i + 1].includes("setScore(prev => prev + 1)")) {
        // Insert verbDB correct count update after setScore
        lines.splice(i + 1, 0,
            "      setVerbDB(prev => prev.map(x => {",
            "        if (x.id !== currentVerb.id) return x;",
            "        const newCount = (x.correctCount || 0) + 1;",
            "        return { ...x, correctCount: newCount, learnStatus: newCount >= 3 ? 'learned' : x.learnStatus };",
            "      }));"
        );
        changes++;
        break;
    }
}

// === 3. Add onlyLearnedVerbTest and onlyLearnedGrammarTest state ===
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("const [onlyImportantGrammarTest, setOnlyImportantGrammarTest] = useState(false);")) {
        lines.splice(i + 1, 0,
            "  const [onlyLearnedVerbTest, setOnlyLearnedVerbTest] = useState(false);",
            "  const [onlyLearnedGrammarTest, setOnlyLearnedGrammarTest] = useState(false);"
        );
        changes++;
        break;
    }
}

console.log(`Made ${changes} changes`);
fs.writeFileSync('src/App.jsx', lines.join('\r\n'));
