const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// === 1. verbDB 初始化補上 learnStatus + correctCount ===
const verbInitTarget = `      if (saved) {\n          const parsed = JSON.parse(saved);\n          if (Array.isArray(parsed)) return parsed;\n      }\n      return INITIAL_VERB_DB;`;
const verbInitNew = `      if (saved) {\n          const parsed = JSON.parse(saved);\n          if (Array.isArray(parsed)) return parsed.map(v => ({ ...v, learnStatus: v.learnStatus || 'new', correctCount: v.correctCount || 0 }));\n      }\n      return INITIAL_VERB_DB.map(v => ({ ...v, learnStatus: 'new', correctCount: 0 }));`;
if (c.includes(verbInitTarget)) {
    c = c.replace(verbInitTarget, verbInitNew);
    console.log('✓ verbDB init patched');
} else {
    console.log('✗ verbDB init NOT found');
}

// === 2. customGrammars 初始化補上 learnStatus ===
const grammarInitTarget = `            parsed = parsed.map(g => {\n                if (g && g.name && g.name.includes('〜')) {\n                    return { ...g, name: g.name.replace(/〜/g, ' ＿') };\n                }\n                return g;\n            });`;
const grammarInitNew = `            parsed = parsed.map(g => {\n                let ng = { ...g, learnStatus: g.learnStatus || 'new' };\n                if (ng.name && ng.name.includes('〜')) {\n                    ng = { ...ng, name: ng.name.replace(/〜/g, ' ＿') };\n                }\n                return ng;\n            });`;
if (c.includes(grammarInitTarget)) {
    c = c.replace(grammarInitTarget, grammarInitNew);
    console.log('✓ customGrammars init patched');
} else {
    console.log('✗ customGrammars init NOT found');
}

// === 3. colDefinitions 加入 learnStatus ===
const colDefTarget = `  const colDefinitions = {
    'isImportant': { label: '重要(⭐)', sortable: true },
    'type': { label: '類型/群組', sortable: true },`;
const colDefNew = `  const colDefinitions = {
    'isImportant': { label: '重要(⭐)', sortable: true },
    'learnStatus': { label: '學習狀態', sortable: true },
    'type': { label: '類型/群組', sortable: true },`;
if (c.includes(colDefTarget)) {
    c = c.replace(colDefTarget, colDefNew);
    console.log('✓ colDefinitions patched');
} else {
    console.log('✗ colDefinitions NOT found');
}

// === 4. verbTableColumnOrder 初始化加入 learnStatus ===
const colOrderTarget = `       if (!newOrder.includes('isImportant')) newOrder.splice(0, 0, 'isImportant');
       if (!newOrder.includes('type')) newOrder.splice(1, 0, 'type');`;
const colOrderNew = `       if (!newOrder.includes('isImportant')) newOrder.splice(0, 0, 'isImportant');
       if (!newOrder.includes('learnStatus')) newOrder.splice(1, 0, 'learnStatus');
       if (!newOrder.includes('type')) newOrder.splice(2, 0, 'type');`;
if (c.includes(colOrderTarget)) {
    c = c.replace(colOrderTarget, colOrderNew);
    console.log('✓ verbTableColumnOrder init patched');
} else {
    console.log('✗ verbTableColumnOrder init NOT found');
}

fs.writeFileSync('src/App.jsx', c);
console.log('Done phase 1!');
