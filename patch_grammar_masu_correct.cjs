const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');
let lines = c.split('\n');

// 1. Add masu to DEFAULT_FORM_OPTIONS
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const DEFAULT_FORM_OPTIONS = [')) {
    // If it doesn't already have masu
    if (!lines[i+1].includes('ます形')) {
       lines.splice(i+1, 0, "  { id: 'masu', label: 'ます形' },");
    }
    break;
  }
}

// 2. Add injection logic to verbForms state
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("localStorage.getItem('verbApp_verbForms')")) {
    // Look a few lines down for the Array.isArray check
    for (let j = i; j < i + 10; j++) {
       if (lines[j].includes('if (Array.isArray(parsed)) return parsed;')) {
          lines[j] = lines[j].replace(
             'if (Array.isArray(parsed)) return parsed;',
             `if (Array.isArray(parsed)) {
             if (!parsed.find(f => f.id === 'masu')) {
                parsed.unshift({ id: 'masu', label: 'ます形' });
             }
             return parsed;
          }`
          );
          break;
       }
    }
    break;
  }
}

fs.writeFileSync('src/App.jsx', lines.join('\n'));
console.log('done');
