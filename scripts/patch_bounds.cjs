const fs = require('fs');
const file = 'd:/jp/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update VocabDB reset button area to add average button
const vocabResetBtn = 'onClick={() => { if(window.confirm(\\'確定要重設所有欄位寬度為預設值嗎？\\')) { setVocabColWidths({}); } }}';
const vocabAvgBtn = 'onClick={(e) => { const cWidth = e.currentTarget.closest(\\'.overflow-x-auto\\').clientWidth; const avg = Math.max(50, cWidth / vocabTableColumnOrder.length); const nw = {}; vocabTableColumnOrder.forEach(id => nw[id] = avg); setVocabColWidths(nw); }}\\n                     className=\"flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors mr-2\"\\n                     title=\"平均分配所有欄位寬度\"\\n                   >\\n                     ⚖️ 平均分配\\n                   </button>\\n                   <button\\n                     ' + vocabResetBtn;

content = content.replace(vocabResetBtn, vocabAvgBtn);

// 2. Update VerbDB reset button area to add average button
const verbResetBtn = 'onClick={() => { if(window.confirm(\\'確定要重設所有欄位寬度為預設值嗎？\\')) { setVerbColWidths({}); } }}';
const verbAvgBtn = 'onClick={(e) => { const cWidth = e.currentTarget.closest(\\'.overflow-x-auto\\').clientWidth; const avg = Math.max(50, cWidth / verbTableColumnOrder.length); const nw = {}; verbTableColumnOrder.forEach(id => nw[id] = avg); setVerbColWidths(nw); }}\\n                     className=\"flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors mr-2\"\\n                     title=\"平均分配所有欄位寬度\"\\n                   >\\n                     ⚖️ 平均分配\\n                   </button>\\n                   <button\\n                     ' + verbResetBtn;

content = content.replace(verbResetBtn, verbAvgBtn);

// 3. Update mouseMove logic
const handleMouseMoveSearch = 'const diffX = e.clientX - startX;\\r\\n      let newWidth = Math.max(15, startWidth + diffX);';
const handleMouseMoveSearchLF = 'const diffX = e.clientX - startX;\\n      let newWidth = Math.max(15, startWidth + diffX);';

const handleMouseMoveReplace = 'let diffX = e.clientX - startX;\\n      const maxAllowedDiff = resizingRef.current.maxAllowedDiff || 0;\\n      diffX = Math.min(diffX, Math.max(0, maxAllowedDiff));\\n      let newWidth = Math.max(15, startWidth + diffX);';

if (content.includes(handleMouseMoveSearch)) {
   content = content.replace(handleMouseMoveSearch, handleMouseMoveReplace);
} else if (content.includes(handleMouseMoveSearchLF)) {
   content = content.replace(handleMouseMoveSearchLF, handleMouseMoveReplace);
} else {
   console.log("Could not find handleMouseMove snippet!");
}

// 4. Update onMouseDown logic for VocabDB
const vocabMouseDownSearch = 'const startWidth = e.currentTarget.parentElement.getBoundingClientRect().width;\\r\\n                                    resizingRef.current = { tableType: \\'vocab\\', colId, startX: e.clientX, startWidth };';
const vocabMouseDownSearchLF = 'const startWidth = e.currentTarget.parentElement.getBoundingClientRect().width;\\n                                    resizingRef.current = { tableType: \\'vocab\\', colId, startX: e.clientX, startWidth };';

const vocabMouseDownReplace = 'const startWidth = e.currentTarget.parentElement.getBoundingClientRect().width;\\n                                    const tEl = e.currentTarget.closest(\\'table\\');\\n                                    const cEl = e.currentTarget.closest(\\'.overflow-x-auto\\');\\n                                    const maxAllowedDiff = cEl.clientWidth - tEl.getBoundingClientRect().width;\\n                                    resizingRef.current = { tableType: \\'vocab\\', colId, startX: e.clientX, startWidth, maxAllowedDiff };';

if (content.includes(vocabMouseDownSearch)) {
   content = content.replace(vocabMouseDownSearch, vocabMouseDownReplace);
} else if (content.includes(vocabMouseDownSearchLF)) {
   content = content.replace(vocabMouseDownSearchLF, vocabMouseDownReplace);
} else {
   console.log("Could not find VocabDB onMouseDown snippet!");
}


// 5. Update onMouseDown logic for VerbDB
const verbMouseDownSearch = 'const startWidth = e.currentTarget.parentElement.getBoundingClientRect().width;\\r\\n                     resizingRef.current = { tableType: \\'verb\\', colId, startX: e.clientX, startWidth };';
const verbMouseDownSearchLF = 'const startWidth = e.currentTarget.parentElement.getBoundingClientRect().width;\\n                     resizingRef.current = { tableType: \\'verb\\', colId, startX: e.clientX, startWidth };';

const verbMouseDownReplace = 'const startWidth = e.currentTarget.parentElement.getBoundingClientRect().width;\\n                     const tEl = e.currentTarget.closest(\\'table\\');\\n                     const cEl = e.currentTarget.closest(\\'.overflow-x-auto\\');\\n                     const maxAllowedDiff = cEl.clientWidth - tEl.getBoundingClientRect().width;\\n                     resizingRef.current = { tableType: \\'verb\\', colId, startX: e.clientX, startWidth, maxAllowedDiff };';

if (content.includes(verbMouseDownSearch)) {
   content = content.replace(verbMouseDownSearch, verbMouseDownReplace);
} else if (content.includes(verbMouseDownSearchLF)) {
   content = content.replace(verbMouseDownSearchLF, verbMouseDownReplace);
} else {
   console.log("Could not find VerbDB onMouseDown snippet!");
}

fs.writeFileSync(file, content, 'utf8');
console.log('App.jsx patched.');
