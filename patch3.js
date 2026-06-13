import fs from 'fs';
let content = fs.readFileSync('src/App.jsx', 'utf8');

const target1 =         if (newVerbs.length === 0 || (newVerbs[newVerbs.length - 1].meaning !== '' && !exampleMatch)) {
             const verbObj = getInitialVerbInputs();
             verbObj.type = currentType;
             verbObj.group = currentGroup;
             verbObj.jisho = trimmed;
             if (currentType === 'verb') {
                 const forms = autoConjugate(trimmed, currentGroup);
                 if (forms && Object.keys(forms).length > 0) Object.assign(verbObj, forms);
             }
             newVerbs.push(verbObj);;

const repl1 =         const isVerbOrAdj = /([うくぐすつぬぶむるいな]|する|くる)$/.test(trimmed.replace(/\\[.*?\\]/g, '')) && /[\\u3040-\\u309F]/.test(trimmed);

        if (newVerbs.length === 0 || (newVerbs[newVerbs.length - 1].meaning !== '' && !exampleMatch) || isVerbOrAdj) {
             const verbObj = getInitialVerbInputs();
             verbObj.type = currentType;
             verbObj.group = currentGroup;
             verbObj.jisho = trimmed;
             if (currentType === 'verb') {
                 const forms = autoConjugate(trimmed, currentGroup);
                 if (forms && Object.keys(forms).length > 0) Object.assign(verbObj, forms);
             }
             newVerbs.push(verbObj);;

content = content.replace(target1, repl1);
content = content.replace("setBatchVerbInputs(validVerbs.map", "setBatchVerbInputs(prev => [...prev, ...validVerbs.map");

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('Fixed multiple edit bug');
