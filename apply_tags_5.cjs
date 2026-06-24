const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// The line is: {g.tag && <span className={`px-2 py-0.5 rounded-full text-[12px] font-bold border ${getTagStyle(g.tag)}`}>{g.tag}</span>}
code = code.replace(
    /\{g\.tag \&\& <span className=\{`px-2 py-0\.5 rounded-full text-\[12px\] font-bold border \$\{getTagStyle\(g\.tag\)\}`\}>\{g\.tag\}<\/span>\}/g,
    "<>{renderTags(g.tags)}</>"
);

fs.writeFileSync('src/App.jsx', code);
console.log('Script 5 complete');
