const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add Star import
c = c.replace(
  "MessageSquareQuote, PenTool, RefreshCcw, Save, Pencil, Search, GripHorizontal",
  "MessageSquareQuote, PenTool, RefreshCcw, Save, Pencil, Search, GripHorizontal, Star"
);

// 2. Add State variables
const stateRegex = /const \[vocabSearchQuery, setVocabSearchQuery\] = useState\(''\);/;
const stateReplacement = `const [vocabSearchQuery, setVocabSearchQuery] = useState('');
  const [showOnlyImportantVocab, setShowOnlyImportantVocab] = useState(false);
  const [showOnlyImportantVerb, setShowOnlyImportantVerb] = useState(false);
  const [onlyImportantVocabTest, setOnlyImportantVocabTest] = useState(false);
  const [onlyImportantVerbTest, setOnlyImportantVerbTest] = useState(false);`;
c = c.replace(stateRegex, stateReplacement);

// 3. Vocab Test Logic
const vocabGenRegex = /let activePool = vocabDB\.filter\(w => activeVocabThemes\.includes\(w\.tag\)\);/;
const vocabGenReplacement = `let activePool = vocabDB.filter(w => activeVocabThemes.includes(w.tag));
    if (onlyImportantVocabTest) {
      const impPool = activePool.filter(w => w.isImportant);
      if (impPool.length > 0) activePool = impPool;
      else alert('目前勾選的主題中沒有標記為「重要」的單字！將回到一般出題。');
    }`;
c = c.replace(vocabGenRegex, vocabGenReplacement);

// 4. Verb Test Logic
const verbGenNormalRegex = /const filteredWords = verbDB\.filter\(w => activeWordTypes\.includes\(w\.type\)\);/;
const verbGenNormalReplacement = `let filteredWords = verbDB.filter(w => activeWordTypes.includes(w.type));
        if (onlyImportantVerbTest) {
          const impPool = filteredWords.filter(w => w.isImportant);
          if (impPool.length > 0) filteredWords = impPool;
          else alert('目前勾選的詞性中沒有標記為「重要」的動詞/形容詞！將回到一般出題。');
        }`;
c = c.replace(verbGenNormalRegex, verbGenNormalReplacement);

const verbGenGrammarRegex = /if \(grammar\.appliesTo\.includes\(word\.type\) && word\[grammar\.baseForm\]\) \{/;
const verbGenGrammarReplacement = `if (onlyImportantVerbTest && !word.isImportant) return;
        if (grammar.appliesTo.includes(word.type) && word[grammar.baseForm]) {`;
c = c.replace(verbGenGrammarRegex, verbGenGrammarReplacement);

// Save it temporarily so we don't lose progress
fs.writeFileSync('src/App.jsx', c);
console.log('done patch phase 1');
