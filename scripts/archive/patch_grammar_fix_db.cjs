const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const badInit = `      if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
             if (!parsed.find(f => f.id === 'masu')) {
                parsed.unshift({ id: 'masu', label: 'ます形' });
             }
             return parsed;
          }
      }`;
      
const goodInit = `      if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
      }`;

// Only replace the FIRST occurrence which is verbDB
c = c.replace(badInit, goodInit);
c = c.replace(badInit.replace(/\n/g, '\r\n'), goodInit);

fs.writeFileSync('src/App.jsx', c);
console.log('done');
