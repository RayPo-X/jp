const fs = require('fs');
let code = fs.readFileSync('d:\\jp\\src\\App.jsx', 'utf8');

const regex = /\} else if \(parts\.length === 1\) \{[\s\S]*?newItems\.push\(\{ word, reading, meaning: '', tag: currentTheme \|\| '自訂', example: '', isSentence: false \}\);\s*\}/;

const replacement = `} else if (parts.length === 1) {
            let word = ''; let reading = ''; let meaning = '';
            const bracketMatch = trimmed.match(/^([^\\(（]+)[\\(（]([^\\)）]+)[\\)）]$/);
            
            if (bracketMatch) {
                const outside = bracketMatch[1].trim(); const inside = bracketMatch[2].trim();
                
                if (hasKanji(outside) && !hasKanji(inside)) {
                    // 服(ふく) -> 漢字(假名)
                    word = outside; reading = inside;
                } else if (!hasKanji(outside) && hasKanji(inside)) {
                    // ふく(衣服) -> 假名(中文)
                    reading = outside; meaning = inside;
                } else if (hasKanji(outside) && hasKanji(inside)) {
                    // 勉強(讀書) -> 日文漢字(中文)
                    word = outside; meaning = inside;
                } else {
                    reading = outside; meaning = inside;
                }
            } else {
                if (!hasKanji(trimmed)) { reading = trimmed; word = ''; } 
                else { word = trimmed; reading = ''; }
            }
            newItems.push({ word, reading, meaning, tag: currentTheme || '自訂', example: '', isSentence: false });
        }`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('d:\\jp\\src\\App.jsx', code, 'utf8');
    console.log("Success");
} else {
    console.log("Regex not matched!");
}
