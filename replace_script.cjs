const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Import BarChart2
code = code.replace(
    /Star,\r?\n  Target\r?\n\} from 'lucide-react';/,
    "Star,\n  Target,\n  BarChart2\n} from 'lucide-react';"
);

// 2. customGrammars state init mapping
code = code.replace(
    /let ng = \{ \.\.\.g, learnStatus: g\.learnStatus \|\| 'new' \};/g,
    `let status = g.status;
                if (!status) {
                    if (g.learnStatus === 'learned') status = 'learning';
                    else status = 'new';
                }
                let ng = { 
                  ...g,
                  status,
                  ef: g.ef || 2.5,
                  interval: g.interval || 0,
                  repetitions: g.repetitions || 0,
                  totalAttempts: g.totalAttempts || 0,
                  totalCorrect: g.totalCorrect || 0,
                  nextReview: g.nextReview || 0
                };
                delete ng.learnStatus;`
);

code = code.replace(
    /return DEFAULT_GRAMMARS;\s*\} catch \{ return DEFAULT_GRAMMARS; \}/,
    `return DEFAULT_GRAMMARS.map(g => ({ ...g, status: 'new', ef: 2.5, interval: 0, repetitions: 0, totalAttempts: 0, totalCorrect: 0, nextReview: 0 }));
    } catch { return DEFAULT_GRAMMARS.map(g => ({ ...g, status: 'new', ef: 2.5, interval: 0, repetitions: 0, totalAttempts: 0, totalCorrect: 0, nextReview: 0 })); }`
);

// 3. processVerbLearningAnswer logic for customGrammars
code = code.replace(
    /\}\r?\n\r?\n    if \(autoAdvance && isCorrect\) setTimeout\(\(\) => advanceVerbRound\(\), 800\);\r?\n  \};/,
    `} else {
      setCustomGrammars(prev => prev.map(g => {
        if (g.id !== currentGrammarDef.id) return g;
        const timeSpent = actualTimeLimit - timeLeft;
        let quality = 0;
        if (isCorrect) {
          if (timeSpent <= actualTimeLimit / 2) quality = 5;
          else if (timeSpent <= actualTimeLimit * 0.8) quality = 4;
          else quality = 3;
        }
        let ef = g.ef || 2.5; let interval = g.interval || 0; let reps = g.repetitions || 0; let status = g.status || 'new';
        if (quality >= 3) {
          ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
          if (ef < 1.3) ef = 1.3;
          if (reps === 0) interval = 1;
          else if (reps === 1) interval = 2;
          else if (reps === 2) interval = 3;
          else if (reps === 3) interval = 5;
          else if (reps === 4) interval = 10;
          else interval = Math.round(interval * ef);
          reps++;
          if (reps >= 5) status = 'mastered';
          else status = 'learning';
        } else {
          reps = 0; interval = 0; status = 'learning';
        }
        return {
          ...g,
          ef, interval, repetitions: reps,
          nextReview: Date.now() + interval * 86400000,
          totalAttempts: (g.totalAttempts || 0) + 1,
          totalCorrect: (g.totalCorrect || 0) + (isCorrect ? 1 : 0),
          status
        };
      }));
    }

    if (autoAdvance && isCorrect) setTimeout(() => advanceVerbRound(), 800);
  };`
);

// 4. generateVerbQuestion logic
const oldGenerateStr = `    if (mode === 'grammar') {
      if (customGrammars.length === 0) { alert('文法公式庫為空！請先建立公式。'); goHome(); return; }
      verbDB.forEach(word => {
        customGrammars.forEach(grammar => { 
          if (onlyImportantVerbTest && !word.isImportant) return;
          if (onlyImportantGrammarTest && !grammar.isImportant) return;
          if (onlyLearnedGrammarTest && !((grammarProgress[grammar.id]?.repetitions || 0) >= 3 || grammar.learnStatus === 'learned')) return;
          if (grammar.appliesTo.includes(word.type) && word[grammar.baseForm]) { availablePool.push({ word, target: grammar.id, grammarDef: grammar }); } 
        });
      });
    }`;

const newGenerateStr = `    if (mode === 'grammar') {
      if (customGrammars.length === 0) { alert('文法公式庫為空！請先建立公式。'); goHome(); return; }
      const now = Date.now();
      const dueGrammars = customGrammars.filter(g => g.status === 'new' || (g.nextReview || 0) <= now);
      if (dueGrammars.length === 0) { alert('🎉 今日文法複習已完畢！'); goHome(); return; }

      verbDB.forEach(word => {
        dueGrammars.forEach(grammar => { 
          if (onlyImportantVerbTest && !word.isImportant) return;
          if (onlyImportantGrammarTest && !grammar.isImportant) return;
          if (grammar.appliesTo.includes(word.type) && word[grammar.baseForm]) { availablePool.push({ word, target: grammar.id, grammarDef: grammar }); } 
        });
      });
    }`;

// Since the file has some garbled text for Japanese in the alert, I should use a regex approach for generateVerbQuestion
code = code.replace(/if \(mode === 'grammar'\) \{[\s\S]*?\}\r?\n\s*else \{/, newGenerateStr + "\n    else {");

// Wait, I will use precise regex:
code = code.replace(
    /if \(mode === 'grammar'\) \{[\s\S]*?verbDB\.forEach\(word => \{[\s\S]*?\}\);\s*\}\);\s*\}/,
    newGenerateStr
);

// 5. Add grammarStats memo before return
code = code.replace(
    /const renderView = \(\) => \{/,
    `const grammarStats = React.useMemo(() => {
    let newCount = 0; let learningCount = 0; let masteredCount = 0; let dueCount = 0;
    let totalAttempts = 0; let totalCorrect = 0;
    const now = Date.now();
    customGrammars.forEach(g => {
       if (g.status === 'new') newCount++;
       else if (g.status === 'learning') learningCount++;
       else if (g.status === 'mastered') masteredCount++;
       
       if (g.status !== 'new' && (g.nextReview || 0) <= now) dueCount++;
       totalAttempts += (g.totalAttempts || 0);
       totalCorrect += (g.totalCorrect || 0);
    });
    const dueTotal = newCount + dueCount;
    const mistakeGrammarsCount = new Set(Object.values(mistakeBank).filter(m => m.grammarDef).map(m => m.grammarDef.id)).size;
    const accuracy = totalAttempts >= 20 ? Math.round((totalCorrect / totalAttempts) * 100) : null;
    return { newCount, learningCount, masteredCount, dueTotal, mistakeGrammarsCount, totalAttempts, accuracy };
  }, [customGrammars, mistakeBank]);

  const renderView = () => {`
);

// 6. UI Update: Grammar Quiz Card
const oldQuizCardRegex = /<button onClick=\{\(\) => startVerbRound\('grammar'\)\}[\s\S]*?<\/button>/;
const newQuizCard = `<button onClick={() => startVerbRound('grammar')}
                  className="p-5 bg-white border-2 border-slate-100 hover:border-emerald-300 hover:bg-emerald-50 rounded-2xl transition-all text-left group active:scale-[0.97] flex flex-col justify-between h-full">
                  <div>
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl w-fit mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <Puzzle className="w-5 h-5"/>
                    </div>
                    <div className="font-bold text-slate-800 mb-1 leading-tight">文法測驗</div>
                    <div className="text-xs text-slate-400 mt-1 leading-relaxed">專注集中練習您建立的「自訂文法公式」</div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                     <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md">待複習 {grammarStats.dueTotal} 題</span>
                     <span className={\`text-xs font-bold px-2 py-1 rounded-md \${grammarStats.accuracy !== null ? 'text-blue-700 bg-blue-100' : 'text-slate-500 bg-slate-100'}\`}>
                        {grammarStats.accuracy !== null ? \`正確率 \${grammarStats.accuracy}%\` : '正確率：資料不足'}
                     </span>
                  </div>
                </button>`;
code = code.replace(oldQuizCardRegex, newQuizCard);

// 7. UI Update: Grammar Manage Dashboard
const oldManageTitleRegex = /<h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-8"><Puzzle className="w-6 h-6 text-emerald-600"\/> [^<]*<\/h2>\s*<div className="grid lg:grid-cols-\[1\.2fr_1fr\] gap-8">/;
const newManageDash = `<h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6"><Puzzle className="w-6 h-6 text-emerald-600"/> 文法公式庫</h2>
              
              {/* Grammar SRS Dashboard */}
              <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-indigo-500"/>文法學習進度總覽 (Grammar SRS)</h3>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center shadow-sm">
                    <div className="text-sm font-bold text-slate-500 mb-1">📚 待學習</div>
                    <div className="text-2xl font-black text-slate-700">{grammarStats.newCount} <span className="text-sm font-normal text-slate-400">公式</span></div>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 text-center shadow-sm">
                    <div className="text-sm font-bold text-blue-600 mb-1">🎯 已學習</div>
                    <div className="text-2xl font-black text-blue-700">{grammarStats.learningCount} <span className="text-sm font-normal text-blue-500/60">公式</span></div>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-center shadow-sm">
                    <div className="text-sm font-bold text-amber-600 mb-1">🏆 精通</div>
                    <div className="text-2xl font-black text-amber-700">{grammarStats.masteredCount} <span className="text-sm font-normal text-amber-500/60">公式</span></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-center shadow-sm">
                    <div className="text-sm font-bold text-emerald-600 mb-1">🗓️ 待複習</div>
                    <div className="text-xl font-black text-emerald-700">{grammarStats.dueTotal} <span className="text-sm font-normal text-emerald-500/60">公式</span></div>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 text-center shadow-sm">
                    <div className="text-sm font-bold text-rose-600 mb-1">📒 錯題本</div>
                    <div className="text-xl font-black text-rose-700">{grammarStats.mistakeGrammarsCount} <span className="text-sm font-normal text-rose-500/60">公式</span></div>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8">`;
code = code.replace(oldManageTitleRegex, newManageDash);

fs.writeFileSync('src/App.jsx', code);
console.log('Done replacement.');
