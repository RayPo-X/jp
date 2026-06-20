const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');
code = code.replace("GlobalSearch';\\nimport", "GlobalSearch';\nimport");
fs.writeFileSync('src/App.jsx', code);
