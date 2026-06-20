const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');
code = code.replace(
    'pt-            {/* Hero Header */}', 
    'pt-6 sm:pt-12 animate-in fade-in slide-in-from-bottom-4">\\n            {/* Hero Header */}'
);
fs.writeFileSync('src/App.jsx', code);
