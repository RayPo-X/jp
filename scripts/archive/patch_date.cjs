const fs = require('fs');
const file = 'd:/jp/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const getAddedDate = \(id\) => \{\s*if \(\!id\) return '-';\s*const parts = id\.split\('_'\);\s*if \(parts\.length >= 3 && !isNaN\(Number\(parts\[2\]\)\)\) \{\s*const date = new Date\(Number\(parts\[2\]\)\);\s*return `\$\{date\.getMonth\(\) \+ 1\}\/\$\{date\.getDate\(\)\}`;?\s*\}\s*return '內建';\s*\};/;

const replacement = `const getAddedDate = (id) => {
    if (!id) return '-';
    const parts = String(id).split('_');
    if (parts.length >= 3 && !isNaN(Number(parts[parts.length-1]))) {
      const date = new Date(Number(parts[parts.length-1]));
      return \`\${date.getMonth() + 1}/\${date.getDate()}\`;
    }
    return '內建';
  };`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Success replacing getAddedDate');
} else {
    console.log('Failed to match getAddedDate');
}
