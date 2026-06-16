const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(
  "const syncToGitHub = async () => {",
  "const syncToGitHub = async () => {\n    const cleanToken = githubToken.trim();\n    const cleanGistId = gistId.trim();"
);

c = c.replace(
  "if (!githubToken) return alert('請先輸入 GitHub Token');",
  "if (!cleanToken) return alert('請先輸入 GitHub Token');"
);

c = c.replace(
  "let url = 'https://api.github.com/gists';\n      let method = 'POST';\n      if (gistId) {\n        url = `https://api.github.com/gists/${gistId}`;\n        method = 'PATCH';\n      }",
  "let url = 'https://api.github.com/gists';\n      let method = 'POST';\n      if (cleanGistId) {\n        url = `https://api.github.com/gists/${cleanGistId}`;\n        method = 'PATCH';\n      }"
);

c = c.replace(
  "'Authorization': `token ${githubToken}`",
  "'Authorization': `token ${cleanToken}`"
);

c = c.replace(
  "if (!gistId) setGistId(json.id);",
  "if (!cleanGistId) setGistId(json.id);"
);

// syncFromGitHub changes
c = c.replace(
  "const syncFromGitHub = async () => {",
  "const syncFromGitHub = async () => {\n    const cleanToken = githubToken.trim();\n    const cleanGistId = gistId.trim();"
);

c = c.replace(
  "if (!githubToken || !gistId) return alert('請輸入 GitHub Token 與 Gist ID');",
  "if (!cleanToken || !cleanGistId) return alert('請輸入 GitHub Token 與 Gist ID');"
);

c = c.replace(
  "const res = await fetch(`https://api.github.com/gists/${gistId}`",
  "const res = await fetch(`https://api.github.com/gists/${cleanGistId}`"
);

c = c.replace(
  "'Authorization': `token ${githubToken}`",
  "'Authorization': `token ${cleanToken}`"
);

const oldRestored = `let restored = false;
      if (data.vocabDB && Array.isArray(data.vocabDB)) { setVocabDB(data.vocabDB); restored = true; }
      if (data.verbDB && Array.isArray(data.verbDB)) { setVerbDB(data.verbDB); restored = true; }
      if (data.customGrammars && Array.isArray(data.customGrammars)) { setCustomGrammars(data.customGrammars); restored = true; }
      if (data.grammarProgress && typeof data.grammarProgress === 'object') { setGrammarProgress(data.grammarProgress); restored = true; }`;

const newRestored = `let restored = false;
      if (data.vocabDB && Array.isArray(data.vocabDB)) { setVocabDB(data.vocabDB); restored = true; }
      if (data.verbDB && Array.isArray(data.verbDB)) { setVerbDB(data.verbDB); restored = true; }
      if (data.verbForms && Array.isArray(data.verbForms)) { setVerbForms(data.verbForms); restored = true; }
      if (data.verbTableColumnOrder && Array.isArray(data.verbTableColumnOrder)) { setVerbTableColumnOrder(data.verbTableColumnOrder); restored = true; }
      if (data.customGrammars && Array.isArray(data.customGrammars)) { setCustomGrammars(data.customGrammars); restored = true; }
      if (data.grammarProgress && typeof data.grammarProgress === 'object') { setGrammarProgress(data.grammarProgress); restored = true; }`;

c = c.replace(oldRestored, newRestored);

const oldCatch = `} catch (err) {
      console.error(err);
      alert('載入失敗，請確認 Token 與 Gist ID 正確，且該檔案未被刪除。');
    }`;

const newCatch = `} catch (err) {
      console.error(err);
      alert(\`下載失敗！錯誤訊息：\${err.message}\\n\\n請檢查您的 Token 與 Gist ID 是否有不小心多複製了『空白鍵』，並確認該 Token 未過期。\`);
    }`;

c = c.replace(oldCatch, newCatch);

fs.writeFileSync('src/App.jsx', c);
console.log('done patch_trim');
