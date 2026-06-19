const fs = require('fs');
const file = 'd:/jp/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldMigrate = const migrateVerb = (v) => ({
  ...v,
  status: v.status || 'not_started',
  stats: v.stats || createDefaultVerbStats()
});;

const newMigrate = const migrateVerb = (v) => ({
  ...v,
  status: v.status || 'not_started',
  recentHistory: v.recentHistory || [],
  stats: v.stats || createDefaultVerbStats()
});;

content = content.replace(oldMigrate, newMigrate);
fs.writeFileSync(file, content, 'utf8');
console.log('migrateVerb updated with recentHistory.');
