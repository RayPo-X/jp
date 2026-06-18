const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(
  "{appState === 'vocab_manage' && (\n        <div className=\"max-w-5xl mx-auto mt-4 animate-in fade-in\">",
  "{appState === 'vocab_manage' && (\n        <div className=\"w-[95vw] max-w-[1600px] mx-auto mt-4 animate-in fade-in\">"
);
c = c.replace(
  "{appState === 'vocab_manage' && (\r\n        <div className=\"max-w-5xl mx-auto mt-4 animate-in fade-in\">",
  "{appState === 'vocab_manage' && (\r\n        <div className=\"w-[95vw] max-w-[1600px] mx-auto mt-4 animate-in fade-in\">"
);

c = c.replace(
  "{appState === 'grammar_manage' && (\n        <div className=\"max-w-6xl mx-auto mt-4 animate-in fade-in\">",
  "{appState === 'grammar_manage' && (\n        <div className=\"w-[95vw] max-w-[1600px] mx-auto mt-4 animate-in fade-in\">"
);
c = c.replace(
  "{appState === 'grammar_manage' && (\r\n        <div className=\"max-w-6xl mx-auto mt-4 animate-in fade-in\">",
  "{appState === 'grammar_manage' && (\r\n        <div className=\"w-[95vw] max-w-[1600px] mx-auto mt-4 animate-in fade-in\">"
);

c = c.replace(
  "{appState === 'verb_manage' && (\n        <div className=\"max-w-5xl mx-auto mt-4 animate-in fade-in\">",
  "{appState === 'verb_manage' && (\n        <div className=\"w-[95vw] max-w-[1600px] mx-auto mt-4 animate-in fade-in\">"
);
c = c.replace(
  "{appState === 'verb_manage' && (\r\n        <div className=\"max-w-5xl mx-auto mt-4 animate-in fade-in\">",
  "{appState === 'verb_manage' && (\r\n        <div className=\"w-[95vw] max-w-[1600px] mx-auto mt-4 animate-in fade-in\">"
);

fs.writeFileSync('src/App.jsx', c);
console.log('done widening pages');
