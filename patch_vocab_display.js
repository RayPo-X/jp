import fs from 'fs';
let content = fs.readFileSync('src/App.jsx', 'utf8');

// Fix audio speech text
const speechTarget = question: vocabTestMode === 'sentence' ? (parseExample(currentVocab.example).plainSentence || currentVocab.word) : (vocabTestMode === 'reverse' ? currentVocab.word : currentVocab.meaning),;
const speechRepl = question: vocabTestMode === 'sentence' ? (parseExample(currentVocab.example).plainSentence || currentVocab.word || currentVocab.reading) : (vocabTestMode === 'reverse' ? (currentVocab.word || currentVocab.reading || currentVocab.example) : currentVocab.meaning),;
content = content.replace(speechTarget, speechRepl);

// Fix UI rendering
const uiTarget =                         <div className="text-sm text-slate-500 mb-2">請問這句日文的中文意思是？</div>
                        <div className="text-4xl sm:text-5xl font-black text-slate-800 tracking-wide mb-8 py-6">{currentVocab.word}</div>;
const uiRepl =                         <div className="text-sm text-slate-500 mb-2">請問這句日文的中文意思是？</div>
                        <div className="text-4xl sm:text-5xl font-black text-slate-800 tracking-wide mb-8 py-6">{currentVocab.word || currentVocab.reading || currentVocab.example}</div>;
content = content.replace(uiTarget, uiRepl);

fs.writeFileSync('src/App.jsx', content, 'utf8');
