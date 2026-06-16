const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(
  "const [sourceForm, setSourceForm] = useState('masu');",
  "const [sourceForm, setSourceForm] = useState(() => localStorage.getItem('verbApp_sourceForm') || 'masu');"
);

c = c.replace(
  "const [targetForms, setTargetForms] = useState(['te', 'ta', 'nai', 'jisho']);",
  "const [targetForms, setTargetForms] = useState(() => {\n    const saved = localStorage.getItem('verbApp_targetForms');\n    if (saved) return JSON.parse(saved);\n    return ['te', 'ta', 'nai', 'jisho'];\n  });"
);

const effects = `
  useEffect(() => { localStorage.setItem('verbApp_sourceForm', sourceForm); }, [sourceForm]);
  useEffect(() => { localStorage.setItem('verbApp_targetForms', JSON.stringify(targetForms)); }, [targetForms]);
`;

c = c.replace(
  "useEffect(() => { localStorage.setItem('verbApp_githubToken', githubToken); }, [githubToken]);",
  "useEffect(() => { localStorage.setItem('verbApp_githubToken', githubToken); }, [githubToken]);\n" + effects
);

fs.writeFileSync('src/App.jsx', c);
console.log('done patch_localstorage');
