const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const regex = /const \[currentFlashcardIndex, setCurrentFlashcardIndex\] = useState\(0\);/;
const replace = `const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showOnlyImportantVocab, setShowOnlyImportantVocab] = useState(false);
  const [showOnlyImportantVerb, setShowOnlyImportantVerb] = useState(false);
  const [onlyImportantVocabTest, setOnlyImportantVocabTest] = useState(false);
  const [onlyImportantVerbTest, setOnlyImportantVerbTest] = useState(false);`;

if(c.includes('const [showOnlyImportantVocab')) {
    console.log('Already defined');
} else {
    c = c.replace(regex, replace);
    fs.writeFileSync('src/App.jsx', c);
    console.log('States added');
}
