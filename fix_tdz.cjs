const fs = require('fs');

let code = fs.readFileSync('src/App.jsx', 'utf8');

// The exact block I injected
const effectBlock = `  useEffect(() => {
    if (targetId) {
        const timer = setTimeout(() => {
            const el = document.getElementById('item-' + targetId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => setTargetId(null), 3000);
            }
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [targetId, appState, vocabManageTab]);`;

// Remove the effect block from where it currently is
code = code.split(effectBlock + '\\n').join('');
code = code.split(effectBlock).join('');

// Now, insert the effect block at a safe location, like right before:
// const grammarStats = React.useMemo(() => {
const targetInjectionPoint = 'const grammarStats = React.useMemo(() => {';
if (code.includes(targetInjectionPoint)) {
    code = code.replace(targetInjectionPoint, effectBlock + '\\n\\n  ' + targetInjectionPoint);
    console.log("Successfully moved useEffect to fix TDZ.");
} else {
    console.log("Could not find grammarStats to inject useEffect.");
}

fs.writeFileSync('src/App.jsx', code);
