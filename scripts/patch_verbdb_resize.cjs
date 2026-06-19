const fs = require('fs');
const file = 'd:/jp/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

const t1 = '              <div className=\"overflow-x-auto\">\\r\\n               <table className=\"min-w-full text-left text-sm table-fixed\">';
const r1 = '              <div className=\"overflow-x-auto\">\\r\\n                 <div className=\"flex justify-end mb-2\">\\r\\n                   <button\\r\\n                     onClick={() => { if(window.confirm(\\'確定要重設所有欄位寬度為預設值嗎？\\')) { setVerbColWidths({}); } }}\\r\\n                     className=\"flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors\"\\r\\n                     title=\"重設所有欄位寬度\"\\r\\n                   >\\r\\n                     ↩ 重設欄寬\\r\\n                   </button>\\r\\n                 </div>\\r\\n                <table className=\"text-left text-sm table-fixed\" style={{ width: \\'max-content\\', minWidth: \\'100%\\' }}>';

const t1_alt = '              <div className=\"overflow-x-auto\">\\n               <table className=\"min-w-full text-left text-sm table-fixed\">';
const r1_alt = '              <div className=\"overflow-x-auto\">\\n                 <div className=\"flex justify-end mb-2\">\\n                   <button\\n                     onClick={() => { if(window.confirm(\\'確定要重設所有欄位寬度為預設值嗎？\\')) { setVerbColWidths({}); } }}\\n                     className=\"flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors\"\\n                     title=\"重設所有欄位寬度\"\\n                   >\\n                     ↩ 重設欄寬\\n                   </button>\\n                 </div>\\n                <table className=\"text-left text-sm table-fixed\" style={{ width: \\'max-content\\', minWidth: \\'100%\\' }}>';


const t2 = '                style={{ width: verbColWidths[colId] || ([\\'isImportant\\', \\'actions\\'].includes(colId) ? 80 : undefined) }}';
const r2 = '                style={{ width: verbColWidths[colId] ?? (VERB_DEFAULT_WIDTHS[colId] || (verbForms.find(f => f.id === colId) ? 120 : undefined)) }}';

const t3 = '                  onMouseDown={(e) => {\\r\\n                    e.preventDefault();\\r\\n                    e.stopPropagation();\\r\\n                    const startWidth = e.currentTarget.parentElement.getBoundingClientRect().width;\\r\\n                    resizingRef.current = { tableType: \\'verb\\', colId, startX: e.clientX, startWidth };\\r\\n                  }}';
const r3 = '                  onMouseDown={(e) => {\\r\\n                    e.preventDefault();\\r\\n                    e.stopPropagation();\\r\\n                    const startWidth = e.currentTarget.parentElement.getBoundingClientRect().width;\\r\\n                    resizingRef.current = { tableType: \\'verb\\', colId, startX: e.clientX, startWidth };\\r\\n                    document.body.style.userSelect = \\'none\\';\\r\\n                    document.body.style.cursor = \\'col-resize\\';\\r\\n                  }}';

const t3_alt = '                  onMouseDown={(e) => {\\n                    e.preventDefault();\\n                    e.stopPropagation();\\n                    const startWidth = e.currentTarget.parentElement.getBoundingClientRect().width;\\n                    resizingRef.current = { tableType: \\'verb\\', colId, startX: e.clientX, startWidth };\\n                  }}';
const r3_alt = '                  onMouseDown={(e) => {\\n                    e.preventDefault();\\n                    e.stopPropagation();\\n                    const startWidth = e.currentTarget.parentElement.getBoundingClientRect().width;\\n                    resizingRef.current = { tableType: \\'verb\\', colId, startX: e.clientX, startWidth };\\n                    document.body.style.userSelect = \\'none\\';\\n                    document.body.style.cursor = \\'col-resize\\';\\n                  }}';


let changed = false;

if (content.includes(t1)) { content = content.replace(t1, r1); changed = true; console.log('T1 applied (CRLF)'); }
else if (content.includes(t1_alt)) { content = content.replace(t1_alt, r1_alt); changed = true; console.log('T1 applied (LF)'); }
else { console.log('T1 NOT FOUND'); }

if (content.includes(t2)) { content = content.replace(t2, r2); changed = true; console.log('T2 applied'); }
else { console.log('T2 NOT FOUND'); }

if (content.includes(t3)) { content = content.replace(t3, r3); changed = true; console.log('T3 applied (CRLF)'); }
else if (content.includes(t3_alt)) { content = content.replace(t3_alt, r3_alt); changed = true; console.log('T3 applied (LF)'); }
else { console.log('T3 NOT FOUND'); }

if (changed) fs.writeFileSync(file, content, 'utf8');
console.log('Done.');
