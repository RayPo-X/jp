const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

code = code.replace(
    /\) :\ \(\r?\n\s*\{renderTags\(v\.tags\)\}\r?\n\s*\)/g,
    ") : (\n                                       <>{renderTags(v.tags)}</>\n                                     )"
);

fs.writeFileSync('src/App.jsx', code);
console.log('Script 4 complete');
