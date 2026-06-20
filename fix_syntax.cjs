const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');
code = code.replace("v>\\n              </div>\\n            </div>\\n            \\n            {/* Two Column Layout */}","\\n            {/* Two Column Layout */}");
fs.writeFileSync('src/App.jsx', code);
