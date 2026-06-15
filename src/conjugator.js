export const autoConjugate = (jisho, group) => {
  // 檢查是否包含漢字標音格式如 買[か]う
  // 我們將分為：prefix (不變的部分), stemKanji (可能變化的詞幹漢字), stemKana (可能變化的詞幹假名), ending (字尾)
  // 但由於變化主要在「字尾」，我們可以把前面的部分全部當作 stem 處理。
  // 例如：買[か]う -> stem: "買[か]", ending: "う"
  // 飲[の]む -> stem: "飲[の]", ending: "む"
  
  if (!jisho) return {};
  
  let stem = '';
  let ending = '';
  
  // 取出最後一個字元當作 ending，其餘為 stem
  ending = jisho.slice(-1);
  stem = jisho.slice(0, -1);
  
  const forms = {};
  
  if (group === '3') {
    // 判斷是 する 還是 くる
    if (jisho.endsWith('する')) {
      const base = jisho.slice(0, -2); // 例如 勉強[べんきょう]
      forms.masu = base + 'します';
      forms.te = base + 'して';
      forms.ta = base + 'した';
      forms.nai = base + 'しない';
      forms.nakatta = base + 'しなかった';
      forms.ba = base + 'すれば';
      forms.volitional = base + 'しよう';
      forms.potential = base + 'できる';
      forms.passive = base + 'される';
      forms.causative = base + 'させる';
      forms.causative_passive = base + 'させられる';
    } else if (jisho.endsWith('る') && (jisho.includes('来') || jisho.includes('來') || jisho === 'くる')) {
      // 處理 くる 的特例，可能帶有標音，如 来[く]る
      // 取代 [く] 為不同的讀音
      // 如果沒有標音，直接給平假名
      const hasRuby = jisho.includes('[');
      if (hasRuby) {
        forms.masu = jisho.replace(/\[く\]/, '[き]').replace(/る$/, 'ます');
        forms.te = jisho.replace(/\[く\]/, '[き]').replace(/る$/, 'て');
        forms.ta = jisho.replace(/\[く\]/, '[き]').replace(/る$/, 'た');
        forms.nai = jisho.replace(/\[く\]/, '[こ]').replace(/る$/, 'ない');
        forms.nakatta = jisho.replace(/\[く\]/, '[こ]').replace(/る$/, 'なかった');
        forms.ba = jisho.replace(/る$/, 'れば'); // 来[く]れば，音不變
        forms.volitional = jisho.replace(/\[く\]/, '[こ]').replace(/る$/, 'よう');
        forms.potential = jisho.replace(/\[く\]/, '[こ]').replace(/る$/, 'られる');
        forms.passive = jisho.replace(/\[く\]/, '[こ]').replace(/る$/, 'られる');
        forms.causative = jisho.replace(/\[く\]/, '[こ]').replace(/る$/, 'させる');
        forms.causative_passive = jisho.replace(/\[く\]/, '[こ]').replace(/る$/, 'させられる');
      } else {
        forms.masu = 'きます';
        forms.te = 'きて';
        forms.ta = 'きた';
        forms.nai = 'こない';
        forms.nakatta = 'こなかった';
        forms.ba = 'くれば';
        forms.volitional = 'こよう';
        forms.potential = 'こられる';
        forms.passive = 'こられる';
        forms.causative = 'こさせる';
        forms.causative_passive = 'こさせられる';
      }
    }
  } else if (group === '2') {
    // 上一段 / 下一段，直接去 る
    if (ending === 'る') {
      forms.masu = stem + 'ます';
      forms.te = stem + 'て';
      forms.ta = stem + 'た';
      forms.nai = stem + 'ない';
      forms.nakatta = stem + 'なかった';
      forms.ba = stem + 'れば';
      forms.volitional = stem + 'よう';
      forms.potential = stem + 'られる';
      forms.passive = stem + 'られる';
      forms.causative = stem + 'させる';
      forms.causative_passive = stem + 'させられる';
    }
  } else if (group === '1') {
    // 五段動詞
    const vowelMap = {
      'う': { a: 'わ', i: 'い', u: 'う', e: 'え', o: 'お', te: 'って', ta: 'った' },
      'く': { a: 'か', i: 'き', u: 'く', e: 'け', o: 'こ', te: 'いて', ta: 'いた' },
      'ぐ': { a: 'が', i: 'ぎ', u: 'ぐ', e: 'げ', o: 'ご', te: 'いで', ta: 'いだ' },
      'す': { a: 'さ', i: 'し', u: 'す', e: 'せ', o: 'そ', te: 'して', ta: 'した' },
      'つ': { a: 'た', i: 'ち', u: 'つ', e: 'て', o: 'と', te: 'って', ta: 'った' },
      'ぬ': { a: 'な', i: 'に', u: 'ぬ', e: 'ね', o: 'の', te: 'んで', ta: 'んだ' },
      'ぶ': { a: 'ば', i: 'び', u: 'ぶ', e: 'べ', o: 'ぼ', te: 'んで', ta: 'んだ' },
      'む': { a: 'ま', i: 'み', u: 'む', e: 'め', o: 'も', te: 'んで', ta: 'んだ' },
      'る': { a: 'ら', i: 'り', u: 'る', e: 'れ', o: 'ろ', te: 'って', ta: 'った' }
    };

    const map = vowelMap[ending];
    if (map) {
      forms.masu = stem + map.i + 'ます';
      
      // ない形有例外：ある -> ない
      if (jisho === 'ある' || jisho === '有[あ]る') {
        forms.nai = 'ない';
        forms.nakatta = 'なかった';
      } else {
        forms.nai = stem + map.a + 'ない';
        forms.nakatta = stem + map.a + 'なかった';
      }

      forms.ba = stem + map.e + 'ば';
      forms.volitional = stem + map.o + 'う';
      forms.potential = stem + map.e + 'る';
      forms.passive = stem + map.a + 'れる';
      forms.causative = stem + map.a + 'せる';
      
      // 使役受身：す結尾為 ささせられる，其餘為 a+される
      if (ending === 'す') {
        forms.causative_passive = stem + 'させられる';
      } else {
        forms.causative_passive = stem + map.a + 'される';
      }

      // te / ta 有例外：行く
      if ((jisho === '行く' || jisho === '行[い]く') && ending === 'く') {
        forms.te = stem + 'って';
        forms.ta = stem + 'った';
      } else {
        forms.te = stem + map.te;
        forms.ta = stem + map.ta;
      }
    }
  }

  return forms;
};
