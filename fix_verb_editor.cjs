const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetStr = "<input type=\"text\" value={verbEditForm.meaning || ''}";
const startIndex = code.indexOf(targetStr);

if (startIndex !== -1 && !code.includes('tags={verbEditForm.tags}')) {
    const divEnd = code.indexOf('</div>', startIndex);
    const insertHTML = '\\n                                   <div className="w-full mt-2 col-span-full"><TagEditor tags={verbEditForm.tags} onChange={tags => setVerbEditForm({...verbEditForm, tags})} tagStats={globalTagStats} /></div>';
    
    code = code.substring(0, divEnd + 6) + insertHTML + code.substring(divEnd + 6);
    fs.writeFileSync('src/App.jsx', code);
    console.log("Success! TagEditor added to Verb edit form.");
} else {
    console.log("Could not find string or already added.");
}
