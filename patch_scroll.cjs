const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(
  '<div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95">',
  '<div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">'
);

fs.writeFileSync('src/App.jsx', c);
console.log('done scroll patch');
