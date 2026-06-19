const fs = require('fs');
let c = fs.readFileSync('src/conjugator.js', 'utf8');

const newFunc = `
export const deriveJishoFromMasu = (masu, group) => {
  if (!masu || !masu.endsWith('ます')) return '';
  const stem = masu.slice(0, -2); // remove 'ます'

  if (group === '3') {
    if (stem.endsWith('し')) {
      return stem.slice(0, -1) + 'する'; // e.g. 勉強し -> 勉強する
    } else if (stem === 'き' || stem === '来[き]' || stem.endsWith('[き]')) {
      // Handle きます -> くる, 来[き]ます -> 来[く]る
      return stem.replace(/き$/, 'く').replace(/\\[き\\]$/, '[く]') + 'る';
    }
  } else if (group === '2') {
    return stem + 'る'; // 食べ -> 食べる
  } else if (group === '1') {
    const lastChar = stem.slice(-1);
    const iToUMap = {
      'い': 'う', 'き': 'く', 'ぎ': 'ぐ', 'し': 'す',
      'ち': 'つ', 'に': 'ぬ', 'び': 'ぶ', 'み': 'む', 'り': 'る'
    };
    if (iToUMap[lastChar]) {
      return stem.slice(0, -1) + iToUMap[lastChar];
    }
  }
  return '';
};
`;

if (!c.includes('deriveJishoFromMasu')) {
  fs.writeFileSync('src/conjugator.js', c + newFunc);
}
console.log('done patch_conjugator_derive');
