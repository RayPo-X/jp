import fs from 'fs';
import { autoConjugate } from './src/conjugator.js';

let content = fs.readFileSync('./src/App.jsx', 'utf8');

const regex = /\{ group: (\d|'i'|'na'), type: '(.+?)', masu: '(.+?)', jisho: '(.+?)', te: '(.+?)', ta: '(.+?)', nai: '(.+?)', nakatta: '(.+?)', meaning: '(.+?)', difficulty: '(.+?)' \}/g;

let newContent = content.replace(regex, (match, group, type, masu, jisho, te, ta, nai, nakatta, meaning, difficulty) => {
    if (type !== 'verb') return match;
    const adv = autoConjugate(jisho, group.toString());
    if (!adv || Object.keys(adv).length === 0) return match;
    
    return `{ group: ${group}, type: '${type}', masu: '${masu}', jisho: '${jisho}', te: '${te}', ta: '${ta}', nai: '${nai}', nakatta: '${nakatta}', ba: '${adv.ba}', volitional: '${adv.volitional}', potential: '${adv.potential}', passive: '${adv.passive}', causative: '${adv.causative}', causative_passive: '${adv.causative_passive}', meaning: '${meaning}', difficulty: '${difficulty}' }`;
});

fs.writeFileSync('./src/App.jsx', newContent, 'utf8');
console.log('done');
