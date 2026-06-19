const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'src', 'App.jsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Fix VocabDB resize handle
const vocabTarget = `<div \n                                  onMouseDown={(e) => {\n                                    e.preventDefault();\n                                    e.stopPropagation();\n                                    const startWidth = e.currentTarget.parentElement.getBoundingClientRect().width;\n                                    resizingRef.current = { tableType: 'vocab', colId, startX: e.clientX, startWidth };\n                                  }}\n                                  className="absolute -right-2 top-0 bottom-0 w-4 cursor-col-resize hover:bg-amber-400/50 z-20 flex items-center justify-center group"\n                                  title="?–æ?ç¸®æ”¾"\n                                >\n                                  <div className="w-1 h-4 rounded-full bg-slate-300 group-hover:bg-amber-500 transition-colors"></div>\n                                </div>`;

const vocabReplace = `<div \n                                  onMouseDown={(e) => {\n                                    e.preventDefault();\n                                    e.stopPropagation();\n                                    const startWidth = e.currentTarget.parentElement.getBoundingClientRect().width;\n                                    resizingRef.current = { tableType: 'vocab', colId, startX: e.clientX, startWidth };\n                                  }}\n                                  className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize hover:bg-amber-300/30 z-30 flex items-center justify-center group border-r border-transparent hover:border-amber-400"\n                                  title="?–æ?ç¸®æ”¾"\n                                >\n                                  <div className="w-0.5 h-6 rounded-full bg-slate-200 group-hover:bg-amber-500 transition-colors"></div>\n                                </div>`;

// Fix VerbDB resize handle
const verbTarget = `<div \n                  onMouseDown={(e) => {\n                    e.preventDefault();\n                    e.stopPropagation();\n                    const startWidth = e.currentTarget.parentElement.getBoundingClientRect().width;\n                    resizingRef.current = { tableType: 'verb', colId, startX: e.clientX, startWidth };\n                  }}\n                  className="absolute -right-2 top-0 bottom-0 w-4 cursor-col-resize hover:bg-indigo-400/50 z-20 flex items-center justify-center group"\n                  title="?–æ?ç¸®æ”¾"\n                >\n                  <div className="w-1 h-4 rounded-full bg-slate-300 group-hover:bg-indigo-500 transition-colors"></div>\n                </div>`;

const verbReplace = `<div \n                  onMouseDown={(e) => {\n                    e.preventDefault();\n                    e.stopPropagation();\n                    const startWidth = e.currentTarget.parentElement.getBoundingClientRect().width;\n                    resizingRef.current = { tableType: 'verb', colId, startX: e.clientX, startWidth };\n                  }}\n                  className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize hover:bg-indigo-300/30 z-30 flex items-center justify-center group border-r border-transparent hover:border-indigo-400"\n                  title="?–æ?ç¸®æ”¾"\n                >\n                  <div className="w-0.5 h-6 rounded-full bg-slate-200 group-hover:bg-indigo-500 transition-colors"></div>\n                </div>`;

let success = true;

if (content.includes(vocabTarget)) {
    content = content.replace(vocabTarget, vocabReplace);
    console.log("Vocab handle replaced.");
} else {
    console.log("Vocab handle target NOT FOUND!");
    success = false;
}

if (content.includes(verbTarget)) {
    content = content.replace(verbTarget, verbReplace);
    console.log("Verb handle replaced.");
} else {
    console.log("Verb handle target NOT FOUND!");
    success = false;
}

if (success) {
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log("Patch successfully applied.");
}
