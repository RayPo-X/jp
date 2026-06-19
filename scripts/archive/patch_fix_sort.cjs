const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// Fix verbSortConfig to also have isImportant
const verbSortConfigRegex = /switch \(verbSortConfig\.key\) \{\s*case 'tag': aVal = a\.tag \|\| ''; bVal = b\.tag \|\| ''; break;/;
const newVerbSortConfig = `switch (verbSortConfig.key) {
        case 'tag': aVal = a.tag || ''; bVal = b.tag || ''; break;
        case 'isImportant': aVal = a.isImportant ? 1 : 0; bVal = b.isImportant ? 1 : 0; break;`;
c = c.replace(verbSortConfigRegex, newVerbSortConfig);

fs.writeFileSync('src/App.jsx', c);
console.log('done fix verbSortConfig');
