const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const targetStr = "{grammarSortConfig.key === 'isImportant' ? (grammarSortConfig.direction === 'desc' ? '遞減' : '遞增') : '排序'}";
const newStr = "{grammarSortConfig.key === 'isImportant' ? (grammarSortConfig.direction === 'desc' ? '星號置頂' : '星號置底') : '排序'}";

if (c.includes(targetStr)) {
    c = c.replace(targetStr, newStr);
    fs.writeFileSync('src/App.jsx', c);
    console.log('done updating button text');
} else {
    console.log('target string not found');
}
