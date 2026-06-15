const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(
  "import { autoConjugate } from './conjugator';",
  "import { autoConjugate, deriveJishoFromMasu } from './conjugator';"
);

const oldBtnCode = `onClick={() => {if (!verbInputs.jisho) return alert('請先填寫普通形(辭書形/常體)！'); const forms = autoConjugate(verbInputs.jisho, verbInputs.group); if (Object.keys(forms).length > 0) { setVerbInputs(prev => ({ ...prev, ...forms })); } else { alert('無法自動產生，請確認格式是否正確！'); } }}`;

const newBtnCode = `onClick={() => {
    let jishoToUse = verbInputs.jisho;
    if (!jishoToUse && verbInputs.masu) {
        jishoToUse = deriveJishoFromMasu(verbInputs.masu, verbInputs.group);
    }
    if (!jishoToUse) return alert('請填寫普通形(辭書形/常體)或ます形！'); 
    const forms = autoConjugate(jishoToUse, verbInputs.group); 
    if (Object.keys(forms).length > 0) { 
        setVerbInputs(prev => ({ ...prev, jisho: jishoToUse, ...forms })); 
    } else { 
        alert('無法自動產生，請確認格式是否正確！'); 
    } 
}}`.replace(/\n/g, ' ');

// Note: oldBtnCode has newline issues potentially, so I will do string matching carefully.
// Instead of matching the whole string, I will replace using a regex.
c = c.replace(/onClick=\{\(\) => \{if \(\!verbInputs\.jisho\) return alert\('請先填寫普通形\(辭書形\/常體\)！'\); const forms = autoConjugate\(verbInputs\.jisho, verbInputs\.group\); if \(Object\.keys\(forms\)\.length > 0\) \{ setVerbInputs\(prev => \(\{ \.\.\.prev, \.\.\.forms \}\)\); \} else \{ alert\('無法自動產生，請確認格式是否正確！'\); \} \}\}/, newBtnCode);

fs.writeFileSync('src/App.jsx', c);
console.log('done patch_app_derive');
