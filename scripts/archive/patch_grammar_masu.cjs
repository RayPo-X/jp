const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add masu to DEFAULT_FORM_OPTIONS
if (!c.includes("{ id: 'masu', label: 'ます形' }")) {
  c = c.replace(
    "const DEFAULT_FORM_OPTIONS = [",
    "const DEFAULT_FORM_OPTIONS = [\n  { id: 'masu', label: 'ます形' },"
  );
}

// 2. Add auto-inject logic for existing users
const stateInitOld = `      if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
      }`;
const stateInitNew = `      if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
             if (!parsed.find(f => f.id === 'masu')) {
                parsed.unshift({ id: 'masu', label: 'ます形' });
             }
             return parsed;
          }
      }`;

c = c.replace(stateInitOld, stateInitNew);
c = c.replace(stateInitOld.replace(/\n/g, '\r\n'), stateInitNew);

fs.writeFileSync('src/App.jsx', c);
console.log('done');
