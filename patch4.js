import fs from 'fs';
let content = fs.readFileSync('src/App.jsx', 'utf8');

const target1 =         const arrowMatch = trimmed.match(/^(?:➜|➡️|➡|->|=>|-->|==>|>)\\s*(.*)$/);
        if (arrowMatch) {
            const meaning = arrowMatch[1].trim();
            if (newItems.length === 0 || newItems[newItems.length - 1].meaning) return;
            newItems[newItems.length - 1].meaning = meaning;
            
            if (!currentTheme) {
               newItems[newItems.length - 1].tag = guessThemeByMeaning(meaning, vocabDB);
            }
            return;
        };

const repl1 =         const arrowMatch = trimmed.match(/^(?:➜|➡️|➡|->|=>|-->|==>|>)\\s*(.*)$/);
        if (arrowMatch) {
            const meaning = arrowMatch[1].trim();
            if (newItems.length === 0 || newItems[newItems.length - 1].meaning) return;
            newItems[newItems.length - 1].meaning = meaning;
            
            if (!currentTheme) {
               newItems[newItems.length - 1].tag = guessThemeByMeaning(meaning, vocabDB);
            }
            return;
        }

        const isJp = /[\\u3040-\\u309F\\u30A0-\\u30FF]/.test(trimmed);
        if (newItems.length > 0 && newItems[newItems.length - 1].meaning === '' && !isJp) {
             newItems[newItems.length - 1].meaning = trimmed;
             if (!currentTheme) {
                newItems[newItems.length - 1].tag = guessThemeByMeaning(trimmed, vocabDB);
             }
             return;
        };

content = content.replace(target1, repl1);

const target2 = const validNewItems = newItems.filter(item => (item.reading || item.example) && item.meaning);;
const repl2 = const validNewItems = newItems.filter(item => (item.word || item.reading || item.example) && item.meaning);;
content = content.replace(target2, repl2);

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('Fixed Vocab Smart Import');
