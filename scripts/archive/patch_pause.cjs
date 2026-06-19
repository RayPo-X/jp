const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(
  "!isRoundComplete && !isPaused && (appState === 'vocab_playing' || appState === 'verb_playing')",
  "!isRoundComplete && (appState === 'vocab_playing' || appState === 'verb_playing')"
);

fs.writeFileSync('src/App.jsx', c);
console.log('done patch_pause');
