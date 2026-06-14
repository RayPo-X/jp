const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Remove duplicate masu input in Settings UI
c = c.replace(
  '<div><label className="block text-sm font-bold text-indigo-700 mb-1">ます形 (支援漢字[假名])</label><input type="text" value={verbInputs.masu || \'\'} onChange={e=>handleVerbInputChange(\'masu\', e.target.value)} placeholder="例：行[い]きます" className="w-full p-3 rounded-xl border border-indigo-200"/></div>',
  ''
);

// 2. Remove duplicate masu input in Edit Mode UI
c = c.replace(
  '<div className="flex-1 min-w-[120px]"><label className="block text-xs font-bold text-indigo-600 mb-1 ml-1">ます形</label><input type="text" value={verbEditForm.masu || \'\'} onChange={e=>setVerbEditForm({...verbEditForm, masu: e.target.value})} placeholder="ます形" className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 font-bold text-sm"/></div>',
  ''
);
// In case the spacing was different, let's use a regex or replace chunks
c = c.replace(/<div className="flex-1 min-w-\[120px\]">\s*<label className="block text-xs font-bold text-indigo-600 mb-1 ml-1">ます形<\/label>\s*<input type="text" value=\{verbEditForm\.masu \|\| ''\} onChange=\{e=>setVerbEditForm\(\{\.\.\.verbEditForm, masu: e\.target\.value\}\)\} placeholder="ます形" className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 font-bold text-sm"\/>\s*<\/div>/g, '');

// 3. Update Table Headers
const oldHeaders = `<th className="p-4">ます形</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleVerbSort('word')}>辭書/て形{renderVerbSortIcon('word')}</th>`;
const newHeaders = `{verbForms.map(f => (
                       <th key={f.id} className="p-4 whitespace-nowrap">{f.label}</th>
                    ))}`;
c = c.replace(oldHeaders, newHeaders);
c = c.replace('<th className="p-4">ます形</th>\\s*<th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick=\\{\\(\\) => handleVerbSort\\(\'word\'\\)\\}>辭書/て形\\{renderVerbSortIcon\\(\'word\'\\)\\}\\</th>', newHeaders);
// Just to be safe with spacing, let's replace them carefully
c = c.replace(/<th className="p-4">ます形<\/th>\s*<th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick=\{\(\) => handleVerbSort\('word'\)\}>辭書\/て形\{renderVerbSortIcon\('word'\)\}<\/th>/g, '{verbForms.map(f => <th key={f.id} className="p-4 whitespace-nowrap">{f.label}</th>)}');


// 4. Update Table Rows (View Mode)
const oldCells = `<td className="p-4 font-bold text-slate-800">{renderRuby(v.masu)}</td>
                          <td className="p-4 text-slate-600">{renderRuby(v.jisho)} / {renderRuby(v.te)}</td>`;
const newCells = `{verbForms.map(f => (
                           <td key={f.id} className="p-4 font-bold text-slate-700 whitespace-nowrap">{renderRuby(v[f.id])}</td>
                        ))}`;
c = c.replace(/<td className="p-4 font-bold text-slate-800">\{renderRuby\(v\.masu\)\}<\/td>\s*<td className="p-4 text-slate-600">\{renderRuby\(v\.jisho\)\} \/ \{renderRuby\(v\.te\)\}<\/td>/g, newCells);

// 5. Update colSpan in Edit Mode
c = c.replace(/<td colSpan=\{7\} className="p-4">/g, '<td colSpan={5 + verbForms.length} className="p-4">');

fs.writeFileSync('src/App.jsx', c);
console.log('done patch_verb_table');
