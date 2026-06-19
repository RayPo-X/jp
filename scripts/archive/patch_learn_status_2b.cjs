const fs = require('fs');
let lines = fs.readFileSync('src/App.jsx', 'utf8').split(/\r?\n/);
let changes = 0;

// === Fix: The processVerbAnswer isCorrect block didn't get updated (look at line 1236)
// We need to insert the verbDB update INSIDE the "if (isCorrect) {" block in processVerbAnswer
// The block is around line 1236-1239, we need to add after setHp

for (let i = 1230; i < 1250; i++) {
    if (lines[i] && lines[i].trim() === 'if (isCorrect) {' && 
        lines[i+1] && lines[i+1].includes("setScore(prev => prev + 1)")) {
        // Insert after "if (verbTestMode === 'rpg') setHp..." line
        for (let j = i+1; j < i+10; j++) {
            if (lines[j] && lines[j].includes("setHp(prev => prev + 1)")) {
                lines.splice(j + 1, 0,
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
        break;
    }
}

console.log(`Made ${changes} changes`);
fs.writeFileSync('src/App.jsx', lines.join('\r\n'));
