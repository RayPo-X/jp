const fs = require('fs');
const file = 'd:/jp/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

const newStatusAndAccuracy =     if (colId === 'status') {
        const icons = { not_started: '📚 待學習', learning: '🔥 練習中', mastered: '🏆 已掌握' };
        const colors = { not_started: 'bg-slate-100 text-slate-500 border-slate-200', learning: 'bg-orange-50 text-orange-600 border-orange-200', mastered: 'bg-amber-100 text-amber-700 border-amber-300' };
        const st = v.status || 'not_started';
        return <td key={colId} className="p-4 text-center">
            <span className={\inline-block px-3 py-1.5 rounded-full text-xs font-bold border \\}>
                {icons[st]}
            </span>
        </td>;
    }
    if (colId === 'accuracy') {
        let totalCorrect = 0; let totalWrong = 0;
        if (v.stats) {
            ACTIVE_VERB_FORMS.forEach(f => {
                if (v.stats[f]) { totalCorrect += v.stats[f].correct; totalWrong += v.stats[f].wrong; }
            });
        }
        const total = totalCorrect + totalWrong;
        const acc = total === 0 ? 0 : Math.round((totalCorrect / total) * 100);
        return <td key={colId} className="p-4 text-center">
            <div className="w-full bg-slate-100 rounded-full h-2 mb-1 border border-slate-200 overflow-hidden">
                <div className="bg-indigo-500 h-2" style={{ width: \\%\ }}></div>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500">{total > 0 ? \\%\ : '-'}</span>
        </td>;
    };

// Replace the learnStatus block using a regex that skips the text.
// The block starts at if (colId === 'learnStatus') { and ends at     } after </td>;
content = content.replace(/if\s*\(colId === 'learnStatus'\)\s*\{[\s\S]*?<\/td>;\s*\}/, newStatusAndAccuracy);

fs.writeFileSync(file, content, 'utf8');
console.log('App.jsx learnStatus replaced successfully.');
