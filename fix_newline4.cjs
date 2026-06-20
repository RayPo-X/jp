const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');
code = code.replace("useState('');\\n  const [targetId", "useState('');\n  const [targetId");
fs.writeFileSync('src/App.jsx', code);
