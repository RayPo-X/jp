import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings, Play, CheckCircle2, XCircle, ArrowRight, BookOpen, 
  Timer, RotateCcw, AlertCircle, Trophy, Keyboard, ListTodo, 
  Pause, SlidersHorizontal, Layers, FolderHeart, ShieldAlert, Trash2, Award, Medal,
  Heart, Swords, Skull, Flame, Home, Puzzle, Plus, Edit3, 
  Map as MapIcon, Library, BookType, Sparkles, Coffee, Car, Shirt, SmilePlus,
  MessageSquareQuote, PenTool, RefreshCcw
} from 'lucide-react';

const INITIAL_VERB_DB = [
  { group: 1, type: 'verb', masu: '行[い]きます', jisho: '行[い]く', te: '行[い]って', ta: '行[い]った', nai: '行[い]かない', nakatta: '行[い]かなかった', meaning: '去', difficulty: 'n5' },
  { group: 1, type: 'verb', masu: '買[か]います', jisho: '買[か]う', te: '買[か]って', ta: '買[か]った', nai: '買[か]わない', nakatta: '買[か]わなかった', meaning: '買', difficulty: 'n5' },
  { group: 1, type: 'verb', masu: '待[ま]ちます', jisho: '待[ま]つ', te: '待[ま]って', ta: '待[ま]った', nai: '待[ま]たない', nakatta: '待[ま]たなかった', meaning: '等待', difficulty: 'n5' },
  { group: 1, type: 'verb', masu: '帰[かえ]ります', jisho: '帰[かえ]る', te: '帰[かえ]って', ta: '帰[かえ]った', nai: '帰[かえ]らない', nakatta: '帰[かえ]らなかった', meaning: '回家', difficulty: 'n5' },
  { group: 1, type: 'verb', masu: '飲[の]みます', jisho: '飲[の]む', te: '飲[の]んで', ta: '飲[の]んだ', nai: '飲[の]まない', nakatta: '飲[の]まなかった', meaning: '喝', difficulty: 'n5' },
  { group: 1, type: 'verb', masu: '遊[あそ]びます', jisho: '遊[あそ]ぶ', te: '遊[あそ]んで', ta: '遊[あそ]んだ', nai: '遊[あそ]ばない', nakatta: '遊[あそ]ばなかった', meaning: '玩', difficulty: 'n5' },
  { group: 1, type: 'verb', masu: '泳[およ]ぎます', jisho: '泳[およ]ぐ', te: '泳[およ]いで', ta: '泳[およ]いだ', nai: '泳[およ]がない', nakatta: '泳[およ]がなかった', meaning: '游泳', difficulty: 'n5' },
  { group: 1, type: 'verb', masu: '話[はな]します', jisho: '話[はな]す', te: '話[はな]して', ta: '話[はな]した', nai: '話[はな]さない', nakatta: '話[はな]さなかった', meaning: '說', difficulty: 'n5' },
  { group: 1, type: 'verb', masu: '書[か]きます', jisho: '書[か]く', te: '書[か]いて', ta: '書[か]いた', nai: '書[か]かない', nakatta: '書[か]かなかった', meaning: '寫', difficulty: 'n5' },
  { group: 1, type: 'verb', masu: '聞[き]きます', jisho: '聞[き]く', te: '聞[き]いて', ta: '聞[き]いた', nai: '聞[き]かない', nakatta: '聞[き]かなかった', meaning: '聽/問', difficulty: 'n5' },
  { group: 1, type: 'verb', masu: '会[あ]います', jisho: '会[あ]う', te: '会[あ]って', ta: '会[あ]った', nai: '会[あ]わない', nakatta: '会[あ]わなかった', meaning: '見面', difficulty: 'n5' },
  { group: 1, type: 'verb', masu: '貸[か]します', jisho: '貸[か]す', te: '貸[か]して', ta: '貸[か]した', nai: '貸[か]さない', nakatta: '貸[か]さなかった', meaning: '借出', difficulty: 'n4' },
  { group: 1, type: 'verb', masu: '急[いそ]ぎます', jisho: '急[いそ]ぐ', te: '急[いそ]いで', ta: '急[いそ]いだ', nai: '急[いそ]がない', nakatta: '急[いそ]がなかった', meaning: '急忙', difficulty: 'n4' },
  
  { group: 2, type: 'verb', masu: '食[た]べます', jisho: '食[た]べる', te: '食[た]べて', ta: '食[た]べた', nai: '食[た]べない', nakatta: '食[た]べなかった', meaning: '吃', difficulty: 'n5' },
  { group: 2, type: 'verb', masu: '見[み]ます', jisho: '見[み]る', te: '見[み]て', ta: '見[み]た', nai: '見[み]ない', nakatta: '見[み]なかった', meaning: '看', difficulty: 'n5' },
  { group: 2, type: 'verb', masu: '起[お]きます', jisho: '起[お]きる', te: '起[お]きて', ta: '起[お]きた', nai: '起[お]きない', nakatta: '起[お]きなかった', meaning: '起床', difficulty: 'n5' },
  { group: 2, type: 'verb', masu: '寝[ね]ます', jisho: '寝[ね]る', te: '寝[ね]て', ta: '寝[ね]た', nai: '寝[ね]ない', nakatta: '寝[ね]なかった', meaning: '睡覺', difficulty: 'n5' },
  { group: 2, type: 'verb', masu: '忘[わす]れます', jisho: '忘[わす]れる', te: '忘[わす]れて', ta: '忘[わす]れた', nai: '忘[わす]れない', nakatta: '忘[わす]れなかった', meaning: '忘記', difficulty: 'n5' },
  { group: 2, type: 'verb', masu: '開[あ]けます', jisho: '開[あ]ける', te: '開[あ]けて', ta: '開[あ]けた', nai: '開[あ]けない', nakatta: '開[あ]けなかった', meaning: '打開', difficulty: 'n5' },
  { group: 2, type: 'verb', masu: '閉[し]めます', jisho: '閉[し]める', te: '閉[し]めて', ta: '閉[し]めた', nai: '閉[し]めない', nakatta: '閉[し]めなかった', meaning: '關閉', difficulty: 'n5' },
  
  { group: 3, type: 'verb', masu: 'します', jisho: 'する', te: 'して', ta: 'した', nai: 'しない', nakatta: 'しなかった', meaning: '做', difficulty: 'n5' },
  { group: 3, type: 'verb', masu: '来[き]ます', jisho: '来[く]る', te: '来[き]て', ta: '来[き]た', nai: '来[こ]ない', nakatta: '来[こ]なかった', meaning: '來', difficulty: 'n5' },
  { group: 3, type: 'verb', masu: '勉強[べんきょう]します', jisho: '勉強[べんきょう]する', te: '勉強[べんきょう]して', ta: '勉強[べんきょう]した', nai: '勉強[べんきょう]しない', nakatta: '勉強[べんきょう]しなかった', meaning: '讀書', difficulty: 'n5' },
  { group: 3, type: 'verb', masu: '運転[うんてん]します', jisho: '運転[うんてん]する', te: '運転[うんてん]して', ta: '運転[うんてん]した', nai: '運転[うんてん]しない', nakatta: '運転[うんてん]しなかった', meaning: '駕駛', difficulty: 'n4' },

  { group: 'i', type: 'adj_i', masu: '大[おお]きいです', jisho: '大[おお]きい', te: '大[おお]きくて', ta: '大[おお]きかった', nai: '大[おお]きくない', nakatta: '大[おお]きくなかった', meaning: '大的', difficulty: 'n5' },
  { group: 'i', type: 'adj_i', masu: '高[たか]いです', jisho: '高[たか]い', te: '高[たか]くて', ta: '高[たか]かった', nai: '高[たか]くない', nakatta: '高[たか]くなかった', meaning: '高的/貴的', difficulty: 'n5' },
  { group: 'i', type: 'adj_i', masu: 'いいです', jisho: 'いい', te: 'よくて', ta: 'よかった', nai: 'よくない', nakatta: 'よくなかった', meaning: '好的', difficulty: 'n5' },

  { group: 'na', type: 'adj_na', masu: '元気[げんき]です', jisho: '元気[げんき]だ', te: '元気[げんき]で', ta: '元気[げんき]だった', nai: '元気[げんき]じゃない', nakatta: '元気[げんき]じゃなかった', meaning: '有精神的', difficulty: 'n5' },
  { group: 'na', type: 'adj_na', masu: '静[しず]かです', jisho: '静[しず]かだ', te: '静[しず]かで', ta: '静[しず]かだった', nai: '静[しず]かじゃない', nakatta: '静[しず]かじゃなかった', meaning: '安靜的', difficulty: 'n5' }
];

INITIAL_VERB_DB.forEach((item, index) => { item.id = `${item.type}_${index}`; });

const INITIAL_VOCAB_DB = [
  { id: 'v_f1', word: '食[た]べる', reading: 'たべる', meaning: '吃', tag: '飲食與餐具', example: '朝[あさ]ごはんを食[た]べます。（吃早餐。）', ef: 2.5, interval: 0, repetitions: 0, nextReview: 0 },
  { id: 'v_f2', word: '飲[の]む', reading: 'のむ', meaning: '喝', tag: '飲食與餐具', example: '', ef: 2.5, interval: 0, repetitions: 0, nextReview: 0 },
  { id: 'v_f3', word: '水[みず]', reading: 'みず', meaning: '水', tag: '飲食與餐具', example: '水[みず]を飲[の]みます。（喝水。）', ef: 2.5, interval: 0, repetitions: 0, nextReview: 0 },
  { id: 'v_t1', word: '行[い]く', reading: 'いく', meaning: '去', tag: '交通與地點', example: '学校[がっこう]へ行[い]きます。（去學校。）', ef: 2.5, interval: 0, repetitions: 0, nextReview: 0 },
  { id: 'v_t2', word: '来[く]る', reading: 'くる', meaning: '來', tag: '交通與地點', example: '', ef: 2.5, interval: 0, repetitions: 0, nextReview: 0 },
  { id: 'v_b1', word: '頭[あたま]', reading: 'あたま', meaning: '頭', tag: '身體與健康', example: '頭[あたま]が痛[いた]いです。（頭痛。）', ef: 2.5, interval: 0, repetitions: 0, nextReview: 0 },
  { id: 'v_c1', word: '着[き]る', reading: 'きる', meaning: '穿(上衣)', tag: '服裝與配件', example: 'シャツを着[き]ます。（穿襯衫。）', ef: 2.5, interval: 0, repetitions: 0, nextReview: 0 }
];

const THEMES = [
  { id: '飲食與餐具', icon: <Coffee className="w-8 h-8"/>, name: '飲食與餐具', description: '挑戰餐廳與食物相關單字' },
  { id: '交通與地點', icon: <Car className="w-8 h-8"/>, name: '交通與地點', description: '出門在外的必備方向感' },
  { id: '服裝與配件', icon: <Shirt className="w-8 h-8"/>, name: '服裝與配件', description: '穿搭與購物實用單字' },
  { id: '身體與健康', icon: <SmilePlus className="w-8 h-8"/>, name: '身體與健康', description: '身體部位與健康狀況' }
];

const FORM_OPTIONS = [
  { id: 'jisho', label: '普通形(辭書形/常體)' },
  { id: 'te', label: 'て形' },
  { id: 'ta', label: 'た形' },
  { id: 'nai', label: 'ない形' },
  { id: 'nakatta', label: 'なかった形' }
];

const DEFAULT_GRAMMARS = [
  { id: 'g_tai', name: '想要 (〜たい)', baseForm: 'masu', removeStr: 'ます', appendStr: 'たい', appliesTo: ['verb'] },
  { id: 'g_nakereba', name: '必須 (〜なければなりません)', baseForm: 'nai', removeStr: 'い', appendStr: 'ければなりません', appliesTo: ['verb'] }
];

const getTagStyle = (tag) => {
    if (!tag) return 'bg-slate-50 text-slate-600 border-slate-200';
    if (tag === '自訂') return 'bg-slate-100 text-slate-700 border-slate-300';
    if (tag.includes('飲食')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (tag.includes('交通')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (tag.includes('服裝')) return 'bg-pink-50 text-pink-700 border-pink-200';
    if (tag.includes('身體')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (tag.includes('想法')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (tag.includes('購物') || tag.includes('金錢')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (tag.includes('居住') || tag.includes('生活')) return 'bg-teal-50 text-teal-700 border-teal-200';
    if (tag.includes('工作') || tag.includes('職場')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    if (tag.includes('娛樂') || tag.includes('休閒')) return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200';
    if (tag.includes('學習') || tag.includes('教育')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (tag.includes('自然') || tag.includes('天氣')) return 'bg-lime-50 text-lime-700 border-lime-200';
    if (tag.includes('時間') || tag.includes('日期')) return 'bg-sky-50 text-sky-700 border-sky-200';
    if (tag.includes('問候') || tag.includes('社交')) return 'bg-violet-50 text-violet-700 border-violet-200';
    
    const colors = [
        'bg-indigo-50 text-indigo-700 border-indigo-200', 
        'bg-rose-50 text-rose-700 border-rose-200',
        'bg-teal-50 text-teal-700 border-teal-200', 
        'bg-orange-50 text-orange-700 border-orange-200',
        'bg-cyan-50 text-cyan-700 border-cyan-200',
        'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
        'bg-lime-50 text-lime-700 border-lime-200',
        'bg-sky-50 text-sky-700 border-sky-200',
        'bg-violet-50 text-violet-700 border-violet-200',
        'bg-emerald-50 text-emerald-700 border-emerald-200',
        'bg-pink-50 text-pink-700 border-pink-200',
        'bg-amber-50 text-amber-700 border-amber-200'
    ];
    let hash = 5381;
    for (let i = 0; i < tag.length; i++) { hash = ((hash << 5) + hash) + tag.charCodeAt(i); }
    return colors[Math.abs(hash) % colors.length];
};

const THEME_KEYWORDS = {
    '飲食與餐具': /吃|喝|水|菜|肉|飯|茶|咖啡|餐|甜|食|料理|味|酒|果|糖|鹽|醬|碗|杯|筷|盤|湯|麵|米|蛋|魚|牛|豬|雞|奶|油|煮|炒|烤|切|洗菜|廚|點心|便當|早|午|晚|零食|飲料|渴|餓|飽|辣|酸|苦|甘/,
    '交通與地點': /車|站|路|機|交|飛|船|騎|搭|走|跑|到|去|來|回|過|進|出|近|遠|前|後|左|右|上|下|東|西|南|北|地|場|口|橋|港|市|町|村|區|街|國|外|公園|學校|醫院|銀行|郵局|超市|百貨|機場|電車|巴士|計程車|腳踏車|開車|駕駛|道|號/,
    '服裝與配件': /衣|褲|鞋|帽|穿|脫|襪|裙|外套|西裝|領帶|手套|圍巾|背包|包|袋|眼鏡|手錶|戒指|項鍊|耳環|扣|拉鍊|布|絲|棉|毛|換|試|件|雙|條|洋裝|T恤|牛仔|短|長|大衣|羽絨|運動服|制服|和服/,
    '身體與健康': /病|痛|手|腳|頭|身|心|累|醫|目|耳|鼻|口|齒|牙|舌|眼|臉|肩|背|腰|胸|腹|膝|指|髮|皮|骨|血|藥|院|診|治|休|睡|死|生|活|熱|冷|咳|發燒|感冒|過敏|受傷|健康|體|力|氣|元氣|疲/,
    '想法與意見': /想|認|覺|意|思|空想|考|決|選|信|疑|望|願|夢|希|怕|擔|煩|喜|怒|哀|悲|愛|恨|感|情|氣|懂|知|明|白|記|忘|猜|判|評|論|答|問|解|惜|悔|驚|嚇|興|趣|好奇|滿|足/,
    '購物與金錢': /買|賣|錢|店|購|百|元|付|找|換|借|還|貴|便宜|免費|折|價|值|算|數|多|少|零|萬|千|收|存|花|稅|帳|卡|現金|信用|打折|特價|商|品|貨|訂|網購|市場|超商/,
    '居住與生活': /家|住|宿|房|洗|掃|門|窗|牆|屋|樓|廳|室|廚|浴|廁|床|桌|椅|燈|電|冷氣|暖|冰箱|微波|洗衣|垃圾|鑰匙|鄰|租|搬|修|裝|掛|放|收|整理|打掃|煮飯|日常|起床|刷牙|化妝/,
    '學習與教育': /學|讀|書|寫|教|課|字|文|語|算|數|考|試|題|答|分|成績|合格|畢業|入|班|級|校|師|生|先|筆|紙|本|黑板|作業|練|複|預|背|查|典|翻|譯|文法|單字|漢字|假名|片假名|平假名/,
    '工作與職場': /工|班|職|業|勤|休|假|會|議|辦|公|社|長|部|課|組|報|告|計|畫|案|客|戶|電話|郵|信|寄|收|打|印|複|掃|傳|真|上班|下班|加班|出差|薪|資|履歷|面試|同事|老闆|主管|員/,
    '娛樂與休閒': /玩|遊|樂|歌|休|唱|跑|游|泳|爬|山|海|旅|行|拍|照|影|畫|看|聽|電影|電視|音|漫|動|網|遊戲|運動|球|棒|籃|足|網球|釣|散步|野餐|露營|節|祭|派對|舞|跳|演|練/,
    '自然與天氣': /天|雨|雪|風|雲|晴|陰|霧|雷|暴|溫|熱|冷|涼|暖|春|夏|秋|冬|花|草|木|林|森|山|川|河|海|湖|島|石|土|星|月|日|空|地|水|火|光|暗|色|紅|藍|綠|黃|白|黑|動物|貓|狗|鳥|蟲/,
    '時間與日期': /時|分|秒|點|年|月|日|週|曜|今|昨|明|後|前|早|晚|午|夜|朝|夕|間|期|始|終|久|短|長|快|慢|新|舊|古|先|次|每|常|常常|偶|總|已|還|才|剛|馬上|立刻|將|要|過去|未來|現在/,
    '問候與社交': /你|我|他|她|們|人|名|姓|歲|男|女|子|父|母|兄|弟|姐|妹|友|家人|親|戚|夫|妻|孩|老|少|先生|小姐|同|伴|見面|打招呼|介紹|謝|歉|拜託|請|好|再見|歡迎|祝|福|禮|邀|約|聚/
};

const guessThemeByMeaning = (meaning, existingVocabDB = null) => {
    if (!meaning) return '自訂';
    
    // Step 1: Check if there's already a word with the same meaning in vocabDB
    if (existingVocabDB && existingVocabDB.length > 0) {
        const existingMatch = existingVocabDB.find(
            v => v.meaning === meaning && v.tag && v.tag !== '自訂' && v.tag !== '未分類'
        );
        if (existingMatch) return existingMatch.tag;
    }
    
    // Step 2: Keyword matching with expanded dictionaries (scoring based)
    let bestTheme = '自訂';
    let maxScore = 0;
    for (const [theme, regex] of Object.entries(THEME_KEYWORDS)) {
        const globalRegex = new RegExp(regex.source, 'g');
        const matches = meaning.match(globalRegex);
        if (matches && matches.length > maxScore) {
            maxScore = matches.length;
            bestTheme = theme;
        }
    }
    
    return bestTheme;
};

const stripRuby = (text) => {
  if (typeof text !== 'string') return '';
  return text.replace(/\[[^\]]+\]/g, '');
};

const parseExample = (exampleText) => {
    if (!exampleText) return { plainSentence: '', translation: '', rawRuby: '', readingOnly: '' };
    const match = exampleText.match(/^(.*?)[\(（](.*?)[\)）]$/);
    let sentenceRaw = exampleText;
    let translation = '';
    if (match) {
        sentenceRaw = match[1].trim();
        translation = match[2].trim();
    }
    let plainSentence = stripRuby(sentenceRaw);
    let readingOnly = sentenceRaw.replace(/[\u4e00-\u9faf]+\[([^\]]+)\]/g, '$1');
    return { plainSentence, translation, rawRuby: sentenceRaw, readingOnly };
};

const renderRuby = (text) => {
  if (typeof text !== 'string') return null;
  const parts = text.split(/([\u4e00-\u9faf]+\[[^\]]+\])/);
  return (
    <span className="inline-flex items-baseline">
      {parts.map((part, i) => {
        const match = part.match(/([\u4e00-\u9faf]+)\[([^\]]+)\]/);
        if (match) {
          return (
            <ruby key={i} className="mx-[1px]">
              {match[1]}
              <rt className="text-[0.6em] text-slate-500">{match[2]}</rt>
            </ruby>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

const getExplanation = (word, target) => {
  if (!word) return '';
  const jishoPlain = stripRuby(word.jisho);
  const endChar = jishoPlain.slice(-1);
  let rule = '';

  if (word.type === 'verb') {
    if (word.group === 1) {
      if (target === 'te' || target === 'ta') {
        const suffix = target === 'te' ? 'て' : 'た';
        const suffixDe = target === 'te' ? 'で' : 'だ';
        if (jishoPlain === '行く') return `「行く」是第一類動詞的例外，變化為促音便「行っ${suffix}」。`;
        if (['う', 'つ', 'る'].includes(endChar)) rule = `結尾是「${endChar}」，發生【促音便】，改為「っ${suffix}」`;
        else if (['む', 'ぶ', 'ぬ'].includes(endChar)) rule = `結尾是「${endChar}」，發生【撥音便】，改為「ん${suffixDe}」`;
        else if (endChar === 'く') rule = `結尾是「く」，發生【イ音便】，改為「い${suffix}」`;
        else if (endChar === 'ぐ') rule = `結尾是「ぐ」，發生【イ音便】，改為「い${suffixDe}」`;
        else if (endChar === 'す') rule = `結尾是「す」，改為「し${suffix}」`;
      } else if (target === 'nai' || target === 'nakatta') {
        const suffix = target === 'nai' ? 'ない' : 'なかった';
        if (endChar === 'う') rule = `結尾是「う」，改為「わ」加上${suffix}`;
        else rule = `將結尾「${endChar}」改成對應的「あ」段音，再加上${suffix}`;
      } else if (target === 'jisho') {
        rule = `從ます形推導：去掉ます，將「い」段音改為對應的「う」段音`;
      }
    } else if (word.group === 2) {
      if (target === 'jisho') rule = `去掉「ます」，直接加上「る」`;
      else rule = `第二類動詞最單純，直接去掉結尾的「る」(或ます)，加上「${target === 'te'?'て':target==='ta'?'た':target==='nai'?'ない':'なかった'}」即可`;
    } else if (word.group === 3) {
      rule = `第三類動詞為不規則變化，需要直接記憶喔！`;
    }
  } else if (word.type === 'adj_i') {
    if (jishoPlain === 'いい') rule = `「いい」是特殊い形容詞，變化時要用「よい」的字根去變。`;
    else rule = `い形容詞：去掉字尾的「い」，加上對應字尾`;
  } else if (word.type === 'adj_na') {
    rule = `な形容詞：變化時要在字根加上對應的字尾 (例如だ、で、だった)`;
  }
  return rule;
};

const generateDistractors = (word, target, grammarDef) => {
  const optionsMap = new Map(); 
  let correctRuby = '';
  if (grammarDef) {
    const baseRubyStr = word[grammarDef.baseForm] || '';
    const replaceRegex = new RegExp((grammarDef.removeStr || '') + '$');
    correctRuby = baseRubyStr.replace(replaceRegex, '') + grammarDef.appendStr;
  } else {
    correctRuby = word[target];
  }
  optionsMap.set(stripRuby(correctRuby), correctRuby);

  const jishoRuby = word.jisho;
  const stemRuby = jishoRuby.slice(0, -1);

  if (!grammarDef) {
      const dummySuffixes = ['て', 'た', 'ない', 'なかった', 'る', 'ます', 'んだ', 'いて', 'いた', 'くて', 'かった', 'だ', 'じゃない', 'じゃなかった', 'って', 'った', 'いで', 'わ', 'あ', 'ら', 'く'];
      let fallbackStem = stemRuby;
      if (word.type === 'adj_na') fallbackStem = jishoRuby.slice(0, -1); 
      
      const shuffledSuffixes = [...dummySuffixes].sort(() => Math.random() - 0.5);
      for (const suf of shuffledSuffixes) {
          if (optionsMap.size >= 4) break;
          const dummyWordRuby = fallbackStem + suf;
          const dummyWordPlain = stripRuby(dummyWordRuby);
          if (!optionsMap.has(dummyWordPlain) && dummyWordPlain !== stripRuby(correctRuby)) {
              optionsMap.set(dummyWordPlain, dummyWordRuby);
          }
      }
  }
  return Array.from(optionsMap.entries()).map(([plain, ruby]) => ({ plain, ruby })).sort(() => Math.random() - 0.5).slice(0, 4);
};

const generateVocabDistractors = (correctVocab, allVocabs) => {
    const optionsMap = new Map();
    optionsMap.set(correctVocab.reading, correctVocab.reading);
    
    let pool = allVocabs.filter(v => v.tag === correctVocab.tag && v.id !== correctVocab.id);
    if (pool.length < 3) pool = allVocabs.filter(v => v.id !== correctVocab.id);
    
    const shuffled = pool.sort(() => Math.random() - 0.5);
    for (const v of shuffled) {
        if (optionsMap.size >= 4) break;
        optionsMap.set(v.reading, v.reading);
    }
    return Array.from(optionsMap.values()).sort(() => Math.random() - 0.5);
};

const generateSentenceDistractors = (correctVocab, allVocabs) => {
    const optionsMap = new Map();
    const correctTrans = parseExample(correctVocab.example).translation || correctVocab.meaning;
    optionsMap.set(correctTrans, correctTrans);
    
    let pool = allVocabs.filter(v => v.example && v.id !== correctVocab.id);
    if (pool.length < 3) pool = allVocabs.filter(v => v.id !== correctVocab.id);
    
    const shuffled = pool.sort(() => Math.random() - 0.5);
    for (const v of shuffled) {
        if (optionsMap.size >= 4) break;
        const trans = parseExample(v.example).translation || v.meaning;
        if(trans && !optionsMap.has(trans)) optionsMap.set(trans, trans);
    }
    
    if (optionsMap.size < 4) {
        const extraPool = allVocabs.sort(() => Math.random() - 0.5);
        for(const v of extraPool) {
            if (optionsMap.size >= 4) break;
            if(v.meaning && !optionsMap.has(v.meaning)) optionsMap.set(v.meaning, v.meaning);
        }
    }
    return Array.from(optionsMap.values()).sort(() => Math.random() - 0.5);
};

export default function App() {
  const [appState, setAppState] = useState('home'); 

  // ==== 單字系統 State ====
  const [vocabDB, setVocabDB] = useState(() => {
    try {
      const saved = localStorage.getItem('verbApp_vocabDB');
      return saved ? JSON.parse(saved) : INITIAL_VOCAB_DB;
    } catch { return INITIAL_VOCAB_DB; }
  });
  const [vocabMistakes, setVocabMistakes] = useState({});
  const [vocabTestMode, setVocabTestMode] = useState('srs'); 
  const [currentThemeLabel, setCurrentThemeLabel] = useState('');
  const [activeVocabQueue, setActiveVocabQueue] = useState([]);
  const [currentVocab, setCurrentVocab] = useState(null);
  
  useEffect(() => { localStorage.setItem('verbApp_vocabDB', JSON.stringify(vocabDB)); }, [vocabDB]);
  const todayQueue = vocabDB.filter(v => v.nextReview <= Date.now());

  // ==== 動詞系統 State ====
  const [verbDB, setVerbDB] = useState(() => {
    try {
      const saved = localStorage.getItem('verbApp_verbDB');
      return saved ? JSON.parse(saved) : INITIAL_VERB_DB;
    } catch { return INITIAL_VERB_DB; }
  });
  useEffect(() => { localStorage.setItem('verbApp_verbDB', JSON.stringify(verbDB)); }, [verbDB]);

  const [sourceForm, setSourceForm] = useState('masu'); 
  const [targetForms, setTargetForms] = useState(['te', 'ta', 'nai', 'jisho']); 
  const [activeWordTypes, setActiveWordTypes] = useState(['verb', 'adj_i', 'adj_na']);
  const [verbTestMode, setVerbTestMode] = useState('normal'); 
  const [mistakeBank, setMistakeBank] = useState({}); 
  const [customWordIds, setCustomWordIds] = useState([]);  
  
  const [customGrammars, setCustomGrammars] = useState(() => {
    try {
      const saved = localStorage.getItem('verbApp_customGrammars');
      return saved ? JSON.parse(saved) : DEFAULT_GRAMMARS;
    } catch { return DEFAULT_GRAMMARS; }
  });
  useEffect(() => { localStorage.setItem('verbApp_customGrammars', JSON.stringify(customGrammars)); }, [customGrammars]);

  // ==== 文法 SRS 記憶系統 State ====
  const [grammarProgress, setGrammarProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('verbApp_grammarProgress');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  useEffect(() => { localStorage.setItem('verbApp_grammarProgress', JSON.stringify(grammarProgress)); }, [grammarProgress]);

  // ==== GitHub Sync State ====
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('verbApp_githubToken') || '');
  const [gistId, setGistId] = useState(() => localStorage.getItem('verbApp_gistId') || '');
  const [isSyncing, setIsSyncing] = useState(false);
  
  useEffect(() => { localStorage.setItem('verbApp_githubToken', githubToken); }, [githubToken]);
  useEffect(() => { localStorage.setItem('verbApp_gistId', gistId); }, [gistId]);

  // 計算今日文法待複習佇列
  const todayGrammarQueue = React.useMemo(() => {
    const now = Date.now();
    const queue = [];
    // 遍歷所有可能的動詞+目標形組合
    const allTargets = ['te', 'ta', 'nai', 'nakatta', 'jisho'];
    verbDB.forEach(word => {
      allTargets.forEach(target => {
        if (target === sourceForm) return; // 跳過來源形
        const key = `${word.id}_${target}`;
        const progress = grammarProgress[key];
        if (!progress) {
          // 從未練習過的也加入（作為新手題）
          queue.push({ word, target, key, isNew: true });
        } else if (progress.nextReview <= now) {
          queue.push({ word, target, key, isNew: false, ...progress });
        }
      });
    });
    return queue;
  }, [grammarProgress, sourceForm]);

  // 文法熟練度徽章
  const getGrammarBadge = (key) => {
    const p = grammarProgress[key];
    if (!p || p.repetitions === 0) return { emoji: '🌱', label: '新手' };
    if (p.repetitions <= 3) return { emoji: '📖', label: '學習中' };
    if (p.repetitions <= 6) return { emoji: '⭐', label: '熟悉' };
    return { emoji: '🏆', label: '精通' };
  };

  // 單字熟練度徽章
  const getVocabBadge = (vocab) => {
    if (!vocab || vocab.repetitions === 0) return { emoji: '🌱', label: '新手' };
    if (vocab.repetitions <= 3) return { emoji: '📖', label: '學習中' };
    if (vocab.repetitions <= 6) return { emoji: '⭐', label: '熟悉' };
    return { emoji: '🏆', label: '精通' };
  };

  // 管理頁面：正在編輯的標籤 ID
  const [editingTagId, setEditingTagId] = useState(null);

  const [currentVerb, setCurrentVerb] = useState(null);
  const [currentTarget, setCurrentTarget] = useState('');
  const [currentGrammarDef, setCurrentGrammarDef] = useState(null); 
  const [currentCorrectPlain, setCurrentCorrectPlain] = useState(''); 
  const [currentCorrectRuby, setCurrentCorrectRuby] = useState('');

  // ==== 共用測驗設定與進度 ====
  const [timeLimit, setTimeLimit] = useState(15); 
  const [inputMode, setInputMode] = useState('choice'); 
  const [autoAdvance, setAutoAdvance] = useState(false); 
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [questionCount, setQuestionCount] = useState(1);
  const [score, setScore] = useState(0);
  const [isRoundComplete, setIsRoundComplete] = useState(false);
  const [roundHistory, setRoundHistory] = useState([]); 
  const [hp, setHp] = useState(3);
  const [combo, setCombo] = useState(0);
  
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null); 
  const [explanation, setExplanation] = useState('');
  const [timeLeft, setTimeLeft] = useState(15);
  const [choiceOptions, setChoiceOptions] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  const actualTimeLimit = inputMode === 'keyboard' ? (timeLimit === 0 ? 0 : timeLimit + 15) : timeLimit;
  const TOTAL_QUESTIONS = 10;

  const goHome = () => {
    setIsRoundComplete(false);
    setIsPaused(false);
    setAppState('home');
  };

  const startVocabSession = (mode, themeId = null) => {
    let queue = [];
    if (mode === 'srs') queue = [...todayQueue];
    else if (mode === 'mistakes') queue = Object.values(vocabMistakes);
    else if (mode === 'sentence') {
      queue = vocabDB.filter(v => v.example && v.example.trim().length > 0);
      if (queue.length === 0) { alert('目前沒有包含例句的單字喔！'); return; }
    }
    else if (mode === 'theme' && themeId) {
      queue = vocabDB.filter(v => v.tag === themeId);
      const themeData = THEMES.find(t => t.id === themeId);
      if(themeData) setCurrentThemeLabel(themeData.name);
    }
    
    if (queue.length === 0) { alert('這個模式目前沒有題目喔！'); return; }
    queue = queue.sort(() => Math.random() - 0.5);
    
    setVocabTestMode(mode);
    setActiveVocabQueue(queue);
    setQuestionCount(1);
    setScore(0);
    setCombo(0);
    setRoundHistory([]);
    setIsRoundComplete(false);
    setIsPaused(false);
    
    loadNextVocab(queue, mode);
    setAppState('vocab_playing');
  };

  const handleRandomTheme = () => {
    const availableThemes = Array.from(new Set(vocabDB.map(v => v.tag))).filter(t => t && t !== '自訂');
    if (availableThemes.length === 0) {
        alert('目前沒有可用的主題喔！');
        return;
    }
    const randomTheme = availableThemes[Math.floor(Math.random() * availableThemes.length)];
    startVocabSession('theme', randomTheme);
  };

  const loadNextVocab = (queue, currentMode = vocabTestMode) => {
    if (queue.length === 0) { setIsRoundComplete(true); return; }
    const nextVocab = queue[0];
    setCurrentVocab(nextVocab);
    setUserInput('');
    setFeedback(null);
    setExplanation('');
    setTimeLeft(actualTimeLimit);
    
    if (inputMode === 'choice') {
        if (currentMode === 'sentence') {
            setChoiceOptions(generateSentenceDistractors(nextVocab, vocabDB));
        } else {
            setChoiceOptions(generateVocabDistractors(nextVocab, vocabDB));
        }
    }
  };

  const processVocabAnswer = (answerToCheck = null) => {
    if (feedback !== null) return;
    const finalAnswer = answerToCheck !== null ? answerToCheck : userInput;
    if (!finalAnswer.trim() && answerToCheck === null) return;

    let correctAnswerStr = '';
    if (vocabTestMode === 'sentence') {
        correctAnswerStr = parseExample(currentVocab.example).translation || currentVocab.meaning;
    } else {
        correctAnswerStr = currentVocab.reading;
    }
    
    const isCorrect = finalAnswer.trim() === correctAnswerStr;
    const timeSpent = actualTimeLimit - timeLeft;
    
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setUserInput(finalAnswer);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setCombo(prev => prev + 1);
      if (vocabTestMode === 'mistakes') setVocabMistakes(prev => { const newM = {...prev}; delete newM[currentVocab.id]; return newM; });
    } else {
      setCombo(0);
      setVocabMistakes(prev => ({...prev, [currentVocab.id]: currentVocab}));
    }

    setRoundHistory(prev => [...prev, {
      question: vocabTestMode === 'sentence' ? (parseExample(currentVocab.example).plainSentence || currentVocab.word) : currentVocab.meaning,
      userAnswer: finalAnswer,
      correctAnswer: correctAnswerStr,
      userIsCorrect: isCorrect,
      explanation: currentVocab.word ? `核心單字：${currentVocab.word}` : `純假名單字`
    }]);

    if (vocabTestMode === 'srs') {
       let quality = 0;
       if (isCorrect) {
           if (timeSpent <= actualTimeLimit / 2) quality = 5;
           else if (timeSpent <= actualTimeLimit * 0.8) quality = 4;
           else quality = 3;
       }
       setVocabDB(prevDB => prevDB.map(v => {
           if (v.id === currentVocab.id) {
               let ef = v.ef || 2.5; let interval = v.interval || 0; let reps = v.repetitions || 0;
               if (quality >= 3) {
                   ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
                   if (ef < 1.3) ef = 1.3;
                   // 艾賓浩斯前期密集間隔：0→1→2→4→7→EF遞增
                   if (reps === 0) interval = 0;
                   else if (reps === 1) interval = 1;
                   else if (reps === 2) interval = 2;
                   else if (reps === 3) interval = 4;
                   else if (reps === 4) interval = 7;
                   else interval = Math.round(interval * ef);
                   reps++;
               } else { reps = 0; interval = 0; }
               return { ...v, ef, interval, repetitions: reps, nextReview: Date.now() + interval * 86400000 };
           }
           return v;
       }));
    }

    // 答錯的題目加回佇列尾部（同輪再考一次）
    if (!isCorrect && vocabTestMode === 'srs') {
      setActiveVocabQueue(prev => [...prev.slice(1), prev[0]]);
    }

    if (autoAdvance && isCorrect) setTimeout(() => advanceVocabQueue(), 800);
  };

  const advanceVocabQueue = () => {
    const nextQueue = activeVocabQueue.slice(1);
    setActiveVocabQueue(nextQueue);
    if (vocabTestMode !== 'srs' && questionCount >= TOTAL_QUESTIONS) setIsRoundComplete(true);
    else {
       if (nextQueue.length > 0) { setQuestionCount(prev => prev + 1); loadNextVocab(nextQueue, vocabTestMode); }
       else setIsRoundComplete(true);
    }
  };

  const startVerbRound = (mode) => {
    setVerbTestMode(mode);
    setQuestionCount(1);
    setScore(0);
    setCombo(0);
    setRoundHistory([]); 
    setIsRoundComplete(false);
    setIsPaused(false);
    if (mode === 'rpg') setHp(3);
    generateVerbQuestion(mode);
    setAppState('verb_playing');
  };

  const generateVerbQuestion = (mode) => {
    let availablePool = [];
    const validTargets = targetForms.filter(form => form !== sourceForm);

    if (mode === 'grammar') {
      if (customGrammars.length === 0) { alert('您的自訂文法庫為空！請先新增。'); goHome(); return; }
      verbDB.forEach(word => {
        customGrammars.forEach(grammar => { if (grammar.appliesTo.includes(word.type)) availablePool.push({ word, target: grammar.id, grammarDef: grammar }); });
      });
    }
    else if (mode === 'custom') {
      if (customWordIds.length === 0) { alert('請先到設定勾選自訂單字！'); goHome(); return; }
      const customWords = verbDB.filter(w => customWordIds.includes(w.id));
      customWords.forEach(word => validTargets.forEach(target => availablePool.push({ word, target, grammarDef: null })));
    }
    else {
      let filteredWords = verbDB.filter(w => activeWordTypes.includes(w.type));
      if (filteredWords.length === 0) return;
      filteredWords.forEach(word => validTargets.forEach(target => availablePool.push({ word, target, grammarDef: null })));
    }

    if (availablePool.length === 0) return;
    const selectedItem = availablePool[Math.floor(Math.random() * availablePool.length)];

    setCurrentVerb(selectedItem.word);
    setCurrentTarget(selectedItem.target);
    setCurrentGrammarDef(selectedItem.grammarDef || null);

    let finalCorrectRuby = '';
    if (selectedItem.grammarDef) {
      const rule = selectedItem.grammarDef;
      const baseRubyStr = selectedItem.word[rule.baseForm] || '';
      const replaceRegex = new RegExp((rule.removeStr || '') + '$');
      finalCorrectRuby = baseRubyStr.replace(replaceRegex, '') + rule.appendStr;
    } else finalCorrectRuby = selectedItem.word[selectedItem.target];

    setCurrentCorrectRuby(finalCorrectRuby);
    setCurrentCorrectPlain(stripRuby(finalCorrectRuby));
    setUserInput('');
    setFeedback(null);
    setExplanation('');
    setTimeLeft(actualTimeLimit);
    setIsPaused(false);

    if (inputMode === 'choice') setChoiceOptions(generateDistractors(selectedItem.word, selectedItem.target, selectedItem.grammarDef));
  };

  const processVerbAnswer = (answerToCheck = null) => {
    if (feedback !== null) return;
    const finalAnswer = answerToCheck !== null ? answerToCheck : userInput;
    if (!finalAnswer.trim() && answerToCheck === null) return;

    const isCorrect = finalAnswer.trim() === currentCorrectPlain;
    let exp = '';
    if (currentGrammarDef) {
       const baseName = FORM_OPTIONS.find(f => f.id === currentGrammarDef.baseForm)?.label || currentGrammarDef.baseForm;
       exp = `自訂文法【${currentGrammarDef.name}】變化規則：接在【${baseName}】後` +
             (currentGrammarDef.removeStr ? `去掉「${currentGrammarDef.removeStr}」，` : '，') + `加上「${currentGrammarDef.appendStr}」。`;
    } else exp = getExplanation(currentVerb, currentTarget);

    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setExplanation(exp);
    setUserInput(finalAnswer);

    const qTitle = `請將「${stripRuby(currentVerb[sourceForm])}」轉換為【${currentGrammarDef ? currentGrammarDef.name : FORM_OPTIONS.find(f=>f.id===currentTarget)?.label || currentTarget}】：`;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setCombo(prev => prev + 1);
      if (verbTestMode === 'rpg') setHp(prev => prev + 1);
    } else {
      setCombo(0);
      if (verbTestMode === 'rpg') setHp(prev => prev - 1);
      setMistakeBank(prev => ({ ...prev, [`${currentVerb.id}_${currentTarget}`]: { wordObj: currentVerb, target: currentTarget, grammarDef: currentGrammarDef } }));
    }

    setRoundHistory(prev => [...prev, { question: qTitle, userAnswer: finalAnswer, correctAnswer: currentCorrectPlain, userIsCorrect: isCorrect, explanation: exp }]);

    // ==== 文法 SRS 更新（艾賓浩斯前期密集間隔） ====
    if (!currentGrammarDef) {
      const srsKey = `${currentVerb.id}_${currentTarget}`;
      const timeSpent = actualTimeLimit - timeLeft;
      let quality = 0;
      if (isCorrect) {
        if (timeSpent <= actualTimeLimit / 2) quality = 5;
        else if (timeSpent <= actualTimeLimit * 0.8) quality = 4;
        else quality = 3;
      }
      setGrammarProgress(prev => {
        const existing = prev[srsKey] || { ef: 2.5, interval: 0, repetitions: 0, nextReview: 0, totalAttempts: 0, totalCorrect: 0 };
        let ef = existing.ef; let interval = existing.interval; let reps = existing.repetitions;
        if (quality >= 3) {
          ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
          if (ef < 1.3) ef = 1.3;
          // 文法用更密集的間隔：0→1→2→3→5→10→EF
          if (reps === 0) interval = 0;
          else if (reps === 1) interval = 1;
          else if (reps === 2) interval = 2;
          else if (reps === 3) interval = 3;
          else if (reps === 4) interval = 5;
          else if (reps === 5) interval = 10;
          else interval = Math.round(interval * ef);
          reps++;
        } else { reps = 0; interval = 0; }
        return {
          ...prev,
          [srsKey]: {
            ef, interval, repetitions: reps,
            nextReview: Date.now() + interval * 86400000,
            lastCorrect: isCorrect ? Date.now() : existing.lastCorrect,
            totalAttempts: existing.totalAttempts + 1,
            totalCorrect: existing.totalCorrect + (isCorrect ? 1 : 0)
          }
        };
      });
    }

    if (autoAdvance && isCorrect) setTimeout(() => advanceVerbRound(), 800);
  };

  const advanceVerbRound = () => {
    if (verbTestMode === 'rpg') {
      if (hp <= 0) setIsRoundComplete(true); else { setQuestionCount(prev => prev + 1); generateVerbQuestion(verbTestMode); }
    } else {
      if (questionCount >= TOTAL_QUESTIONS) setIsRoundComplete(true); else { setQuestionCount(prev => prev + 1); generateVerbQuestion(verbTestMode); }
    }
  };

  // ==== 文法 SRS 複習模式 ====
  const startGrammarSRS = () => {
    const queue = todayGrammarQueue.sort(() => Math.random() - 0.5).slice(0, 20);
    if (queue.length === 0) { alert('今日文法複習已全部完成！'); return; }
    
    setVerbTestMode('grammar_srs');
    setQuestionCount(1);
    setScore(0);
    setCombo(0);
    setRoundHistory([]);
    setIsRoundComplete(false);
    setIsPaused(false);
    
    const firstItem = queue[0];
    setCurrentVerb(firstItem.word);
    setCurrentTarget(firstItem.target);
    setCurrentGrammarDef(null);
    const correctRuby = firstItem.word[firstItem.target];
    setCurrentCorrectRuby(correctRuby);
    setCurrentCorrectPlain(stripRuby(correctRuby));
    setUserInput('');
    setFeedback(null);
    setExplanation('');
    setTimeLeft(actualTimeLimit);
    setIsPaused(false);
    if (inputMode === 'choice') setChoiceOptions(generateDistractors(firstItem.word, firstItem.target, null));
    
    setActiveVocabQueue(queue.slice(1));
    setAppState('verb_playing');
  };

  useEffect(() => {
    if (feedback !== null || isRoundComplete || actualTimeLimit === 0 || isPaused || appState === 'home' || appState.endsWith('manage') || appState === 'theme_select') return;
    const timer = setInterval(() => { setTimeLeft(prev => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; }); }, 1000);
    return () => clearInterval(timer);
  }, [feedback, isRoundComplete, actualTimeLimit, isPaused, appState]); 

  useEffect(() => {
    if (timeLeft === 0 && feedback === null && !isPaused && (appState === 'verb_playing' || appState === 'vocab_playing')) {
       if (appState === 'vocab_playing' && currentVocab) processVocabAnswer('[超時未答]');
       if (appState === 'verb_playing' && currentVerb) processVerbAnswer('[超時未答]');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const getTargetName = (id) => {
    const defaultOpt = FORM_OPTIONS.find(f => f.id === id);
    if (defaultOpt) return defaultOpt.label;
    const customOpt = customGrammars.find(g => g.id === id);
    if (customOpt) return customOpt.name;
    return id;
  };

  const [batchInputs, setBatchInputs] = useState(Array(5).fill({ word: '', reading: '', meaning: '', tag: '自訂', example: '' }));
  const [importText, setImportText] = useState(''); 

  const handleRematchBatchTheme = (idx) => {
    const n = [...batchInputs];
    if (n[idx].meaning) {
        n[idx].tag = guessThemeByMeaning(n[idx].meaning, vocabDB);
        setBatchInputs(n);
    }
  };

  const handleRematchDbTheme = (id, meaning) => {
    if (!meaning) return;
    // 排除自己，避免自我參照（如果自己被改成奇怪的 tag，不要再匹配到自己）
    const otherVocabs = vocabDB.filter(v => v.id !== id);
    const newTag = guessThemeByMeaning(meaning, otherVocabs);
    setVocabDB(prev => prev.map(v => v.id === id ? { ...v, tag: newTag } : v));
  };

  const handleBatchSave = () => {
    const newVocabs = batchInputs
      .filter(v => (v.word.trim() || v.reading.trim() || v.example.trim()) && v.meaning.trim())
      .map((v, i) => ({
        id: `v_custom_${Date.now()}_${i}`, 
        word: v.word.trim(), 
        reading: v.reading.trim() || v.word.trim(), 
        meaning: v.meaning.trim(), 
        tag: v.tag || '自訂', 
        example: v.example.trim(),
        ef: 2.5, interval: 0, repetitions: 0, nextReview: 0
    }));
    if (newVocabs.length > 0) {
        setVocabDB(prev => [...prev, ...newVocabs]);
        setBatchInputs(Array(5).fill({ word: '', reading: '', meaning: '', tag: '自訂', example: '' }));
        alert(`成功加入 ${newVocabs.length} 個單字/例句到學習序列！`);
    } else alert('沒有找到可儲存的內容，請確認至少填寫「中文」與「平假名」或「例句」。');
  };

  const handleSmartImport = () => {
    if (!importText.trim()) return;
    const lines = importText.split('\n');
    const newItems = [];
    let currentTheme = ''; 

    const hasKanji = (str) => /[\u4E00-\u9FFF]/.test(str);
    
    // 過濾非文字 emoji，但保留控制字元
    const removeEmojis = (str) => {
       return str.replace(/[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, (match) => {
           if (['➜', '➡️', '➡', '💬', '💡'].includes(match)) return match;
           return '';
       });
    };

    lines.forEach(line => {
        let trimmed = removeEmojis(line).trim();
        if(!trimmed) return;
        trimmed = trimmed.replace(/^[\-\*\•\+]\s+/, '');

        const headerMatch = trimmed.match(/^[【\[\(#](.+?)[】\]\)]?$/);
        if (headerMatch && !trimmed.includes('➜') && !trimmed.includes('->')) {
            currentTheme = headerMatch[1].trim(); 
            return;
        }

        const exampleMatch = trimmed.match(/^(?:💬|例：|例:|💡)\s*(.*)$/);
        if (exampleMatch) {
            if (newItems.length > 0) {
                newItems[newItems.length - 1].example = exampleMatch[1].trim();
            }
            return;
        }

        const arrowMatch = trimmed.match(/^(?:➜|➡️|➡|->|=>|-->|==>|>)\s*(.*)$/);
        if (arrowMatch) {
            const meaning = arrowMatch[1].trim();
            if (newItems.length === 0 || newItems[newItems.length - 1].meaning) return;
            newItems[newItems.length - 1].meaning = meaning;
            
            if (!currentTheme) {
               newItems[newItems.length - 1].tag = guessThemeByMeaning(meaning, vocabDB);
            }
            return;
        }

        const parts = trimmed.split(/[\t,，、\/\|]+|\s{2,}/).map(s => s.trim()).filter(Boolean);
        if (parts.length >= 3) {
            newItems.push({ word: parts[0], reading: parts[1], meaning: parts[2], tag: currentTheme || '自訂', example: '' });
        } else if (parts.length === 2) {
            newItems.push({ word: hasKanji(parts[0]) ? parts[0] : '', reading: hasKanji(parts[0]) ? '' : parts[0], meaning: parts[1], tag: currentTheme || '自訂', example: '' });
        } else if (parts.length === 1) {
            let word = ''; let reading = '';
            const bracketMatch = trimmed.match(/^([^\(（]+)[\(（]([^\)）]+)[\)）]$/);
            
            if (bracketMatch) {
                const outside = bracketMatch[1].trim(); const inside = bracketMatch[2].trim();
                if (!hasKanji(outside)) { reading = outside; word = ''; } 
                else { word = outside; reading = inside; }
            } else {
                if (!hasKanji(trimmed)) { reading = trimmed; word = ''; } 
                else { word = trimmed; reading = ''; }
            }
            newItems.push({ word, reading, meaning: '', tag: currentTheme || '自訂', example: '' });
        }
    });

    const validNewItems = newItems.filter(item => (item.reading || item.example) && item.meaning);
    if (validNewItems.length > 0) {
        validNewItems.forEach(item => {
            if (item.tag === '自訂') {
                item.tag = guessThemeByMeaning(item.meaning, vocabDB);
            }
        });
        const existingFilled = batchInputs.filter(v => (v.word.trim() || v.reading.trim() || v.example.trim()) && v.meaning.trim());
        let updatedList = [...existingFilled, ...validNewItems];
        if (updatedList.length < 5) updatedList = [...updatedList, ...Array(5 - updatedList.length).fill({ word: '', reading: '', meaning: '', tag: '自訂', example: '' })];
        setBatchInputs(updatedList);
        setImportText(''); 
    }
  };

  const [newGrammar, setNewGrammar] = useState({ name: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'] });
  const handleAddGrammar = () => {
    if (!newGrammar.name || !newGrammar.appendStr) { alert('請填寫文法名稱與加上字尾！'); return; }
    setCustomGrammars(prev => [...prev, { ...newGrammar, id: `g_custom_${Date.now()}` }]);
    setNewGrammar({ name: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'] });
  };

  const [verbInputs, setVerbInputs] = useState({ type: 'verb', group: '1', difficulty: 'n5', masu: '', jisho: '', te: '', ta: '', nai: '', nakatta: '', meaning: '' });
  const handleAddVerb = () => {
    if (!verbInputs.masu || !verbInputs.jisho || !verbInputs.meaning) return alert('請填寫至少 masu, jisho, meaning');
    setVerbDB(prev => [...prev, { ...verbInputs, id: `${verbInputs.type}_custom_${Date.now()}` }]);
    setVerbInputs({ type: 'verb', group: '1', difficulty: 'n5', masu: '', jisho: '', te: '', ta: '', nai: '', nakatta: '', meaning: '' });
  };

  // 在 Theme Select 中取得有效主題清單
  const availableThemes = Array.from(new Set(vocabDB.map(v => v.tag))).filter(t => t && t !== '自訂' && t !== '未分類');

  const handleExportData = () => {
    const data = {
      vocabDB,
      customGrammars,
      grammarProgress,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jp-dojo-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fileInputRef = React.useRef(null);
  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        let restored = false;
        if (data.vocabDB && Array.isArray(data.vocabDB)) {
          setVocabDB(data.vocabDB);
          restored = true;
        }
        if (data.customGrammars && Array.isArray(data.customGrammars)) {
          setCustomGrammars(data.customGrammars);
          restored = true;
        }
        if (data.grammarProgress && typeof data.grammarProgress === 'object') {
          setGrammarProgress(data.grammarProgress);
          restored = true;
        }
        if (restored) {
          alert('資料還原成功！');
        } else {
          alert('檔案中未找到有效的備份資料。');
        }
      } catch (err) {
        alert('檔案格式錯誤，還原失敗。');
      }
      e.target.value = ''; 
    };
    reader.readAsText(file);
  };

  const syncToGitHub = async () => {
    if (!githubToken) return alert('請先輸入 GitHub Token');
    setIsSyncing(true);
    try {
      const data = { vocabDB, customGrammars, grammarProgress, verbDB, exportDate: new Date().toISOString() };
      const content = JSON.stringify(data, null, 2);
      
      let url = 'https://api.github.com/gists';
      let method = 'POST';
      if (gistId) {
        url = `https://api.github.com/gists/${gistId}`;
        method = 'PATCH';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: 'JP Dojo Sync Data',
          public: false,
          files: {
            'jp-dojo-sync.json': { content }
          }
        })
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      if (!gistId) setGistId(json.id);
      alert('上傳至 GitHub 成功！');
    } catch (err) {
      console.error(err);
      alert('上傳失敗，請檢查您的 GitHub Token 是否正確且具有 gist 權限。');
    } finally {
      setIsSyncing(false);
    }
  };

  const syncFromGitHub = async () => {
    if (!githubToken || !gistId) return alert('請輸入 GitHub Token 與 Gist ID');
    if (!window.confirm('此操作會以雲端資料覆蓋本地進度，確定要下載嗎？')) return;
    setIsSyncing(true);
    try {
      const res = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      const file = json.files['jp-dojo-sync.json'];
      if (!file) throw new Error('找不到同步檔案');
      
      const data = JSON.parse(file.content);
      let restored = false;
      if (data.vocabDB && Array.isArray(data.vocabDB)) { setVocabDB(data.vocabDB); restored = true; }
      if (data.verbDB && Array.isArray(data.verbDB)) { setVerbDB(data.verbDB); restored = true; }
      if (data.customGrammars && Array.isArray(data.customGrammars)) { setCustomGrammars(data.customGrammars); restored = true; }
      if (data.grammarProgress && typeof data.grammarProgress === 'object') { setGrammarProgress(data.grammarProgress); restored = true; }
      
      if (restored) alert('從 GitHub 載入進度成功！');
      else alert('雲端檔案格式不正確。');
    } catch (err) {
      console.error(err);
      alert('載入失敗，請確認 Token 與 Gist ID 正確，且該檔案未被刪除。');
    } finally {
      setIsSyncing(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 font-sans selection:bg-blue-200 pb-20">
      
      {appState !== 'home' && (
         <header className="max-w-4xl mx-auto flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 relative z-50">
            <div className="flex items-center gap-3">
              <button onClick={goHome} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"><Home className="w-5 h-5" /></button>
              <h1 className="font-bold text-slate-800 hidden sm:block">
                {appState === 'vocab_playing' ? '單字記憶特訓' : appState === 'verb_playing' ? '動詞變化特訓' : appState === 'theme_select' ? '主題闖關大廳' : appState === 'vocab_manage' ? '管理單字記憶庫' : '管理自訂文法'}
              </h1>
            </div>
            {(appState === 'verb_playing' || appState === 'vocab_playing') && (
              <button onClick={() => setShowSettingsModal(true)} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"><Settings className="w-5 h-5" /></button>
            )}
         </header>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95">
             <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold flex items-center gap-2"><Settings className="w-6 h-6 text-slate-600"/> 測驗設定</h2><button onClick={()=>setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-600"><XCircle className="w-6 h-6"/></button></div>
             <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">作答模式</h3>
                  <div className="flex gap-2">
                    <label className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-colors ${inputMode === 'choice' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <input type="radio" value="choice" checked={inputMode === 'choice'} onChange={(e) => setInputMode(e.target.value)} className="hidden"/><ListTodo className="w-5 h-5" /> <span className="font-medium text-sm">選擇題</span>
                    </label>
                    <label className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-colors ${inputMode === 'keyboard' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <input type="radio" value="keyboard" checked={inputMode === 'keyboard'} onChange={(e) => setInputMode(e.target.value)} className="hidden"/><Keyboard className="w-5 h-5" /> <span className="font-medium text-sm">鍵盤輸入</span><span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full mt-1">時間自動+15秒</span>
                    </label>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">基礎限時</h3>
                  <select value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 bg-white focus:outline-none"><option value={10}>10 秒 (困難)</option><option value={15}>15 秒 (標準)</option><option value={30}>30 秒 (寬鬆)</option><option value={0}>無限制</option></select>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">自動換題</h3>
                    <label className="flex items-center gap-2 cursor-pointer p-2"><input type="checkbox" checked={autoAdvance} onChange={(e)=>setAutoAdvance(e.target.checked)} className="w-5 h-5 text-blue-600 rounded"/><span>答對時自動進入下一題 (無縫體驗)</span></label>
                </div>
             </div>
             <button onClick={()=>setShowSettingsModal(false)} className="w-full mt-8 py-3 bg-slate-800 text-white rounded-xl font-bold">完成設定</button>
          </div>
        </div>
      )}

      {appState === 'home' && (
        <div className="max-w-6xl mx-auto pt-6 sm:pt-12 animate-in fade-in slide-in-from-bottom-4">

          {/* Hero Header */}
          <div className="text-center mb-10">
            <div className="inline-flex p-5 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-3xl mb-4">
              <BookOpen className="w-14 h-14"/>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight mb-3">日文綜合特訓中心</h1>
            <p className="text-slate-400 text-base font-medium">每天一點點，透過科學方法建立直覺與長久記憶。</p>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">

            {/* ===== LEFT: 單字記憶庫 ===== */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 pb-2">
                <div className="p-2.5 bg-amber-500 text-white rounded-2xl shadow-sm"><Library className="w-5 h-5"/></div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 leading-tight">單字記憶庫</h2>
                  <p className="text-xs text-slate-400 font-medium">SRS 科學間隔複習系統</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-amber-600 leading-none mb-1.5">{todayQueue.length}</div>
                  <div className="text-xs font-bold text-amber-700/70">今日待複習</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-slate-700 leading-none mb-1.5">{vocabDB.length}</div>
                  <div className="text-xs font-bold text-slate-400">單字總數</div>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-red-500 leading-none mb-1.5">{Object.keys(vocabMistakes).length}</div>
                  <div className="text-xs font-bold text-red-400">累積錯題</div>
                </div>
              </div>

              {/* Primary Action */}
              <button
                onClick={() => startVocabSession('srs')}
                disabled={todayQueue.length === 0}
                className={`w-full py-5 rounded-2xl font-bold text-lg flex justify-center items-center gap-2 transition-all ${
                  todayQueue.length > 0
                    ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm hover:shadow-md active:scale-[0.98]'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {todayQueue.length > 0 ? `🌅 開始今日複習 (${todayQueue.length} 題)` : '🎉 今日任務全部完成！'}
              </button>

              {/* Secondary Actions 2x2 */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setAppState('theme_select')}
                  className="py-4 bg-blue-50 border border-blue-100 text-blue-700 rounded-2xl font-bold hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all text-sm flex flex-col items-center gap-1.5">
                  <span className="text-xl">🎮</span>主題單字闖關
                </button>
                <button onClick={() => startVocabSession('sentence')}
                  disabled={vocabDB.filter(v => v.example).length === 0}
                  className="py-4 bg-fuchsia-50 border border-fuchsia-100 text-fuchsia-700 rounded-2xl font-bold hover:bg-fuchsia-500 hover:text-white hover:border-fuchsia-500 transition-all text-sm flex flex-col items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
                  <MessageSquareQuote className="w-5 h-5"/>例句翻譯特訓
                </button>
                <button onClick={() => startVocabSession('mistakes')}
                  disabled={Object.keys(vocabMistakes).length === 0}
                  className="py-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all text-sm flex flex-col items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
                  <span className="text-xl">🔥</span>單字錯題特訓
                </button>
                <button onClick={() => setAppState('vocab_manage')}
                  className="py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all text-sm flex flex-col items-center gap-1.5">
                  <BookType className="w-5 h-5"/>管理記憶庫
                </button>
              </div>
            </div>

            {/* ===== RIGHT: 動詞文法訓練場 ===== */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 pb-2">
                <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-sm"><RotateCcw className="w-5 h-5"/></div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 leading-tight">動詞文法訓練場</h2>
                  <p className="text-xs text-slate-400 font-medium">動詞變化與自訂文法練習</p>
                </div>
              </div>

              {/* Grammar Stats Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-blue-600 leading-none mb-1.5">{todayGrammarQueue.length}</div>
                  <div className="text-xs font-bold text-blue-700/70">待複習</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-emerald-600 leading-none mb-1.5">{Object.values(grammarProgress).filter(p => p.repetitions >= 5).length}</div>
                  <div className="text-xs font-bold text-emerald-400">已掌握</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-slate-700 leading-none mb-1.5">{Object.keys(grammarProgress).length}</div>
                  <div className="text-xs font-bold text-slate-400">已練習</div>
                </div>
              </div>

              {/* Grammar SRS Primary Action */}
              <button
                onClick={startGrammarSRS}
                disabled={todayGrammarQueue.length === 0}
                className={`w-full py-5 rounded-2xl font-bold text-lg flex justify-center items-center gap-2 transition-all ${
                  todayGrammarQueue.length > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md active:scale-[0.98]'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {todayGrammarQueue.length > 0 ? `📝 開始今日文法複習 (${Math.min(todayGrammarQueue.length, 20)} 題)` : '🎉 今日文法複習完成！'}
              </button>

              {/* Mode Cards */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => startVerbRound('normal')}
                  className="p-5 bg-white border-2 border-slate-100 hover:border-blue-300 hover:bg-blue-50 rounded-2xl transition-all text-left group active:scale-[0.97]">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl w-fit mb-3 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <RotateCcw className="w-5 h-5"/>
                  </div>
                  <div className="font-bold text-slate-800 mb-1">一般綜合測驗</div>
                  <div className="text-xs text-slate-400">隨機考驗基礎變化</div>
                </button>

                <button onClick={() => startVerbRound('rpg')}
                  className="p-5 bg-white border-2 border-slate-100 hover:border-red-300 hover:bg-red-50 rounded-2xl transition-all text-left group active:scale-[0.97]">
                  <div className="p-2 bg-red-100 text-red-500 rounded-xl w-fit mb-3 group-hover:bg-red-500 group-hover:text-white transition-colors">
                    <Swords className="w-5 h-5"/>
                  </div>
                  <div className="font-bold text-slate-800 mb-1">RPG 生存戰</div>
                  <div className="text-xs text-slate-400">3 滴血極限挑戰</div>
                </button>
              </div>

              <button onClick={() => startVerbRound('grammar')}
                className="w-full p-5 bg-white border-2 border-slate-100 hover:border-emerald-300 hover:bg-emerald-50 rounded-2xl transition-all group active:scale-[0.97]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors flex-shrink-0">
                    <Puzzle className="w-5 h-5"/>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-800">套用自訂文法測驗</div>
                    <div className="text-xs text-slate-400 mt-0.5">練習您建立的進階文法公式</div>
                  </div>
                </div>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-slate-100"></div>
                <span className="text-xs text-slate-300 font-bold tracking-widest">管理</span>
                <div className="flex-1 h-px bg-slate-100"></div>
              </div>

              <button onClick={() => setAppState('grammar_manage')}
                className="w-full py-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl font-bold hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all flex items-center justify-center gap-2 mb-2">
                <Puzzle className="w-4 h-4"/>管理自訂文法公式庫
              </button>
              <button onClick={() => setAppState('verb_manage')}
                className="w-full py-4 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-2xl font-bold hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all flex items-center justify-center gap-2">
                <Library className="w-4 h-4"/>管理動詞與形容詞庫
              </button>
            </div>

          </div>

          {/* System and Data Management Section */}
          <div className="mt-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-xl"><Settings className="w-5 h-5"/></div>
              <h2 className="text-xl font-bold text-slate-800">系統與資料管理</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6">定期備份您的學習資料，避免清除瀏覽器快取時遺失進度。</p>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button onClick={handleExportData} className="flex-1 py-3 px-4 bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-colors flex items-center justify-center gap-2">
                <ArrowRight className="w-4 h-4 rotate-90"/> 備份學習資料 (匯出 JSON)
              </button>
              <input type="file" accept=".json" ref={fileInputRef} onChange={handleImportData} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-3 px-4 bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-colors flex items-center justify-center gap-2">
                <ArrowRight className="w-4 h-4 -rotate-90"/> 還原學習資料 (匯入 JSON)
              </button>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">☁️ 進階：GitHub 雲端同步 (跨裝置)</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">GitHub Token (需具備 gist 權限)</label>
                  <input type="password" value={githubToken} onChange={e => setGithubToken(e.target.value)} placeholder="ghp_..." className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Gist ID (第一次上傳後自動產生)</label>
                  <input type="text" value={gistId} onChange={e => setGistId(e.target.value)} placeholder="留空以建立新檔..." className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={syncToGitHub} disabled={isSyncing} className="flex-1 py-3 px-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {isSyncing ? <RefreshCcw className="w-4 h-4 animate-spin"/> : <ArrowRight className="w-4 h-4 -rotate-90"/>}
                  覆蓋雲端進度 (上傳)
                </button>
                <button onClick={syncFromGitHub} disabled={isSyncing} className="flex-1 py-3 px-4 bg-white border-2 border-slate-800 text-slate-800 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {isSyncing ? <RefreshCcw className="w-4 h-4 animate-spin"/> : <ArrowRight className="w-4 h-4 rotate-90"/>}
                  載入雲端進度 (下載)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {appState === 'theme_select' && (
        <div className="max-w-4xl mx-auto mt-6 animate-in fade-in zoom-in-95">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-800 flex items-center justify-center gap-3"><MapIcon className="w-8 h-8 text-blue-500"/> 主題單字闖關</h2>
            <p className="text-slate-500 mt-2">選擇一個情境，在該情境下快速辨認單字！</p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <button onClick={handleRandomTheme} disabled={availableThemes.length === 0} className="sm:col-span-2 p-6 bg-gradient-to-br from-indigo-500 to-purple-600 border-none rounded-3xl text-left flex items-center gap-5 transition-all hover:shadow-xl hover:scale-[1.02] group text-white disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none">
               <div className="p-4 bg-white/20 rounded-2xl group-hover:rotate-12 transition-transform backdrop-blur-sm"><Sparkles className="w-8 h-8 text-white"/></div>
               <div>
                  <h3 className="text-2xl font-black tracking-wide">🎲 隨機主題挑戰</h3>
                  <p className="text-white/80 text-sm mt-1 font-medium">不知道該選哪個？讓系統幫你隨機挑選一個主題進行測驗！</p>
               </div>
            </button>

            {availableThemes.map(tagName => {
              const count = vocabDB.filter(v => v.tag === tagName).length;
              return (
                <button key={tagName} onClick={() => startVocabSession('theme', tagName)} className="p-6 bg-white border border-slate-200 hover:border-blue-400 rounded-3xl text-left flex items-start gap-4 transition-all hover:shadow-md group">
                   <div className={`p-4 rounded-2xl group-hover:scale-110 transition-transform ${getTagStyle(tagName)}`}><FolderHeart className="w-8 h-8"/></div>
                   <div>
                      <h3 className="text-xl font-bold text-slate-800">{tagName}</h3>
                      <p className="text-sm text-slate-500 mt-1">針對「{tagName}」相關詞彙特訓</p>
                      <div className="mt-3 text-xs font-bold text-slate-400 bg-slate-50 inline-block px-2 py-1 rounded">收錄 {count} 個單字</div>
                   </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {appState === 'vocab_manage' && (
        <div className="max-w-5xl mx-auto mt-4 animate-in fade-in">
           <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
             <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><BookType className="w-6 h-6 text-amber-500"/> 管理單字記憶庫</h2></div>
             
             <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 mb-8">
                <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-amber-800 text-lg">批次新增單字/例句</h3></div>
                <div className="mb-6 bg-white p-5 rounded-2xl border border-amber-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3 text-sm font-bold text-amber-700"><Sparkles className="w-5 h-5"/> 快速貼上區 (智能過濾 Emoji)</div>
                  <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder="支援加上主題標籤與例句！例如：&#10;【交通與地點】&#10;くるま（車）&#10;➜ 汽車&#10;💬 新しい車を買いました。（買了新車。）" className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-amber-500 text-sm h-32 resize-y placeholder:text-slate-400 leading-relaxed"/>
                  <button onClick={handleSmartImport} className="mt-3 w-full py-3 bg-amber-100 text-amber-800 rounded-xl font-bold hover:bg-amber-200 transition-colors flex items-center justify-center gap-2">解析文字並套用到下方表格</button>
                </div>

                <div className="flex justify-between items-center mb-4 mt-8 border-t border-amber-200 pt-6">
                  <h4 className="font-bold text-amber-800">確認與編輯區</h4>
                  <button onClick={() => setBatchInputs([...batchInputs, {word:'', reading:'', meaning:'', tag: '自訂', example: ''}])} className="text-sm text-amber-700 bg-amber-100 px-4 py-2 rounded-xl font-bold hover:bg-amber-200 flex items-center gap-1"><Plus className="w-4 h-4"/> 新增一列</button>
                </div>
                <datalist id="theme-suggestions">{Array.from(new Set(vocabDB.map(v => v.tag))).filter(Boolean).map(tag => <option key={tag} value={tag} />)}</datalist>

                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                   {batchInputs.map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-amber-100 shadow-sm transition-all focus-within:border-amber-400 focus-within:shadow-md">
                        <div className="flex gap-2">
                          <div className="relative w-40 flex items-center">
                              <input type="text" placeholder="主題/標籤" value={item.tag} onChange={e => {const n=[...batchInputs]; n[idx].tag=e.target.value; setBatchInputs(n);}} className={`w-full pl-3 pr-8 py-3 rounded-xl outline-none text-sm font-bold border ${getTagStyle(item.tag)}`} list="theme-suggestions" />
                              <button onClick={() => handleRematchBatchTheme(idx)} title="自動重配主題" className="absolute right-2 p-1 text-slate-400 hover:text-amber-500 transition-colors"><Sparkles className="w-4 h-4"/></button>
                          </div>
                          <input type="text" placeholder="漢字/原形 (留空即純假名)" value={item.word} onChange={e => {const n=[...batchInputs]; n[idx].word=e.target.value; setBatchInputs(n);}} className="flex-1 p-3 rounded-xl border border-slate-200 outline-none focus:border-amber-500 text-sm font-bold"/>
                          <input type="text" placeholder="平假名 (例: たべる)" value={item.reading} onChange={e => {const n=[...batchInputs]; n[idx].reading=e.target.value; setBatchInputs(n);}} className="flex-1 p-3 rounded-xl border border-slate-200 outline-none focus:border-amber-500 text-sm font-bold"/>
                          <input type="text" placeholder="中文 (例: 吃)" value={item.meaning} onChange={e => {const n=[...batchInputs]; n[idx].meaning=e.target.value; setBatchInputs(n);}} className="flex-1 p-3 rounded-xl border border-slate-200 outline-none focus:border-amber-500 text-sm font-bold"/>
                          <button onClick={() => setBatchInputs(batchInputs.filter((_, i) => i !== idx))} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-5 h-5"/></button>
                        </div>
                        <div className="flex items-center gap-2 relative">
                          <MessageSquareQuote className="w-5 h-5 text-amber-400 absolute left-3" />
                          <input type="text" placeholder="附加例句 (選填，支援「漢字[假名]」注音格式。例如: 水[みず]を飲[の]みます。)" value={item.example} onChange={e => {const n=[...batchInputs]; n[idx].example=e.target.value; setBatchInputs(n);}} className="w-full pl-10 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-amber-500 focus:bg-white text-sm text-slate-600"/>
                        </div>
                      </div>
                   ))}
                </div>
                <button onClick={handleBatchSave} className="w-full py-4 bg-amber-600 text-white rounded-2xl font-bold text-lg hover:bg-amber-700 transition-colors shadow-sm">批次儲存到資料庫</button>
             </div>

             <datalist id="db-theme-suggestions">{Array.from(new Set(vocabDB.map(v => v.tag))).filter(Boolean).map(tag => <option key={tag} value={tag} />)}</datalist>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 text-slate-600"><tr><th className="p-4 rounded-tl-xl">主題標籤</th><th className="p-4">單字 (平假名)</th><th className="p-4">中文 / 例句</th><th className="p-4">熟練度</th><th className="p-4">下次複習</th><th className="p-4 rounded-tr-xl">操作</th></tr></thead>
                 <tbody>
                    {vocabDB.map(v => (
                       <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                             <div className="flex items-center gap-1.5">
                               {editingTagId === v.id ? (
                                 <input
                                   type="text"
                                   autoFocus
                                   defaultValue={v.tag}
                                   list="db-theme-suggestions"
                                   onBlur={(e) => {
                                     const newTag = e.target.value.trim();
                                     if (newTag && newTag !== v.tag) {
                                       setVocabDB(prev => prev.map(x => x.id === v.id ? { ...x, tag: newTag } : x));
                                     }
                                     setEditingTagId(null);
                                   }}
                                   onKeyDown={(e) => {
                                     if (e.key === 'Enter') e.target.blur();
                                     if (e.key === 'Escape') setEditingTagId(null);
                                   }}
                                   className="w-28 px-2 py-1 text-xs font-bold rounded-lg border-2 border-amber-400 outline-none bg-amber-50"
                                 />
                               ) : (
                                 <span
                                   onClick={() => setEditingTagId(v.id)}
                                   className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg border whitespace-nowrap cursor-pointer hover:ring-2 hover:ring-amber-300 transition-all ${getTagStyle(v.tag)}`}
                                   title="點擊編輯主題標籤"
                                 >{v.tag}</span>
                               )}
                               <button onClick={() => handleRematchDbTheme(v.id, v.meaning)} title="根據中文重新自動配對主題" className="p-1 text-slate-300 hover:text-amber-500 transition-colors"><Sparkles className="w-4 h-4"/></button>
                             </div>
                          </td>
                          <td className="p-4"><div className="font-bold text-slate-800 text-base">{v.word || v.reading}</div>{v.word && <div className="text-slate-500 text-xs mt-0.5">{v.reading}</div>}</td>
                          <td className="p-4"><div className="font-bold text-slate-700">{v.meaning}</div>{v.example && <div className="text-slate-500 text-xs mt-1 bg-slate-100 p-1.5 rounded inline-block">{renderRuby(v.example)}</div>}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">{getVocabBadge(v).emoji}</span>
                              <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg font-mono text-xs border border-emerald-100">EF {v.ef.toFixed(1)}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-500 font-medium">{v.interval === 0 ? '今天' : `${v.interval} 天後`}</td>
                          <td className="p-4"><button onClick={()=>{if(window.confirm('確定刪除？')) setVocabDB(vocabDB.filter(x=>x.id!==v.id))}} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button></td>
                       </tr>
                    ))}
                 </tbody>
               </table>
             </div>
           </div>
        </div>
      )}

      {appState === 'grammar_manage' && (
        <div className="max-w-5xl mx-auto mt-4 animate-in fade-in">
           <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-8"><Puzzle className="w-6 h-6 text-emerald-600"/> 管理自訂文法公式庫</h2>
              <div className="grid lg:grid-cols-2 gap-8">
                 <div className="space-y-4">
                   <h3 className="font-bold text-slate-700 mb-4 text-lg">已儲存的公式</h3>
                   {customGrammars.map(g => (
                      <div key={g.id} className="p-5 bg-white border border-slate-200 rounded-2xl flex justify-between items-center shadow-sm hover:border-emerald-300 transition-colors">
                         <div>
                           <div className="font-bold text-slate-800 text-lg mb-1.5">{g.name}</div>
                           <div className="text-sm text-slate-500 flex items-center gap-2">
                              接續：<span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium border border-slate-200">{FORM_OPTIONS.find(f=>f.id===g.baseForm)?.label}</span>
                              {g.removeStr && <span className="text-red-400 font-bold">-「{g.removeStr}」</span>}
                              <span className="text-emerald-500 font-bold">+「{g.appendStr}」</span>
                           </div>
                         </div>
                         <button onClick={() => {if(window.confirm('確定刪除？')) setCustomGrammars(customGrammars.filter(x=>x.id!==g.id))}} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-5 h-5"/></button>
                      </div>
                   ))}
                 </div>
                 <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 h-fit">
                    <h3 className="font-bold text-emerald-800 mb-6 flex items-center gap-2 text-lg"><Plus className="w-6 h-6"/> 新增文法公式</h3>
                    <div className="space-y-5">
                      <div><label className="block text-sm font-bold text-emerald-700 mb-1.5">文法名稱 (提示語)</label><input type="text" value={newGrammar.name} onChange={e => setNewGrammar(p => ({...p, name: e.target.value}))} placeholder="例：請不要... (〜ないでください)" className="w-full p-4 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500"/></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-bold text-emerald-700 mb-1.5">接續基礎形</label><select value={newGrammar.baseForm} onChange={e => setNewGrammar(p => ({...p, baseForm: e.target.value}))} className="w-full p-4 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500 bg-white">{FORM_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}</select></div>
                        <div><label className="block text-sm font-bold text-emerald-700 mb-1.5">加上字尾</label><input type="text" value={newGrammar.appendStr} onChange={e => setNewGrammar(p => ({...p, appendStr: e.target.value}))} placeholder="例：でください" className="w-full p-4 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500"/></div>
                      </div>
                      <button onClick={handleAddGrammar} className="w-full py-4 mt-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm text-lg">儲存新文法</button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {appState === 'verb_manage' && (
        <div className="max-w-5xl mx-auto mt-4 animate-in fade-in">
           <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Library className="w-6 h-6 text-indigo-600"/> 管理動詞與形容詞庫</h2>
              </div>
              <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 mb-8">
                 <h3 className="font-bold text-indigo-800 mb-6 flex items-center gap-2 text-lg"><Plus className="w-6 h-6"/> 新增詞彙</h3>
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                   <div><label className="block text-sm font-bold text-indigo-700 mb-1">類型</label><select value={verbInputs.type} onChange={e=>setVerbInputs({...verbInputs, type: e.target.value})} className="w-full p-3 rounded-xl border border-indigo-200"><option value="verb">動詞 (verb)</option><option value="adj_i">い形容詞 (adj_i)</option><option value="adj_na">な形容詞 (adj_na)</option></select></div>
                   <div><label className="block text-sm font-bold text-indigo-700 mb-1">群組/分類</label><select value={verbInputs.group} onChange={e=>setVerbInputs({...verbInputs, group: e.target.value})} className="w-full p-3 rounded-xl border border-indigo-200"><option value="1">第一類動詞 (1)</option><option value="2">第二類動詞 (2)</option><option value="3">第三類動詞 (3)</option><option value="i">い形容詞 (i)</option><option value="na">な形容詞 (na)</option></select></div>
                   <div><label className="block text-sm font-bold text-indigo-700 mb-1">難易度</label><select value={verbInputs.difficulty} onChange={e=>setVerbInputs({...verbInputs, difficulty: e.target.value})} className="w-full p-3 rounded-xl border border-indigo-200"><option value="n5">N5</option><option value="n4">N4</option><option value="n3">N3</option><option value="n2">N2</option><option value="n1">N1</option></select></div>
                   <div><label className="block text-sm font-bold text-indigo-700 mb-1">中文意思</label><input type="text" value={verbInputs.meaning} onChange={e=>setVerbInputs({...verbInputs, meaning: e.target.value})} placeholder="例：去" className="w-full p-3 rounded-xl border border-indigo-200"/></div>
                 </div>
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                   <div><label className="block text-sm font-bold text-indigo-700 mb-1">ます形 (支援漢字[假名])</label><input type="text" value={verbInputs.masu} onChange={e=>setVerbInputs({...verbInputs, masu: e.target.value})} placeholder="例：行[い]きます" className="w-full p-3 rounded-xl border border-indigo-200"/></div>
                   <div><label className="block text-sm font-bold text-indigo-700 mb-1">辭書形 (jisho)</label><input type="text" value={verbInputs.jisho} onChange={e=>setVerbInputs({...verbInputs, jisho: e.target.value})} placeholder="例：行[い]く" className="w-full p-3 rounded-xl border border-indigo-200"/></div>
                   <div><label className="block text-sm font-bold text-indigo-700 mb-1">て形 (te)</label><input type="text" value={verbInputs.te} onChange={e=>setVerbInputs({...verbInputs, te: e.target.value})} placeholder="例：行[い]って" className="w-full p-3 rounded-xl border border-indigo-200"/></div>
                   <div><label className="block text-sm font-bold text-indigo-700 mb-1">た形 (ta)</label><input type="text" value={verbInputs.ta} onChange={e=>setVerbInputs({...verbInputs, ta: e.target.value})} placeholder="例：行[い]った" className="w-full p-3 rounded-xl border border-indigo-200"/></div>
                   <div><label className="block text-sm font-bold text-indigo-700 mb-1">ない形 (nai)</label><input type="text" value={verbInputs.nai} onChange={e=>setVerbInputs({...verbInputs, nai: e.target.value})} placeholder="例：行[い]かない" className="w-full p-3 rounded-xl border border-indigo-200"/></div>
                   <div><label className="block text-sm font-bold text-indigo-700 mb-1">なかった形</label><input type="text" value={verbInputs.nakatta} onChange={e=>setVerbInputs({...verbInputs, nakatta: e.target.value})} placeholder="例：行[い]かなかった" className="w-full p-3 rounded-xl border border-indigo-200"/></div>
                 </div>
                 <button onClick={handleAddVerb} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-sm">新增至記憶庫</button>
              </div>

              <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 text-slate-600"><tr><th className="p-4 rounded-tl-xl">類型/群組</th><th className="p-4">ます形</th><th className="p-4">辭書/て形</th><th className="p-4">中文意思</th><th className="p-4">難易度</th><th className="p-4 rounded-tr-xl">操作</th></tr></thead>
                 <tbody>
                    {verbDB.map(v => (
                       <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="p-4"><span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold whitespace-nowrap">{v.type} ({v.group})</span></td>
                          <td className="p-4 font-bold text-slate-800">{renderRuby(v.masu)}</td>
                          <td className="p-4 text-slate-600">{renderRuby(v.jisho)} / {renderRuby(v.te)}</td>
                          <td className="p-4 font-bold text-slate-700">{v.meaning}</td>
                          <td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-500 uppercase">{v.difficulty}</span></td>
                          <td className="p-4"><button onClick={()=>{if(window.confirm('確定刪除？')) setVerbDB(verbDB.filter(x=>x.id!==v.id))}} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button></td>
                       </tr>
                    ))}
                 </tbody>
               </table>
              </div>
           </div>
        </div>
      )}

      {/* ==== 測驗完成 (結算畫面) ==== */}
      {isRoundComplete && (appState === 'verb_playing' || appState === 'vocab_playing') && (
         <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center relative animate-in slide-in-from-bottom-4 z-10">
            {appState === 'verb_playing' && verbTestMode === 'rpg' ? (
              <><Skull className="w-24 h-24 text-red-500 mx-auto mb-6 drop-shadow-md" /><h2 className="text-4xl font-black text-slate-800 mb-2">GAME OVER</h2><p className="text-slate-500 mb-8 text-lg font-bold">生存結束，血量耗盡！</p><div className="bg-slate-50 rounded-2xl p-6 flex-1 border-2 border-slate-100 max-w-xs mx-auto mb-8"><div className="text-sm text-slate-500 font-bold mb-2">本次擊破單字數</div><div className="text-5xl font-black text-slate-800">{score}</div></div></>
            ) : (
              <><Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4 drop-shadow-md" /><h2 className="text-3xl font-black text-slate-800 mb-2">測驗完成！</h2><div className="text-5xl font-black text-blue-600 my-8">{score} <span className="text-2xl text-slate-400 font-medium">/ {roundHistory.length}</span></div></>
            )}
            {roundHistory.length > 0 && (
               <div className="text-left bg-slate-50 p-4 sm:p-6 rounded-2xl mb-8 max-h-64 overflow-y-auto border border-slate-200">
                 <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Edit3 className="w-5 h-5"/> 錯題與解析清單</h3>
                 <div className="space-y-4">
                   {roundHistory.filter(h => !h.userIsCorrect).length === 0 ? <div className="text-green-600 font-bold text-center py-6">太神啦！全對無錯題！🎉</div> : (
                     roundHistory.filter(h => !h.userIsCorrect).map((item, idx) => (
                       <div key={idx} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm"><div className="text-sm text-slate-600 mb-2 font-bold">{item.question}</div><div className="flex gap-4 text-sm font-bold mb-3"><div className="text-red-500 line-through">你的答案: {item.userAnswer || '未作答'}</div><div className="text-green-600">正確答案: {item.correctAnswer}</div></div><div className="text-xs bg-red-50 p-2 rounded text-red-800 leading-relaxed font-medium">💡 解析：{item.explanation}</div></div>
                     ))
                   )}
                 </div>
               </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
               <button onClick={goHome} className="px-8 py-4 bg-slate-100 text-slate-700 rounded-xl font-bold flex gap-2 justify-center hover:bg-slate-200 transition-colors"><Home className="w-5 h-5"/> 回首頁</button>
               {appState === 'verb_playing' && <button onClick={()=>startVerbRound(verbTestMode)} className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold flex gap-2 justify-center hover:bg-blue-700 transition-colors"><Play className="w-5 h-5 fill-current"/> 再來一局</button>}
               {appState === 'vocab_playing' && vocabTestMode !== 'srs' && !vocabTestMode.startsWith('theme') && <button onClick={()=>startVocabSession(vocabTestMode)} className="px-8 py-4 bg-amber-600 text-white rounded-xl font-bold flex gap-2 justify-center hover:bg-amber-700 transition-colors"><Play className="w-5 h-5 fill-current"/> 再來一局</button>}
               {appState === 'vocab_playing' && vocabTestMode === 'theme' && <button onClick={()=>setAppState('theme_select')} className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold flex gap-2 justify-center hover:bg-blue-700 transition-colors"><MapIcon className="w-5 h-5"/> 選擇其他主題</button>}
            </div>
         </div>
      )}

      {/* ==== 進行測驗中 (Playing UI) ==== */}
      {!isRoundComplete && !isPaused && (appState === 'vocab_playing' || appState === 'verb_playing') && (
         <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 text-center relative overflow-hidden">
            
            {isPaused && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl text-center border border-slate-200 animate-in zoom-in-95">
                        <Pause className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">測驗暫停中</h2>
                        <button onClick={() => setIsPaused(false)} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mx-auto">
                            <Play className="w-5 h-5 fill-current" /> 繼續測驗
                        </button>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-8">
               {appState === 'verb_playing' && verbTestMode === 'rpg' ? (
                  <div className="flex items-center gap-3 bg-red-50 px-4 py-1.5 rounded-full border border-red-100"><Heart className={`w-5 h-5 text-red-500 ${hp > 0 ? 'fill-current animate-pulse' : ''}`} /><span className="font-black text-red-600">HP: {hp}</span><div className="ml-2 pl-3 border-l-2 border-red-200 flex gap-3 text-sm font-bold"><span className="text-slate-700">總答對: {score}</span><span className="text-amber-600">連擊: {combo}</span></div></div>
               ) : (
                  <div className="bg-slate-100 px-4 py-1.5 rounded-full text-sm font-bold text-slate-600">{appState === 'vocab_playing' && vocabTestMode === 'srs' ? `SRS 待處理: ${activeVocabQueue.length}` : `題目: ${questionCount} / ${TOTAL_QUESTIONS}`}</div>
               )}
               {actualTimeLimit > 0 && (
                  <div className="flex items-center gap-2"><button onClick={() => setIsPaused(true)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg bg-slate-50 border border-slate-200"><Pause className="w-4 h-4" /></button><div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold ${timeLeft <= 3 && !feedback ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600'}`}><Timer className="w-4 h-4" /> {timeLeft}s</div></div>
               )}
            </div>

            {appState === 'vocab_playing' && currentVocab && (
               <>
                 {vocabTestMode === 'sentence' ? (
                     <>
                       <div className="text-sm text-slate-500 mb-2">請翻譯以下例句（不顯示漢字以訓練聽力/閱讀）：</div>
                       <div className="text-2xl sm:text-3xl font-black text-slate-800 tracking-wide mb-8 py-8 px-4 bg-slate-50 rounded-2xl border border-slate-200">
                          {parseExample(currentVocab.example).readingOnly}
                       </div>
                     </>
                 ) : (
                     <>
                       <div className="text-sm text-slate-500 mb-2">請問這個中文意思的平假名發音是？</div>
                       <div className="text-5xl font-black text-slate-800 tracking-wide mb-8 py-6">{currentVocab.meaning}</div>
                     </>
                 )}
               </>
            )}

            {appState === 'verb_playing' && currentVerb && (
               <><div className="text-sm text-slate-500 mb-2">請將以下單字轉換為</div><div className="text-2xl font-bold mb-6 border-b-2 inline-block px-2 pb-1 text-blue-700 border-blue-500">{getTargetName(currentTarget)}</div><div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"><div className="text-5xl font-black text-slate-800 tracking-wide">{renderRuby(currentVerb[sourceForm])}</div><div className="text-slate-400 hidden sm:block"><ArrowRight className="w-8 h-8" /></div><div className="text-lg text-slate-500 font-medium bg-slate-50 px-4 py-2 rounded-xl">{currentVerb.meaning}</div></div></>
            )}

            {inputMode === 'choice' ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                 {choiceOptions.map((opt, idx) => {
                    let btnClass = "py-4 px-6 rounded-2xl border-2 text-xl font-bold transition-all ";
                    let isPlainMatch = false;
                    
                    if (appState === 'vocab_playing') {
                        if (vocabTestMode === 'sentence') {
                            isPlainMatch = opt === (parseExample(currentVocab.example).translation || currentVocab.meaning);
                        } else {
                            isPlainMatch = opt === currentVocab.reading;
                        }
                    } else {
                        isPlainMatch = opt.plain === currentCorrectPlain;
                    }
                    
                    if (feedback === null) btnClass += "border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700";
                    else if (isPlainMatch) btnClass += "border-green-500 bg-green-50 text-green-700";
                    else if ((appState === 'vocab_playing' ? opt : opt.plain) === userInput) btnClass += "border-red-500 bg-red-50 text-red-700";
                    else btnClass += "border-slate-100 bg-slate-50 text-slate-400 opacity-50";
                    
                    return (<button key={idx} disabled={feedback !== null} onClick={() => { setUserInput(appState === 'vocab_playing' ? opt : opt.plain); appState === 'vocab_playing' ? processVocabAnswer(opt) : processVerbAnswer(opt.plain); }} className={btnClass}>{appState === 'vocab_playing' ? opt : renderRuby(opt.ruby)}</button>);
                 })}
               </div>
            ) : (
               <form onSubmit={e => { e.preventDefault(); appState === 'vocab_playing' ? processVocabAnswer() : processVerbAnswer(); }} className="max-w-md mx-auto relative">
                 <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} disabled={feedback !== null} placeholder="輸入解答..." autoFocus className={`w-full px-5 py-4 text-2xl text-center rounded-2xl border-2 outline-none ${feedback === 'correct' ? 'border-green-500 bg-green-50 text-green-800 font-bold' : feedback ? 'border-red-500 bg-red-50 text-red-800 font-bold' : 'border-slate-200 focus:border-blue-500'}`} />
                 {feedback === 'correct' && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 animate-in zoom-in"><CheckCircle2 className="w-8 h-8"/></div>}
                 {feedback && feedback !== 'correct' && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 animate-in zoom-in"><XCircle className="w-8 h-8"/></div>}
               </form>
            )}

            {inputMode === 'keyboard' && feedback === null && (
               <button onClick={() => appState === 'vocab_playing' ? processVocabAnswer() : processVerbAnswer()} className="mt-6 max-w-md mx-auto w-full py-4 bg-slate-800 text-white rounded-xl font-bold text-lg hover:bg-slate-700">送出答案 (Enter)</button>
            )}

            {feedback !== null && (
               <button onClick={appState === 'vocab_playing' ? advanceVocabQueue : advanceVerbRound} disabled={autoAdvance && feedback === 'correct'} className={`mt-6 max-w-md mx-auto w-full py-4 rounded-xl font-bold text-lg flex justify-center gap-2 ${feedback === 'correct' ? 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-90' : 'bg-red-600 text-white hover:bg-red-700'}`} autoFocus>
                 {feedback === 'correct' && autoAdvance ? '換題中...' : '下一題'} <Play className="w-5 h-5 fill-current" />
               </button>
            )}

            {/* Vocab 專屬例句展示 (對錯皆顯示) */}
            {appState === 'vocab_playing' && feedback !== null && currentVocab.example && (
               <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-left animate-in fade-in flex items-start gap-3">
                   <MessageSquareQuote className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                   <div><div className="font-bold text-amber-800 mb-1">情境例句與解析</div><div className="text-lg text-slate-800 leading-relaxed font-medium">{renderRuby(currentVocab.example)}</div></div>
               </div>
            )}

            {/* 原有錯誤/超時解析 */}
            {feedback && feedback !== 'correct' && (
               <div className="mt-6 p-5 bg-red-50 border border-red-100 rounded-2xl text-left animate-in slide-in-from-bottom-4">
                 <div className="flex items-center gap-2 text-red-700 font-bold mb-3"><AlertCircle className="w-5 h-5" /> 答錯囉！解析如下：</div>
                 <div className="space-y-3 text-red-900">
                   <div className="flex gap-2 bg-white/60 p-3 rounded-xl items-center">
                       <span className="font-semibold text-red-700 whitespace-nowrap">正確答案：</span>
                       <span className="text-2xl font-black">
                           {appState === 'vocab_playing' 
                               ? (vocabTestMode === 'sentence' ? (parseExample(currentVocab.example).translation || currentVocab.meaning) : currentVocab.reading) 
                               : renderRuby(currentCorrectRuby)}
                       </span>
                   </div>
                   <div className="flex gap-2 bg-white/60 p-3 rounded-xl">
                       <span className="font-semibold text-red-700 whitespace-nowrap">重點提示：</span>
                       <span className="font-medium leading-relaxed">
                           {appState === 'vocab_playing' 
                               ? (vocabTestMode === 'sentence' 
                                   ? `核心單字：${currentVocab.word || currentVocab.reading} (${currentVocab.meaning})`
                                   : (currentVocab.word ? `日文漢字寫作「${currentVocab.word}」` : `此單字為純假名組合`))
                               : explanation}
                       </span>
                   </div>
                 </div>
               </div>
            )}
         </div>
      )}
    </div>
  );
}