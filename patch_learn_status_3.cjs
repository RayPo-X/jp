const fs = require('fs');
let lines = fs.readFileSync('src/App.jsx', 'utf8').split(/\r?\n/);
let changes = 0;

// === 1. Grammar card: Add learnStatus badge button before isImportant Star button ===
for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '<div className="flex items-center gap-2 shrink-0">' &&
        lines[i + 1] && lines[i + 1].includes('setCustomGrammars(prev => prev.map(x => x.id === g.id ? { ...x, isImportant:')) {
        // Insert learnStatus button before
        lines.splice(i + 1, 0,
            "                           {(() => { const isGLearned = (grammarProgress[g.id]?.repetitions || 0) >= 3 || g.learnStatus === 'learned'; return (<button onClick={() => setCustomGrammars(prev => prev.map(x => x.id === g.id ? { ...x, learnStatus: isGLearned && g.learnStatus === 'learned' ? 'new' : 'learned' } : x))} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${isGLearned ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-600'}`} title={isGLearned ? '已學習（點擊可重置手動標記）' : '手動標記為已學習'}>{isGLearned ? '✓ 已學習' : '待學習'}</button>); })()}"
        );
        changes++;
        break;
    }
}

// === 2. Settings panel: Add onlyLearnedVerbTest and onlyLearnedGrammarTest options ===
for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '</>' && 
        lines[i - 1] && lines[i - 1].includes('onlyImportantGrammarTest') &&
        lines[i + 1] && lines[i + 1].trim() === ')}') {
        lines.splice(i, 0,
            "                        <label className=\"flex items-center gap-2 cursor-pointer p-2 border-t border-slate-100 mt-1\"><input type=\"checkbox\" checked={onlyLearnedVerbTest} onChange={(e)=>setOnlyLearnedVerbTest(e.target.checked)} className=\"w-5 h-5 text-emerald-600 rounded border-slate-300\"/><span>只從「已學習」的動詞/形容詞出題</span></label>",
            "                        <label className=\"flex items-center gap-2 cursor-pointer p-2\"><input type=\"checkbox\" checked={onlyLearnedGrammarTest} onChange={(e)=>setOnlyLearnedGrammarTest(e.target.checked)} className=\"w-5 h-5 text-emerald-600 rounded border-slate-300\"/><span>只從「已學習」的文法公式出題</span></label>"
        );
        changes++;
        break;
    }
}

// === 3. generateVerbQuestion: Add onlyLearnedVerbTest and onlyLearnedGrammarTest filters ===
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('if (onlyImportantVerbTest) {') && lines[i + 1] && lines[i + 1].includes("const impPool = filteredWords.filter")) {
        // Insert after the onlyImportantVerbTest block
        for (let j = i; j < i + 8; j++) {
            if (lines[j].includes("alert('目前勾選的詞性中沒有標記為「重要」的動詞/形容詞！將回到一般出題。')")) {
                // Insert after the closing brace of this if block
                lines.splice(j + 2, 0,
                    "        if (onlyLearnedVerbTest) {",
                    "          const learnedPool = filteredWords.filter(w => w.learnStatus === 'learned');",
                    "          if (learnedPool.length > 0) filteredWords = learnedPool;",
                    "          else alert('目前沒有已學習的動詞/形容詞！將回到全部出題。');",
                    "        }"
                );
                changes++;
                break;
            }
        }
        break;
    }
}

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('if (onlyImportantGrammarTest && !grammar.isImportant) return;')) {
        lines.splice(i + 1, 0,
            "          if (onlyLearnedGrammarTest && !((grammarProgress[grammar.id]?.repetitions || 0) >= 3 || grammar.learnStatus === 'learned')) return;"
        );
        changes++;
        break;
    }
}

// === 4. Home page stats: Add verb learned count card ===
// The grammar stats are in grid grid-cols-3
for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '{/* Grammar Stats Cards */}') {
        // Replace grid-cols-3 with grid-cols-4 and add new card
        if (lines[i + 1] && lines[i + 1].includes('grid-cols-3')) {
            lines[i + 1] = lines[i + 1].replace('grid grid-cols-3 gap-3', 'grid grid-cols-2 sm:grid-cols-4 gap-3');
        }
        // Find end of stats div and add new card before it
        for (let j = i + 2; j < i + 20; j++) {
            if (lines[j] && lines[j].trim() === '</div>' && lines[j - 1] && lines[j - 1].includes('已練習')) {
                lines.splice(j, 0,
                    "                 <div className=\"bg-green-50 border border-green-100 rounded-2xl p-4 text-center\">",
                    "                   <div className=\"text-3xl font-black text-green-600 leading-none mb-1.5\">{verbDB.filter(v => v.learnStatus === 'learned').length}</div>",
                    "                   <div className=\"text-xs font-bold text-green-700/70\">已學習詞彙</div>",
                    "                 </div>"
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
