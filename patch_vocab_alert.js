import fs from 'fs';
let content = fs.readFileSync('src/App.jsx', 'utf8');

const target =     if (validNewItems.length > 0) {
        validNewItems.forEach(item => {
            if (item.tag === '自訂') {;

const repl =     if (validNewItems.length > 0) {
        validNewItems.forEach(item => {
            if (item.tag === '自訂') {;

const target2 =         setBatchInputs(updatedList);
        setImportText(''); 
    }
  };;

const repl2 =         setBatchInputs(updatedList);
        setImportText(''); 
    } else {
        alert('解析失敗！請確認有輸入文字。');
    }
  };;

content = content.replace(target2, repl2);

fs.writeFileSync('src/App.jsx', content, 'utf8');
