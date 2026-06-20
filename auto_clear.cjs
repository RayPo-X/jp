const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');
code = code.replace(
    "el.scrollIntoView({ behavior: 'smooth', block: 'center' });\\n            }", 
    "el.scrollIntoView({ behavior: 'smooth', block: 'center' });\\n                setTimeout(() => setTargetId(null), 3000);\\n            }"
);
fs.writeFileSync('src/App.jsx', code);
