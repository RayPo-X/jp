import fs from 'fs';
let content = fs.readFileSync('src/App.jsx', 'utf8');

// Fix handleBatchSave
const saveTarget = setBatchInputs(Array(5).fill({ word: '', reading: '', meaning: '', tag: '自訂', example: '' }));;
const saveRepl = setBatchInputs(Array.from({ length: 5 }, () => ({ word: '', reading: '', meaning: '', tag: '自訂', example: '' })));;
content = content.replace(saveTarget, saveRepl);

// Fix handleSmartImport Array fill
const importTarget = if (updatedList.length < 5) updatedList = [...updatedList, ...Array(5 - updatedList.length).fill({ word: '', reading: '', meaning: '', tag: '自訂', example: '' })];;
const importRepl = if (updatedList.length < 5) updatedList = [...updatedList, ...Array.from({ length: 5 - updatedList.length }, () => ({ word: '', reading: '', meaning: '', tag: '自訂', example: '' }))];;
content = content.replace(importTarget, importRepl);

// Fix hasKanji fallback
const hasKanjiTarget =             if (bracketMatch) {
                const outside = bracketMatch[1].trim(); const inside = bracketMatch[2].trim();
                if (!hasKanji(outside)) { reading = outside; word = ''; } 
                else { word = outside; reading = inside; }
            } else {
                if (!hasKanji(trimmed)) { reading = trimmed; word = ''; } 
                else { word = trimmed; reading = ''; }
            };

const hasKanjiRepl =             if (bracketMatch) {
                const outside = bracketMatch[1].trim(); const inside = bracketMatch[2].trim();
                if (!hasKanji(outside)) { reading = outside; word = ''; } 
                else { word = outside; reading = inside; }
            } else {
                if (!hasKanji(trimmed) && trimmed.length < 15 && !trimmed.includes('、') && !trimmed.includes('。')) { reading = trimmed; word = ''; } 
                else { word = trimmed; reading = ''; }
            };
content = content.replace(hasKanjiTarget, hasKanjiRepl);

fs.writeFileSync('src/App.jsx', content, 'utf8');
