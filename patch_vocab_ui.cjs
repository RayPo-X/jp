const fs = require('fs');
let lines = fs.readFileSync('src/App.jsx', 'utf8').split(/\r?\n/);
let changes = 0;

// === 1. vocabColDefinitions: 加入 learnStatus ===
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const vocabColDefinitions = {')) {
        for (let j = i; j < i + 10; j++) {
            if (lines[j].includes("'isImportant':")) {
                lines.splice(j + 1, 0, "    'learnStatus': { label: '學習狀態', sortable: true },");
                changes++;
                break;
            }
        }
        break;
    }
}

// === 2. vocabTableColumnOrder: 初始化加入 learnStatus ===
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("if (!arr.includes('isImportant')) arr = ['isImportant', ...arr];")) {
        lines.splice(i + 1, 0, "         if (!arr.includes('learnStatus')) arr.splice(1, 0, 'learnStatus');");
        changes++;
        break;
    }
}
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("return ['isImportant', 'tag', 'type',")) {
        lines[i] = "    return ['isImportant', 'learnStatus', 'tag', 'type', 'word', 'meaning', 'status', 'dateAdded', 'nextReview', 'actions'];";
        changes++;
        break;
    }
}

// === 3. vocabDB tbody: 加入 learnStatus 格子渲染 ===
for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "if (colId === 'isImportant') {") {
        for (let j = i; j < i + 10; j++) {
            if (lines[j].trim() === 'if (colId === \'tag\') {') {
                const block = [
                    "                             if (colId === 'learnStatus') {",
                    "                                const isLearned = v.learnStatus === 'learned';",
                    "                                return <td key={colId} className=\"p-4 text-center\">",
                    "                                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${isLearned ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>",
                    "                                    {isLearned ? '✓ 已學習' : '待學習'}",
                    "                                  </span>",
                    "                                  <div className=\"text-[10px] text-slate-400 mt-1 font-mono\">{(v.correctDates || []).length} / 3 天</div>",
                    "                                </td>;",
                    "                             }"
                ];
                lines.splice(j, 0, ...block);
                changes++;
                break;
            }
        }
        break;
    }
}

// === 4. 首頁統計區: 單字記憶庫新增「已學習」數字卡片 ===
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('{/* ===== LEFT: 單字記憶庫 ===== */}')) {
        for (let j = i; j < i + 30; j++) {
            if (lines[j].includes('grid-cols-2 sm:grid-cols-4')) {
                // Change layout slightly if needed, or just insert it.
                // It has 4 cards already. Let's make it grid-cols-2 sm:grid-cols-5 
                // Or let's replace "累積錯題" with it, or just add a 5th card and make it flex-wrap?
                // Let's change grid-cols-2 sm:grid-cols-4 to grid-cols-2 sm:grid-cols-5
                lines[j] = lines[j].replace('sm:grid-cols-4', 'sm:grid-cols-5');
                
                // Now insert the new card before the first one
                lines.splice(j + 1, 0,
                    "                <div className=\"bg-green-50 border border-green-100 rounded-2xl p-4 text-center\">",
                    "                  <div className=\"text-3xl font-black text-green-600 leading-none mb-1.5\">{vocabDB.filter(v => v.learnStatus === 'learned').length}</div>",
                    "                  <div className=\"text-xs font-bold text-green-700/70\">已學習詞彙</div>",
                    "                </div>"
                );
                changes++;
                break;
            }
        }
        break;
    }
}

// === 5. 文法公式庫: 把徽章改為 <span> (唯讀) ===
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const isGLearned = (grammarProgress[g.id]?.repetitions || 0) >= 3 || g.learnStatus === \'learned\';')) {
        if (lines[i].includes('<button')) {
            lines[i] = "                           {(() => { const isGLearned = (grammarProgress[g.id]?.repetitions || 0) >= 3 || g.learnStatus === 'learned'; return (<span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${isGLearned ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-50 text-slate-400 border-slate-200'}`} title={isGLearned ? '系統判定已學習' : '系統判定待學習'}>{isGLearned ? '✓ 已學習' : '待學習'}</span>); })()}";
            changes++;
        }
        break;
    }
}

console.log(`Made ${changes} changes`);
fs.writeFileSync('src/App.jsx', lines.join('\r\n'));
