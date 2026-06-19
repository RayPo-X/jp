const fs = require('fs');
const file = 'd:/jp/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

const constantsToAdd = 
export const ALL_VERB_FORMS = ['dictionary', 'masu', 'te', 'ta', 'nai', 'potential', 'passive', 'causative', 'volitional', 'imperative', 'causative_passive'];
export const ACTIVE_VERB_FORMS = ['dictionary', 'masu', 'te', 'ta', 'nai'];

export const createDefaultVerbStats = () => {
  const stats = {};
  ALL_VERB_FORMS.forEach(form => {
    stats[form] = { correct: 0, wrong: 0, recentHistory: [] };
  });
  return stats;
};

export const migrateVerb = (v) => ({
  ...v,
  status: v.status || 'not_started',
  stats: v.stats || createDefaultVerbStats()
});
;

if (!content.includes('ALL_VERB_FORMS')) {
  // Insert after THEMES or somewhere appropriate. Let's insert after DEFAULT_FORM_OPTIONS.
  content = content.replace(/const DEFAULT_FORM_OPTIONS = \[([\s\S]*?)\];/, (match) => match + '\\n' + constantsToAdd);
}

// Update useState for verbDB
const oldUseState = if (Array.isArray(parsed)) return parsed.map(v => ({ ...v, learnStatus: v.learnStatus || 'new', correctDates: v.correctDates || [] }));;
const newUseState = if (Array.isArray(parsed)) return parsed.map(v => migrateVerb({ ...v, learnStatus: v.learnStatus || 'new', correctDates: v.correctDates || [] }));;
content = content.replace(oldUseState, newUseState);

const oldUseStateReturn = eturn INITIAL_VERB_DB.map(v => ({...v, learnStatus: 'new', correctDates: []}));;
const newUseStateReturn = eturn INITIAL_VERB_DB.map(v => migrateVerb({...v, learnStatus: 'new', correctDates: []}));;
content = content.replace(oldUseStateReturn, newUseStateReturn);

fs.writeFileSync(file, content, 'utf8');
console.log('App.jsx constants and migration added.');
