import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import GlobalSearch from './components/GlobalSearch/GlobalSearch';
import ThemePanel from './components/ThemePanel';
import { autoConjugate, deriveJishoFromMasu } from './conjugator';
import { BUILT_IN_DICTIONARY, getAvailableThemes, getWordsByTheme } from './dictionary';
import { 
  Settings, Play, CheckCircle2, XCircle, ArrowRight, BookOpen, 
  Timer, RotateCcw, AlertCircle, Trophy, Keyboard, ListTodo, 
  Pause, SlidersHorizontal, Layers, FolderHeart, ShieldAlert, Trash2, Award, Medal,
  Heart, Swords, Skull, Flame, Home, Puzzle, Plus, Edit3, 
  Map as MapIcon, Library, BookType, Sparkles, Coffee, Car, Shirt, SmilePlus,
  MessageSquareQuote, PenTool, RefreshCcw, Save, Pencil, Search, GripHorizontal, Star,
  Target,
  BarChart2,
  History,
  ChevronUp
} from 'lucide-react';

const renderFormulaText = (text) => {
  if (!text) return null;
  return text.split(/(〔名〕|_)/g).map((part, i) => {
    if (part === '〔名〕') return <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300 mx-0.5 align-middle">名</span>;
    if (part === '_') return <span key={i} className="mx-0.5">＿</span>;
    return <span key={i}>{part}</span>;
  });
};

const renderTextWithStrikethrough = (text) => {
  if (!text) return null;
  const parts = text.split(/(~~.*?~~)/g);
  return parts.map((part, i) => {
    if (part.startsWith('~~') && part.endsWith('~~')) {
      return <span key={i} className="line-through text-slate-400 font-normal">{part.slice(2, -2)}</span>;
    }
    return <span key={i}>{part}</span>;
  });
};

const INITIAL_VERB_DB = [
  { group: 1, type: 'verb', masu: '行[い]きます', jisho: '行[い]く', te: '行[い]って', ta: '行[い]った', nai: '行[い]かない', nakatta: '行[い]かなかった', ba: '行[い]けば', volitional: '行[い]こう', potential: '行[い]ける', passive: '行[い]かれる', causative: '行[い]かせる', causative_passive: '行[い]かされる', meaning: '去', difficulty: 'n5' },
  { group: 1, type: 'verb', masu: '買[か]います', jisho: '買[か]う', te: '買[か]って', ta: '買[か]った', nai: '買[か]わない', nakatta: '買[か]わなかった', ba: '買[か]えば', volitional: '買[か]おう', potential: '買[か]える', passive: '買[か]われる', causative: '買[か]わせる', causative_passive: '買[か]わされる', meaning: '買', difficulty: 'n5' },
  { group: 1, type: 'verb', masu: '待[ま]ちます', jisho: '待[ま]つ', te: '待[ま]って', ta: '待[ま]った', nai: '待[ま]たない', nakatta: '待[ま]たなかった', ba: '待[ま]てば', volitional: '待[ま]とう', potential: '待[ま]てる', passive: '待[ま]たれる', causative: '待[ま]たせる', causative_passive: '待[ま]たされる', meaning: '等待', difficulty: 'n5' },
  { group: 1, type: 'verb', masu: '帰[かえ]ります', jisho: '帰[かえ]る', te: '帰[かえ]って', ta: '帰[かえ]った', nai: '帰[かえ]らない', nakatta: '帰[かえ]らなかった', ba: '帰[かえ]れば', volitional: '帰[かえ]ろう', potential: '帰[かえ]れる', passive: '帰[かえ]られる', causative: '帰[かえ]らせる', causative_passive: '帰[かえ]らされる', meaning: '回家', difficulty: 'n5' },
  { group: 1, type: 'verb', masu: '飲[の]みます', jisho: '飲[の]む', te: '飲[の]んで', ta: '飲[の]んだ', nai: '飲[の]まない', nakatta: '飲[の]まなかった', ba: '飲[の]めば', volitional: '飲[の]もう', potential: '飲[の]める', passive: '飲[の]まれる', causative: '飲[の]ませる', causative_passive: '飲[の]まされる', meaning: '喝', difficulty: 'n5' },
  { group: 1, type: 'verb', masu: '遊[あそ]びます', jisho: '遊[あそ]ぶ', te: '遊[あそ]んで', ta: '遊[あそ]んだ', nai: '遊[あそ]ばない', nakatta: '遊[あそ]ばなかった', ba: '遊[あそ]べば', volitional: '遊[あそ]ぼう', potential: '遊[あそ]べる', passive: '遊[あそ]ばれる', causative: '遊[あそ]ばせる', causative_passive: '遊[あそ]ばされる', meaning: '玩', difficulty: 'n5' },
  { group: 1, type: 'verb', masu: '泳[およ]ぎます', jisho: '泳[およ]ぐ', te: '泳[およ]いで', ta: '泳[およ]いだ', nai: '泳[およ]がない', nakatta: '泳[およ]がなかった', ba: '泳[およ]げば', volitional: '泳[およ]ごう', potential: '泳[およ]げる', passive: '泳[およ]がれる', causative: '泳[およ]がせる', causative_passive: '泳[およ]がされる', meaning: '游泳', difficulty: 'n5' },
  { group: 1, type: 'verb', masu: '話[はな]します', jisho: '話[はな]す', te: '話[はな]して', ta: '話[はな]した', nai: '話[はな]さない', nakatta: '話[はな]さなかった', ba: '話[はな]せば', volitional: '話[はな]そう', potential: '話[はな]せる', passive: '話[はな]される', causative: '話[はな]させる', causative_passive: '話[はな]させられる', meaning: '說', difficulty: 'n5' },
  { group: 1, type: 'verb', masu: '書[か]きます', jisho: '書[か]く', te: '書[か]いて', ta: '書[か]いた', nai: '書[か]かない', nakatta: '書[か]かなかった', ba: '書[か]けば', volitional: '書[か]こう', potential: '書[か]ける', passive: '書[か]かれる', causative: '書[か]かせる', causative_passive: '書[か]かされる', meaning: '寫', difficulty: 'n5' },
  { group: 1, type: 'verb', masu: '聞[き]きます', jisho: '聞[き]く', te: '聞[き]いて', ta: '聞[き]いた', nai: '聞[き]かない', nakatta: '聞[き]かなかった', ba: '聞[き]けば', volitional: '聞[き]こう', potential: '聞[き]ける', passive: '聞[き]かれる', causative: '聞[き]かせる', causative_passive: '聞[き]かされる', meaning: '聽/問', difficulty: 'n5' },
  { group: 1, type: 'verb', masu: '会[あ]います', jisho: '会[あ]う', te: '会[あ]って', ta: '会[あ]った', nai: '会[あ]わない', nakatta: '会[あ]わなかった', ba: '会[あ]えば', volitional: '会[あ]おう', potential: '会[あ]える', passive: '会[あ]われる', causative: '会[あ]わせる', causative_passive: '会[あ]わされる', meaning: '見面', difficulty: 'n5' },
  { group: 1, type: 'verb', masu: '貸[か]します', jisho: '貸[か]す', te: '貸[か]して', ta: '貸[か]した', nai: '貸[か]さない', nakatta: '貸[か]さなかった', ba: '貸[か]せば', volitional: '貸[か]そう', potential: '貸[か]せる', passive: '貸[か]される', causative: '貸[か]させる', causative_passive: '貸[か]させられる', meaning: '借出', difficulty: 'n4' },
  { group: 1, type: 'verb', masu: '急[いそ]ぎます', jisho: '急[いそ]ぐ', te: '急[いそ]いで', ta: '急[いそ]いだ', nai: '急[いそ]がない', nakatta: '急[いそ]がなかった', ba: '急[いそ]げば', volitional: '急[いそ]ごう', potential: '急[いそ]げる', passive: '急[いそ]がれる', causative: '急[いそ]がせる', causative_passive: '急[いそ]がされる', meaning: '急忙', difficulty: 'n4' },
  
  { group: 2, type: 'verb', masu: '食[た]べます', jisho: '食[た]べる', te: '食[た]べて', ta: '食[た]べた', nai: '食[た]べない', nakatta: '食[た]べなかった', ba: '食[た]べれば', volitional: '食[た]べよう', potential: '食[た]べられる', passive: '食[た]べられる', causative: '食[た]べさせる', causative_passive: '食[た]べさせられる', meaning: '吃', difficulty: 'n5' },
  { group: 2, type: 'verb', masu: '見[み]ます', jisho: '見[み]る', te: '見[み]て', ta: '見[み]た', nai: '見[み]ない', nakatta: '見[み]なかった', ba: '見[み]れば', volitional: '見[み]よう', potential: '見[み]られる', passive: '見[み]られる', causative: '見[み]させる', causative_passive: '見[み]させられる', meaning: '看', difficulty: 'n5' },
  { group: 2, type: 'verb', masu: '起[お]きます', jisho: '起[お]きる', te: '起[お]きて', ta: '起[お]きた', nai: '起[お]きない', nakatta: '起[お]きなかった', ba: '起[お]きれば', volitional: '起[お]きよう', potential: '起[お]きられる', passive: '起[お]きられる', causative: '起[お]きさせる', causative_passive: '起[お]きさせられる', meaning: '起床', difficulty: 'n5' },
  { group: 2, type: 'verb', masu: '寝[ね]ます', jisho: '寝[ね]る', te: '寝[ね]て', ta: '寝[ね]た', nai: '寝[ね]ない', nakatta: '寝[ね]なかった', ba: '寝[ね]れば', volitional: '寝[ね]よう', potential: '寝[ね]られる', passive: '寝[ね]られる', causative: '寝[ね]させる', causative_passive: '寝[ね]させられる', meaning: '睡覺', difficulty: 'n5' },
  { group: 2, type: 'verb', masu: '忘[わす]れます', jisho: '忘[わす]れる', te: '忘[わす]れて', ta: '忘[わす]れた', nai: '忘[わす]れない', nakatta: '忘[わす]れなかった', ba: '忘[わす]れれば', volitional: '忘[わす]れよう', potential: '忘[わす]れられる', passive: '忘[わす]れられる', causative: '忘[わす]れさせる', causative_passive: '忘[わす]れさせられる', meaning: '忘記', difficulty: 'n5' },
  { group: 2, type: 'verb', masu: '開[あ]けます', jisho: '開[あ]ける', te: '開[あ]けて', ta: '開[あ]けた', nai: '開[あ]けない', nakatta: '開[あ]けなかった', ba: '開[あ]ければ', volitional: '開[あ]けよう', potential: '開[あ]けられる', passive: '開[あ]けられる', causative: '開[あ]けさせる', causative_passive: '開[あ]けさせられる', meaning: '打開', difficulty: 'n5' },
  { group: 2, type: 'verb', masu: '閉[し]めます', jisho: '閉[し]める', te: '閉[し]めて', ta: '閉[し]めた', nai: '閉[し]めない', nakatta: '閉[し]めなかった', ba: '閉[し]めれば', volitional: '閉[し]めよう', potential: '閉[し]められる', passive: '閉[し]められる', causative: '閉[し]めさせる', causative_passive: '閉[し]めさせられる', meaning: '關閉', difficulty: 'n5' },
  
  { group: 3, type: 'verb', masu: 'します', jisho: 'する', te: 'して', ta: 'した', nai: 'しない', nakatta: 'しなかった', ba: 'すれば', volitional: 'しよう', potential: 'できる', passive: 'される', causative: 'させる', causative_passive: 'させられる', meaning: '做', difficulty: 'n5' },
  { group: 3, type: 'verb', masu: '来[き]ます', jisho: '来[く]る', te: '来[き]て', ta: '来[き]た', nai: '来[こ]ない', nakatta: '来[こ]なかった', ba: '来[く]れば', volitional: '来[こ]よう', potential: '来[こ]られる', passive: '来[こ]られる', causative: '来[こ]させる', causative_passive: '来[こ]させられる', meaning: '來', difficulty: 'n5' },
  { group: 3, type: 'verb', masu: '勉強[べんきょう]します', jisho: '勉強[べんきょう]する', te: '勉強[べんきょう]して', ta: '勉強[べんきょう]した', nai: '勉強[べんきょう]しない', nakatta: '勉強[べんきょう]しなかった', ba: '勉強[べんきょう]すれば', volitional: '勉強[べんきょう]しよう', potential: '勉強[べんきょう]できる', passive: '勉強[べんきょう]される', causative: '勉強[べんきょう]させる', causative_passive: '勉強[べんきょう]させられる', meaning: '讀書', difficulty: 'n5' },
  { group: 3, type: 'verb', masu: '運転[うんてん]します', jisho: '運転[うんてん]する', te: '運転[うんてん]して', ta: '運転[うんてん]した', nai: '運転[うんてん]しない', nakatta: '運転[うんてん]しなかった', ba: '運転[うんてん]すれば', volitional: '運転[うんてん]しよう', potential: '運転[うんてん]できる', passive: '運転[うんてん]される', causative: '運転[うんてん]させる', causative_passive: '運転[うんてん]させられる', meaning: '駕駛', difficulty: 'n4' },

  { group: 'i', type: 'adj_i', masu: '大[おお]きいです', jisho: '大[おお]きい', te: '大[おお]きくて', ta: '大[おお]きかった', nai: '大[おお]きくない', nakatta: '大[おお]きくなかった', meaning: '大的', difficulty: 'n5' },
  { group: 'i', type: 'adj_i', masu: '高[たか]いです', jisho: '高[たか]い', te: '高[たか]くて', ta: '高[たか]かった', nai: '高[たか]くない', nakatta: '高[たか]くなかった', meaning: '高的/貴的', difficulty: 'n5' },
  { group: 'i', type: 'adj_i', masu: 'いいです', jisho: 'いい', te: 'よくて', ta: 'よかった', nai: 'よくない', nakatta: 'よくなかった', meaning: '好的', difficulty: 'n5', irregular: true },

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

const DEFAULT_FORM_OPTIONS = [
  { id: 'masu', label: 'ます形' },
  { id: 'jisho', label: '辭書形' },
  { id: 'te', label: 'て形' },
  { id: 'ta', label: 'た形' },
  { id: 'nai', label: 'ない形' },
  { id: 'nakatta', label: 'なかった形' },
  { id: 'ba', label: 'ば形 (條件形)' },
  { id: 'volitional', label: '意向形 (～よう)' },
  { id: 'potential', label: '可能形 (能～)' },
  { id: 'passive', label: '受身形 (被～)' },
  { id: 'causative', label: '使役形 (讓～)' },
  { id: 'causative_passive', label: '使役受身形 (被迫～)' }
];

const ALL_VERB_FORMS = ['jisho', 'masu', 'te', 'ta', 'nai', 'potential', 'passive', 'causative', 'volitional', 'imperative', 'causative_passive'];
const ACTIVE_VERB_FORMS = ['jisho', 'masu', 'te', 'ta', 'nai'];

const createDefaultVerbStats = () => {
  const stats = {};
  ALL_VERB_FORMS.forEach(form => {
    stats[form] = { correct: 0, wrong: 0, recentHistory: [] };
  });
  return stats;
};

const migrateVerb = (v) => {
  const newV = {
    ...v,
    status: v.status || 'not_started',
    recentHistory: v.recentHistory || [],
    stats: v.stats || createDefaultVerbStats(),
      tags: v.tags || (v.tag ? [v.tag] : [])
    };
  
  if (newV.stats && newV.stats.dictionary) {
    if (!newV.stats.jisho) {
      newV.stats.jisho = newV.stats.dictionary;
    } else {
      newV.stats.jisho.correct += newV.stats.dictionary.correct || 0;
      newV.stats.jisho.wrong += newV.stats.dictionary.wrong || 0;
      newV.stats.jisho.recentHistory = [...newV.stats.dictionary.recentHistory, ...newV.stats.jisho.recentHistory].slice(-20);
    }
    delete newV.stats.dictionary;
  }
  
  return newV;
};

const extractKanjiFromWord = (word) => {
  if (!word) return [];
  const matches = word.match(/[\u4e00-\u9faf]/g);
  return matches ? Array.from(new Set(matches)) : [];
};

const syncKanjiDB = (vocabDB, currentKanjiDB) => {
  let updated = false;
  const newKanjiDB = [...currentKanjiDB];
  const existingKanjis = new Set(newKanjiDB.map(k => k.kanji));

  vocabDB.forEach(vocab => {
    const kanjis = extractKanjiFromWord(vocab.word);
    kanjis.forEach(k => {
      if (!existingKanjis.has(k)) {
        existingKanjis.add(k);
        newKanjiDB.push({
            id: `k_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            kanji: k,
            meaning: '',
            tags: [],
          jlptLevel: 'Unknown',
          dateAdded: Date.now()
        });
        updated = true;
      }
    });
  });

  return updated ? newKanjiDB : currentKanjiDB;
};

const getWeakestVerbForms = (db) => {
  const formAccuracies = {};
  
  ACTIVE_VERB_FORMS.forEach(form => {
    let totalCorrect = 0;
    let totalWrong = 0;
    db.forEach(verb => {
       if (verb.stats && verb.stats[form]) {
           totalCorrect += verb.stats[form].correct;
           totalWrong += verb.stats[form].wrong;
       }
    });
    const totalAttempts = totalCorrect + totalWrong;
    formAccuracies[form] = totalAttempts === 0 ? 0 : totalCorrect / totalAttempts;
  });

  return Object.entries(formAccuracies).sort((a, b) => a[1] - b[1]);
};

const generateVerbQuestion = (db) => {
  if (!db || db.length === 0) return null;

  const sortedForms = getWeakestVerbForms(db);
  // Give 70% chance to pick the absolute weakest form, 30% for a random active form
  const targetForm = Math.random() < 0.7 ? sortedForms[0][0] : ACTIVE_VERB_FORMS[Math.floor(Math.random() * ACTIVE_VERB_FORMS.length)];
  
  let candidateVerbs = db.filter(v => v.status !== 'mastered');
  if (candidateVerbs.length === 0) candidateVerbs = db;
  const selectedVerb = candidateVerbs[Math.floor(Math.random() * candidateVerbs.length)];
  
  let baseForm, targetQuestionForm;
  
  if (Math.random() > 0.5 && targetForm !== 'jisho') {
     baseForm = 'jisho';
     targetQuestionForm = targetForm;
  } else {
     targetQuestionForm = 'jisho';
     baseForm = targetForm === 'jisho' ? 'masu' : targetForm;
  }
  
  const forms = autoConjugateVerb(selectedVerb.masu, selectedVerb.group?.toString() || (selectedVerb.type === 'verb' ? (selectedVerb.jisho.endsWith('る') ? '2' : '1') : '')) || selectedVerb;
  
  return {
    verbId: selectedVerb.id,
    baseForm: baseForm,
    targetForm: targetQuestionForm,
    baseWord: forms[baseForm] || selectedVerb[baseForm],
    correctAnswer: forms[targetQuestionForm] || selectedVerb[targetQuestionForm],
    testedForm: targetForm
  };
};

const handleVerbAnswer = (verbId, form, isCorrect, db) => {
    return db.map(v => {
        if (v.id !== verbId) return v;
        const newVerb = { ...v };
        if (!newVerb.stats) newVerb.stats = createDefaultVerbStats();
        if (!newVerb.stats[form]) newVerb.stats[form] = { correct: 0, wrong: 0, recentHistory: [] };
        
        if (isCorrect) newVerb.stats[form].correct += 1;
        else newVerb.stats[form].wrong += 1;
        newVerb.stats[form].recentHistory = [...newVerb.stats[form].recentHistory, isCorrect].slice(-20);
        
        if (!newVerb.recentHistory) newVerb.recentHistory = [];
        newVerb.recentHistory = [...newVerb.recentHistory, isCorrect].slice(-20);
        
        if (newVerb.recentHistory.length >= 20) {
            const globalAccuracy = newVerb.recentHistory.filter(Boolean).length / 20;
            if (globalAccuracy >= 0.9 && newVerb.status !== 'mastered') {
                newVerb.status = 'mastered';
            } else if (globalAccuracy < 0.8 && newVerb.status === 'mastered') {
                newVerb.status = 'learning';
            }
        } else if (newVerb.status === 'not_started') {
            newVerb.status = 'learning';
        }
        
        return newVerb;
    });
};

const autoConjugateVerb = (masuStr, group) => {
    if (!masuStr || typeof masuStr !== 'string' || !masuStr.endsWith('ます')) return null;
    const match = masuStr.match(/^(.*?)(.)ます$/);
    if (!match) return null;
    let [ , prefix, iDan ] = match;
    
    // Group 2
    if (group === '2') {
        const stem = prefix + iDan;
        return { jisho: stem + 'る', te: stem + 'て', ta: stem + 'た', nai: stem + 'ない', nakatta: stem + 'なかった' };
    }
    
    // Group 3
    if (group === '3') {
        if (masuStr === 'します' || masuStr === 'し[し]ます') return { jisho: 'する', te: 'して', ta: 'した', nai: 'しない', nakatta: 'しなかった' };
        if (masuStr === '来[き]ます' || masuStr === 'きます') return { jisho: masuStr.includes('[') ? '来[く]る' : 'くる', te: masuStr.includes('[') ? '来[き]て' : 'きて', ta: masuStr.includes('[') ? '来[き]た' : 'きた', nai: masuStr.includes('[') ? '来[こ]ない' : 'こない', nakatta: masuStr.includes('[') ? '来[こ]なかった' : 'こなかった' };
        const nMatch = masuStr.match(/^(.*?)します$/);
        if (nMatch) {
            const n = nMatch[1];
            return { jisho: n + 'する', te: n + 'して', ta: n + 'した', nai: n + 'しない', nakatta: n + 'しなかった' };
        }
    }
    
    // Group 1
    if (group === '1') {
        const iToU = { 'い': 'う', 'き': 'く', 'ぎ': 'ぐ', 'し': 'す', 'ち': 'つ', 'に': 'ぬ', 'ひ': 'ふ', 'び': 'ぶ', 'み': 'む', 'り': 'る' };
        const iToA = { 'い': 'わ', 'き': 'か', 'ぎ': 'が', 'し': 'さ', 'ち': 'た', 'に': 'な', 'ひ': 'は', 'び': 'ば', 'み': 'ま', 'り': 'ら' };
        const iToTe = { 'い': 'って', 'ち': 'って', 'り': 'って', 'み': 'んで', 'に': 'んで', 'び': 'んで', 'き': 'いて', 'ぎ': 'いで', 'し': 'して' };
        const iToTa = { 'い': 'った', 'ち': 'った', 'り': 'った', 'み': 'んだ', 'に': 'んだ', 'び': 'んだ', 'き': 'いた', 'ぎ': 'いだ', 'し': 'した' };
        
        if (masuStr === '行[い]きます' || masuStr === 'いきます') {
             const rt = masuStr.includes('[') ? '行[い]' : 'い';
             return { jisho: rt + 'く', te: rt + 'って', ta: rt + 'った', nai: rt + 'かない', nakatta: rt + 'かなかった' };
        }
        
        const uDan = iToU[iDan] || '';
        const aDan = iToA[iDan] || '';
        const teForm = iToTe[iDan] || '';
        const taForm = iToTa[iDan] || '';
        
        if (!uDan) return null;
        
        return {
            jisho: prefix + uDan,
            te: prefix + teForm,
            ta: prefix + taForm,
            nai: prefix + aDan + 'ない',
            nakatta: prefix + aDan + 'なかった'
        };
    }
    
    return null;
};

const KNOWN_FORM_RULES = {
  // ます幹系列
  'ました形':        { base: 'masu_stem', suffix: 'ました' },
  'ません形':        { base: 'masu_stem', suffix: 'ません' },
  'ませんでした形':  { base: 'masu_stem', suffix: 'ませんでした' },
  'ましょう形':      { base: 'masu_stem', suffix: 'ましょう' },
  'ませんか形':      { base: 'masu_stem', suffix: 'ませんか' },
  'ましょうか形':    { base: 'masu_stem', suffix: 'ましょうか' },
  'ながら形':        { base: 'masu_stem', suffix: 'ながら' },
  'やすい形':        { base: 'masu_stem', suffix: 'やすい' },
  'にくい形':        { base: 'masu_stem', suffix: 'にくい' },
  'すぎる形':        { base: 'masu_stem', suffix: 'すぎる' },
  'かた形':          { base: 'masu_stem', suffix: 'かた' },
  '方形':            { base: 'masu_stem', suffix: 'かた' },
  // て形系列
  'てください形':    { base: 'te', suffix: 'ください' },
  'てもいい形':      { base: 'te', suffix: 'もいい' },
  'てもいいです形':  { base: 'te', suffix: 'もいいです' },
  'てはいけない形':  { base: 'te', suffix: 'はいけない' },
  'てはだめ形':      { base: 'te', suffix: 'はだめ' },
  'ている形':        { base: 'te', suffix: 'いる' },
  'てある形':        { base: 'te', suffix: 'ある' },
  'てみる形':        { base: 'te', suffix: 'みる' },
  'てしまう形':      { base: 'te', suffix: 'しまう' },
  'てから形':        { base: 'te', suffix: 'から' },
  'てほしい形':      { base: 'te', suffix: 'ほしい' },
  'てあげる形':      { base: 'te', suffix: 'あげる' },
  'てくれる形':      { base: 'te', suffix: 'くれる' },
  'てもらう形':      { base: 'te', suffix: 'もらう' },
  'ておく形':        { base: 'te', suffix: 'おく' },
  // た形系列
  'たことがある形':  { base: 'ta', suffix: 'ことがある' },
  'たほうがいい形':  { base: 'ta', suffix: 'ほうがいい' },
  'たら形':          { base: 'ta', suffix: 'ら' },
  'たり形':          { base: 'ta', suffix: 'り' },
  'たばかり形':      { base: 'ta', suffix: 'ばかり' },
  'たところ形':      { base: 'ta', suffix: 'ところ' },
  // ない形系列
  'ないでください形': { base: 'nai', suffix: 'でください' },
  'ないほうがいい形': { base: 'nai', suffix: 'ほうがいい' },
  'ないで形':         { base: 'nai', suffix: 'で' },
  'ないうちに形':     { base: 'nai', suffix: 'うちに' },
  // ない幹系列
  'なければならない形':  { base: 'nai_stem', suffix: 'ければならない' },
  'なければいけない形':  { base: 'nai_stem', suffix: 'ければいけない' },
  'なくてもいい形':      { base: 'nai_stem', suffix: 'くてもいい' },
  'なくてはならない形':  { base: 'nai_stem', suffix: 'くてはならない' },
  'なくてはいけない形':  { base: 'nai_stem', suffix: 'くてはいけない' },
  'なくなる形':          { base: 'nai_stem', suffix: 'くなる' },
  // 辭書形系列
  'ことができる形':    { base: 'jisho', suffix: 'ことができる' },
  'つもりだ形':        { base: 'jisho', suffix: 'つもりだ' },
  'はずだ形':          { base: 'jisho', suffix: 'はずだ' },
  'ようだ形':          { base: 'jisho', suffix: 'ようだ' },
  'らしい形':          { base: 'jisho', suffix: 'らしい' },
  'ために形':          { base: 'jisho', suffix: 'ために' },
  'まえに形':          { base: 'jisho', suffix: 'まえに' },
  'ところだ形':        { base: 'jisho', suffix: 'ところだ' },
  'かもしれない形':    { base: 'jisho', suffix: 'かもしれない' },
  'と思う形':          { base: 'jisho', suffix: 'と思う' },
  'ことにする形':      { base: 'jisho', suffix: 'ことにする' },
  'ことになる形':      { base: 'jisho', suffix: 'ことになる' },
  'ようにする形':      { base: 'jisho', suffix: 'ようにする' },
  'ようになる形':      { base: 'jisho', suffix: 'ようになる' },
  'まで形':            { base: 'jisho', suffix: 'まで' },
  'まえ形':            { base: 'jisho', suffix: 'まえ' },
};
const QUICK_ADD_FORMS = [
  { label: 'ました形' }, { label: 'ません形' }, { label: 'ませんでした形' }, { label: 'ましょう形' },
  { label: 'ながら形' }, { label: 'やすい形' }, { label: 'にくい形' },
  { label: 'てください形' }, { label: 'てもいい形' }, { label: 'てはいけない形' },
  { label: 'ている形' }, { label: 'てみる形' }, { label: 'てしまう形' }, { label: 'てから形' },
  { label: 'たことがある形' }, { label: 'たほうがいい形' }, { label: 'たら形' }, { label: 'たばかり形' },
  { label: 'ないでください形' }, { label: 'なければならない形' }, { label: 'なくてもいい形' },
  { label: 'ことができる形' }, { label: 'つもりだ形' }, { label: 'はずだ形' }, { label: 'かもしれない形' },
  { label: 'ことにする形' }, { label: 'ようになる形' },
];

const GRAMMAR_ADJ_FORMS = [
  { id: 'adj_all', label: '形容詞(全)' },
  { id: 'adj_i',  label: 'い形容詞' },
  { id: 'adj_na', label: 'な形容詞' },
  { id: 'noun',   label: '名詞' },
];

const BASE_FORM_COLORS = {
  masu:             'bg-blue-100 text-blue-700 border-blue-200',
  jisho:            'bg-indigo-100 text-indigo-700 border-indigo-200',
  te:               'bg-emerald-100 text-emerald-700 border-emerald-200',
  ta:               'bg-teal-100 text-teal-700 border-teal-200',
  nai:              'bg-rose-100 text-rose-700 border-rose-200',
  nakatta:          'bg-orange-100 text-orange-700 border-orange-200',
  ba:               'bg-violet-100 text-violet-700 border-violet-200',
  volitional:       'bg-amber-100 text-amber-700 border-amber-200',
  potential:        'bg-cyan-100 text-cyan-700 border-cyan-200',
  passive:          'bg-slate-100 text-slate-600 border-slate-300',
  causative:        'bg-purple-100 text-purple-700 border-purple-200',
  causative_passive:'bg-pink-100 text-pink-700 border-pink-200',
  adj_i:            'bg-lime-100 text-lime-700 border-lime-300',
  adj_na:           'bg-yellow-100 text-yellow-700 border-yellow-300',
  adj_all:          'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  noun:             'bg-amber-100 text-amber-900 border-amber-500',
};
const BASE_FORM_COLOR_FALLBACK = [
  'bg-sky-100 text-sky-700 border-sky-200',
  'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  'bg-red-100 text-red-700 border-red-200',
  'bg-green-100 text-green-700 border-green-200',
];
const getBaseFormStyle = (id) => {
  if (BASE_FORM_COLORS[id]) return BASE_FORM_COLORS[id];
  const idx = Math.abs([...id].reduce((a, c) => a + c.charCodeAt(0), 0)) % BASE_FORM_COLOR_FALLBACK.length;
  return BASE_FORM_COLOR_FALLBACK[idx];
};

const BASE_FORM_CARD_STYLES = {
  masu:             { bg: 'bg-blue-50',    border: 'border-blue-200',    hover: 'hover:border-blue-400',    underline: 'border-blue-400' },
  jisho:            { bg: 'bg-indigo-50',  border: 'border-indigo-200',  hover: 'hover:border-indigo-400',  underline: 'border-indigo-400' },
  te:               { bg: 'bg-emerald-50', border: 'border-emerald-200', hover: 'hover:border-emerald-400', underline: 'border-emerald-400' },
  ta:               { bg: 'bg-teal-50',    border: 'border-teal-200',    hover: 'hover:border-teal-400',    underline: 'border-teal-400' },
  nai:              { bg: 'bg-rose-50',    border: 'border-rose-200',    hover: 'hover:border-rose-400',    underline: 'border-rose-400' },
  nakatta:          { bg: 'bg-orange-50',  border: 'border-orange-200',  hover: 'hover:border-orange-400',  underline: 'border-orange-400' },
  ba:               { bg: 'bg-violet-50',  border: 'border-violet-200',  hover: 'hover:border-violet-400',  underline: 'border-violet-400' },
  volitional:       { bg: 'bg-amber-50',   border: 'border-amber-200',   hover: 'hover:border-amber-400',   underline: 'border-amber-400' },
  potential:        { bg: 'bg-cyan-50',    border: 'border-cyan-200',    hover: 'hover:border-cyan-400',    underline: 'border-cyan-400' },
  passive:          { bg: 'bg-slate-50',   border: 'border-slate-200',   hover: 'hover:border-slate-400',   underline: 'border-slate-400' },
  causative:        { bg: 'bg-purple-50',  border: 'border-purple-200',  hover: 'hover:border-purple-400',  underline: 'border-purple-400' },
  causative_passive:{ bg: 'bg-pink-50',    border: 'border-pink-200',    hover: 'hover:border-pink-400',    underline: 'border-pink-400' },
  adj_i:            { bg: 'bg-lime-50',    border: 'border-lime-200',    hover: 'hover:border-lime-400',    underline: 'border-lime-400' },
  adj_na:           { bg: 'bg-yellow-50',  border: 'border-yellow-200',  hover: 'hover:border-yellow-400',  underline: 'border-yellow-500' },
  adj_all:          { bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', hover: 'hover:border-fuchsia-400', underline: 'border-fuchsia-400' },
  noun:             { bg: 'bg-amber-50',   border: 'border-amber-300',   hover: 'hover:border-amber-500',   underline: 'border-amber-600' },
};
const getBaseFormCardStyle = (id) => BASE_FORM_CARD_STYLES[id] || { bg: 'bg-white', border: 'border-slate-200', hover: 'hover:border-emerald-300', underline: 'border-slate-300' };

const DEFAULT_GRAMMARS = [
  { id: 'g_tai', name: '想要 ( ＿たい)', baseForm: 'masu', removeStr: 'ます', appendStr: 'たい', appliesTo: ['verb'], example: '私は日本へ行きたいです' },
  { id: 'g_nakereba', name: '必須 ( ＿なければなりません)', baseForm: 'nai', removeStr: 'い', appendStr: 'ければなりません', appliesTo: ['verb'], example: '明日早く起きなければなりません' }
];


const DEFAULT_TAG_SUGGESTIONS = ['N5', 'N4', 'N3', 'N2', 'N1', '重要', '易錯', '必背', '留學', '生活', '學校', '打工'];

const processTags = (tagStrOrArray) => {
    let arr = [];
    if (typeof tagStrOrArray === 'string') {
        arr = tagStrOrArray.split(/[,，、]/);
    } else if (Array.isArray(tagStrOrArray)) {
        arr = tagStrOrArray;
    }
    const uniqueTags = new Set();
    arr.forEach(t => {
        let clean = t.trim();
        if (!clean) return;
        clean = clean.replace(/^[nｎＮ]\s*([1-5])$/i, 'N$1');
        uniqueTags.add(clean);
    });
    return Array.from(uniqueTags);
};

const TagEditor = ({ tags, onChange, tagStats, tagKeywordsMap, onTagKeywordsChange }) => {
    const allExistingTags = Object.keys(tagStats).sort((a,b) => tagStats[b] - tagStats[a]);
    const suggestions = Array.from(new Set([...DEFAULT_TAG_SUGGESTIONS, ...allExistingTags]));
    const [inputValue, setInputValue] = React.useState(tags ? tags.join(', ') : '');
    const [isOpen, setIsOpen] = React.useState(false);
    const [isKwOpen, setIsKwOpen] = React.useState(false);

    React.useEffect(() => {
        setInputValue(tags ? tags.join(', ') : '');
    }, [tags]);

    const handleBlur = () => {
        const newTags = processTags(inputValue);
        onChange(newTags);
        setInputValue(newTags.join(', '));
    };

    const toggleTag = (t) => {
        let current = processTags(inputValue);
        if (current.includes(t)) current = current.filter(x => x !== t);
        else current.push(t);
        const newStr = current.join(', ');
        setInputValue(newStr);
        onChange(current);
    };

    const handleKwChange = (tag, rawValue) => {
        if (!onTagKeywordsChange) return;
        const kws = rawValue.split(/[,，、\s]+/).map(k => k.trim()).filter(k => k.length >= 2);
        onTagKeywordsChange(prev => ({ ...prev, [tag]: kws }));
    };

    const kwTags = Array.from(new Set([...allExistingTags, ...processTags(inputValue)])).filter(t => t);

    return (
        <div className="mt-2 mb-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <label className="block text-xs font-bold text-slate-500 mb-1">標籤 (可用半形逗號分隔)</label>
            <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onBlur={handleBlur} onKeyDown={e => e.key === 'Enter' && handleBlur()} placeholder="例如: N4, 重要, 學校" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none mb-2"/>
            <button type="button" onClick={() => setIsOpen(v => !v)} className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors">
                <span>建議標籤 ({suggestions.length} 個)</span>
                <span className="text-slate-400">{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && (
                <div className="flex flex-wrap gap-1.5 mt-2 p-1">
                    {suggestions.map(t => {
                        const isActive = processTags(inputValue).includes(t);
                        return <button key={t} onClick={(e) => { e.preventDefault(); toggleTag(t); }} className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition-colors ${isActive ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}>{t} {tagStats[t] ? <span className="opacity-70 font-normal ml-1">({tagStats[t]})</span> : ''}</button>
                    })}
                </div>
            )}
            {onTagKeywordsChange && (
                <>
                    <button type="button" onClick={() => setIsKwOpen(v => !v)} className="w-full flex items-center justify-between px-2 py-1.5 mt-1 rounded-lg text-xs font-bold text-violet-600 hover:bg-violet-50 transition-colors">
                        <span>🔑 辨識關鍵字設定</span>
                        <span className="text-violet-400">{isKwOpen ? '▲' : '▼'}</span>
                    </button>
                    {isKwOpen && (
                        <div className="mt-2 space-y-2">
                            <p className="text-[10px] text-slate-400 px-1">為標籤設定關鍵字後，新增單字時系統能自動配對。關鍵字需 2 字以上，用逗號分隔。</p>
                            {kwTags.map(t => (
                                <div key={t} className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-slate-600 w-16 shrink-0 truncate">{t}</span>
                                    <input
                                        type="text"
                                        defaultValue={(tagKeywordsMap?.[t] || []).join(', ')}
                                        onBlur={e => handleKwChange(t, e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleKwChange(t, e.target.value)}
                                        placeholder="旅行, 機場, 飯店"
                                        className="flex-1 px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-lg focus:border-violet-400 focus:ring-1 focus:ring-violet-100 outline-none"
                                    />
                                </div>
                            ))}
                            {kwTags.length === 0 && <p className="text-[11px] text-slate-400 px-1">先新增標籤才能設定關鍵字</p>}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const renderTags = (tags, onTagClick) => {
    if (!tags || !Array.isArray(tags) || tags.length === 0) return null;
    return (
        <div className="flex flex-wrap gap-1 mt-1">
            {tags.map(t => (
                <span
                  key={t}
                  onClick={onTagClick ? (e) => { e.stopPropagation(); onTagClick(t); } : undefined}
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md border ${getTagStyle(t)}${onTagClick ? ' cursor-pointer hover:opacity-75 transition-opacity' : ''}`}
                >
                  {t}
                </span>
            ))}
        </div>
    );
};

const getTagStyle = (tag) => {
    if (!tag) return 'bg-slate-50 text-slate-600 border-slate-200';
    if (tag === '自訂') return 'bg-slate-100 text-slate-700 border-slate-300';
    // JLPT 等級
    if (tag === 'N5') return 'bg-green-100 text-green-700 border-green-300';
    if (tag === 'N4') return 'bg-blue-100 text-blue-700 border-blue-300';
    if (tag === 'N3') return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    if (tag === 'N2') return 'bg-orange-100 text-orange-700 border-orange-300';
    if (tag === 'N1') return 'bg-red-100 text-red-700 border-red-300';
    // 學習優先度
    if (tag === '重要') return 'bg-amber-100 text-amber-700 border-amber-300';
    if (tag === '易錯') return 'bg-red-100 text-red-700 border-red-300';
    if (tag === '必背') return 'bg-rose-100 text-rose-700 border-rose-300';
    // 情境
    if (tag === '留學' || tag === '學校') return 'bg-indigo-100 text-indigo-700 border-indigo-300';
    if (tag === '打工') return 'bg-cyan-100 text-cyan-700 border-cyan-300';
    if (tag === '生活') return 'bg-teal-100 text-teal-700 border-teal-300';
    // 字典主題
    if (tag === '考駕照') return 'bg-orange-100 text-orange-700 border-orange-300';
    if (tag.includes('專門學校') || tag.includes('語言學校')) return 'bg-indigo-100 text-indigo-700 border-indigo-300';
    if (tag.includes('職場打工')) return 'bg-cyan-100 text-cyan-700 border-cyan-300';
    if (tag.includes('生活形容詞')) return 'bg-slate-100 text-slate-700 border-slate-300';
    if (tag === 'JLPT') return 'bg-purple-100 text-purple-700 border-purple-300';
    // THEME_KEYWORDS 主題
    if (tag.includes('飲食')) return 'bg-amber-100 text-amber-700 border-amber-300';
    if (tag.includes('交通')) return 'bg-blue-100 text-blue-700 border-blue-300';
    if (tag.includes('服裝')) return 'bg-pink-100 text-pink-700 border-pink-300';
    if (tag.includes('身體')) return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    if (tag.includes('想法')) return 'bg-purple-100 text-purple-700 border-purple-300';
    if (tag.includes('購物') || tag.includes('金錢')) return 'bg-rose-100 text-rose-700 border-rose-300';
    if (tag.includes('居住') || tag.includes('生活')) return 'bg-teal-100 text-teal-700 border-teal-300';
    if (tag.includes('工作') || tag.includes('職場')) return 'bg-cyan-100 text-cyan-700 border-cyan-300';
    if (tag.includes('娛樂') || tag.includes('休閒')) return 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300';
    if (tag.includes('學習') || tag.includes('教育')) return 'bg-indigo-100 text-indigo-700 border-indigo-300';
    if (tag.includes('自然') || tag.includes('天氣')) return 'bg-lime-100 text-lime-700 border-lime-300';
    if (tag.includes('時間') || tag.includes('日期')) return 'bg-sky-100 text-sky-700 border-sky-300';
    if (tag.includes('問候') || tag.includes('社交')) return 'bg-violet-100 text-violet-700 border-violet-300';
    if (tag.includes('感情') || tag.includes('心情')) return 'bg-pink-100 text-pink-700 border-pink-300';
    if (tag.includes('人物') || tag.includes('個性')) return 'bg-amber-100 text-amber-700 border-amber-300';
    if (tag.includes('外觀') || tag.includes('形狀')) return 'bg-purple-100 text-purple-700 border-purple-300';
    if (tag.includes('狀態') || tag.includes('程度')) return 'bg-cyan-100 text-cyan-700 border-cyan-300';
    if (tag.includes('美感') || tag.includes('藝術')) return 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300';
    if (tag.includes('社會') || tag.includes('人際')) return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    if (tag.includes('科技') || tag.includes('媒體')) return 'bg-blue-100 text-blue-700 border-blue-300';
    if (tag.includes('政治') || tag.includes('法律')) return 'bg-red-100 text-red-700 border-red-300';
    if (tag.includes('醫療') || tag.includes('科學')) return 'bg-teal-100 text-teal-700 border-teal-300';
    if (tag.includes('環境') || tag.includes('資源')) return 'bg-lime-100 text-lime-700 border-lime-300';
    // 其他：固定 hash
    const colors = [
        'bg-indigo-100 text-indigo-700 border-indigo-300',
        'bg-rose-100 text-rose-700 border-rose-300',
        'bg-teal-100 text-teal-700 border-teal-300',
        'bg-orange-100 text-orange-700 border-orange-300',
        'bg-cyan-100 text-cyan-700 border-cyan-300',
        'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300',
        'bg-lime-100 text-lime-700 border-lime-300',
        'bg-sky-100 text-sky-700 border-sky-300',
        'bg-violet-100 text-violet-700 border-violet-300',
        'bg-emerald-100 text-emerald-700 border-emerald-300',
        'bg-pink-100 text-pink-700 border-pink-300',
        'bg-amber-100 text-amber-700 border-amber-300'
    ];
    let hash = 5381;
    for (let i = 0; i < tag.length; i++) { hash = ((hash << 5) + hash) + tag.charCodeAt(i); }
    return colors[Math.abs(hash) % colors.length];
};

const THEME_KEYWORDS = {
    '飲食與餐具': /吃飯|吃東西|喝水|喝酒|吃|喝|菜|肉類|飯|茶|咖啡|餐廳|餐點|甜點|食物|料理|味道|酒|水果|果汁|糖|鹽|醬油|碗|杯子|筷子|盤子|湯|麵|米飯|蛋|魚|牛肉|豬肉|雞肉|奶|油|煮飯|炒菜|烤|切菜|廚房|點心|便當|早餐|午餐|晚餐|零食|飲料|渴|餓|飽|辣|酸|苦|甘甜|蔬菜|海鮮|壽司|拉麵|炒飯|味噌|醬汁/,
    '交通': /火車|電車|捷運|地鐵|公車|巴士|計程車|腳踏車|機車|汽車|飛機|船隻|開車|騎車|搭車|駕駛|過站|轉乘|高鐵|新幹線|交通工具|搭乘|乘坐|出發|抵達|班機|航班|渡輪|纜車|搭飛機|搭火車|搭公車|交通|換乘|大眾運輸/,
    '地點': /公園|學校|醫院|銀行|郵局|超市|百貨公司|機場|車站|城市|街道|國家|地址|地圖|圖書館|餐廳|咖啡廳|便利商店|體育館|博物館|美術館|動物園|水族館|神社|寺廟|教堂|公寓|大樓|社區|附近|東邊|西邊|南邊|北邊|右邊|左邊|前面|後面|場所|地方|住所|目的地|商店街|辦公室/,
    '服裝與配件': /衣服|褲子|鞋子|帽子|穿衣|脫衣|換衣|試穿|襪子|裙子|外套|西裝|領帶|手套|圍巾|背包|眼鏡|手錶|戒指|項鍊|耳環|拉鍊|毛衣|洋裝|T恤|牛仔褲|大衣|羽絨衣|運動服|制服|和服|服裝|服飾|時尚|流行穿搭/,
    '身體與健康': /身體|生病|疼痛|手臂|腳|頭痛|心臟|眼睛|耳朵|鼻子|牙齒|舌頭|臉|肩膀|背部|腰部|胸部|腹部|膝蓋|手指|頭髮|皮膚|骨頭|血液|藥物|醫院|診所|治療|休息|睡眠|發燒|感冒|過敏|受傷|健康|體力|元氣|疲憊|精神|跌倒|摔倒|扭到|扭傷|骨折|肌肉|手術|醫生|護士|注射|打針|復健|咳嗽|頭暈|噁心|呼吸|運動傷害/,
    '想法與意見': /認為|覺得|思考|考慮|決定|選擇|相信|懷疑|希望|願望|夢想|害怕|擔心|煩惱|感覺|情緒|懂得|知道|明白|記得|忘記|判斷|評論|回答|解決|後悔|驚訝|好奇|如果|假如|若是|假設|意見|看法|理解|誤解|同意|反對|贊成|主張|認識|了解|期待|想要|認知/,
    '購物與金錢': /買東西|買|賣|購物|付錢|找錢|換錢|借錢|還錢|借出|借入|出租|租借|租金|貴|便宜|免費|折扣|價格|價值|計算|多少錢|零錢|萬元|千元|收錢|存錢|花錢|稅金|帳單|信用卡|現金|打折|特價|商品|貨物|訂購|網購|市場|超商|消費|費用|優惠|發票|收據/,
    '居住與生活': /家裡|居住|宿舍|房間|洗澡|打掃|門口|窗戶|牆壁|房屋|樓梯|客廳|臥室|廚房|浴室|廁所|床鋪|桌子|椅子|燈光|電器|冷氣|暖氣|冰箱|微波爐|洗衣機|垃圾|鑰匙|鄰居|租房|搬家|修理|裝潢|整理|打掃|煮飯|日常生活|起床|刷牙|化妝|開燈|關門|安靜|吵鬧|漱口/,
    '學習與教育': /學習|讀書|書本|寫字|教學|課程|文字|語言|算術|考試|題目|成績|合格|畢業|入學|班級|校園|老師|學生|鉛筆|紙張|筆記本|黑板|作業|練習|複習|預習|背單字|查字典|翻譯|文法|單字|漢字|假名|片假名|平假名|困難|簡單/,
    '工作與職場': /工作|上班|職業|業務|勤務|請假|會議|辦公室|公司|社長|部門|課長|報告|計畫|企劃|客戶|電話|郵件|寄信|收件|列印|複印|傳真|下班|加班|出差|薪水|薪資|履歷|面試|同事|老闆|主管|員工|任務|緊急|忙碌/,
    '娛樂與休閒': /玩耍|遊戲|娛樂|唱歌|跑步|游泳|爬山|海邊|旅遊|旅行|拍照|攝影|畫畫|看電影|電影|電視|音樂|漫畫|動漫|網路|運動|棒球|籃球|足球|網球|釣魚|散步|野餐|露營|節慶|派對|舞蹈|演出|練習|休閒|嗜好|興趣/,
    '自然與天氣': /天氣|下雨|下雪|颳風|天晴|陰天|起霧|打雷|暴風|溫度|炎熱|寒冷|涼爽|溫暖|春天|夏天|秋天|冬天|花朵|草地|樹木|森林|山岳|河川|海洋|湖泊|島嶼|石頭|土地|天空|陽光|黑暗|紅色|藍色|綠色|黃色|白色|黑色|動物|貓咪|狗狗|鳥類|昆蟲|大自然|季節|氣溫|颱風/,
    '時間與日期': /星期|幾點|幾分|幾秒|今年|今月|今天|昨天|明天|後天|這週|早上|晚上|中午|夜晚|早晨|傍晚|時間|期間|開始|結束|很久|快點|慢慢|新的|舊的|古老|上次|下次|每天|常常|偶爾|總是|已經|還沒|剛剛|馬上|立刻|將要|過去|未來|現在|等待|月份|日期|年度|週末|假日|時刻/,
    '問候與社交': /你好|我們|他們|她們|名字|姓名|年齡|男生|女生|兒子|父親|母親|兄弟|姐妹|朋友|家人|親戚|夫妻|丈夫|妻子|孩子|老人|年輕人|先生|小姐|同學|夥伴|見面|打招呼|介紹|謝謝|道歉|拜託|請問|再見|歡迎|祝賀|禮物|邀請|約定|聚會|說話|聊天/,
    '感情與心情': /高興|開心|快樂|幸福|興奮|感動|滿足|舒適|愉快|難過|悲傷|傷心|痛苦|絕望|失望|後悔|寂寞|孤獨|害怕|恐懼|緊張|不安|擔心|焦慮|憤怒|生氣|煩躁|羞恥|害羞|尷尬|嫉妒|羨慕|驚訝|震驚|感激|懷念|思念|無聊|疲憊|輕鬆|平靜|溫暖|冷漠|憂鬱/,
    '人物個性': /親切|溫柔|善良|友善|熱情|體貼|細心|耐心|真誠|誠實|正直|謙虛|謙遜|禮貌|有禮|認真|勤勞|努力|積極|主動|冷靜|沉著|成熟|穩重|嚴格|嚴厲|傲慢|自大|懶惰|粗心|粗魯|固執|任性|敏感|脆弱|堅強|勇敢|膽小|樂觀|悲觀|聰明|聰穎|優秀|有才|創意|幽默|風趣|老實|坦率/,
    '外觀與形狀': /巨大|微小|高大|矮小|苗條|肥胖|長的|短的|粗的|細的|寬廣|狹窄|厚的|薄的|圓形|方形|扁平|尖銳|平坦|彎曲|筆直|重量|輕巧|堅硬|柔軟|粗糙|光滑|整齊|凌亂|透明|不透明|鮮豔|暗淡|明亮|黑暗|清晰|模糊|深色|淺色|遠近|廣闊|狹小/,
    '狀態與程度': /嚴重|輕微|嚴格|寬鬆|複雜|簡單|困難|容易|特殊|普通|正常|異常|奇怪|奇特|特別|一般|常見|罕見|重要|次要|必要|不必要|有用|無用|有效|無效|完整|不完整|充分|不足|過多|過少|剛好|適當|不當|合適|不合適|正確|錯誤|準確|模糊|曖昧|微妙|徹底|完全|部分|暫時|永久/,
    '美感與藝術': /美麗|美觀|好看|漂亮|醜陋|難看|優雅|雅致|精緻|精美|樸素|素雅|簡約|華麗|豪華|鮮豔|色彩|鮮明|暗沉|清爽|清新|人工|古典|現代|傳統|流行|時髦|陳舊|新穎|獨特|平凡|出色|驚豔|賞心悅目|細膩|生動|栩栩如生/,
    '社會與人際': /社會|文化|傳統|習俗|禮節|禮儀|規矩|規則|法律|道德|倫理|公平|不公|平等|不平等|自由|限制|民主|權利|義務|責任|合法|違法|安全|危險|和平|戰爭|合作|競爭|衝突|矛盾|和諧|穩定|動盪|進步|落後|發展|保守|開放|保護|破壞|珍貴|珍惜|浪費/,
    '科技與媒體': /電腦|手機|網路|軟體|程式|系統|數位|螢幕|鍵盤|滑鼠|應用程式|社群媒體|平台|網站|搜尋|下載|上傳|資料|密碼|帳號|登入|登出|更新|安裝|病毒|駭客|人工智慧|機器人|自動化|電子|無線|藍牙|衛星|新聞|報紙|雜誌|廣播|電視台|媒體|記者|報導|採訪|直播|頻道|訂閱/,
    '政治與法律': /政治|選舉|投票|政府|議會|國會|法院|法官|律師|警察|憲法|法律|條約|協議|政策|制度|改革|革命|獨立|統一|外交|大使|邊境|移民|難民|稅金|預算|補助|腐敗|貪污|抗議|示威|戰爭|軍隊|和平|裁軍|聯合國|主權|領土|判決|起訴|犯罪|刑罰|禁止|允許|批准/,
    '醫療與科學': /醫療|手術|治療|診斷|處方|藥物|疫苗|注射|病毒|細菌|感染|傳染|免疫|過敏|症狀|發病|康復|住院|出院|急救|手術室|醫師|護士|研究|實驗|分析|數據|結果|理論|假設|證明|發現|發明|科技|化學|物理|生物|遺傳|基因|細胞|分子|元素|反應|能量|輻射|太空|宇宙/,
    '環境與資源': /環境|生態|汙染|排放|溫室效應|氣候變遷|暖化|臭氧|廢氣|廢水|垃圾|回收|再生能源|節能|省電|資源|能源|石油|天然氣|煤炭|核能|太陽能|風力|水力|森林|砍伐|保育|滅絕|物種|生物多樣|水資源|乾旱|洪水|颱風|地震|火山|海平面|碳排|減碳/
};

const parsePasteInput = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const items = [];
  let currentTag = '自訂';
  let pendingExample = '';
  lines.forEach(line => {
    const tagMatch = line.match(/^[【\[](.+)[】\]]$/);
    if (tagMatch) { currentTag = tagMatch[1]; return; }
    if (/^[📬💬🔸例]/.test(line)) { pendingExample = line.replace(/^[📬💬🔸例：: ]+/, ''); return; }
    const arrow = line.indexOf('→') !== -1 ? '→' : line.indexOf('➡') !== -1 ? '➡' : null;
    if (!arrow) return;
    const arrowIdx = line.indexOf(arrow);
    const left = line.slice(0, arrowIdx).trim();
    const meaning = line.slice(arrowIdx + arrow.length).trim();
    if (!left || !meaning) return;
    const readingMatch = left.match(/[（(]([ぁ-んァ-ン]+)[）)]/);
    const reading = readingMatch ? readingMatch[1] : '';
    const word = left.replace(/[（(][^）)]+[）)]/, '').trim();
    const kana = reading || word;
    const isVerb = /[うくぐすつぬぶむる]$/.test(kana) && !/です$|ます$/.test(kana) && word.length >= 2;
    const isGrammar = word.length >= 6 || /[～〜]/.test(word);
    const type = isGrammar ? 'grammar' : isVerb ? 'verb' : 'vocab';
    items.push({ id: Date.now() + '_' + Math.random().toString(36).slice(2), type, word, reading, meaning, tag: currentTag, example: pendingExample, selected: true });
    pendingExample = '';
  });
  return items;
};

const guessThemeByMeaning = (meaning, existingVocabDB = null, tagKeywordsMap = null) => {
    if (!meaning) return '自訂';

    // Step 1: Exact meaning match in vocabDB
    if (existingVocabDB && existingVocabDB.length > 0) {
        const existingMatch = existingVocabDB.find(
            v => v.meaning === meaning && v.tag && v.tag !== '自訂' && v.tag !== '未分類'
        );
        if (existingMatch) return existingMatch.tag;
    }

    // Step 1.5: User-defined tag keywords (Method 1)
    if (tagKeywordsMap && Object.keys(tagKeywordsMap).length > 0) {
        let bestTagScore = 0;
        let bestTag = null;
        for (const [tag, keywords] of Object.entries(tagKeywordsMap)) {
            if (!Array.isArray(keywords) || keywords.length === 0) continue;
            let score = 0;
            keywords.forEach(kw => { if (kw && kw.length >= 2 && meaning.includes(kw)) score += kw.length; });
            if (score > bestTagScore) { bestTagScore = score; bestTag = tag; }
        }
        if (bestTag && bestTagScore >= 2) return bestTag;
    }

    // Step 1.7: Bigram learning from existing DB (Method 2)
    if (existingVocabDB && existingVocabDB.length >= 5) {
        const tagBigrams = {};
        existingVocabDB.forEach(v => {
            if (!v.tag || v.tag === '自訂' || v.tag === '未分類') return;
            const m = v.meaning || '';
            if (!tagBigrams[v.tag]) tagBigrams[v.tag] = {};
            for (let i = 0; i < m.length - 1; i++) {
                const bg = m.slice(i, i + 2);
                tagBigrams[v.tag][bg] = (tagBigrams[v.tag][bg] || 0) + 1;
            }
        });
        const meaningBigrams = new Set();
        for (let i = 0; i < meaning.length - 1; i++) meaningBigrams.add(meaning.slice(i, i + 2));
        let bestLearnedTag = null;
        let bestLearnedScore = 0;
        for (const [tag, bgCounts] of Object.entries(tagBigrams)) {
            let score = 0;
            meaningBigrams.forEach(bg => { if (bgCounts[bg] >= 2) score += bgCounts[bg]; });
            if (score > bestLearnedScore) { bestLearnedScore = score; bestLearnedTag = tag; }
        }
        if (bestLearnedTag && bestLearnedScore >= 4) return bestLearnedTag;
    }

    // Step 2: Built-in THEME_KEYWORDS — score = total char length of matched strings
    let bestTheme = '自訂';
    let maxScore = 0;
    for (const [theme, regex] of Object.entries(THEME_KEYWORDS)) {
        const globalRegex = new RegExp(regex.source, 'g');
        const matches = meaning.match(globalRegex);
        if (matches) {
            const score = matches.reduce((sum, m) => sum + m.length, 0);
            if (score > maxScore) { maxScore = score; bestTheme = theme; }
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
    const adjFormMap = { adj_i: 'jisho', adj_na: 'jisho', adj_all: 'jisho', noun: 'jisho' };
    const resolvedBase = adjFormMap[grammarDef.baseForm] || grammarDef.baseForm;
    const baseRubyStr = word[resolvedBase] || '';
    const replaceRegex = new RegExp((grammarDef.removeStr || '') + '$');
    correctRuby = baseRubyStr.replace(replaceRegex, '') + grammarDef.appendStr;
  } else {
    correctRuby = word[target];
  }
  optionsMap.set(stripRuby(correctRuby), correctRuby);

  const jishoRuby = word.jisho;
  const stemRuby = jishoRuby.slice(0, -1);

  const dummySuffixes = ['て', 'た', 'ない', 'なかった', 'る', 'ます', 'んだ', 'いて', 'いた', 'くて', 'かった', 'だ', 'じゃない', 'じゃなかった', 'って', 'った', 'いで', 'わ', 'あ', 'ら', 'く'];
  let fallbackStem = stemRuby;
  if (word.type === 'adj_na') fallbackStem = jishoRuby.slice(0, -1); 
  
  const shuffledSuffixes = [...dummySuffixes].sort(() => Math.random() - 0.5);
  for (const suf of shuffledSuffixes) {
      if (optionsMap.size >= 4) break;
      let dummyWordRuby = fallbackStem + suf;
      if (grammarDef) {
          const replaceRegex = new RegExp((grammarDef.removeStr || '') + '$');
          dummyWordRuby = dummyWordRuby.replace(replaceRegex, '') + grammarDef.appendStr;
      }
      const dummyWordPlain = stripRuby(dummyWordRuby);
      if (!optionsMap.has(dummyWordPlain) && dummyWordPlain !== stripRuby(correctRuby)) {
          optionsMap.set(dummyWordPlain, dummyWordRuby);
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

const generateSentenceDistractors = (correctVocab, allVocabs, direction = 'j2c') => {
    const optionsMap = new Map();
    let correctStr = '';
    if (direction === 'j2c') {
        correctStr = parseExample(correctVocab.example || correctVocab.word || correctVocab.reading).translation || correctVocab.meaning;
    } else {
        correctStr = parseExample(correctVocab.example || correctVocab.word || correctVocab.reading).plainSentence || correctVocab.word || correctVocab.reading;
    }
    optionsMap.set(correctStr, correctStr);
    
    let pool = allVocabs.filter(v => ((v.example && v.example.trim().length > 0) || v.isSentence) && v.id !== correctVocab.id);
    if (pool.length < 3) pool = allVocabs.filter(v => v.id !== correctVocab.id);
    
    const shuffled = pool.sort(() => Math.random() - 0.5);
    for (const v of shuffled) {
        if (optionsMap.size >= 4) break;
        let distractorStr = '';
        if (direction === 'j2c') {
            distractorStr = parseExample(v.example || v.word || v.reading).translation || v.meaning;
        } else {
            distractorStr = parseExample(v.example || v.word || v.reading).plainSentence || v.word || v.reading;
        }
        if(distractorStr && !optionsMap.has(distractorStr)) optionsMap.set(distractorStr, distractorStr);
    }
    
    if (optionsMap.size < 4) {
        const extraPool = allVocabs.sort(() => Math.random() - 0.5);
        for(const v of extraPool) {
            if (optionsMap.size >= 4) break;
            let distractorStr = '';
            if (direction === 'j2c') {
                distractorStr = v.meaning;
            } else {
                distractorStr = parseExample(v.example || v.word || v.reading).plainSentence || v.word || v.reading;
            }
            if(distractorStr && !optionsMap.has(distractorStr)) optionsMap.set(distractorStr, distractorStr);
        }
    }
    return Array.from(optionsMap.values()).sort(() => Math.random() - 0.5);
};

export default function App() {

  const [appState, setAppState] = useState('home');
  const [vocabManageTab, setVocabManageTab] = useState('vocab');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  
  // ==== 全域搜尋 State ====
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [targetId, setTargetId] = useState(null);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
     try { return JSON.parse(localStorage.getItem('verbApp_recentSearches')) || []; } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('verbApp_recentSearches', JSON.stringify(recentSearches)); }, [recentSearches]);

  // ==== 單字系統 State ====
  const [vocabDB, setVocabDB] = useState(() => {
    try {
      const saved = localStorage.getItem('verbApp_vocabDB');
      if (saved) {
         let parsed = JSON.parse(saved);
         if (!Array.isArray(parsed)) throw new Error('Invalid DB');
         parsed = parsed.filter(v => v !== null && v !== undefined).map(v => {
           let updatedV = { ...v, correctDates: v.correctDates || [] };
             if (!updatedV.tags) updatedV.tags = updatedV.tag ? [updatedV.tag] : [];
           if (updatedV.learnStatus === 'learned' && updatedV.status === 'new') updatedV.status = 'learning';
           if (updatedV.repetitions >= 5 && updatedV.status !== 'mastered' && updatedV.status !== 'learning') updatedV.status = 'learning';
           if (!updatedV.status) updatedV.status = 'new';
           if (updatedV.status === 'mastered' && (updatedV.interval || 0) < 60) updatedV.status = 'learning';
           delete updatedV.learnStatus;
           return updatedV;
         });
return parsed;
      }
      return INITIAL_VOCAB_DB.map(v => ({ ...v, status: 'new', correctDates: [], tags: v.tag ? [v.tag] : [] }));
    } catch { return INITIAL_VOCAB_DB.map(v => ({ ...v, status: 'new', correctDates: [], tags: v.tag ? [v.tag] : [] })); }
  });
  const [vocabMistakes, setVocabMistakes] = useState({});
  const [vocabTestMode, setVocabTestMode] = useState('srs'); 
  const [currentQuestionDirection, setCurrentQuestionDirection] = useState('j2c');
  const [currentThemeLabel, setCurrentThemeLabel] = useState('');
  const [activeVocabQueue, setActiveVocabQueue] = useState([]);
  const [currentVocab, setCurrentVocab] = useState(null);

  // ==== 每日解鎖與主題抽卡 State ====
  const [unlockAmount, setUnlockAmount] = useState(5);
  const [unlockTheme, setUnlockTheme] = useState('random');
  const [themeSuggestionSeed, setThemeSuggestionSeed] = useState(Date.now());

  // ==== 每日學習上限 State ====
  const [dailyReviewLimit, setDailyReviewLimit] = useState(() => { try { return Number(localStorage.getItem('jp_daily_review_limit') || 80); } catch { return 80; } });
  const [dailyNewVocabLimit, setDailyNewVocabLimit] = useState(() => { try { return Number(localStorage.getItem('jp_daily_vocab_limit') || 30); } catch { return 30; } });
  const [dailyNewGrammarLimit, setDailyNewGrammarLimit] = useState(() => { try { return Number(localStorage.getItem('jp_daily_grammar_limit') || 5); } catch { return 5; } });
  const [dailyNewVerbLimit, setDailyNewVerbLimit] = useState(() => { try { return Number(localStorage.getItem('jp_daily_verb_limit') || 15); } catch { return 15; } });
  const [todayNewVocabCount, setTodayNewVocabCount] = useState(() => { try { return Number(localStorage.getItem(`jp_daily_new_vocab_${new Date().toISOString().slice(0,10)}`) || 0); } catch { return 0; } });

  // ==== 每日上限 Helper 函式 ====
  const todayDateStr = () => new Date().toISOString().slice(0, 10);
  const getTodayNewVocabCount  = () => { try { return Number(localStorage.getItem(`jp_daily_new_vocab_${todayDateStr()}`) || 0); } catch { return 0; } };
  const addTodayNewVocabCount  = (n) => { try { const k = `jp_daily_new_vocab_${todayDateStr()}`; localStorage.setItem(k, String(getTodayNewVocabCount() + n)); } catch {} };
  const getTodayGrammarIds = () => { try { const s = localStorage.getItem(`jp_daily_grammar_ids_${todayDateStr()}`); return s ? JSON.parse(s) : null; } catch { return null; } };
  const setTodayGrammarIds = (ids) => { try { localStorage.setItem(`jp_daily_grammar_ids_${todayDateStr()}`, JSON.stringify(ids)); } catch {} };
  const getTodayVerbIds    = () => { try { const s = localStorage.getItem(`jp_daily_verb_ids_${todayDateStr()}`);    return s ? JSON.parse(s) : null; } catch { return null; } };
  const setTodayVerbIds    = (ids) => { try { localStorage.setItem(`jp_daily_verb_ids_${todayDateStr()}`,    JSON.stringify(ids)); } catch {} };

  const currentThemeSuggestions = useMemo(() => {
    const all = getAvailableThemes();
    const shuffled = [...all].sort(() => 0.5 - Math.random());
    const THEME_GRADIENTS = [
      'bg-gradient-to-r from-teal-400 to-emerald-400',
      'bg-gradient-to-r from-orange-400 to-rose-400',
      'bg-gradient-to-r from-violet-500 to-fuchsia-500',
      'bg-gradient-to-r from-blue-400 to-indigo-500',
      'bg-gradient-to-r from-pink-400 to-rose-500',
      'bg-gradient-to-r from-amber-400 to-orange-500',
      'bg-gradient-to-r from-cyan-400 to-blue-500'
    ];
    return shuffled.slice(0, 5).map((t, i) => ({
      name: t,
      color: THEME_GRADIENTS[i % THEME_GRADIENTS.length]
    }));
  }, [vocabDB, themeSuggestionSeed]);
  const [flashcardQueue, setFlashcardQueue] = useState([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showOnlyImportantVocab, setShowOnlyImportantVocab] = useState(false);
  const [showOnlyImportantVerb, setShowOnlyImportantVerb] = useState(false);
  const [verbManageTypeTab, setVerbManageTypeTab] = useState('all');
  const [showVerbAddSection, setShowVerbAddSection] = useState(false);
  const [onlyImportantVocabTest, setOnlyImportantVocabTest] = useState(false);
  const [onlyImportantVerbTest, setOnlyImportantVerbTest] = useState(false);
  const [onlyImportantGrammarTest, setOnlyImportantGrammarTest] = useState(false);
  const [onlyLearnedVerbTest, setOnlyLearnedVerbTest] = useState(false);
  const [onlyLearnedGrammarTest, setOnlyLearnedGrammarTest] = useState(false);
  
  const [referenceAmount, setReferenceAmount] = useState(5);
  const [referenceTheme, setReferenceTheme] = useState('random');
  const [referenceQueue, setReferenceQueue] = useState([]);
  
  const [tagKeywordsMap, setTagKeywordsMap] = useState(() => { try { return JSON.parse(localStorage.getItem('verbApp_tagKeywordsMap') || '{}'); } catch { return {}; } });
  useEffect(() => { localStorage.setItem('verbApp_tagKeywordsMap', JSON.stringify(tagKeywordsMap)); }, [tagKeywordsMap]);

  useEffect(() => { localStorage.setItem('verbApp_vocabDB', JSON.stringify(vocabDB)); }, [vocabDB]);
  useEffect(() => {
    setVocabDB(prev => {
      if (!prev.some(v => !v.addedAt)) return prev;
      const getTs = (id) => { const p = String(id||'').split('_'); for (const x of p) { const n = Number(x); if (!isNaN(n) && n > 1000000000000) return n; } return 0; };
      return prev.map((v, i) => v.addedAt ? v : { ...v, addedAt: getTs(v.id) + i });
    });
  }, []);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayQueue = vocabDB.filter(v => !((v.example && v.example.trim().length > 0) || v.isSentence) && v.status !== 'new' && v.nextReview <= Date.now());
  const todaySentenceQueue = vocabDB.filter(v => ((v.example && v.example.trim().length > 0) || v.isSentence) && v.status !== 'new' && v.nextReview <= Date.now());
  const reviewedTodayQueue = vocabDB.filter(v => v.lastReviewed && v.lastReviewed >= todayStart.getTime());

  // ==== 每日有效統計（混搭模式）====
  const effectiveTodayStats = useMemo(() => {
    const reviewCount  = Math.min(todayQueue.length, dailyReviewLimit);
    const newVocabSlots = Math.max(0, dailyNewVocabLimit - getTodayNewVocabCount());
    const newVocabAvail = vocabDB.filter(v => !((v.example && v.example.trim().length > 0) || v.isSentence) && v.status === 'new').length;
    const newVocabCount = Math.min(newVocabSlots, newVocabAvail);
    return { reviewCount, newVocabCount, total: reviewCount + newVocabCount };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayQueue.length, dailyReviewLimit, dailyNewVocabLimit, todayNewVocabCount, vocabDB]);

  // ==== 動詞系統 State ====
  const [verbDB, setVerbDB] = useState(() => {
    try {
      const saved = localStorage.getItem('verbApp_verbDB');
      if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed.map(v => migrateVerb({ ...v, learnStatus: v.learnStatus || 'new', correctDates: v.correctDates || [] }));
      }
      return INITIAL_VERB_DB.map(v => migrateVerb({ ...v, learnStatus: 'new', correctDates: [] }));
    } catch { return INITIAL_VERB_DB.map(v => migrateVerb({ ...v, learnStatus: 'new', correctDates: [] })); }
  });
  useEffect(() => { localStorage.setItem('verbApp_verbDB', JSON.stringify(verbDB)); }, [verbDB]);
  useEffect(() => {
    setVerbDB(prev => {
      if (!prev.some(v => !v.addedAt)) return prev;
      const getTs = (id) => { const p = String(id||'').split('_'); for (const x of p) { const n = Number(x); if (!isNaN(n) && n > 1000000000000) return n; } return 0; };
      return prev.map((v, i) => v.addedAt ? v : { ...v, addedAt: getTs(v.id) + i });
    });
  }, []);

  // ==== 漢字索引 State ====
  const [kanjiDB, setKanjiDB] = useState(() => {
    try {
      const saved = localStorage.getItem('verbApp_kanjiDB');
      if (saved) return JSON.parse(saved).map(k => ({ ...k, tags: k.tags || [] }));
    } catch {}
    return [];
  });
  useEffect(() => { localStorage.setItem('verbApp_kanjiDB', JSON.stringify(kanjiDB)); }, [kanjiDB]);

  useEffect(() => {
    setKanjiDB(prev => syncKanjiDB(vocabDB, prev));
  }, [vocabDB]);

  const [draggedFormIndex, setDraggedFormIndex] = useState(null);
  const [dragOverFormIndex, setDragOverFormIndex] = useState(null);
  const [renamingFormId, setRenamingFormId] = useState(null);
  const [showQuickForms, setShowQuickForms] = useState(false);
  const [renamingFormLabel, setRenamingFormLabel] = useState('');
  const [renamingFormBase, setRenamingFormBase] = useState('');
  const [renamingFormSuffix, setRenamingFormSuffix] = useState('');
  const [verbForms, setVerbForms] = useState(() => {
    try {
      const saved = localStorage.getItem('verbApp_verbForms');
      if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
             if (!parsed.find(f => f.id === 'masu')) {
                parsed.unshift({ id: 'masu', label: 'ます形' });
             }
             return parsed;
          }
      }
      return DEFAULT_FORM_OPTIONS;
    } catch { return DEFAULT_FORM_OPTIONS; }
  });
  useEffect(() => { localStorage.setItem('verbApp_verbForms', JSON.stringify(verbForms)); }, [verbForms]);
  const [verbTableColumnOrder, setVerbTableColumnOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('verbApp_verbTableColumnOrder');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  
  useEffect(() => {
    const formIds = verbForms.map(f => f.id);
    const defaultCols = ['isImportant', 'status', 'accuracy', 'type', 'tag', 'meaning', 'dateAdded', 'actions'];
    setVerbTableColumnOrder(prev => {
       let newOrder = [...prev].filter(id => defaultCols.includes(id) || formIds.includes(id));
       
       if (!newOrder.includes('isImportant')) newOrder.splice(0, 0, 'isImportant');
       if (!newOrder.includes('type')) newOrder.splice(1, 0, 'type');
       if (!newOrder.includes('tag')) newOrder.splice(1, 0, 'tag');
       
       let insertIdx = newOrder.indexOf('tag') + 1;
       formIds.forEach(id => {
         if (!newOrder.includes(id)) {
             newOrder.splice(insertIdx, 0, id);
             insertIdx++;
         }
       });
       
       if (!newOrder.includes('meaning')) newOrder.push('meaning');
       if (!newOrder.includes('dateAdded')) newOrder.push('dateAdded');
       if (!newOrder.includes('actions')) newOrder.push('actions');
       
       return newOrder;
    });
  }, [verbForms]);

  useEffect(() => {
    if (verbTableColumnOrder.length > 0) {
      localStorage.setItem('verbApp_verbTableColumnOrder', JSON.stringify(verbTableColumnOrder));
    }
  }, [verbTableColumnOrder]);

  const [vocabTableColumnOrder, setVocabTableColumnOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('verbApp_vocabTableColumnOrder');
      if (saved) {
         let arr = JSON.parse(saved);
         if (!arr.includes('isImportant')) arr = ['isImportant', ...arr];
         // Remove old learnStatus if exists
         arr = arr.filter(col => col !== 'learnStatus');
         if (!arr.includes('status')) arr.splice(1, 0, 'status');
         return arr;
      }
    } catch {}
    return ['isImportant', 'status', 'tag', 'type', 'word', 'meaning', 'dateAdded', 'nextReview', 'actions'];
  });
  const [dragVocabColIdx, setDragVocabColIdx] = useState(null);
  const [dragOverVocabColIdx, setDragOverVocabColIdx] = useState(null);
  
  const VOCAB_DEFAULT_WIDTHS = {
    'isImportant': 70,
    'status': 110,
    'tag': 110,
    'type': 80,
    'word': 160,
    'meaning': 220,
    'dateAdded': 120,
    'nextReview': 120,
    'actions': 90,
  };
  const VERB_DEFAULT_WIDTHS = {
    'isImportant': 70,
    'status': 110,
    'accuracy': 110,
    'type': 100,
    'tag': 110,
    'meaning': 160,
    'dateAdded': 120,
    'actions': 90,
  };

  const resizingRef = useRef(null);
  const [vocabColWidths, setVocabColWidths] = useState(() => {
    try { return JSON.parse(localStorage.getItem('verbApp_vocabColWidths')) || {}; } catch { return {}; }
  });
  const [verbColWidths, setVerbColWidths] = useState(() => {
    try { return JSON.parse(localStorage.getItem('verbApp_verbColWidths')) || {}; } catch { return {}; }
  });
  const [vocabAutoFit, setVocabAutoFit] = useState(() => localStorage.getItem('verbApp_vocabAutoFit') !== 'false');
  const [verbAutoFit, setVerbAutoFit] = useState(() => localStorage.getItem('verbApp_verbAutoFit') !== 'false');

  useEffect(() => {
    localStorage.setItem('verbApp_vocabColWidths', JSON.stringify(vocabColWidths));
  }, [vocabColWidths]);
  useEffect(() => {
    localStorage.setItem('verbApp_verbColWidths', JSON.stringify(verbColWidths));
  }, [verbColWidths]);
  useEffect(() => { localStorage.setItem('verbApp_vocabAutoFit', vocabAutoFit); }, [vocabAutoFit]);
  useEffect(() => { localStorage.setItem('verbApp_verbAutoFit', verbAutoFit); }, [verbAutoFit]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizingRef.current) return;
      const { tableType, colId, startX, startWidth, maxAllowedDiff } = resizingRef.current;
      let diffX = e.clientX - startX;
      diffX = Math.min(diffX, Math.max(0, maxAllowedDiff || 0));
      let newWidth = Math.max(15, startWidth + diffX);
      if (tableType === 'vocab') { setVocabColWidths(prev => ({ ...prev, [colId]: newWidth })); setVocabAutoFit(false); }
      else { setVerbColWidths(prev => ({ ...prev, [colId]: newWidth })); setVerbAutoFit(false); }
    };
    const handleMouseUp = () => {
      if (resizingRef.current) {
        resizingRef.current = null;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  
  useEffect(() => {
    if (vocabTableColumnOrder.length > 0) {
      localStorage.setItem('verbApp_vocabTableColumnOrder', JSON.stringify(vocabTableColumnOrder));
    }
  }, [vocabTableColumnOrder]);

  const vocabColDefinitions = {
    'isImportant': { label: '重要(⭐)', sortable: true },
    'tag': { label: '主題標籤', sortable: true },
    'type': { label: '類型', sortable: true },
    'word': { label: '單字 (平假名)', sortable: true },
    'meaning': { label: '中文 / 例句', sortable: true },
    'status': { label: '學習狀態', sortable: true },
    'dateAdded': { label: '加入日期', sortable: true },
    'nextReview': { label: '下次複習', sortable: true },
    'actions': { label: '操作', sortable: false }
  };
  const [dragTableColIdx, setDragTableColIdx] = useState(null);
  const [dragOverTableColIdx, setDragOverTableColIdx] = useState(null);

  const colDefinitions = {
    'isImportant': { label: '重要(⭐)', sortable: true },
    'status': { label: '學習狀態', sortable: true },
    'accuracy': { label: '整體準確率', sortable: true },
    'type': { label: '類型/群組', sortable: true },
    'tag': { label: '標籤/主題', sortable: true },
    'meaning': { label: '中文意思', sortable: true },
    'dateAdded': { label: '加入日期', sortable: true },
    'actions': { label: '操作', sortable: false }
  };


  const [sourceForm, setSourceForm] = useState(() => localStorage.getItem('verbApp_sourceForm') || 'masu'); 
  const [targetForms, setTargetForms] = useState(() => {
    const saved = localStorage.getItem('verbApp_targetForms');
    if (saved) return JSON.parse(saved);
    return ['te', 'ta', 'nai', 'jisho'];
  }); 
  const [activeWordTypes, setActiveWordTypes] = useState(['verb', 'adj_i', 'adj_na']);
  const [verbTestMode, setVerbTestMode] = useState('normal'); 
  const [mistakeBank, setMistakeBank] = useState({}); 
  const [customWordIds, setCustomWordIds] = useState([]);  
  
  const [exampleVerbId, setExampleVerbId] = useState('');
  const [customGrammars, setCustomGrammars] = useState(() => {
    try {
      const saved = localStorage.getItem('verbApp_customGrammars');
      if (saved) {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
            parsed = parsed.map(g => {
                let status = g.status;
                if (!status) {
                    if (g.learnStatus === 'learned') status = 'learning';
                    else status = 'new';
                }
                let ng = { 
                  ...g,
                  status,
                  ef: g.ef || 2.5,
                  interval: g.interval || 0,
                  repetitions: g.repetitions || 0,
                  totalAttempts: g.totalAttempts || 0,
                  totalCorrect: g.totalCorrect || 0,
                  nextReview: g.nextReview || 0,
                    tags: g.tags || (g.tag ? [g.tag] : [])
                  };
                  delete ng.learnStatus;
                if (ng && ng.name && ng.name.includes('〜')) {
                    ng = { ...ng, name: ng.name.replace(/〜/g, ' ＿') };
                }
                return ng;
            });
            return parsed;
        }
      }
      return DEFAULT_GRAMMARS.map(g => ({ ...g, status: 'new', ef: 2.5, interval: 0, repetitions: 0, totalAttempts: 0, totalCorrect: 0, nextReview: 0, tags: g.tag ? [g.tag] : [] }));
    } catch { return DEFAULT_GRAMMARS.map(g => ({ ...g, status: 'new', ef: 2.5, interval: 0, repetitions: 0, totalAttempts: 0, totalCorrect: 0, nextReview: 0, tags: g.tag ? [g.tag] : [] })); }
  });
  useEffect(() => { localStorage.setItem('verbApp_customGrammars', JSON.stringify(customGrammars)); }, [customGrammars]);
  useEffect(() => {
    setCustomGrammars(prev => {
      if (!prev.some(g => !g.addedAt)) return prev;
      const getTs = (id) => { const p = String(id||'').split('_'); for (const x of p) { const n = Number(x); if (!isNaN(n) && n > 1000000000000) return n; } return 0; };
      return prev.map((g, i) => g.addedAt ? g : { ...g, addedAt: getTs(g.id) + i });
    });
  }, []);

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

  useEffect(() => { localStorage.setItem('verbApp_sourceForm', sourceForm); }, [sourceForm]);
  useEffect(() => { localStorage.setItem('verbApp_targetForms', JSON.stringify(targetForms)); }, [targetForms]);


  // One-time migration: Change all timestamps to June 12, 2026
  useEffect(() => {
    const hasMigrated = localStorage.getItem('migrated_to_june_12_v3');
    if (!hasMigrated) {
       const june12 = new Date('2026-06-12T00:00:00').getTime();
       let vocabChanged = false;
       let verbChanged = false;

       const newVocabDB = vocabDB.map(v => {
           let newId = String(v.id);
           const parts = newId.split('_');
           let found = false;
           const newParts = parts.map(p => {
               if (Number(p) > 1000000000000) { found = true; return june12; }
               return p;
           });
           if (!found) {
               newId = `${newId}_${june12}`;
           } else {
               newId = newParts.join('_');
           }
           if (newId !== String(v.id)) vocabChanged = true;
           return { ...v, id: newId };
       });

       const newVerbDB = verbDB.map(v => {
           let newId = String(v.id);
           const parts = newId.split('_');
           let found = false;
           const newParts = parts.map(p => {
               if (Number(p) > 1000000000000) { found = true; return june12; }
               return p;
           });
           if (!found) {
               newId = `${newId}_${june12}`;
           } else {
               newId = newParts.join('_');
           }
           if (newId !== String(v.id)) verbChanged = true;
           return { ...v, id: newId };
       });

       if (vocabChanged) {
           setVocabDB(newVocabDB);
           setVocabMistakes(prev => {
              const newM = {};
              Object.values(prev).forEach(mistake => {
                  const newVocab = newVocabDB.find(nv => nv.word === mistake.word);
                  if (newVocab) newM[newVocab.id] = newVocab;
              });
              return newM;
           });
       }

       if (verbChanged) {
           setVerbDB(newVerbDB);
       }

       if (vocabChanged || verbChanged || vocabDB.length === 0) {
           localStorage.setItem('migrated_to_june_12_v3', 'true');
       }
    }
  }, [vocabDB, verbDB]);

  // One-time auto reset all vocab to today
  useEffect(() => {
    const hasReset = localStorage.getItem('auto_reset_vocab_today_v2');
    if (!hasReset && vocabDB.length > 0) {
      setVocabDB(prev => prev.map(v => ({ ...v, status: 'learning', interval: 0, repetitions: 0, nextReview: Date.now() })));
      localStorage.setItem('auto_reset_vocab_today_v2', 'true');
    }
  }, [vocabDB]);
  useEffect(() => { localStorage.setItem('verbApp_gistId', gistId); }, [gistId]);

  // 計算今日文法待複習佇列
  const todayGrammarQueue = React.useMemo(() => {
    const now = Date.now();
    const queue = [];
    // 遍歷所有可能的動詞+目標形組合
    const allTargets = verbForms.map(f => f.id);
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

  const formatVerbType = (type, group) => {
    const gStr = String(group);
    if (type === 'verb') {
        if (gStr === '1') return <div className="text-center leading-tight">第一類動詞<br/><span className="text-[10px] opacity-80">（五段動詞）</span></div>;
        if (gStr === '2') return <div className="text-center leading-tight">第二類動詞<br/><span className="text-[10px] opacity-80">( 一段動詞 )</span></div>;
        if (gStr === '3') return <div className="text-center leading-tight">第3類<br/><span className="text-[10px] opacity-80">（不規則）</span></div>;
        return <div className="text-center leading-tight">動詞<br/><span className="text-[10px] opacity-80">({group})</span></div>;
    } else if (type === 'adj_i') {
        return <div className="text-center leading-tight">い形容詞</div>;
    } else if (type === 'adj_na') {
        return <div className="text-center leading-tight">な形容詞</div>;
    }
    return <div className="text-center leading-tight">{type}<br/><span className="text-[10px] opacity-80">({group})</span></div>;
  };

  const getVerbTypeStyle = (type, group) => {
    const gStr = String(group);
    if (type === 'verb') {
        if (gStr === '1') return 'bg-orange-400 border-orange-700 text-orange-950';
        if (gStr === '2') return 'bg-teal-400 border-teal-800 text-teal-950';
        if (gStr === '3') return 'bg-pink-500 border-pink-900 text-white';
        return 'bg-slate-300 border-slate-600 text-slate-800';
    } else if (type === 'adj_i') {
        return 'bg-purple-500 border-purple-900 text-white';
    } else if (type === 'adj_na') {
        return 'bg-amber-100 border-amber-600 text-amber-950';
    }
    return 'bg-slate-300 border-slate-600 text-slate-800';
  };

  // 單字建立日期
  const getAddedDate = (id) => {
    if (!id) return '-';
    const parts = String(id).split('_');
    let ts = 0;
    for (const p of parts) {
      const num = Number(p);
      if (!isNaN(num) && num > 1000000000000) { ts = num; break; }
    }
    if (ts > 0) {
      const date = new Date(ts);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
    return '內建';
  };

  // 管理頁面：正在編輯的標籤 ID
  const [editingTagId, setEditingTagId] = useState(null);

  const [vocabSortConfig, setVocabSortConfig] = useState({ key: 'dateAdded', direction: 'desc' });
  const sortedVocabDB = useMemo(() => {
    let list = [...vocabDB];
    if (vocabManageTab === 'vocab' && searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        list = list.filter(v => (v.word && v.word.toLowerCase().includes(q)) || (v.reading && v.reading.toLowerCase().includes(q)) || (v.meaning && v.meaning.toLowerCase().includes(q)) || (v.tags && v.tags.some(t => t.toLowerCase().includes(q))));
    }
    let sorted = list;
    sorted.sort((a, b) => {
      if (!a) return 1; if (!b) return -1;
      if (!a) return 1; if (!b) return -1;
      let aVal, bVal;
      switch (vocabSortConfig.key) {
        case 'tag': aVal = a.tag || ''; bVal = b.tag || ''; break;
        case 'type': aVal = a.isSentence ? 1 : 0; bVal = b.isSentence ? 1 : 0; break;
        case 'word': aVal = a.word || a.reading || ''; bVal = b.word || b.reading || ''; break;
        case 'meaning': aVal = a.meaning || ''; bVal = b.meaning || ''; break;
        case 'status': aVal = a.repetitions || 0; bVal = b.repetitions || 0; break;
        case 'nextReview': aVal = a.nextReview || 0; bVal = b.nextReview || 0; break;
        case 'dateAdded':
        default:
          const getTs = (id) => { const p = String(id||'').split('_'); for (const x of p) { const n = Number(x); if (!isNaN(n) && n > 1000000000000) return n; } return 0; };
          aVal = a.addedAt || getTs(a.id); bVal = b.addedAt || getTs(b.id); break;
      }
      if (aVal < bVal) return vocabSortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return vocabSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [vocabDB, vocabSortConfig, searchTerm, vocabManageTab]);

  const handleSort = (key) => {
    setVocabSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const renderSortIcon = (key) => {
    if (vocabSortConfig.key !== key) return null;
    return <span className="ml-1 text-amber-500">{vocabSortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  const [verbSortConfig, setVerbSortConfig] = useState({ key: 'dateAdded', direction: 'desc' });
  const sortedVerbDB = useMemo(() => {
    let sorted = [...verbDB];
    if (verbManageTypeTab !== 'all') {
      sorted = sorted.filter(v => verbManageTypeTab === 'verb' ? v.type === 'verb' : verbManageTypeTab === 'adj_i' ? v.type === 'adj_i' : verbManageTypeTab === 'adj_na' ? v.type === 'adj_na' : (v.type === 'adj_i' || v.type === 'adj_na'));
    }
    if (showOnlyImportantVerb) sorted = sorted.filter(v => v.isImportant);
      if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          sorted = sorted.filter(v =>
              (v.jisho && v.jisho.toLowerCase().includes(q)) ||
              (v.meaning && v.meaning.toLowerCase().includes(q)) ||
              (v.tags && v.tags.some(t => t.toLowerCase().includes(q)))
          );
      }
    sorted.sort((a, b) => {
      if (!a) return 1; if (!b) return -1;
      if (!a) return 1; if (!b) return -1;
      let aVal, bVal;
      switch (verbSortConfig.key) {
        case 'tag': aVal = a.tag || ''; bVal = b.tag || ''; break;
        case 'type': aVal = (a.type || '') + (a.group || ''); bVal = (b.type || '') + (b.group || ''); break;
        case 'word': aVal = a.jisho || ''; bVal = b.jisho || ''; break;
        case 'meaning': aVal = a.meaning || ''; bVal = b.meaning || ''; break;
        case 'difficulty': aVal = a.difficulty || 'easy'; bVal = b.difficulty || 'easy'; break;
        case 'dateAdded':
        default:
          const getTs = (id) => { const p = String(id||'').split('_'); for (const x of p) { const n = Number(x); if (!isNaN(n) && n > 1000000000000) return n; } return 0; };
          aVal = a.addedAt || getTs(a.id); bVal = b.addedAt || getTs(b.id); break;
      }
      if (aVal < bVal) return verbSortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return verbSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [verbDB, verbSortConfig, verbManageTypeTab, showOnlyImportantVerb, searchTerm]);

  const handleVerbSort = (key) => {
    setVerbSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const renderVerbSortIcon = (key) => {
    if (verbSortConfig.key !== key) return null;
    return <span className="ml-1 text-indigo-500">{verbSortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };


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

  const handleExportBackup = () => {
    const backupData = {
      vocabDB,
      verbDB,
      verbForms,
      verbTableColumnOrder,
      customGrammars,
      grammarProgress
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,"");
    downloadAnchorNode.setAttribute("download", `jp_verb_dojo_backup_${dateStr}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (importedData.vocabDB) setVocabDB(importedData.vocabDB);
        if (importedData.verbDB) setVerbDB(importedData.verbDB);
        if (importedData.verbForms) setVerbForms(importedData.verbForms);
        if (importedData.verbTableColumnOrder) setVerbTableColumnOrder(importedData.verbTableColumnOrder);
        if (importedData.customGrammars) setCustomGrammars(importedData.customGrammars);
        if (importedData.grammarProgress) setGrammarProgress(importedData.grammarProgress);
        
        alert('匯入成功！系統將為您套用備份檔中的資料。');
        setShowSettingsModal(false);
      } catch (err) {
        alert('檔案格式錯誤，無法讀取備份資料！');
        console.error(err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const [showManualModal, setShowManualModal] = useState(false);
  const [showTagMgr, setShowTagMgr] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [parsedPasteItems, setParsedPasteItems] = useState([]);
  const [pasteAnalyzed, setPasteAnalyzed] = useState(false);

  const [questionCount, setQuestionCount] = useState(1);
  const [score, setScore] = useState(0);
  const [isRoundComplete, setIsRoundComplete] = useState(false);
  const [roundHistory, setRoundHistory] = useState([]); 
  const [hp, setHp] = useState(3);
  const [combo, setCombo] = useState(0);
  
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null); 
  
  const [currentVerbQuiz, setCurrentVerbQuiz] = useState(null);
  const [verbQuizFeedback, setVerbQuizFeedback] = useState(null);
  const [verbQuizInput, setVerbQuizInput] = useState('');
  const [explanation, setExplanation] = useState('');
  const [timeLeft, setTimeLeft] = useState(15);
  const [choiceOptions, setChoiceOptions] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  const actualTimeLimit = inputMode === 'keyboard' ? (timeLimit === 0 ? 0 : timeLimit + 15) : timeLimit;
  const TOTAL_QUESTIONS = 10;

  const goHome = () => {
    if (window.confirm && (appState === 'vocab_playing' || appState === 'verb_playing')) {
      if (!window.confirm('確定要回首頁嗎？目前的測驗進度將會遺失。')) return;
    }
    setSearchTerm('');
    setAppState('home');
  };

  const startVocabSession = (mode, themeId = null) => {
    let queue = [];
    if (mode === 'srs') {
      // 按到期時間排序，最舊的先複習
      const sortedReviews = [...todayQueue].sort((a, b) => (a.nextReview || 0) - (b.nextReview || 0));
      // 超過每日上限的複習單字推到明天
      const overflow = sortedReviews.slice(dailyReviewLimit);
      if (overflow.length > 0) {
        setVocabDB(prev => prev.map(v => {
          if (overflow.some(o => o.id === v.id)) {
            return { ...v, nextReview: Date.now() + 86400000 };
          }
          return v;
        }));
      }
      const reviewPart = sortedReviews.slice(0, dailyReviewLimit);
      // 計算今日還可新增的單字數量
      const alreadyNew = getTodayNewVocabCount();
      const newSlots = Math.max(0, dailyNewVocabLimit - alreadyNew);
      const newPool = vocabDB
        .filter(v => !((v.example && v.example.trim().length > 0) || v.isSentence) && v.status === 'new')
        .sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0) || String(a.id).localeCompare(String(b.id)))
        .slice(0, newSlots);
      if (newPool.length > 0) {
        addTodayNewVocabCount(newPool.length);
        setTodayNewVocabCount(getTodayNewVocabCount());
        // 將新單字狀態從 'new' 改為 'learning' 以加入 SRS 系統
        const newIds = new Set(newPool.map(v => v.id));
        setVocabDB(prev => prev.map(v => newIds.has(v.id) ? { ...v, status: 'learning', nextReview: Date.now(), repetitions: 0, ef: 2.5, interval: 1 } : v));
      }
      // 複習在前、新字在後（不 shuffle SRS 隊列）
      queue = [...reviewPart, ...newPool];
    }
    else if (mode === 'today_extra') queue = [...reviewedTodayQueue];
    else if (mode === 'mistakes') queue = Object.values(vocabMistakes);
    else if (mode === 'sentence_srs') {
      queue = [...todaySentenceQueue];
      if (queue.length === 0) { alert('目前沒有需要複習的例句喔！'); return; }
    }
    else if (mode === 'sentence_infinite') {
      queue = vocabDB.filter(v => (v.example && v.example.trim().length > 0) || v.isSentence);
      if (queue.length === 0) { alert('目前沒有包含例句的單字喔！'); return; }
    }
    else if (mode === 'theme' && themeId) {
      queue = vocabDB.filter(v => v.tag === themeId);
      const themeData = THEMES.find(t => t.id === themeId);
      if(themeData) setCurrentThemeLabel(themeData.name);
    }


    if (onlyImportantVocabTest) {
      const impPool = queue.filter(w => w.isImportant);
      if (impPool.length > 0) queue = impPool;
      else alert('目前的單字範圍內沒有標記為「重要」的項目！將回到一般出題。');
    }

    if (inputMode === 'kanji') {
      queue = queue.filter(v => v.word && v.word.trim() !== '' && v.word !== v.reading);
      if (queue.length === 0) { alert('目前的單字範圍內沒有包含漢字的單字，無法進行漢字測驗！'); return; }
    }
    if (queue.length === 0) { alert('這個模式目前沒有題目喔！'); return; }
    if (mode !== 'srs') queue = queue.sort(() => Math.random() * 0.5);
    
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
    
    let direction = 'j2c';
    if (currentMode === 'sentence_srs' || currentMode === 'sentence_infinite') {
        direction = Math.random() > 0.5 ? 'j2c' : 'c2j';
        setCurrentQuestionDirection(direction);
    }
    
    if (inputMode === 'choice') {
        if (currentMode === 'sentence_srs' || currentMode === 'sentence_infinite') {
            setChoiceOptions(generateSentenceDistractors(nextVocab, vocabDB, direction));
        } else {
            setChoiceOptions(generateVocabDistractors(nextVocab, vocabDB));
        }
    }
  };

  const startVerbLearningEngine = () => {
    const q = generateVerbQuestion(verbDB);
    if (!q) { alert('動詞庫中沒有可用的動詞。'); return; }
    setCurrentVerbQuiz(q);
    setVerbQuizFeedback(null);
    setVerbQuizInput('');
    setAppState('verb_learning_quiz');
  };

  const processVerbLearningAnswer = () => {
    if (verbQuizFeedback !== null || !currentVerbQuiz) return;
    const isCorrect = verbQuizInput.trim().toLowerCase() === currentVerbQuiz.correctAnswer.toLowerCase();
    
    setVerbDB(prev => handleVerbAnswer(currentVerbQuiz.verbId, currentVerbQuiz.testedForm, isCorrect, prev));
    setVerbQuizFeedback(isCorrect ? 'correct' : 'wrong');
  };

  const nextVerbLearningQuestion = () => {
    const q = generateVerbQuestion(verbDB);
    if (!q) { alert('發生錯誤，無法產生題目。'); setAppState('verb_learning_dashboard'); return; }
    setCurrentVerbQuiz(q);
    setVerbQuizFeedback(null);
    setVerbQuizInput('');
  };

  const processVocabAnswer = (answerToCheck = null) => {
    if (feedback !== null) return;
    const finalAnswer = answerToCheck !== null ? answerToCheck : userInput;
    if (!finalAnswer.trim() && answerToCheck === null) return;

    let correctAnswerStr = '';
    if (vocabTestMode === 'sentence_srs' || vocabTestMode === 'sentence_infinite') {
        if (currentQuestionDirection === 'j2c') {
            correctAnswerStr = parseExample(currentVocab.example || currentVocab.word || currentVocab.reading).translation || currentVocab.meaning;
        } else {
            correctAnswerStr = parseExample(currentVocab.example || currentVocab.word || currentVocab.reading).plainSentence || currentVocab.word || currentVocab.reading;
        }
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

    setRoundHistory(prev => [...prev, { id: currentVocab.id, isVocab: true,
      question: (vocabTestMode === 'sentence_srs' || vocabTestMode === 'sentence_infinite') ? 
        (currentQuestionDirection === 'j2c' ? (parseExample(currentVocab.example || currentVocab.word || currentVocab.reading).plainSentence || currentVocab.word || currentVocab.reading) : (parseExample(currentVocab.example || currentVocab.word || currentVocab.reading).translation || currentVocab.meaning)) 
        : (inputMode === 'kanji' ? `${currentVocab.reading} (${currentVocab.meaning})` : currentVocab.meaning),
      userAnswer: finalAnswer,
      correctAnswer: correctAnswerStr,
      userIsCorrect: isCorrect,
      explanation: currentVocab.word ? `核心單字：${currentVocab.word}` : `純假名單字`
    }]);

    if (vocabTestMode === 'srs' || vocabTestMode === 'sentence_srs') {
       let quality = 0;
       if (isCorrect) {
           if (timeSpent <= actualTimeLimit / 2) quality = 5;
           else if (timeSpent <= actualTimeLimit * 0.8) quality = 4;
           else quality = 3;
       }
       setVocabDB(prevDB => prevDB.map(v => {
           if (v.id === currentVocab.id) {
               let ef = v.ef || 2.5; let interval = v.interval || 0; let reps = v.repetitions || 0; let status = v.status || 'learning';
               if (quality >= 3) {
                   ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
                   if (ef < 1.3) ef = 1.3;
                   if (reps === 0) interval = 1;
                   else if (reps === 1) interval = 2;
                   else if (reps === 2) interval = 4;
                   else if (reps === 3) interval = 7;
                   else if (reps === 4) interval = 14;
                   else interval = Math.round(interval * ef);
                   reps++;
                   if (reps >= 5) status = 'mastered';
               } else { reps = 0; interval = 0; status = 'learning'; }
               return { ...v, ef, interval, repetitions: reps, nextReview: Date.now() + interval * 86400000, status, lastReviewed: Date.now() };
           }
           return v;
       }));
    }

    if (!isCorrect && (vocabTestMode === 'srs' || vocabTestMode === 'today_extra')) {
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
      if (customGrammars.length === 0) { alert('文法公式庫為空！請先建立公式。'); goHome(); return; }
      const now = Date.now();
      const srsGrammars = customGrammars.filter(g => g.status !== 'new' && (g.nextReview || 0) <= now);
      let storedIds = getTodayGrammarIds();
      if (storedIds === null) {
        const newGrammars = customGrammars
          .filter(g => g.status === 'new')
          .sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0) || String(a.id).localeCompare(String(b.id)))
          .slice(0, dailyNewGrammarLimit);
        storedIds = newGrammars.map(g => g.id);
        setTodayGrammarIds(storedIds);
      }
      const todayNewGrammars = customGrammars.filter(g => storedIds.includes(g.id));
      const dueGrammars = [...srsGrammars, ...todayNewGrammars];
      if (dueGrammars.length === 0) { alert('🎉 今日文法複習已完畢！'); goHome(); return; }

      verbDB.forEach(word => {
        dueGrammars.forEach(grammar => { 
          if (onlyImportantVerbTest && !word.isImportant) return;
          if (onlyImportantGrammarTest && !grammar.isImportant) return;
          if (grammar.appliesTo.includes(word.type) && word[grammar.baseForm]) { availablePool.push({ word, target: grammar.id, grammarDef: grammar }); } 
        });
      });
    }
    else {
      const processWord = (word) => {
        validTargets.forEach(target => {
          const customDef = customGrammars.find(g => g.id === target);
          if (customDef) {
             if (customDef.appliesTo.includes(word.type) && word[customDef.baseForm]) {
               availablePool.push({ word, target: customDef.id, grammarDef: customDef });
             }
          } else {
             if (word[target]) availablePool.push({ word, target, grammarDef: null });
          }
        });
      };

      if (mode === 'custom') {
        if (customWordIds.length === 0) { alert('請先到設定勾選自訂單字！'); goHome(); return; }
        verbDB.filter(w => customWordIds.includes(w.id)).forEach(processWord);
      } else {
        let filteredWords = verbDB.filter(w => activeWordTypes.includes(w.type));
        if (onlyImportantVerbTest) {
          const impPool = filteredWords.filter(w => w.isImportant);
          if (impPool.length > 0) filteredWords = impPool;
          else alert('目前勾選的詞性中沒有標記為「重要」的動詞/形容詞！將回到一般出題。');
        }
        if (onlyLearnedVerbTest) {
          const learnedPool = filteredWords.filter(w => w.learnStatus === 'learned');
          if (learnedPool.length > 0) filteredWords = learnedPool;
          else alert('目前沒有已學習的動詞/形容詞！將回到全部出題。');
        }
        // 每日動詞解鎖上限：限制 'new' learnStatus 的動詞數量
        const newVerbs = filteredWords.filter(w => w.learnStatus === 'new');
        const learnedVerbs = filteredWords.filter(w => w.learnStatus !== 'new');
        if (newVerbs.length > 0) {
          let storedVerbIds = getTodayVerbIds();
          if (storedVerbIds === null) {
            const pickedNewVerbs = newVerbs
              .sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0) || String(a.id).localeCompare(String(b.id)))
              .slice(0, dailyNewVerbLimit);
            storedVerbIds = pickedNewVerbs.map(v => v.id);
            setTodayVerbIds(storedVerbIds);
          }
          const todayNewVerbs = newVerbs.filter(v => storedVerbIds.includes(v.id));
          filteredWords = [...learnedVerbs, ...todayNewVerbs];
        }
        if (filteredWords.length === 0) return;
        filteredWords.forEach(processWord);
      }
    }

    if (availablePool.length === 0) {
      alert('找不到符合條件的單字，請檢查您的出題基準與變化目標設定是否衝突！');
      return;
    }
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
       const baseName = verbForms.find(f => f.id === currentGrammarDef.baseForm)?.label || GRAMMAR_ADJ_FORMS.find(f => f.id === currentGrammarDef.baseForm)?.label || currentGrammarDef.baseForm;
       exp = `自訂文法【${currentGrammarDef.name}】變化規則：接在【${baseName}】後` +
             (currentGrammarDef.removeStr ? `去掉「${currentGrammarDef.removeStr}」，` : '，') + `加上「${currentGrammarDef.appendStr}」。`;
    } else exp = getExplanation(currentVerb, currentTarget);

    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setExplanation(exp);
    setUserInput(finalAnswer);

    const qTitle = `請將「${stripRuby(currentVerb[sourceForm])}」轉換為【${currentGrammarDef ? currentGrammarDef.name : verbForms.find(f=>f.id===currentTarget)?.label || currentTarget}】：`;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setCombo(prev => prev + 1);
      if (verbTestMode === 'rpg') setHp(prev => prev + 1);
      setVerbDB(prev => prev.map(x => {
        if (x.id !== currentVerb.id) return x;
        const todayStr = new Date().toLocaleDateString('en-CA'); // e.g. YYYY-MM-DD
        const newDates = Array.from(new Set([...(x.correctDates || []), todayStr]));
        return { ...x, correctDates: newDates, learnStatus: newDates.length >= 3 ? 'learned' : x.learnStatus };
      }));
    } else {
      setCombo(0);
      if (verbTestMode === 'rpg') setHp(prev => prev - 1);
      setMistakeBank(prev => ({ ...prev, [`${currentVerb.id}_${currentTarget}`]: { wordObj: currentVerb, target: currentTarget, grammarDef: currentGrammarDef } }));
    }

    setRoundHistory(prev => [...prev, { id: currentVerb.id, isVocab: false, question: qTitle, userAnswer: finalAnswer, correctAnswer: currentCorrectPlain, userIsCorrect: isCorrect, explanation: exp }]);

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
    } else {
      setCustomGrammars(prev => prev.map(g => {
        if (g.id !== currentGrammarDef.id) return g;
        const timeSpent = actualTimeLimit - timeLeft;
        let quality = 0;
        if (isCorrect) {
          if (timeSpent <= actualTimeLimit / 2) quality = 5;
          else if (timeSpent <= actualTimeLimit * 0.8) quality = 4;
          else quality = 3;
        }
        let ef = g.ef || 2.5; let interval = g.interval || 0; let reps = g.repetitions || 0; let status = g.status || 'new';
        if (quality >= 3) {
          ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
          if (ef < 1.3) ef = 1.3;
          if (reps === 0) interval = 1;
          else if (reps === 1) interval = 2;
          else if (reps === 2) interval = 3;
          else if (reps === 3) interval = 5;
          else if (reps === 4) interval = 10;
          else interval = Math.round(interval * ef);
          reps++;
          if (reps >= 5) status = 'mastered';
          else status = 'learning';
        } else {
          reps = 0; interval = 0; status = 'learning';
        }
        return {
          ...g,
          ef, interval, repetitions: reps,
          nextReview: Date.now() + interval * 86400000,
          totalAttempts: (g.totalAttempts || 0) + 1,
          totalCorrect: (g.totalCorrect || 0) + (isCorrect ? 1 : 0),
          status
        };
      }));
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
    const defaultOpt = verbForms.find(f => f.id === id);
    if (defaultOpt) return defaultOpt.label;
    const customOpt = customGrammars.find(g => g.id === id);
    if (customOpt) return customOpt.name;
    return id;
  };

  const [batchInputs, setBatchInputs] = useState(Array.from({ length: 5 }, () => ({ word: '', reading: '', meaning: '', tag: '自訂', tags: [], example: '', exampleMeaning: '', isSentence: false })));
  useEffect(() => {
    const emptyCard = { word: '', reading: '', meaning: '', tag: '未知', tags: [], example: '', exampleMeaning: '', isSentence: false };
    if (batchInputs.length === 0) { setBatchInputs([emptyCard]); return; }
    const last = batchInputs[batchInputs.length - 1];
    if (last.word || last.reading || last.meaning || last.example) {
      setBatchInputs(prev => [...prev, emptyCard]);
    }
  }, [batchInputs]);
  const [editingKanjiId, setEditingKanjiId] = useState(null);
  const [autoUnlock, setAutoUnlock] = useState(false);
  const obsidianFileRef = React.useRef(null);
  const [obsidianScannedWords, setObsidianScannedWords] = useState([]);
  const [isScanningObsidian, setIsScanningObsidian] = useState(false);
  const [importText, setImportText] = useState('');
  const [editingVocabId, setEditingVocabId] = useState(null);
  const [vocabEditForm, setVocabEditForm] = useState({ word: '', reading: '', meaning: '', example: '', exampleMeaning: '', tags: [] });
  useEffect(() => {
    document.body.style.overflow = editingVocabId ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [editingVocabId]);
  const [editingVerbId, setEditingVerbId] = useState(null);
  const [verbEditForm, setVerbEditForm] = useState({ masu: '', jisho: '', te: '', meaning: '', tags: [] });
  const [verbEditExpanded, setVerbEditExpanded] = useState(false);
  useEffect(() => { setVerbEditExpanded(false); }, [editingVerbId]);
  useEffect(() => {
    document.body.style.overflow = editingVerbId ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [editingVerbId]);

  const [verbImportText, setVerbImportText] = useState('');
  const [verbBatchItems, setVerbBatchItems] = useState([]);
  const [isVerbBatchOpen, setIsVerbBatchOpen] = useState(true);
  useEffect(() => {
    const emptyVerb = getInitialVerbInputs();
    if (verbBatchItems.length === 0) { setVerbBatchItems([emptyVerb]); return; }
    const last = verbBatchItems[verbBatchItems.length - 1];
    if (last.jisho || last.meaning) {
      setVerbBatchItems(prev => [...prev, emptyVerb]);
    }
  }, [verbBatchItems]);
  const [addToReviewNow, setAddToReviewNow] = useState(true);
  const [batchLayoutMode, setBatchLayoutMode] = useState(() => localStorage.getItem('verbApp_batchLayoutMode') || 'grid3');
  const [showObsidianHelp, setShowObsidianHelp] = useState(false);
  const [showObsidianSection, setShowObsidianSection] = useState(() => localStorage.getItem('verbApp_showObsidian') === 'true');
  const [showQuickPasteSection, setShowQuickPasteSection] = useState(() => localStorage.getItem('verbApp_showQuickPaste') === 'true');
  const [showBatchSection, setShowBatchSection] = useState(() => localStorage.getItem('verbApp_showBatch') === 'true');

  const obsidianTemplate = `### 🚗 交通工具 (這個會變成標籤)
- くるま（車）
➜ 汽車
- じてんしゃ（自転車）
➜ 腳踏車

#### 📝 例句
- 毎日バスで学校へ行きます。
➜ 每天搭公車去學校。`;

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(obsidianTemplate);
    alert('模板已複製！');
  };

  const handleRematchBatchTheme = (idx) => {
    const n = [...batchInputs];
    const item = n[idx];
    if (item.meaning) {
        const newTag = guessTag(item.meaning, vocabDB);
        const cleanedTags = (item.tags || []).filter(t => t !== item.tag);
        const newTags = (newTag && newTag !== '自訂') ? [...cleanedTags, newTag] : cleanedTags;
        n[idx].tag = newTag;
        n[idx].tags = newTags;
        setBatchInputs(n);
    } else if (item.word || item.reading) {
        const jWord = (item.word || item.reading).trim();
        const existingMatch = vocabDB.find(v =>
            (v.word === jWord || v.reading === jWord) &&
            v.tag && v.tag !== '自訂' && v.tag !== '未分類' && v.tag !== '未知'
        );
        if (existingMatch) {
            n[idx].tag = existingMatch.tag;
            n[idx].tags = [existingMatch.tag];
            setBatchInputs(n);
        }
    }
  };

  const [selectedBatchIds, setSelectedBatchIds] = useState(new Set());
  const toggleBatchSelect = (idx) => setSelectedBatchIds(prev => { const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n; });

  const handleBatchRematchSelected = () => {
    setBatchInputs(prev => prev.map((item, idx) => {
      if (!selectedBatchIds.has(idx)) return item;
      if (item.meaning) {
        const newTag = guessTag(item.meaning, vocabDB);
        const cleanedTags = (item.tags || []).filter(t => t !== item.tag);
        const newTags = (newTag && newTag !== '自訂') ? [...cleanedTags, newTag] : cleanedTags;
        return { ...item, tag: newTag, tags: newTags };
      } else if (item.word || item.reading) {
        const jWord = (item.word || item.reading).trim();
        const match = vocabDB.find(v => (v.word === jWord || v.reading === jWord) && v.tag && v.tag !== '自訂' && v.tag !== '未知');
        if (match) return { ...item, tag: match.tag, tags: [match.tag] };
      }
      return item;
    }));
    setSelectedBatchIds(new Set());
  };

  const handleBatchDeleteSelected = () => {
    setBatchInputs(prev => prev.filter((_, i) => !selectedBatchIds.has(i)));
    setSelectedBatchIds(new Set());
  };

  const handleRematchAllBatchThemes = () => {
    setBatchInputs(prev => prev.map(item => {
      if (item.meaning) {
        const newTag = guessTag(item.meaning, vocabDB);
        const cleanedTags = (item.tags || []).filter(t => t !== item.tag);
        const newTags = (newTag && newTag !== '自訂') ? [...cleanedTags, newTag] : cleanedTags;
        return { ...item, tag: newTag, tags: newTags };
      } else if (item.word || item.reading) {
        const jWord = (item.word || item.reading).trim();
        const existingMatch = vocabDB.find(v =>
          (v.word === jWord || v.reading === jWord) &&
          v.tag && v.tag !== '自訂' && v.tag !== '未分類' && v.tag !== '未知'
        );
        if (existingMatch) return { ...item, tag: existingMatch.tag, tags: [existingMatch.tag] };
      }
      return item;
    }));
  };

  const [selectedVocabIds, setSelectedVocabIds] = useState(new Set());
  const toggleVocabSelect = (id) => setSelectedVocabIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const handleBatchRematchThemes = () => {
    if (selectedVocabIds.size === 0) return;
    setVocabDB(prev => prev.map(v => {
      if (!selectedVocabIds.has(v.id) || !v.meaning) return v;
      const others = prev.filter(x => x.id !== v.id);
      const newTag = guessTag(v.meaning, others);
      const cleanedTags = (v.tags || []).filter(t => t !== v.tag);
      const newTags = (newTag && newTag !== '自訂') ? [...cleanedTags, newTag] : cleanedTags;
      return { ...v, tag: newTag, tags: newTags };
    }));
    setSelectedVocabIds(new Set());
  };

  const handleRematchDbTheme = (id, meaning) => {
    if (!meaning) return;
    const otherVocabs = vocabDB.filter(v => v.id !== id);
    const newTag = guessTag(meaning, otherVocabs);
    setVocabDB(prev => prev.map(v => {
      if (v.id !== id) return v;
      const cleanedTags = (v.tags || []).filter(t => t !== v.tag);
      const newTags = (newTag && newTag !== '自訂') ? [...cleanedTags, newTag] : cleanedTags;
      return { ...v, tag: newTag, tags: newTags };
    }));
  };

  const handleRematchVerbDbTheme = (id, meaning) => {
    if (!meaning) return;
    const newTag = guessTag(meaning, vocabDB);
    setVerbDB(prev => prev.map(v => {
      if (v.id !== id) return v;
      const cleanedTags = (v.tags || []).filter(t => t !== v.tag);
      const newTags = (newTag && newTag !== '自訂') ? [...cleanedTags, newTag] : cleanedTags;
      return { ...v, tag: newTag, tags: newTags };
    }));
  };

  const [selectedVerbIds, setSelectedVerbIds] = useState(new Set());
  const toggleVerbSelect = (id) => setSelectedVerbIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const handleBatchRematchVerbThemes = () => {
    if (selectedVerbIds.size === 0) return;
    setVerbDB(prev => prev.map(v => {
      if (!selectedVerbIds.has(v.id) || !v.meaning) return v;
      const newTag = guessTag(v.meaning, vocabDB);
      const cleanedTags = (v.tags || []).filter(t => t !== v.tag);
      const newTags = (newTag && newTag !== '自訂') ? [...cleanedTags, newTag] : cleanedTags;
      return { ...v, tag: newTag, tags: newTags };
    }));
    setSelectedVerbIds(new Set());
  };


  const [obsidianScannedGrammar, setObsidianScannedGrammar] = useState([]);

  const parseObsidianNotes = (text) => {
    const vocabResults = [];

    let currentMode = 'vocab'; 
    let currentTag = '自訂';
    
    let currentVocab = null;

    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
         const line = lines[i].trim();
         if (!line) continue;

         if (line.includes('💬 對話') || line.includes('3️⃣ 💬')) {
             currentMode = 'skip';
             continue;
         }

         if (line.startsWith('### ')) {
             const rawHeader = line.replace(/^###\s+/, '').trim();
             currentMode = 'vocab';
             currentTag = rawHeader.replace(/^[\s\S]*?(?=[a-zA-Z\u4e00-\u9fa5\u3040-\u309F\u30A0-\u30FF])/, '').trim() || rawHeader;
             continue;
         }

         if (currentMode === 'skip') {
             if (line.startsWith('### ') || line.startsWith('## ')) {
             } else {
                 continue;
             }
         }

         if (line.startsWith('#### 📝 例句')) {
             currentMode = 'sentence';
             continue;
         }

         if (line.startsWith('- ')) {
             const rawContent = line.substring(2).trim();
             
             if (currentMode === 'vocab') {
                 if (currentVocab) vocabResults.push({...currentVocab});
                 
                 let word = rawContent;
                 let reading = rawContent;
                 const bracketMatch = rawContent.match(/^(.+?)（(.+?)）$/) || rawContent.match(/^(.+?)\((.+?)\)$/);
                 if (bracketMatch) {
                     word = bracketMatch[2].trim() + '[' + bracketMatch[1].trim() + ']';
                     reading = bracketMatch[1].trim();
                 }
                 currentVocab = {
                    id: 'obs_' + Date.now() + '_' + Math.random().toString(36).substring(2,9),
                    word, reading, meaning: '', tag: currentTag, example: '', isSentence: false,
                    ef: 2.5, interval: 0, repetitions: 0, nextReview: Date.now(), status: 'learning'
                 };
             } else if (currentMode === 'sentence') {
                 if (currentVocab) vocabResults.push({...currentVocab});
                 currentVocab = {
                    id: 'obs_' + Date.now() + '_' + Math.random().toString(36).substring(2,9),
                    word: rawContent, reading: rawContent, meaning: '', tag: currentTag, example: '', isSentence: true,
                    ef: 2.5, interval: 0, repetitions: 0, nextReview: Date.now(), status: 'learning'
                 };
             }
             continue;
         }

         if (currentVocab && (line.startsWith('➜ ') || line.startsWith('-> ') || line.startsWith('=> ') || line.startsWith('👉 '))) {
             currentVocab.meaning = line.replace(/^(➜|->|=>|👉)\s*/, '').trim();
             vocabResults.push({...currentVocab});
             currentVocab = null;
         }
    }
    if (currentVocab) vocabResults.push(currentVocab);

    return { vocabResults };
  };

  const handleScanObsidian = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
          setIsScanningObsidian(true);
          const allVocabs = [];
          const allGrammars = [];
          
          const text = await file.text();
          const { vocabResults } = parseObsidianNotes(text);
          allVocabs.push(...vocabResults);
          
          // Deduplicate Vocabs
          const existingWords = new Set(vocabDB.map(v => v.word));
          const newWords = allVocabs.filter(v => !existingWords.has(v.word));
          const uniqueNewWords = [];
          const seen = new Set();
          for (const w of newWords) {
              if (!seen.has(w.word) && w.meaning.trim() !== '') {
                  seen.add(w.word);
                  uniqueNewWords.push(w);
              }
          }

          // Deduplicate Grammars
          const existingGrammars = new Set(customGrammars.map(g => g.name + '_' + g.appendStr));
          const newGrammarsList = allGrammars.filter(g => !existingGrammars.has(g.name + '_' + g.appendStr));
          const uniqueNewGrammars = [];
          const seenGrammar = new Set();
          for (const g of newGrammarsList) {
              const key = g.name + '_' + g.appendStr;
              if (!seenGrammar.has(key)) {
                  seenGrammar.add(key);
                  uniqueNewGrammars.push(g);
              }
          }

          setObsidianScannedWords(uniqueNewWords);
          setObsidianScannedGrammar(uniqueNewGrammars);
          if (uniqueNewWords.length > 0 || uniqueNewGrammars.length > 0) { setShowObsidianSection(true); localStorage.setItem('verbApp_showObsidian', 'true'); }
          
          if (uniqueNewWords.length === 0 && uniqueNewGrammars.length === 0) {
              alert('掃描完成！沒有找到新單字與文法，或均已在字庫中。');
          } else {
              alert('掃描完成！共找到 ' + uniqueNewWords.length + ' 個新單字/例句，' + uniqueNewGrammars.length + ' 條新文法規則！');
          }
      } catch (err) {
          console.error(err);
          alert('掃描失敗或已取消授權。');
          e.target.value = ''; // Reset input so the same file can be selected again if needed
      } finally {
          setIsScanningObsidian(false);
      }
  };

  const handleImportObsidian = () => {
      if (obsidianScannedWords.length === 0 && obsidianScannedGrammar.length === 0) return;
      
      if (obsidianScannedWords.length > 0) {
          const newBatchItems = obsidianScannedWords.map(w => ({
              word: w.word,
              reading: w.reading !== w.word ? w.reading : '',
              meaning: w.meaning,
              tag: w.tag || 'Obsidian',
              example: w.example || '',
              isSentence: !!w.isSentence
          }));
          setBatchInputs(prev => {
              const filtered = prev.filter(v => v.word.trim() || v.reading.trim() || v.meaning.trim() || v.example.trim());
              return [...filtered, ...newBatchItems];
          });
      }
      
      alert('單字已放入「確認與編輯區」，請往下捲動查看並點擊「批次儲存」。');
  };

  const handleBatchSave = () => {
    createVocabBackup();
    const newVocabs = batchInputs
      .filter(v => (v.word.trim() || v.reading.trim() || v.example.trim()) && v.meaning.trim())
      .map((v, i) => ({
        id: `v_custom_${Date.now()}_${i}`, 
        word: v.word.trim(), 
        reading: v.reading.trim() || v.word.trim(), 
        meaning: v.meaning.trim(), 
        tag: v.tag || '自訂',
        tags: (v.tags && v.tags.length > 0) ? v.tags : (v.tag && v.tag !== '自訂' ? [v.tag] : []),
        example: v.example.trim(),
        exampleMeaning: v.exampleMeaning?.trim() || '',
        note: v.note?.trim() || '',
        isSentence: !!v.isSentence,
        addedAt: Date.now() + i,
        ef: 2.5, interval: 0, repetitions: 0, nextReview: 0, status: addToReviewNow ? 'learning' : 'new'
    }));

    const isDuplicate = (nv) => vocabDB.some(ev => {
        if (nv.word) return ev.word === nv.word;
        return ev.reading === nv.reading && !ev.word;
    });
    const duplicates = newVocabs.filter(isDuplicate);
    if (duplicates.length > 0) {
        const dupWords = duplicates.map(d => d.word || d.reading).join(', ');
        alert(`批次新增失敗！發現重複的單字：\n${dupWords}\n\n請手動刪除重複項目後再試一次！`);
        return;
    }

    if (newVocabs.length > 0) {
        setVocabDB(prev => [...prev, ...newVocabs]);
        setBatchInputs(Array.from({ length: 5 }, () => ({ word: '', reading: '', meaning: '', tag: '自訂', tags: [], example: '', isSentence: false })));
        alert(`成功加入 ${newVocabs.length} 個單字/例句到學習序列！`);
    } else alert('沒有找到可儲存的內容，請確認至少填寫「中文」與「平假名」或「例句」。');
  };

  


  const handleSmartImport = () => {
    createVocabBackup();
    if (!importText.trim()) return;
    const lines = importText.split('\n');
    const newItems = [];
    let currentTheme = '';

    const hasKanji = (str) => /[一-鿿]/.test(str);
    const hasHiragana = (str) => /[぀-ゟ]/.test(str);
    const hasKatakana = (str) => /[゠-ヿ]/.test(str);
    const isJapanese = (str) => hasHiragana(str) || hasKatakana(str);

    const cleanLine = (str) => str
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, m =>
        ['➜','➡️','➡','💬','💡','→'].includes(m) ? m : ' ')
      .replace(/^(?:\d+[.)、．]|[①-⑳]|[❶-❿]|[-\-\*\•\+◆◇▶▷►])\s*/, '')
      .trim();

    const parseJapaneseSide = (str) => {
      const bm = str.match(/^([^\(（]+)[\(（]([^\)）]+)[\)）]$/);
      if (bm) {
        const out = bm[1].trim(), ins = bm[2].trim();
        if (hasKanji(out) && isJapanese(ins)) return { word: out, reading: ins };
        if (!hasKanji(out) && hasKanji(ins) && !isJapanese(ins)) return { word: ins, reading: out };
        if (hasKanji(out) && hasKanji(ins) && !isJapanese(ins)) return { word: out, reading: '' };
        return { word: '', reading: out };
      }
      return hasKanji(str) ? { word: str, reading: '' } : { word: '', reading: str };
    };

    lines.forEach(line => {
      let trimmed = cleanLine(line);
      if (!trimmed) return;

      // 主題標籤：【...】 [...] # ...
      const headerMatch = trimmed.match(/^[【\[\(#＃](.+?)[】\]\)]?\s*$/);
      if (headerMatch && !isJapanese(headerMatch[1]) && !/➜|->|：/.test(trimmed)) {
        currentTheme = headerMatch[1].trim();
        return;
      }

      // 例句行
      const exMatch = trimmed.match(/^(?:💬|例：|例:|💡|EX:|EX：)\s*(.+)$/i);
      if (exMatch) {
        if (newItems.length > 0) newItems[newItems.length - 1].example = exMatch[1].trim();
        return;
      }

      // 行內分隔符：日文 ➜/→/：/＝ 中文（同一行）
      const sepMatch = trimmed.match(/^(.+?)\s*(?:➜|➡️|➡|-->|==>|=>|->|→|：|＝|=)\s*(.+)$/);
      if (sepMatch) {
        const left = sepMatch[1].trim(), right = sepMatch[2].trim();
        let japSide = left, meanSide = right;
        if (!isJapanese(left) && isJapanese(right)) { japSide = right; meanSide = left; }
        const { word, reading } = parseJapaneseSide(japSide);
        const tag = currentTheme || guessTag(meanSide, vocabDB);
        newItems.push({ word, reading, meaning: meanSide, tag, tags: currentTheme ? [currentTheme] : [], example: '', isSentence: false });
        return;
      }

      // 空白分隔：「たべる 食べること」（左側有假名、右側無假名）
      const spaceSep = trimmed.match(/^(\S+)\s+(.+)$/);
      if (spaceSep && isJapanese(spaceSep[1]) && !isJapanese(spaceSep[2])) {
        const { word, reading } = parseJapaneseSide(spaceSep[1].trim());
        const meanSide = spaceSep[2].trim();
        const tag = currentTheme || guessTag(meanSide, vocabDB);
        newItems.push({ word, reading, meaning: meanSide, tag, tags: currentTheme ? [currentTheme] : [], example: '', isSentence: false });
        return;
      }

      // 獨立箭頭行（接在上一筆後面）
      const arrowMatch = trimmed.match(/^(?:➜|➡️|➡|->|=>|-->|==>|→|>)\s*(.+)$/);
      if (arrowMatch) {
        const meaning = arrowMatch[1].trim();
        if (newItems.length > 0 && !newItems[newItems.length - 1].meaning) {
          newItems[newItems.length - 1].meaning = meaning;
          if (!currentTheme) newItems[newItems.length - 1].tag = guessTag(meaning, vocabDB);
        }
        return;
      }

      // Tab / 多格空白 / 逗號分隔多欄
      const parts = trimmed.split(/\t+|[,，]+|\s{2,}/).map(s => s.trim()).filter(Boolean);
      if (parts.length >= 3) {
        const { word, reading } = parseJapaneseSide(parts[0]);
        newItems.push({ word, reading, meaning: parts[2], tag: currentTheme || '自訂', tags: [], example: '', isSentence: false });
      } else if (parts.length === 2) {
        const [p0, p1] = parts;
        let japSide = p0, meanSide = p1;
        if (!isJapanese(p0) && isJapanese(p1)) { japSide = p1; meanSide = p0; }
        const { word, reading } = parseJapaneseSide(japSide);
        newItems.push({ word, reading, meaning: meanSide, tag: currentTheme || '自訂', tags: [], example: '', isSentence: false });
      } else {
        const bm = trimmed.match(/^([^\(（]+)[\(（]([^\)）]+)[\)）]$/);
        if (bm) {
          const out = bm[1].trim(), ins = bm[2].trim();
          let word = '', reading = '', meaning = '';
          if (hasKanji(out) && isJapanese(ins)) { word = out; reading = ins; }
          else if (isJapanese(out) && !isJapanese(ins) && hasKanji(ins)) { reading = out; meaning = ins; }
          else if (hasKanji(out) && !isJapanese(ins)) { word = out; meaning = ins; }
          else { reading = out; meaning = ins; }
          newItems.push({ word, reading, meaning, tag: currentTheme || '自訂', tags: [], example: '', isSentence: false });
        } else {
          const { word, reading } = parseJapaneseSide(trimmed);
          newItems.push({ word, reading, meaning: '', tag: currentTheme || '自訂', tags: [], example: '', isSentence: false });
        }
      }
    });

    const validNewItems = newItems.filter(item => (item.word || item.reading || item.example) && item.meaning);
    if (validNewItems.length > 0) {
        validNewItems.forEach(item => {
            if (item.tag === '自訂') {
                item.tag = guessTag(item.meaning, vocabDB);
            }
        });
        const existingFilled = batchInputs.filter(v => (v.word.trim() || v.reading.trim() || v.example.trim()) && v.meaning.trim());
        let updatedList = [...existingFilled, ...validNewItems];
        if (updatedList.length < 5) updatedList = [...updatedList, ...Array.from({ length: 5 - updatedList.length }, () => ({ word: '', reading: '', meaning: '', tag: '自訂', example: '', isSentence: false }))];
        setBatchInputs(updatedList);
        setImportText(''); 
    }
  };

  const handleUnlockNewWords = () => {
    // 1. 取得指定主題的所有內建單字
    const systemWords = getWordsByTheme(unlockTheme);
    const existingWords = new Set(vocabDB.map(v => v.word));
    const poolFromSys = systemWords.filter(v => !existingWords.has(v.word)).map((v, i) => ({
       ...v,
       id: `v_sys_${Date.now()}_${i}`,
       status: 'learning',
       nextReview: Date.now()
    }));

    // 2. 加上以前卡在資料庫裡的 new 單字 (相容舊資料)
    let poolFromUser = vocabDB.filter(v => v.status === 'new');
    if (unlockTheme !== 'random') {
       poolFromUser = poolFromUser.filter(v => v.tag === unlockTheme);
    }

    const pool = [...poolFromSys, ...poolFromUser];

    if (pool.length === 0) return alert('這個主題的單字已經全部解鎖完畢囉！請選擇其他主題，或去「動詞與單字庫管理」自行新增。');
    
    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, unlockAmount);
    
    setFlashcardQueue(selected);
    setCurrentFlashcardIndex(0);
    setAppState('flashcard_learning');
  };

  const handleReferenceDraw = () => {
    let pool;
    if (referenceTheme === 'verb_all') {
      pool = verbDB;
    } else {
      pool = vocabDB.filter(v => v.status !== 'new');
      if (referenceTheme !== 'random') {
        pool = pool.filter(v => v.tag === referenceTheme);
      }
    }
    if (pool.length === 0) return alert('沒有符合條件的單字/動詞可供抽卡！');
    
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, referenceAmount);
    
    setReferenceQueue(selected);
    setAppState('theme_reference');
  };

  const handleFinishFlashcards = () => {
    // 預習完成後，將這些單字正式寫入使用者的 vocabDB
    setVocabDB(prev => {
       const prevMap = new Map(prev.map(v => [v.id, v]));
       flashcardQueue.forEach(item => {
           if (prevMap.has(item.id)) {
               // 原本就在 DB 的 (來自舊 new 狀態)，更新為 learning
               prevMap.set(item.id, { ...item, status: 'learning', nextReview: Date.now(), lastReviewed: Date.now() });
           } else {
               // 來自系統辭典庫的全新單字，直接存入
               prevMap.set(item.id, { ...item, lastReviewed: Date.now() });
           }
       });
       return Array.from(prevMap.values());
    });
    setAppState('home');
    alert(`太棒了！您已經解鎖並預習了 ${flashcardQueue.length} 個新單字！它們已被正式加入您的學習清單中。`);
  };

  const [editingGrammarId, setEditingGrammarId] = useState(null);
  const [grammarSortConfig, setGrammarSortConfig] = useState({ key: null, direction: null });
  const [grammarFilterTag, setGrammarFilterTag] = useState('');
  const [newGrammar, setNewGrammar] = useState({ name: '', translation: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '', exampleTranslation: '', extraExamples: [], processExample: '', note: '', tag: '', tags: [], structureNote: '' });
  const [isGrammarExtraOpen, setIsGrammarExtraOpen] = useState(false);
  const [isGrammarFormReordering, setIsGrammarFormReordering] = useState(false);
  const [grammarTagsOpen, setGrammarTagsOpen] = useState(false);
  const [grammarFormOrder, setGrammarFormOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('grammarFormOrder');
      if (saved) {
        let p = JSON.parse(saved);
        if (Array.isArray(p)) {
          p = p.filter(id => id !== 'example' && id !== 'exampleTranslation' && id !== 'tag');
          if (!p.includes('exampleBlock')) p.splice(p.indexOf('structureNote') + 1, 0, 'exampleBlock');
          if (!p.includes('tags')) p.splice(p.indexOf('baseForm') + 1, 0, 'tags');
          if (p.length >= 6) return p;
        }
      }
    } catch {}
    return ['name','translation','baseForm','tags','structureNote','exampleBlock','advanced'];
  });
  const [isGrammarReordering, setIsGrammarReordering] = useState(false);
  const [grammarDragIdx, setGrammarDragIdx] = useState(null);
  const [grammarDragOverIdx, setGrammarDragOverIdx] = useState(null);
  useEffect(() => { localStorage.setItem('grammarFormOrder', JSON.stringify(grammarFormOrder)); }, [grammarFormOrder]);

  const handleEditGrammar = (g) => {
    setEditingGrammarId(g.id);
    setNewGrammar({
      name: g.name || '',
      baseForm: g.baseForm || 'te',
      removeStr: g.removeStr || '',
      appendStr: g.appendStr || '',
      appliesTo: g.appliesTo || ['verb'],
      translation: g.translation || '', example: g.example || '', exampleTranslation: g.exampleTranslation || '', extraExamples: g.extraExamples || [], processExample: g.processExample || '', note: g.note || '', tag: g.tag || '', tags: g.tags || [], structureNote: g.structureNote || ''
    });
  };

  const handleAddGrammar = () => {
    if (!newGrammar.name) { alert('請填寫文法名稱！'); return; }

    if (editingGrammarId) {
        setCustomGrammars(prev => prev.map(g => g.id === editingGrammarId ? { ...g, ...newGrammar } : g));
        setEditingGrammarId(null);
    } else {
        const isDup = customGrammars.some(g => g.name.trim() === newGrammar.name.trim());
        if (isDup) { alert(`「${newGrammar.name.trim()}」已存在於文法公式庫中！`); return; }
        setCustomGrammars(prev => [...prev, { ...newGrammar, id: `g_custom_${Date.now()}`, addedAt: Date.now() }]);
    }
    setNewGrammar({ name: '', translation: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '', exampleTranslation: '', processExample: '', note: '', tag: '', tags: [], structureNote: '' });
  };

  const getInitialVerbInputs = () => {
      const base = { type: 'verb', group: '1', difficulty: 'n5', masu: '', meaning: '', tags: [], irregular: false };
      verbForms.forEach(f => { base[f.id] = ''; });
      return base;
  };
  const [verbInputs, setVerbInputs] = useState(getInitialVerbInputs);

  const handleVerbInputChange = (key, value) => {
      setVerbInputs(prev => {
          const next = { ...prev, [key]: value };
          if (key === 'jisho' && next.type === 'verb') {
              const j = value.trim();
              if (j.endsWith('する')) {
                  next.group = '3';
              } else if (j === 'くる' || j.endsWith('くる') || (/来/.test(j) && j.endsWith('る'))) {
                  next.group = '3';
              } else if (/[むぬぶすくぐつう]$/.test(j)) {
                  next.group = '1';
              }
          }
          if ((key === 'masu' || key === 'group' || key === 'type') && next.type === 'verb' && next.masu) {
              const autoGen = autoConjugateVerb(next.masu, next.group);
              if (autoGen) {
                  return { ...next, ...autoGen };
              }
          }
          return next;
      });
  };

    const autoDetectVerbType = (jisho) => {
      const naList = [
        // N5
        'しずか','べんり','しんせつ','たいせつ','すき','きらい','じょうず','へた','げんき','ゆうめい',
        'きれい','にぎやか','まじめ','ていねい','ふべん','だいじょうぶ','かんたん','とくべつ','じゆう',
        'あんぜん','ひつよう','じゅうぶん','ざんねん','たいへん','きけん','ふつう',
        // N4
        'じゅうよう','むり','とくい','にがて','ゆたか','さかん','てきとう','しんぱい','すてき',
        'あんしん','かんこう','そうだい','ゆうしゅう','しんせん','ねっしん','こうふく','せいかつ',
        'じゅうじつ','ふまん','こうつう','えいぎょう','せいこう','しっぱい','しんちょう',
        // N3
        'こうへい','さわやか','しつれい','しんこく','せいかく','なだらか','ぶじ','へいわ',
        'めんどう','よけい','かっきてき','けんこう','ていちょう','とうぜん','どくとく',
        'むだ','むしょう','むじゃき','じみ','はで','ふかのう','たんじゅん','えんかつ','おだやか',
        'かいてき','ひかえめ','そぼく','きちょう','じゅんすい','ふさわしい',
        // N2
        'せっきょくてき','しょうきょくてき','しゅたいてき','きゃっかんてき','しゅかんてき',
        'ぐたいてき','ちゅうしょうてき','けんきょ','ごうまん','おうへい','やっかい','そまつ',
        'せいそ','せいけつ','すなお','じゅうなん','せいじつ','ちゅうじつ','てきせつ','てきかく',
        'だとう','かんけつ','めいかく','めいかい','そっちょく','びみょう','あいまい',
        'とくゆう','きんいつ','びょうどう','こうせい','ゆうこう','むこう','ゆうり','ふり',
        'ゆうのう','むのう','かんぺき','しょうちょうてき','こうりてき','はんのうてき',
        // N1
        'あざやか','なごやか','なめらか','やわらか','おろそか','はるか','わずか','ほのか',
        'ひそか','さりげない','おごそか','にわか','しなやか','たおやか','ゆるやか',
        'いかめしい','きびしい',
        'けいそつ','こうみょう','しつぼう','たんのう','てんさい','どりょく','はんぱ',
        'ふとう','ふてきせつ','むこうみず','むとんじゃく','らんぼう','りりしい',
        'いちじるしい','おびただしい',
      ];
      if (naList.includes(jisho)) return { type: 'adj_na', group: 'na' };
      if (jisho.endsWith('い')) return { type: 'adj_i', group: 'i' };
      return { type: 'unknown', group: '1' };
    };

    const handleVerbSmartImport = () => {
    if (!verbImportText.trim()) return;
    const lines = verbImportText.split('\n');
    const newVerbs = [];
    let currentGroup = '1';
    let currentType = 'verb';
    let headerSet = false;

    const hasHiragana = (s) => /[぀-ゟ]/.test(s);
    const hasKatakana = (s) => /[゠-ヿ]/.test(s);
    const isJapanese = (s) => hasHiragana(s) || hasKatakana(s);

    const cleanVerbLine = (str) => str
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, m => ['💬','💡','➜','➡️','➡','→'].includes(m) ? m : ' ')
      .replace(/^(?:\d+[.)、．]|[①-⑳]|[❶-❿]|[-\-\*\•\+◆▶►])\s*/, '')
      .trim();

    const stripTypeHint = (str) => str.replace(/[（(]\s*(?:い形|な形|動詞|adj_i|adj_na|verb)\s*[）)]/g, '').trim();

    const pushVerb = (jisho, meaning, type, group) => {
      const verbObj = getInitialVerbInputs();
      verbObj.type = type; verbObj.group = group;
      verbObj.jisho = jisho; verbObj.meaning = meaning;
      if (type === 'verb') {
        const forms = autoConjugate(jisho, group);
        if (forms && Object.keys(forms).length > 0) Object.assign(verbObj, forms);
      }
      newVerbs.push(verbObj);
    };

    lines.forEach(line => {
        let trimmed = cleanVerbLine(line);
        if (!trimmed) return;

        // 主題 header
        const headerMatch = trimmed.match(/^[【\[\(#](.+?)[】\]\)]?\s*$/);
        if (headerMatch && !trimmed.includes('➜') && !trimmed.includes('->') && !trimmed.includes('=')) {
            const h = headerMatch[1].trim();
            headerSet = true;
            if (h.includes('第一') || h.match(/^1/)) { currentGroup = '1'; currentType = 'verb'; }
            else if (h.includes('第二') || h.match(/^2/)) { currentGroup = '2'; currentType = 'verb'; }
            else if (h.includes('第三') || h.includes('不規則') || h.match(/^3/)) { currentGroup = '3'; currentType = 'verb'; }
            else if (h.includes('い形') || h.includes('i形')) { currentGroup = 'i'; currentType = 'adj_i'; }
            else if (h.includes('な形') || h.includes('na形')) { currentGroup = 'na'; currentType = 'adj_na'; }
            return;
        }

        // 例句行
        const exampleMatch = trimmed.match(/^(?:💬|例：|例:|💡)\s*(.*)$/);
        if (exampleMatch) {
            if (newVerbs.length > 0) newVerbs[newVerbs.length - 1].example = exampleMatch[1].trim();
            return;
        }

        // 行內分隔符：jisho ➜/=/：/→ meaning（同一行）
        const sepMatch = trimmed.match(/^(.+?)\s*(?:➜|➡️|➡|-->|==>|=>|->|→|：|＝|=)\s*(.+)$/);
        if (sepMatch) {
            let japSide = sepMatch[1].trim(), meanSide = stripTypeHint(sepMatch[2].trim());
            if (!isJapanese(japSide) && isJapanese(meanSide)) { [japSide, meanSide] = [meanSide, japSide]; }
            const detected = headerSet ? { type: currentType, group: currentGroup } : autoDetectVerbType(japSide);
            pushVerb(japSide, meanSide, detected.type, detected.group);
            return;
        }

        // 空白分隔：「すずしい 涼快的」（左側有假名、右側無假名）
        const spaceSepMatch = trimmed.match(/^(\S+)\s+(.+)$/);
        if (spaceSepMatch && isJapanese(spaceSepMatch[1]) && !isJapanese(spaceSepMatch[2])) {
            let japSide = spaceSepMatch[1].trim(), meanSide = stripTypeHint(spaceSepMatch[2].trim());
            const detected = headerSet ? { type: currentType, group: currentGroup } : autoDetectVerbType(japSide);
            pushVerb(japSide, meanSide, detected.type, detected.group);
            return;
        }

        // 換行格式：jisho 一行，meaning 下一行
        if (newVerbs.length === 0 || newVerbs[newVerbs.length - 1].meaning !== '') {
            const detected = headerSet ? { type: currentType, group: currentGroup } : autoDetectVerbType(trimmed);
            pushVerb(trimmed, '', detected.type, detected.group);
        } else {
            newVerbs[newVerbs.length - 1].meaning = stripTypeHint(trimmed);
        }
    });

    const validVerbs = newVerbs.filter(v => v.jisho && v.meaning);
    if (validVerbs.length > 0) {
        setVerbBatchItems(prev => [...prev.filter(v => v.jisho?.trim() || v.meaning?.trim()), ...validVerbs]);
        setVerbImportText('');
    } else {
        alert('解析失敗，請確認格式是否為「辭書形」換行「中文意思」，或使用 ➜ 分隔。');
    }
  };

  const handleVerbBatchSave = () => {
    const isVerbDuplicate = (nv) => verbDB.some(ev => (ev.jisho && ev.jisho === nv.jisho) || (ev.masu && ev.masu === nv.masu));
    const filledItems = verbBatchItems.filter(v => v.jisho?.trim());
    const duplicates = filledItems.filter(isVerbDuplicate);
    if (duplicates.length > 0) {
        const dupWords = duplicates.map(d => d.jisho || d.masu).join(', ');
        if (!window.confirm(`發現重複的動詞/形容詞：\n${dupWords}\n\n是否跳過重複項目，儲存其餘 ${filledItems.length - duplicates.length} 筆？`)) return;
    }
    const toSave = filledItems.filter(v => !isVerbDuplicate(v));
    if (toSave.length === 0) { alert('沒有可儲存的項目！'); return; }
    setVerbDB(prev => [...prev, ...toSave.map((v, i) => {
      const finalTag = v.tag || guessTag(v.meaning, vocabDB);
      const finalTags = (v.tags && v.tags.length > 0) ? v.tags : (finalTag ? [finalTag] : []);
      return { ...v, tag: finalTag, tags: finalTags, id: v.type + '_custom_' + Date.now() + '_' + i, addedAt: Date.now() + i };
    })]);
    setVerbBatchItems([]);
    alert('成功儲存 ' + toSave.length + ' 個詞彙！');
  };

  const handleAddVerb = () => {
    if (!verbInputs.masu || !verbInputs.meaning) return alert('請填寫至少 masu, meaning');
    const isVerbDuplicate = verbDB.some(ev => (ev.jisho && ev.jisho === verbInputs.jisho) || (ev.masu && ev.masu === verbInputs.masu));
    if (isVerbDuplicate) {
        alert('此動詞/形容詞已存在於題庫中（辭書形或ます形重複），禁止重複新增！');
        return;
    }
    const newTag = guessTag(verbInputs.meaning, vocabDB);
    setVerbDB(prev => [...prev, { ...verbInputs, tag: newTag, tags: newTag && newTag !== '自訂' ? [newTag] : [], id: `${verbInputs.type}_custom_${Date.now()}`, addedAt: Date.now() }]);
    setVerbInputs(getInitialVerbInputs());
  };

  // 在 Theme Select 中取得有效主題清單
  const availableThemes = Array.from(new Set(vocabDB.map(v => v.tag))).filter(t => t && t !== '自訂' && t !== '未分類');

  const createVocabBackup = () => {
    localStorage.setItem('verbApp_vocabDB_backup', JSON.stringify(vocabDB));
  };

  const handleRestoreBackup = () => {
    const backup = localStorage.getItem('verbApp_vocabDB_backup');
    if (!backup) return alert('沒有找到前一次的操作備份喔！');
    if (window.confirm('確定要還原到前一次的狀態嗎？這會覆蓋目前的單字庫！')) {
      try {
        const parsed = JSON.parse(backup);
        setVocabDB(parsed);
        alert('還原成功！');
      } catch (e) {
        alert('還原失敗：檔案格式錯誤');
      }
    }
  };

  const handlePasteConfirm = () => {
    const now = Date.now();
    const vocabItems = parsedPasteItems.filter(i => i.selected && i.type === 'vocab');
    const verbItems = parsedPasteItems.filter(i => i.selected && i.type === 'verb');
    if (vocabItems.length > 0) {
      const newVocab = vocabItems.map(item => ({
        id: 'v_paste_' + now + '_' + Math.random().toString(36).slice(2),
        word: item.word, reading: item.reading, meaning: item.meaning,
        tag: item.tag || '自訂', tags: item.tag && item.tag !== '自訂' ? [item.tag] : [],
        status: 'new', difficulty: 'n5', srsLevel: 0,
        nextReview: now, addedAt: now, example: item.example || '', exampleMeaning: '', history: [],
      }));
      setVocabDB(prev => [...prev, ...newVocab]);
    }
    if (verbItems.length > 0) {
      const newVerbs = verbItems.map(item => {
        const jisho = item.word;
        const group = jisho.endsWith('する') ? '3' : jisho.endsWith('くる') || jisho === 'くる' ? '3' : /[むぬぶすくぐつう]$/.test(jisho) ? '1' : '2';
        const forms = autoConjugate(jisho, group);
        return {
          id: 'verb_paste_' + now + '_' + Math.random().toString(36).slice(2),
          type: 'verb', group, jisho, masu: forms.masu || '', meaning: item.meaning,
          tag: item.tag || '自訂', tags: item.tag && item.tag !== '自訂' ? [item.tag] : [],
          status: 'not_started', difficulty: 'n5', irregular: false, addedAt: now, ...forms,
        };
      });
      setVerbDB(prev => [...prev, ...newVerbs]);
    }
    const saved = vocabItems.length + verbItems.length;
    const grammarCount = parsedPasteItems.filter(i => i.selected && i.type === 'grammar').length;
    alert(`✅ 已加入 ${saved} 筆${grammarCount > 0 ? `（文法 ${grammarCount} 筆請手動至文法庫新增）` : ''}`);
    setAppState('home');
    setPasteText(''); setParsedPasteItems([]); setPasteAnalyzed(false);
  };

  const handleExportData = () => {
    const data = {
      vocabDB,
      verbDB,
      verbForms,
      verbTableColumnOrder,
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
    createVocabBackup();
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
        if (data.verbDB && Array.isArray(data.verbDB)) {
          setVerbDB(data.verbDB);
          restored = true;
        }
        if (data.verbForms && Array.isArray(data.verbForms)) {
          setVerbForms(data.verbForms);
          restored = true;
        }
        if (data.verbTableColumnOrder && Array.isArray(data.verbTableColumnOrder)) {
          setVerbTableColumnOrder(data.verbTableColumnOrder);
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
    const cleanToken = githubToken.trim();
    const cleanGistId = gistId.trim();
    if (!cleanToken) return alert('請先輸入 GitHub Token');
    setIsSyncing(true);
    try {
      const data = { vocabDB, verbDB, verbForms, verbTableColumnOrder, customGrammars, grammarProgress, exportDate: new Date().toISOString() };
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
          'Authorization': `token ${cleanToken}`,
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
      if (!cleanGistId) setGistId(json.id);
      alert('上傳至 GitHub 成功！');
    } catch (err) {
      console.error(err);
      alert('上傳失敗，請檢查您的 GitHub Token 是否正確且具有 gist 權限。');
    } finally {
      setIsSyncing(false);
    }
  };

  const syncFromGitHub = async () => {
    const cleanToken = githubToken.trim();
    const cleanGistId = gistId.trim();
    if (!cleanToken || !cleanGistId) return alert('請輸入 GitHub Token 與 Gist ID');
    if (!window.confirm('此操作會以雲端資料覆蓋本地進度，確定要下載嗎？')) return;
    setIsSyncing(true);
    try {
      const res = await fetch(`https://api.github.com/gists/${cleanGistId}`, {
        headers: {
          'Authorization': `token ${cleanToken}`,
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

  const dashboardStats = React.useMemo(() => {
     const now = Date.now();
     const grammarDue = customGrammars.filter(g => g.status !== 'new' && (g.nextReview || 0) <= now).length;
     // 單字：使用混搭模式的有效數量（複習上限 + 新字名額）
     const effectiveVocab = effectiveTodayStats.total;
     const totalDue = effectiveVocab + grammarDue;

     const vocabMistakesCount = Object.keys(vocabMistakes).length;
     const otherMistakesCount = Object.keys(mistakeBank).length;
     const totalMistakes = vocabMistakesCount + otherMistakesCount;

     return {
        totalDue, totalMistakes, effectiveVocab,
        reviewCount: effectiveTodayStats.reviewCount, newVocabCount: effectiveTodayStats.newVocabCount,
        vocabTotal: vocabDB.length, verbTotal: verbDB.length, grammarTotal: customGrammars.length, kanjiTotal: kanjiDB.length
     };
  }, [vocabDB, verbDB, customGrammars, kanjiDB, vocabMistakes, mistakeBank, todayQueue, effectiveTodayStats]);

  const guessTag = React.useCallback((meaning, db) => guessThemeByMeaning(meaning, db, tagKeywordsMap), [tagKeywordsMap]);

    const globalTagStats = React.useMemo(() => {
      const stats = {};
      const addTags = (tags) => {
          if (!Array.isArray(tags)) return;
          tags.forEach(t => { stats[t] = (stats[t] || 0) + 1; });
      };
      vocabDB.forEach(v => addTags(v.tags));
      verbDB.forEach(v => addTags(v.tags));
      customGrammars.forEach(g => addTags(g.tags));
      kanjiDB.forEach(k => addTags(k.tags));
      return stats;
  }, [vocabDB, verbDB, customGrammars, kanjiDB]);

  const globalSearchResults = React.useMemo(() => {
     if (!globalSearchTerm.trim()) return null;
     const q = globalSearchTerm.trim().toLowerCase();
     
     const scoreField = (val, query) => {
         if (!val) return 0;
         const v = val.toLowerCase();
         if (v === query) return 3;
         if (v.startsWith(query)) return 2;
         if (v.includes(query)) return 1;
         return 0;
     };

     const scoreTags = (tags, query) => {
         if (!Array.isArray(tags)) return 0;
         let max = 0;
         tags.forEach(t => {
             const lower = t.toLowerCase();
             if (lower === query) max = Math.max(max, 3);
             else if (lower.startsWith(query)) max = Math.max(max, 2);
             else if (lower.includes(query)) max = Math.max(max, 1);
         });
         return max;
     };

     const calculateScore = (titleFields, contentFields, tags) => {
         let titleScore = 0;
         for (let text of titleFields) { titleScore = Math.max(titleScore, scoreField(text, q)); }
         
         let tagScore = scoreTags(tags, q);

         let contentScore = 0;
         for (let text of contentFields) { contentScore = Math.max(contentScore, scoreField(text, q)); }

         if (titleScore > 0) return 100 + titleScore;
         if (tagScore > 0) return 50 + tagScore;
         if (contentScore > 0) return 10 + contentScore;
         return 0;
     };

     const results = { vocab: [], verb: [], grammar: [], kanji: [] };

     vocabDB.forEach(v => {
         let s = calculateScore([v.word, v.reading], [v.meaning, v.notes, v.example], v.tags);
         if (s > 0) results.vocab.push({ item: v, score: s });
     });
     verbDB.forEach(v => {
         let s = calculateScore([v.jisho], [v.meaning, v.notes], v.tags);
         if (s > 0) results.verb.push({ item: v, score: s });
     });
     customGrammars.forEach(g => {
         let s = calculateScore([g.name], [g.suffix], g.tags);
         if (s > 0) results.grammar.push({ item: g, score: s });
     });
     kanjiDB.forEach(k => {
           let s = calculateScore([k.kanji], [k.meaning], k.tags);
           if (s > 0) results.kanji.push({ item: k, score: s });
       });
       
       // Override scoring to heavily prioritize Title > Tag > Content
       const adjustScore = (r, titleStr, tags) => {
           let finalScore = 0;
           const q = globalSearchTerm.trim().toLowerCase();
           if (!q) return;
           if (titleStr && titleStr.toLowerCase().includes(q)) finalScore += 100;
           if (tags && tags.some(t => t.toLowerCase().includes(q))) finalScore += 50;
           if (finalScore === 0) finalScore = r.score; // fallback to content match
           r.score = finalScore;
       };
       
       results.vocab.forEach(r => adjustScore(r, r.item.word || r.item.reading, r.item.tags));
       results.verb.forEach(r => adjustScore(r, r.item.jisho, r.item.tags));
       results.grammar.forEach(r => adjustScore(r, r.item.name, r.item.tags));
       results.kanji.forEach(r => adjustScore(r, r.item.kanji, r.item.tags));

       results.vocab.sort((a, b) => b.score - a.score);
       results.verb.sort((a, b) => b.score - a.score);
       results.grammar.sort((a, b) => b.score - a.score);
       results.kanji.sort((a, b) => b.score - a.score);

     return results;
  }, [globalSearchTerm, vocabDB, verbDB, customGrammars, kanjiDB]);
  const handleGlobalSearchClick = (type, term, id) => {
      setRecentSearches(prev => [term, ...prev.filter(t => t !== term)].slice(0, 10));
      setShowGlobalSearch(false);
      setGlobalSearchTerm('');
      
      setSearchTerm(term);
      setTargetId(id);

      if (type === 'vocab') {
         setVocabManageTab('vocab');
         setAppState('vocab_manage');
      } else if (type === 'kanji') {
         setVocabManageTab('kanji');
         setAppState('vocab_manage');
      } else if (type === 'verb') {
         setAppState('verb_manage');
      } else if (type === 'grammar') {
         setAppState('grammar_manage');
      }
  };

    useEffect(() => {
    if (targetId) {
        const timer = setTimeout(() => {
            const el = document.getElementById('item-' + targetId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => setTargetId(null), 3000);
            }
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [targetId, appState, vocabManageTab]);

  const grammarStats = React.useMemo(() => {
    let newCount = 0; let learningCount = 0; let masteredCount = 0; let dueCount = 0;
    let totalAttempts = 0; let totalCorrect = 0;
    const now = Date.now();
    customGrammars.forEach(g => {
       if (g.status === 'new') newCount++;
       else if (g.status === 'learning') learningCount++;
       else if (g.status === 'mastered') masteredCount++;
       
       if (g.status !== 'new' && (g.nextReview || 0) <= now) dueCount++;
       totalAttempts += (g.totalAttempts || 0);
       totalCorrect += (g.totalCorrect || 0);
    });
    const dueTotal = newCount + dueCount;
    const mistakeGrammarsCount = new Set(Object.values(mistakeBank).filter(m => m.grammarDef).map(m => m.grammarDef.id)).size;
    const accuracy = totalAttempts >= 20 ? Math.round((totalCorrect / totalAttempts) * 100) : null;
    return { newCount, learningCount, masteredCount, dueTotal, mistakeGrammarsCount, totalAttempts, accuracy };
  }, [customGrammars, mistakeBank]);

  return (
    <div className="app-root min-h-screen bg-slate-50 text-slate-800 p-4 font-sans selection:bg-blue-200 pb-20">
      
      {appState !== 'home' && appState !== 'paste' && (
         <header className="max-w-4xl mx-auto flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 relative z-50">
            <div className="flex items-center gap-3">
              <button onClick={goHome} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"><Home className="w-5 h-5" /></button>
              <h1 className="font-bold text-slate-800 hidden sm:block">
                {appState === 'vocab_playing' ? '單字記憶特訓' : appState === 'verb_playing' ? '動詞變化特訓' : appState === 'theme_select' ? '主題闖關大廳' : appState === 'vocab_manage' ? '管理單字記憶庫' : '管理自訂文法'}
              </h1>
            </div>
            {(appState === 'verb_playing' || appState === 'vocab_playing') && (
              <button onClick={() => { setIsPaused(true); setShowSettingsModal(true); }} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"><Settings className="w-5 h-5" /></button>
            )}
         </header>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold flex items-center gap-2"><Settings className="w-6 h-6 text-slate-600"/> 系統與測驗設定</h2><button onClick={()=>setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-600"><XCircle className="w-6 h-6"/></button></div>
             <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">📅 每日學習上限</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <label className="text-sm text-slate-600 whitespace-nowrap">單字每日複習上限</label>
                      <div className="flex items-center gap-2">
                        <input type="number" min={1} max={500} value={dailyReviewLimit}
                          onChange={e => { const v = Math.max(1, Number(e.target.value)); setDailyReviewLimit(v); localStorage.setItem('jp_daily_review_limit', String(v)); }}
                          className="w-20 p-2 rounded-lg border border-slate-200 text-center text-sm focus:outline-none focus:border-blue-400" />
                        <span className="text-xs text-slate-400">題</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <label className="text-sm text-slate-600 whitespace-nowrap">單字每日新字上限</label>
                      <div className="flex items-center gap-2">
                        <input type="number" min={0} max={100} value={dailyNewVocabLimit}
                          onChange={e => { const v = Math.max(0, Number(e.target.value)); setDailyNewVocabLimit(v); localStorage.setItem('jp_daily_vocab_limit', String(v)); }}
                          className="w-20 p-2 rounded-lg border border-slate-200 text-center text-sm focus:outline-none focus:border-blue-400" />
                        <span className="text-xs text-slate-400">字</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <label className="text-sm text-slate-600 whitespace-nowrap">文法每日新公式上限</label>
                      <div className="flex items-center gap-2">
                        <input type="number" min={0} max={50} value={dailyNewGrammarLimit}
                          onChange={e => { const v = Math.max(0, Number(e.target.value)); setDailyNewGrammarLimit(v); localStorage.setItem('jp_daily_grammar_limit', String(v)); }}
                          className="w-20 p-2 rounded-lg border border-slate-200 text-center text-sm focus:outline-none focus:border-blue-400" />
                        <span className="text-xs text-slate-400">條</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <label className="text-sm text-slate-600 whitespace-nowrap">動詞每日新動詞上限</label>
                      <div className="flex items-center gap-2">
                        <input type="number" min={0} max={100} value={dailyNewVerbLimit}
                          onChange={e => { const v = Math.max(0, Number(e.target.value)); setDailyNewVerbLimit(v); localStorage.setItem('jp_daily_verb_limit', String(v)); }}
                          className="w-20 p-2 rounded-lg border border-slate-200 text-center text-sm focus:outline-none focus:border-blue-400" />
                        <span className="text-xs text-slate-400">個</span>
                      </div>
                    </div>
                  </div>
                </div>
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
                <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">⭐ 專屬特訓</h3>
                    {(appState === 'vocab_playing' || appState === 'home') && (
                      <label className="flex items-center gap-2 cursor-pointer p-2"><input type="checkbox" checked={onlyImportantVocabTest} onChange={(e)=>setOnlyImportantVocabTest(e.target.checked)} className="w-5 h-5 text-amber-500 rounded border-slate-300"/><span>僅針對標記為「重要」的單字出題</span></label>
                    )}
                    {(appState === 'verb_playing' || appState === 'home') && (
                      <>
                        <label className="flex items-center gap-2 cursor-pointer p-2"><input type="checkbox" checked={onlyImportantVerbTest} onChange={(e)=>setOnlyImportantVerbTest(e.target.checked)} className="w-5 h-5 text-amber-500 rounded border-slate-300"/><span>僅針對標記為「重要」的動詞/形容詞出題</span></label>
                        <label className="flex items-center gap-2 cursor-pointer p-2"><input type="checkbox" checked={onlyImportantGrammarTest} onChange={(e)=>setOnlyImportantGrammarTest(e.target.checked)} className="w-5 h-5 text-emerald-500 rounded border-slate-300"/><span>僅針對標記為「重要」的文法公式出題</span></label>
                        <label className="flex items-center gap-2 cursor-pointer p-2 border-t border-slate-100 mt-1"><input type="checkbox" checked={onlyLearnedVerbTest} onChange={(e)=>setOnlyLearnedVerbTest(e.target.checked)} className="w-5 h-5 text-emerald-600 rounded border-slate-300"/><span>只從「已學習」的動詞/形容詞出題</span></label>
                        <label className="flex items-center gap-2 cursor-pointer p-2"><input type="checkbox" checked={onlyLearnedGrammarTest} onChange={(e)=>setOnlyLearnedGrammarTest(e.target.checked)} className="w-5 h-5 text-emerald-600 rounded border-slate-300"/><span>只從「已學習」的文法公式出題</span></label>
                      </>
                    )}
                </div>
             </div>
             
                 {appState === 'verb_playing' && (
                  <>
                    <div className="pt-6 border-t border-slate-100 mt-6">
                      <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">出題基準 (看到什麼形)</h3>
                      <select value={sourceForm} onChange={(e) => setSourceForm(e.target.value)} className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors">
                        {verbForms.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center justify-between mt-6">變化練習目標 (要變成什麼形) <span className="text-xs font-normal text-slate-500">可複選</span></h3>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-50 rounded-xl border-2 border-slate-100">
                        {verbForms.map(f => {
                           if (f.id === sourceForm) return null;
                           return (
                             <label key={f.id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
                               <input type="checkbox" checked={targetForms.includes(f.id)} onChange={(e) => {
                                 if (e.target.checked) setTargetForms(prev => [...prev, f.id]);
                                 else setTargetForms(prev => prev.filter(x => x !== f.id));
                               }} className="w-4 h-4 text-blue-600 rounded"/>
                               <span className="text-sm truncate text-slate-700">{f.label}</span>
                             </label>
                           );
                        })}
                        {customGrammars.map(g => {
                           return (
                             <label key={`g_${g.id}`} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100">
                               <input type="checkbox" checked={targetForms.includes(g.id)} onChange={(e) => {
                                 if (e.target.checked) setTargetForms(prev => [...prev, g.id]);
                                 else setTargetForms(prev => prev.filter(x => x !== g.id));
                               }} className="w-4 h-4 text-emerald-600 rounded"/>
                               <span className="text-sm truncate text-emerald-700 font-medium">{g.name}</span>
                             </label>
                           );
                        })}
                      </div>
                    </div>
                  </>
                 )}
                 


  <button onClick={() => { setShowSettingsModal(false); if(appState === 'verb_playing') { generateVerbQuestion(verbTestMode); } }} className="w-full mt-8 py-3 bg-slate-800 text-white rounded-xl font-bold">完成設定</button>
          </div>
        </div>
      )}

      {showManualModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl animate-in zoom-in-95 flex flex-col" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
             <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur rounded-t-3xl z-10">
                <h2 className="text-2xl font-black flex items-center gap-3 text-slate-800">
                   <BookOpen className="w-8 h-8 text-amber-500"/> 日文綜合特訓中心 - 使用說明書
                </h2>
                <button onClick={()=>setShowManualModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"><XCircle className="w-7 h-7"/></button>
             </div>
             <div className="p-6 overflow-y-auto space-y-8 text-slate-700">
               <section>
                 <h3 className="text-xl font-bold text-slate-800 mb-4 border-b-2 border-amber-200 pb-2 flex items-center gap-2"><Home className="w-6 h-6 text-amber-500"/> 一、首頁：學習的起點</h3>
                 <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl">
                       <h4 className="font-bold text-amber-700 mb-2">1. 每日新詞解鎖 (Daily Unlock)</h4>
                       <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
                          <li><strong>用途</strong>：每天開始時，先從這裡獲取新的單字。</li>
                          <li><strong>操作</strong>：拉桿選擇解鎖數量（最高 10 個），選定主題。</li>
                          <li><strong>邏輯</strong>：系統會從您「完全沒背過」的資料庫中抽出新詞，解鎖後立刻進入預習狀態。</li>
                       </ul>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl">
                       <h4 className="font-bold text-amber-700 mb-2">2. 今日複習任務 (SRS Review)</h4>
                       <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
                          <li><strong>用途</strong>：系統根據遺忘曲線，自動安排今天需要複習的任務。</li>
                          <li><strong>內容</strong>：包含「字卡測驗」與「文法測驗」，精準對付您最容易忘記的部分。</li>
                       </ul>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl">
                       <h4 className="font-bold text-amber-700 mb-2">3. 智慧單字庫與公式庫</h4>
                       <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
                          <li>可以查看您所有的學習進度，並能快速進入「動詞與形容詞庫」或建立「文法公式庫」。</li>
                       </ul>
                    </div>
                 </div>
               </section>

               <section>
                 <h3 className="text-xl font-bold text-slate-800 mb-4 border-b-2 border-blue-200 pb-2 flex items-center gap-2"><Swords className="w-6 h-6 text-blue-500"/> 二、測驗模式介紹</h3>
                 <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-2xl">
                       <h4 className="font-bold text-blue-700 mb-2">1. 單字字卡測驗 (Vocab Test)</h4>
                       <p className="mb-2">主要考驗您對<strong>單字本身</strong>的理解。支援選擇題與打字輸入。</p>
                       <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
                          <li><strong>一般模式</strong>：看日文選中文。</li>
                          <li><strong>例句填空測驗</strong>：若單字有例句，系統會將單字挖空，讓您依上下文選出正確讀音。</li>
                       </ul>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl">
                       <h4 className="font-bold text-blue-700 mb-2">2. 文法測驗 (Grammar Dojo)</h4>
                       <p className="mb-2"><strong>不考單字意思</strong>，專門訓練大腦的<strong>文法變形反應速度</strong>！</p>
                       <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
                          <li>畫面上出現動詞或形容詞原形（如：食べる），您必須回答指定的變化形態（如：食べて）。</li>
                          <li>考題會自動從您的「文法公式庫」中隨機抽取。</li>
                       </ul>
                    </div>
                 </div>
               </section>

               <section>
                 <h3 className="text-xl font-bold text-slate-800 mb-4 border-b-2 border-indigo-200 pb-2 flex items-center gap-2"><Settings className="w-6 h-6 text-indigo-500"/> 三、進階管理功能</h3>
                 <div className="space-y-4">
                    <div className="bg-indigo-50 p-4 rounded-2xl">
                       <h4 className="font-bold text-indigo-700 mb-2">1. 動詞與形容詞庫 (Verbs & Adjectives DB)</h4>
                       <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
                          <li><strong>自動變形</strong>：存入單字時，系統自動幫您算出十二種以上的時態與變化（ます形、て形、使役被動等）！支援動詞、い形容詞、な形容詞。</li>
                          <li><strong>智慧貼上區</strong>：直接貼上一大串日文文本，系統會自動分析出裡面的動詞和形容詞，讓您一鍵加入資料庫。</li>
                       </ul>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-2xl">
                       <h4 className="font-bold text-indigo-700 mb-2">2. 文法公式庫 (Custom Grammar)</h4>
                       <p className="mb-2">將「文法句型」模組化，把規則教給系統，它就會自動幫您出題！</p>
                       <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
                          <li><strong>自由建立公式</strong>：設定接續的「基礎形」（如接在 て形 後），以及要刪除或「加上的字尾」（如加上 ください）。</li>
                          <li><strong>動態示範單字</strong>：在畫面上方隨意選擇您資料庫中的任何一個單字（🏃動詞 或 ✨形容詞），底下所有的公式範例都會瞬間跟著變身！</li>
                       </ul>
                    </div>
                 </div>
               </section>
             </div>
             <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl text-center">
                <button onClick={()=>setShowManualModal(false)} className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors">我了解了，開始訓練！</button>
             </div>
          </div>
        </div>
      )}

      {showTagMgr && (() => {
        const allTags = Object.keys(globalTagStats).sort((a,b) => globalTagStats[b] - globalTagStats[a]);
        const vocabTagCounts = {};
        vocabDB.forEach(v => { if (v.tag && v.tag !== '自訂' && v.tag !== '未分類') vocabTagCounts[v.tag] = (vocabTagCounts[v.tag] || 0) + 1; });
        const handleKw = (tag, raw) => {
          const kws = raw.split(/[,，、\s]+/).map(k => k.trim()).filter(k => k.length >= 2);
          setTagKeywordsMap(prev => ({ ...prev, [tag]: kws }));
        };
        return (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setShowTagMgr(false)}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">🏷️ 標籤管理</h2>
                <button onClick={() => setShowTagMgr(false)} className="text-slate-400 hover:text-slate-600"><XCircle className="w-6 h-6"/></button>
              </div>
              <div className="overflow-y-auto flex-1 p-6">
                <p className="text-xs text-slate-400 mb-4">設定關鍵字後，新增單字時系統可自動配對該標籤（需 2 字以上，逗號分隔）。「自動學習中」表示方法 2 已累積足夠資料。</p>
                <div className="space-y-2">
                  {allTags.length === 0 && <p className="text-center text-slate-400 py-8 text-sm">尚未建立任何標籤</p>}
                  {allTags.map(tag => {
                    const total = globalTagStats[tag] || 0;
                    const vocabCount = vocabTagCounts[tag] || 0;
                    const hasLearnedEnough = vocabCount >= 5;
                    const hasKeywords = (tagKeywordsMap[tag] || []).length > 0;
                    return (
                      <div key={tag} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-violet-200 transition-colors">
                        <div className="w-24 shrink-0">
                          <div className="text-sm font-bold text-slate-700 truncate" title={tag}>{tag}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{total} 筆資料</div>
                        </div>
                        <input
                          type="text"
                          key={`${tag}-${(tagKeywordsMap[tag]||[]).join(',')}`}
                          defaultValue={(tagKeywordsMap[tag] || []).join(', ')}
                          onBlur={e => handleKw(tag, e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleKw(tag, e.target.value)}
                          placeholder="辨識關鍵字（選填）"
                          className="flex-1 min-w-0 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:border-violet-400 focus:ring-1 focus:ring-violet-100 outline-none"
                        />
                        <div className="shrink-0 flex flex-col items-end gap-1">
                          {hasKeywords && <span className="text-[10px] text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-200">關鍵字 ✓</span>}
                          {hasLearnedEnough && <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">自動學習中</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl">
                <button onClick={() => setShowTagMgr(false)} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors text-sm">完成</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== Side Drawer ===== */}
      {showDrawer && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowDrawer(false)}/>
          <div className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Puzzle className="w-5 h-5"/></div>
                <span className="font-black text-slate-800 text-base">選單</span>
              </div>
              <button onClick={() => setShowDrawer(false)} className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors font-bold text-lg leading-none">✕</button>
            </div>
            <div className="px-3 py-4 flex flex-col gap-0.5 flex-1">
              <div className="text-[11px] font-bold text-slate-400 tracking-widest px-3 py-2">〇 快速新增</div>
              <button onClick={() => { setAppState('paste'); setShowDrawer(false); }} className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-blue-50 transition-colors text-left w-full border border-blue-100 bg-blue-50/60 mb-1">
                <span className="text-base">📋</span><span className="text-sm font-bold text-blue-700 flex-1">智慧貼上筆記</span><span className="text-blue-300 text-xs">›</span>
              </button>
              <div className="text-[11px] font-bold text-slate-400 tracking-widest px-3 py-2 mt-1">📚 資料庫</div>
              {[
                { icon: '📚', label: '單字記憶庫', action: () => { setAppState('vocab_manage'); setShowDrawer(false); } },
                { icon: '🔄', label: '動詞與形容詞庫', action: () => { setAppState('verb_manage'); setShowDrawer(false); } },
                { icon: '🧩', label: '文法公式庫', action: () => { setAppState('grammar_manage'); setShowDrawer(false); } },
                { icon: '🏷️', label: '標籤管理', action: () => { setShowTagMgr(true); setShowDrawer(false); } },
              ].map(item => (
                <button key={item.label} onClick={item.action} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-left w-full">
                  <span className="text-base">{item.icon}</span><span className="text-sm font-medium text-slate-700 flex-1">{item.label}</span><span className="text-slate-300 text-xs">›</span>
                </button>
              ))}
              <div className="text-[11px] font-bold text-slate-400 tracking-widest px-3 py-2 mt-1">🧰 學習工具</div>
              <button onClick={() => { setAppState('theme_select'); setShowDrawer(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-left w-full">
                <span className="text-base">🗂️</span><span className="text-sm font-medium text-slate-700 flex-1">主題總覽閃卡</span><span className="text-slate-300 text-xs">›</span>
              </button>
              <div className="text-[11px] font-bold text-slate-400 tracking-widest px-3 py-2 mt-1">⚙️ 系統</div>
              <button onClick={() => { handleExportData(); setShowDrawer(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-left w-full">
                <span className="text-base">💾</span><span className="text-sm font-medium text-slate-700 flex-1">備份學習資料</span><span className="text-slate-300 text-xs">›</span>
              </button>
              <button onClick={() => { fileInputRef.current?.click(); setShowDrawer(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-left w-full">
                <span className="text-base">📂</span><span className="text-sm font-medium text-slate-700 flex-1">還原學習資料</span><span className="text-slate-300 text-xs">›</span>
              </button>
              <div className="text-[11px] font-bold text-slate-400 tracking-widest px-3 py-2 mt-1">☁️ GitHub 雲端同步</div>
              <div className="px-2 space-y-2 pb-2">
                <div>
                  <label className="text-xs font-bold text-slate-400 px-1 mb-1 block">Token (需 gist 權限)</label>
                  <input type="password" value={githubToken} onChange={e => setGithubToken(e.target.value)} placeholder="ghp_..." className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-400 text-slate-700" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 px-1 mb-1 block">Gist ID</label>
                  <input type="text" value={gistId} onChange={e => setGistId(e.target.value)} placeholder="留空以建立新檔..." className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-400 text-slate-700" />
                </div>
                <button onClick={syncToGitHub} disabled={isSyncing} className="w-full py-2.5 px-4 rounded-xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSyncing ? <RefreshCcw className="w-3 h-3 animate-spin"/> : null}{isSyncing ? '同步中…' : '⬆️ 上傳 (覆蓋雲端)'}
                </button>
                <button onClick={syncFromGitHub} disabled={isSyncing} className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSyncing ? <RefreshCcw className="w-3 h-3 animate-spin"/> : null}{isSyncing ? '同步中…' : '⬇️ 下載 (覆蓋本地)'}
                </button>
              </div>
              <button onClick={() => { setShowSettingsModal(true); setShowDrawer(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-left w-full">
                <span className="text-base">⚙️</span><span className="text-sm font-medium text-slate-700 flex-1">測驗與學習設定</span><span className="text-slate-300 text-xs">›</span>
              </button>
              <button onClick={() => { setShowManualModal(true); setShowDrawer(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-left w-full">
                <span className="text-base">📖</span><span className="text-sm font-medium text-slate-700 flex-1">使用說明</span><span className="text-slate-300 text-xs">›</span>
              </button>
            </div>
          </div>
        </>
      )}

      {appState === 'home' && (
        <div className="max-w-6xl mx-auto pt-6 sm:pt-12 animate-in fade-in slide-in-from-bottom-4">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowDrawer(true)} className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors shadow-sm flex-shrink-0">
                  <span className="block w-4 h-0.5 bg-slate-600 rounded-full"/>
                  <span className="block w-4 h-0.5 bg-slate-600 rounded-full"/>
                  <span className="block w-4 h-0.5 bg-slate-600 rounded-full"/>
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Puzzle className="w-6 h-6"/>
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xl font-black text-slate-800 leading-tight">日語記憶系統</div>
                    <div className="text-xs text-slate-400 font-medium">單字・動詞・文法・漢字 一站練習</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setAppState('paste')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm">
                  📋 <span className="hidden sm:inline">貼上筆記</span>
                </button>
                <ThemePanel />
                <button onClick={() => setShowManualModal(true)} className="p-2 bg-white text-amber-600 rounded-xl hover:bg-amber-50 transition-colors border border-slate-200 flex items-center gap-1.5 shadow-sm">
                  <BookOpen className="w-4 h-4"/>
                  <span className="hidden sm:inline text-sm font-bold">說明</span>
                </button>
              </div>
            </div>
            
            <div className="max-w-3xl mx-auto mb-10 space-y-4">
              <GlobalSearch 
                  globalSearchTerm={globalSearchTerm} 
                  setGlobalSearchTerm={setGlobalSearchTerm} 
                  showGlobalSearch={showGlobalSearch} 
                  setShowGlobalSearch={setShowGlobalSearch} 
                  recentSearches={recentSearches} 
                  setRecentSearches={setRecentSearches} 
                  globalSearchResults={globalSearchResults} 
                  handleGlobalSearchClick={handleGlobalSearchClick} 
                  renderTags={renderTags} 
              />

              {/* Dashboard Lite */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                 <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex flex-col items-center justify-center">
                       <div className="text-sm font-bold text-emerald-600 mb-1">🗓️ 今日待複習</div>
                       <div className="text-3xl font-black text-emerald-700">{dashboardStats.totalDue} <span className="text-sm font-normal text-emerald-500/70">題</span></div>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex flex-col items-center justify-center">
                       <div className="text-sm font-bold text-rose-600 mb-1">📒 錯題本</div>
                       <div className="text-3xl font-black text-rose-700">{dashboardStats.totalMistakes} <span className="text-sm font-normal text-rose-500/70">題</span></div>
                    </div>
                 </div>
                 <div className="grid grid-cols-4 gap-3">
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-center">
                       <div className="text-xs font-bold text-slate-400 mb-1">📚 單字</div>
                       <div className="text-xl font-bold text-slate-700">{dashboardStats.vocabTotal}</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-center">
                       <div className="text-xs font-bold text-slate-400 mb-1">🔄 動詞</div>
                       <div className="text-xl font-bold text-slate-700">{dashboardStats.verbTotal}</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-center">
                       <div className="text-xs font-bold text-slate-400 mb-1">📖 文法</div>
                       <div className="text-xl font-bold text-slate-700">{dashboardStats.grammarTotal}</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-center">
                       <div className="text-xs font-bold text-slate-400 mb-1">🈶 漢字</div>
                       <div className="text-xl font-bold text-slate-700">{dashboardStats.kanjiTotal}</div>
                    </div>
                 </div>
              </div>
            </div>
            {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">

            {/* ===== LEFT: 單字記憶庫 ===== */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500 text-white rounded-2xl shadow-sm"><Library className="w-5 h-5"/></div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 leading-tight">單字記憶庫</h2>
                    <p className="text-xs text-slate-400 font-medium">SRS 科學間隔複習系統</p>
                  </div>
                </div>
                <button onClick={() => setAppState('vocab_manage')} className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-blue-600 font-bold text-xs hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap">
                  📚 詞庫 ▶
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-white border border-[#ece7df] rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-[#4a4640] leading-none mb-1.5">{vocabDB.filter(v => v.status === 'new').length}</div>
                  <div className="text-xs font-bold text-[#aaa295]">📚 待學習</div>
                </div>
                <div className="bg-white border border-[#ece7df] rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-[#5b7ba3] leading-none mb-1.5">{vocabDB.filter(v => v.status === 'learning').length}</div>
                  <div className="text-xs font-bold text-[#aaa295]">🎯 已學習</div>
                </div>
                <div className="bg-white border border-[#ece7df] rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-[#54916c] leading-none mb-1.5">{vocabDB.filter(v => v.status === 'mastered').length}</div>
                  <div className="text-xs font-bold text-[#aaa295]">🏆 精通</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-[#ece7df] rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-[#4a4640] leading-none mb-1.5">{effectiveTodayStats.reviewCount}</div>
                  <div className="text-xs font-bold text-[#aaa295]">🗓️ 今日複習</div>
                  {todayQueue.length > dailyReviewLimit && <div className="text-[10px] text-orange-400 mt-0.5">共 {todayQueue.length} 題，上限 {dailyReviewLimit}</div>}
                </div>
                <div className="bg-white border border-[#ece7df] rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-[#4a4640] leading-none mb-1.5">{effectiveTodayStats.newVocabCount}</div>
                  <div className="text-xs font-bold text-[#aaa295]">✨ 今日新字</div>
                </div>
                <div className="bg-white border border-[#ece7df] rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-[#bd7256] leading-none mb-1.5">{Object.keys(vocabMistakes).length}</div>
                  <div className="text-xs font-bold text-[#aaa295]">📒 錯題本</div>
                </div>
              </div>

              {/* Primary Action */}
              {effectiveTodayStats.total > 0 ? (
                <button
                  onClick={() => startVocabSession('srs')}
                  className="w-full py-5 rounded-2xl font-bold text-lg flex justify-center items-center gap-2 transition-all bg-[#5b7ba3] text-white hover:bg-[#4f74a0] shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                  🌅 開始今日學習 ({effectiveTodayStats.reviewCount} 複習 + {effectiveTodayStats.newVocabCount} 新字)
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <button disabled className="w-full py-5 rounded-2xl font-bold text-lg flex justify-center items-center gap-2 transition-all bg-slate-100 text-slate-400 cursor-not-allowed">
                    🎉 今日任務全部完成！
                  </button>
                  {reviewedTodayQueue.length > 0 && (
                    <button
                      onClick={() => startVocabSession('today_extra')}
                      className="w-full py-3 rounded-2xl font-bold text-base flex justify-center items-center gap-2 bg-amber-50 border-2 border-amber-200 text-amber-700 hover:bg-amber-100 transition-all"
                    >
                      <RotateCcw className="w-5 h-5"/>重新複習今日單字 ({reviewedTodayQueue.length} 題)
                    </button>
                  )}
                </div>
              )}

              {/* Secondary Actions 2x2 */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button onClick={() => setAppState('theme_select')}
                  className="py-4 bg-white border border-[#ece7df] text-[#4a4640] rounded-2xl font-bold hover:bg-[#e8eef6] hover:border-[#cfdcea] transition-all text-sm flex flex-col items-center gap-1.5">
                  <span className="text-xl">🎮</span>主題單字闖關
                </button>
                <button onClick={() => startVocabSession('mistakes')}
                  disabled={Object.keys(vocabMistakes).length === 0}
                  className="py-4 bg-white border border-[#ece7df] text-[#4a4640] rounded-2xl font-bold hover:bg-[#e8eef6] hover:border-[#cfdcea] transition-all text-sm flex flex-col items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
                  <span className="text-xl">🔥</span>單字錯題特訓
                </button>
              </div>

              {/* 例句特訓區 */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button onClick={() => startVocabSession('sentence_srs')}
                  disabled={todaySentenceQueue.length === 0}
                  className="py-4 bg-white border border-[#ece7df] text-[#4a4640] rounded-2xl font-bold hover:bg-[#e8eef6] hover:border-[#cfdcea] transition-all text-sm flex flex-col items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
                  <span className="text-xl">🎯</span>例句專屬 SRS {todaySentenceQueue.length > 0 ? `(${todaySentenceQueue.length})` : '(完成)'}
                </button>
                <button onClick={() => startVocabSession('sentence_infinite')}
                  disabled={vocabDB.filter(v => (v.example && v.example.trim().length > 0) || v.isSentence).length === 0}
                  className="py-4 bg-white border border-[#ece7df] text-[#4a4640] rounded-2xl font-bold hover:bg-[#e8eef6] hover:border-[#cfdcea] transition-all text-sm flex flex-col items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
                  <span className="text-xl">♾️</span>例句無極限特訓
                </button>
              </div>

            </div>

            {/* ===== RIGHT: 動詞文法訓練場 ===== */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-sm"><RotateCcw className="w-5 h-5"/></div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 leading-tight">動詞文法訓練場</h2>
                    <p className="text-xs text-slate-400 font-medium">動詞變化與自訂文法練習</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setAppState('verb_manage')} className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-blue-600 font-bold text-xs hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap">
                    🔄 動詞庫 ▶
                  </button>
                  <button onClick={() => setAppState('grammar_manage')} className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-blue-600 font-bold text-xs hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap">
                    🧩 文法庫 ▶
                  </button>
                </div>
              </div>

              {/* Grammar Stats Cards */}
              {(() => {
                const totalVerbAttempts = verbDB.reduce((acc, v) => acc + (v.stats ? Object.values(v.stats).reduce((s, fs) => s + (fs.correct || 0) + (fs.wrong || 0), 0) : 0), 0);
                const totalVerbMistakes = verbDB.reduce((acc, v) => acc + (v.stats ? Object.values(v.stats).reduce((s, fs) => s + (fs.wrong || 0), 0) : 0), 0);
                return (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white border border-[#ece7df] rounded-2xl p-4 text-center">
                        <div className="text-3xl font-black text-[#4a4640] leading-none mb-1.5">{verbDB.filter(v => v.status === 'not_started').length}</div>
                        <div className="text-xs font-bold text-[#aaa295]">📚 待學習</div>
                      </div>
                      <div className="bg-white border border-[#ece7df] rounded-2xl p-4 text-center">
                        <div className="text-3xl font-black text-[#5b7ba3] leading-none mb-1.5">{verbDB.filter(v => v.status === 'learning').length}</div>
                        <div className="text-xs font-bold text-[#aaa295]">🗓️ 待複習</div>
                      </div>
                      <div className="bg-white border border-[#ece7df] rounded-2xl p-4 text-center">
                        <div className="text-3xl font-black text-[#54916c] leading-none mb-1.5">{verbDB.filter(v => v.status === 'mastered').length}</div>
                        <div className="text-xs font-bold text-[#aaa295]">🏆 精通</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white border border-[#ece7df] rounded-2xl p-4 text-center">
                        <div className="text-3xl font-black text-[#4a4640] leading-none mb-1.5">{totalVerbAttempts}</div>
                        <div className="text-xs font-bold text-[#aaa295]">📈 累積練習</div>
                      </div>
                      <div className="bg-white border border-[#ece7df] rounded-2xl p-4 text-center">
                        <div className="text-3xl font-black text-[#bd7256] leading-none mb-1.5">{totalVerbMistakes}</div>
                        <div className="text-xs font-bold text-[#aaa295]">❌ 累積錯題</div>
                      </div>
                      <div className="bg-white border border-dashed border-[#cfc7b8] rounded-2xl p-4 text-center flex items-center justify-center">
                        <div className="text-sm font-bold text-[#cfc7b8]">JLPT N5→N1</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Grammar SRS Primary Action */}
              <button
                onClick={startGrammarSRS}
                disabled={todayGrammarQueue.length === 0}
                className={`w-full py-5 rounded-2xl font-bold text-lg flex justify-center items-center gap-2 transition-all ${
                  todayGrammarQueue.length > 0
                    ? 'bg-[#5b7ba3] text-white hover:bg-[#4f74a0] shadow-sm hover:shadow-md active:scale-[0.98]'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {todayGrammarQueue.length > 0 ? `📝 今日變化複習 (SRS) - 剩餘 ${Math.min(todayGrammarQueue.length, 20)} 題` : '🎉 今日變化複習完成！'}
              </button>

              <button onClick={() => setAppState('verb_learning_dashboard')}
                className="w-full py-4 rounded-2xl font-bold text-sm flex justify-center items-center gap-2 transition-all bg-[#e8eef6] text-[#4f74a0] hover:bg-[#cfdcea] border border-[#cfdcea] mt-2"
              >
                {(() => {
                   const weakest = getWeakestVerbForms(verbDB)[0];
                   const formLabel = DEFAULT_FORM_OPTIONS.find(o => o.id === weakest[0])?.label || weakest[0];
                   const acc = Math.round(weakest[1] * 100);
                   return `🎯 動詞弱點特訓( 錯題與弱項補強 ) 最弱：${formLabel}（${acc}%）`;
                })()}
              </button>

              {/* Practice Modes */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={() => startVerbRound('normal')}
                  className="p-5 bg-white border-2 border-slate-100 hover:border-blue-300 hover:bg-blue-50 rounded-2xl transition-all text-left group active:scale-[0.97]">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl w-fit mb-3 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <RotateCcw className="w-5 h-5"/>
                  </div>
                  <div className="font-bold text-slate-800 mb-1 leading-tight">自訂綜合特訓</div>
                  <div className="text-xs text-slate-400 mt-1 leading-relaxed">嚴格依照右上角「設定」的勾選項目隨機出題</div>
                </button>

                <button onClick={() => startVerbRound('grammar')}
                  className="p-5 bg-white border-2 border-slate-100 hover:border-emerald-300 hover:bg-emerald-50 rounded-2xl transition-all text-left group active:scale-[0.97] flex flex-col justify-between h-full">
                  <div>
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl w-fit mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <Puzzle className="w-5 h-5"/>
                    </div>
                    <div className="font-bold text-slate-800 mb-1 leading-tight">文法測驗</div>
                    <div className="text-xs text-slate-400 mt-1 leading-relaxed">專注集中練習您建立的「自訂文法公式」</div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                     <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md">待複習 {grammarStats.dueTotal} 題</span>
                     <span className={`text-xs font-bold px-2 py-1 rounded-md ${grammarStats.accuracy !== null ? 'text-blue-700 bg-blue-100' : 'text-slate-500 bg-slate-100'}`}>
                        {grammarStats.accuracy !== null ? `正確率 ${grammarStats.accuracy}%` : '正確率：資料不足'}
                     </span>
                  </div>
                </button>
              </div>

              {/* Game Mode */}
              <button onClick={() => startVerbRound('rpg')}
                className="w-full mt-3 p-5 bg-white border-2 border-slate-100 hover:border-red-300 hover:bg-red-50 rounded-2xl transition-all group active:scale-[0.97]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 text-red-500 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-colors flex-shrink-0">
                    <Swords className="w-6 h-6"/>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-800 text-lg">RPG 極限生存戰</div>
                    <div className="text-sm text-slate-500 mt-1">3 滴血挑戰（依照您的設定出題）</div>
                  </div>
                </div>
              </button>

            </div>

          </div>

          {/* 首頁提示 */}
          <div className="mt-8 mb-2 p-5 rounded-2xl border border-dashed border-[#cfc7b8] bg-white">
            <p className="text-sm text-[#8a8475] leading-relaxed">
              <strong className="text-[#5b7ba3]">首頁:</strong> 只有「練習」(左單字，右動詞文法)；資料庫/備份等進階功能 → 主選單「☰ 右上角」；貼上筆記可進入新功能 → 點點點!
            </p>
          </div>
          <input type="file" accept=".json" ref={fileInputRef} onChange={handleImportData} className="hidden" />

          {/* ===== NEW: 每日新詞解鎖與主題抽卡區 ===== */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            
            {/* 每日新詞解鎖 */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><Sparkles className="w-5 h-5"/></div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">每日新詞解鎖</h2>
                  <p className="text-xs text-slate-500">學習新單字，解鎖後進入閃卡預習</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-sm font-bold text-slate-700">選擇主題 (可輸入或點擊按鈕)</label>
                    <button onClick={() => setThemeSuggestionSeed(Date.now())} className="text-xs font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-md transition-colors"><RefreshCcw className="w-3 h-3" /> 換一批</button>
                  </div>
                  <input
                    type="text"
                    value={unlockTheme === 'random' ? '' : unlockTheme}
                    onChange={(e) => setUnlockTheme(e.target.value || 'random')}
                    placeholder="留空代表 🎲 隨機為我挑選..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 mb-3"
                  />
                  <div className="flex flex-wrap gap-2">
                    {currentThemeSuggestions.map(theme => (
                      <button
                        key={theme.name}
                        onClick={() => setUnlockTheme(theme.name)}
                        className={`px-4 py-1.5 rounded-full text-white font-bold text-sm shadow-sm hover:opacity-90 hover:scale-105 transition-all ${theme.color}`}
                      >
                        {theme.name}
                      </button>
                    ))}
                    <button
                        onClick={() => setUnlockTheme('random')}
                        className={`px-4 py-1.5 rounded-full text-slate-700 font-bold text-sm shadow-sm border border-slate-200 bg-white hover:bg-slate-50 hover:scale-105 transition-all`}
                    >
                        🎲 隨機挑選
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">解鎖數量</label>
                  <div className="flex items-center gap-4">
                    <input type="range" min="1" max="10" value={unlockAmount} onChange={(e)=>setUnlockAmount(Number(e.target.value))} className="flex-1 accent-indigo-600" />
                    <span className="font-bold text-indigo-600 w-8 text-right">{unlockAmount}</span>
                  </div>
                </div>
                <button onClick={handleUnlockNewWords} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                  解鎖並開始預習
                </button>
              </div>
            </div>

            {/* 主題抽卡總覽 */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-fuchsia-100 text-fuchsia-600 rounded-xl"><Layers className="w-5 h-5"/></div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">主題總覽抽卡</h2>
                  <p className="text-xs text-slate-500">從學習中/已掌握的詞庫抽出單字複習</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-sm font-bold text-slate-700">選擇主題 (可輸入或點擊按鈕)</label>
                    <button onClick={() => setThemeSuggestionSeed(Date.now())} className="text-xs font-bold text-fuchsia-500 hover:text-fuchsia-700 flex items-center gap-1 bg-fuchsia-50 px-2 py-1 rounded-md transition-colors"><RefreshCcw className="w-3 h-3" /> 換一批</button>
                  </div>
                  <input
                    type="text"
                    value={referenceTheme === 'random' ? '' : referenceTheme}
                    onChange={(e) => setReferenceTheme(e.target.value || 'random')}
                    placeholder="留空代表 🎲 隨機大亂鬥..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-fuchsia-400 mb-3"
                  />
                  <div className="flex flex-wrap gap-2">
                    {currentThemeSuggestions.map(theme => (
                      <button
                        key={theme.name}
                        onClick={() => setReferenceTheme(theme.name)}
                        className={`px-4 py-1.5 rounded-full text-white font-bold text-sm shadow-sm hover:opacity-90 hover:scale-105 transition-all ${theme.color}`}
                      >
                        {theme.name}
                      </button>
                    ))}
                    <button
                        onClick={() => setReferenceTheme('動詞')}
                        className={`px-4 py-1.5 rounded-full text-slate-700 font-bold text-sm shadow-sm border border-slate-200 bg-amber-50 hover:bg-amber-100 hover:scale-105 transition-all`}
                    >
                        🏃 動詞特輯
                    </button>
                    <button
                        onClick={() => setReferenceTheme('random')}
                        className={`px-4 py-1.5 rounded-full text-slate-700 font-bold text-sm shadow-sm border border-slate-200 bg-white hover:bg-slate-50 hover:scale-105 transition-all`}
                    >
                        🎲 隨機大亂鬥
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">抽卡數量</label>
                  <div className="flex items-center gap-4">
                    <input type="range" min="1" max="20" value={referenceAmount} onChange={(e)=>setReferenceAmount(Number(e.target.value))} className="flex-1 accent-fuchsia-600" />
                    <span className="font-bold text-fuchsia-600 w-8 text-right">{referenceAmount}</span>
                  </div>
                </div>
                <button onClick={handleReferenceDraw} className="w-full py-3 bg-fuchsia-600 text-white font-bold rounded-xl hover:bg-fuchsia-700 transition-colors shadow-sm">
                  開始抽卡展示
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==== 智慧貼上筆記 ==== */}
      {appState === 'paste' && (
        <div className="max-w-3xl mx-auto pt-4 animate-in fade-in slide-in-from-bottom-4">
          <button onClick={() => { setAppState('home'); setPasteText(''); setParsedPasteItems([]); setPasteAnalyzed(false); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors mb-6 shadow-sm">
            ‹ 返回首頁
          </button>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl flex-shrink-0">📋</div>
            <div>
              <div className="text-2xl font-black text-slate-800">智慧貼上筆記</div>
              <div className="text-sm text-slate-400 font-medium mt-0.5">貼上一段筆記，系統自動分類為單字／動詞，確認後加入資料庫</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-5">
            <div className="flex items-center gap-2 font-bold text-slate-700 mb-2 text-sm">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">1</span>
              貼上你的筆記
            </div>
            <div className="text-xs text-slate-400 mb-3">格式：<span className="font-bold text-slate-500">日文（讀音）→ 中文</span>，一行一筆。可用【主題】作分段標題。</div>
            <textarea
              value={pasteText}
              onChange={e => { setPasteText(e.target.value); setPasteAnalyzed(false); setParsedPasteItems([]); }}
              className="w-full h-44 p-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-sans leading-relaxed text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
              placeholder={"【交通】\n車（くるま）→ 汽車\n走る（はしる）→ 跑\n\n電話する → 打電話\nなければならない → 必須（表義務）"}
            />
            <button
              onClick={() => { const items = parsePasteInput(pasteText); setParsedPasteItems(items); setPasteAnalyzed(true); }}
              disabled={!pasteText.trim()}
              className="mt-4 w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-base hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
              🔍 分析並自動分類
            </button>
          </div>

          {!pasteAnalyzed && (
            <div className="text-center py-10 text-slate-400 text-sm font-medium">↑ 貼上筆記後，按「分析」就會在這裡顯示分類結果</div>
          )}
          {pasteAnalyzed && parsedPasteItems.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">找不到可解析的項目，請確認格式為「日文 → 中文」</div>
          )}

          {pasteAnalyzed && parsedPasteItems.length > 0 && (
            <>
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm mb-4">
                <div className="flex items-center gap-2 font-bold text-slate-700 text-sm mb-3">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">2</span>
                  分析結果 — 共 {parsedPasteItems.length} 筆，可調整類型後確認加入
                </div>
                <div className="flex flex-wrap gap-2">
                  {['vocab','verb','grammar'].map(t => {
                    const count = parsedPasteItems.filter(i => i.selected && i.type === t).length;
                    if (!count) return null;
                    const styles = { vocab: 'bg-blue-50 text-blue-700', verb: 'bg-indigo-50 text-indigo-700', grammar: 'bg-amber-50 text-amber-700' };
                    const labels = { vocab: '📚 單字', verb: '🔄 動詞', grammar: '🧩 文法' };
                    return <span key={t} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${styles[t]}`}>{labels[t]} ×{count}</span>;
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3 mb-28">
                {parsedPasteItems.map((item, idx) => (
                  <div key={item.id} className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-opacity ${item.selected ? '' : 'opacity-40'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <input type="checkbox" checked={item.selected} onChange={() => setParsedPasteItems(prev => prev.map((p,i) => i===idx ? {...p,selected:!p.selected} : p))} className="w-4 h-4 accent-blue-600 rounded flex-shrink-0"/>
                      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                        {['vocab','verb','grammar'].map(t => {
                          const colors = { vocab: 'bg-blue-600 text-white', verb: 'bg-indigo-600 text-white', grammar: 'bg-amber-600 text-white' };
                          return (
                            <button key={t} onClick={() => setParsedPasteItems(prev => prev.map((p,i) => i===idx ? {...p,type:t} : p))}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${item.type===t ? colors[t] : 'text-slate-400'}`}>
                              {t==='vocab'?'單字':t==='verb'?'動詞':'文法'}
                            </button>
                          );
                        })}
                      </div>
                      <span className="flex-1"/>
                      {item.tag && item.tag !== '自訂' && <span className="text-xs font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-500">{item.tag}</span>}
                    </div>
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-xl font-black text-slate-800">{item.word}</span>
                      {item.reading && <span className="text-sm text-slate-400 font-medium">({item.reading})</span>}
                      <span className="text-sm text-slate-600">→ {item.meaning}</span>
                    </div>
                    {item.example && <div className="mt-2 px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-500">{item.example}</div>}
                    {item.type === 'grammar' && <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">⚠️ 文法項目將不自動儲存，請手動在「文法公式庫」新增</div>}
                  </div>
                ))}
              </div>

              <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-4 z-30">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                  <div className="text-sm font-bold text-slate-500">
                    已選 {parsedPasteItems.filter(i => i.selected && i.type !== 'grammar').length} / {parsedPasteItems.filter(i => i.type !== 'grammar').length} 筆（不含文法）
                  </div>
                  <div className="flex-1"/>
                  <button onClick={() => { setAppState('home'); setPasteText(''); setParsedPasteItems([]); setPasteAnalyzed(false); }}
                    className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                    取消
                  </button>
                  <button onClick={handlePasteConfirm}
                    disabled={parsedPasteItems.filter(i => i.selected && i.type !== 'grammar').length === 0}
                    className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                    ✅ 確認加入
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ==== NEW: 閃卡預習畫面 (Flashcard Learning) ==== */}
      {appState === 'flashcard_learning' && flashcardQueue.length > 0 && (
          <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 text-center relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
              <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-800">新詞預習</h2>
                  <div className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold">
                      {currentFlashcardIndex + 1} / {flashcardQueue.length}
                  </div>
              </div>
              
              <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-10 mb-8 min-h-[300px] flex flex-col items-center justify-center relative">
                  <div className="absolute top-4 right-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${getTagStyle(flashcardQueue[currentFlashcardIndex].tag)}`}>{flashcardQueue[currentFlashcardIndex].tag}</span></div>
                  <div className="text-6xl font-black text-slate-800 mb-6 tracking-wide">{flashcardQueue[currentFlashcardIndex].word}</div>
                  <div className="text-2xl text-slate-500 font-bold mb-4">{flashcardQueue[currentFlashcardIndex].reading}</div>
                  <div className="text-xl text-blue-600 font-bold bg-blue-50 px-6 py-2 rounded-2xl">{flashcardQueue[currentFlashcardIndex].meaning}</div>
                  {flashcardQueue[currentFlashcardIndex].example && (
                      <div className="mt-6 text-sm text-slate-600 bg-white border border-slate-200 p-4 rounded-xl max-w-sm text-left">
                          <MessageSquareQuote className="w-4 h-4 mb-2 text-slate-400" />
                          {renderRuby(flashcardQueue[currentFlashcardIndex].example)}
                      </div>
                  )}
              </div>

              <div className="flex gap-4">
                  {currentFlashcardIndex > 0 && (
                      <button onClick={() => setCurrentFlashcardIndex(prev => prev - 1)} className="flex-1 py-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                          上一個
                      </button>
                  )}
                  {currentFlashcardIndex < flashcardQueue.length - 1 ? (
                      <button onClick={() => setCurrentFlashcardIndex(prev => prev + 1)} className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">
                          下一個
                      </button>
                  ) : (
                      <button onClick={handleFinishFlashcards} className="flex-1 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors">
                          完成預習
                      </button>
                  )}
              </div>
          </div>
      )}

      {/* ==== NEW: 主題抽卡總覽畫面 (Theme Reference) ==== */}
      {appState === 'theme_reference' && referenceQueue.length > 0 && (
          <div className="max-w-4xl mx-auto mt-4 animate-in fade-in">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Layers className="w-6 h-6 text-fuchsia-600"/> 主題抽卡總覽</h2>
                <div className="flex items-center gap-3">
                  <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-600 text-sm font-bold border border-slate-200">共 {referenceQueue.length} 詞</span>
                  <button onClick={goHome} className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition-colors"><Home className="w-5 h-5" /></button>
                </div>
             </div>
             
             <div className="grid sm:grid-cols-2 gap-4">
                 {referenceQueue.map((item, idx) => (
                     <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:border-fuchsia-200 transition-all hover:shadow-md group">
                         {item.isVerbDef ? (
                             <>
                               <div className="flex justify-between items-start mb-4">
                                   <div>
                                       <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold whitespace-nowrap mb-2 inline-block">{item.type} ({item.group})</span>
                                       <div className="text-3xl font-black text-slate-800">{renderRuby(item.masu)}</div>
                                   </div>
                                   <div className="text-right">
                                       <div className="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl inline-block">{item.meaning}</div>
                                   </div>
                               </div>
                               <div className="grid grid-cols-2 gap-2 text-sm mt-4 border-t border-slate-100 pt-4">
                                   {verbForms.map(f => (
                                       item[f.id] && <div key={f.id} className="flex flex-col bg-slate-50 p-2 rounded-lg"><span className="text-xs text-slate-400 font-bold mb-1">{f.label}</span><span className="font-medium text-slate-700">{renderRuby(item[f.id])}</span></div>
                                   ))}
                               </div>
                             </>
                         ) : (
                             <>
                               <div className="flex justify-between items-start mb-2">
                                   <div className="text-3xl font-black text-slate-800 tracking-wide">{item.word}</div>
                                   <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getTagStyle(item.tag)}`}>{item.tag}</span>
                               </div>
                               <div className="text-lg text-slate-500 font-bold mb-3">{item.reading}</div>
                               <div className="text-lg font-bold text-blue-600 mb-4">{item.meaning}</div>
                               {item.example && (
                                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                      {renderRuby(item.example)}
                                  </div>
                               )}
                               <div className="mt-3 flex justify-end">
                                   {item.status === 'mastered' ? (
                                       <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><Medal className="w-3 h-3"/> 已掌握</span>
                                   ) : (
                                       <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><BookOpen className="w-3 h-3"/> 學習中</span>
                                   )}
                               </div>
                             </>
                         )}
                     </div>
                 ))}
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
        <div className="w-[95vw] max-w-[1600px] mx-auto mt-4 animate-in fade-in">
           <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><BookType className="w-6 h-6 text-amber-500"/> 單字記憶庫</h2>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button onClick={() => setVocabManageTab('vocab')} className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-colors ${vocabManageTab === 'vocab' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>📝 單字列表</button>
                        <button onClick={() => setVocabManageTab('kanji')} className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-colors ${vocabManageTab === 'kanji' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>🈶 漢字索引</button>
                    </div>
                </div>
                
                <div className="flex flex-1 max-w-xs relative ml-4">
                        {vocabManageTab === 'vocab' && (
                           <>
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                             <input type="text" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="單字,主題標籤 搜尋..." className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all outline-none"/>
                             {searchTerm && <button onClick={()=>setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><XCircle className="w-4 h-4"/></button>}
                           </>
                        )}
                    </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 hidden lg:block">
                        單字: <span className="text-slate-700">{vocabDB.length}</span> | 漢字: <span className="text-slate-700">{kanjiDB.length}</span>
                    </div>
                    {vocabManageTab === 'vocab' && (
                        <label className="flex items-center gap-2 cursor-pointer select-none bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl font-bold border border-amber-200 hover:bg-amber-100 transition-colors">
                            <input type="checkbox" checked={showOnlyImportantVocab} onChange={(e)=>setShowOnlyImportantVocab(e.target.checked)} className="hidden"/>
                            <Star className={`w-4 h-4 ${showOnlyImportantVocab ? 'fill-amber-500 text-amber-500' : 'text-amber-500/50'}`}/>
                            只顯示重要
                        </label>
                    )}
                    {vocabManageTab === 'vocab' && (
                        <button onClick={() => {
                          if(window.confirm('確定要將所有單字的複習進度重置為今天嗎？這將會讓所有單字出現在今日待複習清單中！')) {
                            setVocabDB(vocabDB.map(v => ({ ...v, status: 'learning', interval: 0, repetitions: 0, nextReview: Date.now() })));
                            alert('已強制解鎖並重置所有單字！請回首頁開始複習。');
                            setAppState('home');
                          }
                        }} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2 text-sm shadow-sm hidden sm:flex">
                          <RefreshCcw className="w-4 h-4"/> 重置
                        </button>
                    )}
                </div>
             </div>
             
             
             {vocabManageTab === 'vocab' && (
             <><div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 mb-8 shadow-lg">
                <button onClick={() => { const next = !showObsidianSection; setShowObsidianSection(next); localStorage.setItem('verbApp_showObsidian', String(next)); }} className="w-full flex justify-between items-center">
                  <h3 className="font-bold text-white text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-400"/> Obsidian 智慧同步 (僅支援單字與例句)</h3>
                  <span className="text-slate-400 text-sm font-bold">{showObsidianSection ? '▲ 收起' : '▼ 展開'}</span>
                </button>
                {showObsidianSection && <div className="bg-slate-700/50 p-5 rounded-2xl border border-slate-600 mt-4">
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed">選擇筆記檔案，系統會自動轉換 🟡【單字】、#### 📝 例句 結構，並過濾重複項目匯入。</p>
                  
                  {(obsidianScannedWords.length > 0) ? (
                      <div className="mb-4">
                        <div className="text-green-400 font-bold mb-2">🎉 找到 {obsidianScannedWords.length} 個新單字/例句！</div>
                        <div className="max-h-48 overflow-y-auto bg-slate-800 rounded-xl p-3 border border-slate-600 text-sm text-slate-300 space-y-1">
                           {obsidianScannedWords.map((w, i) => (
                              <div key={'w'+i} className="flex justify-between"><span>{w.word} {w.reading !== w.word && '('+w.reading+')'}</span><span className="text-slate-400">{w.meaning} [{w.tag}]</span></div>
                           ))}
                        </div>
                        <div className="flex gap-3 mt-4">
                           <button onClick={handleImportObsidian} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">📥 匯入至確認與編輯區</button>
                           <button onClick={() => {setObsidianScannedWords([]);}} className="py-3 px-6 bg-slate-600 text-white rounded-xl font-bold hover:bg-slate-500 transition-colors">取消</button>
                        </div>
                      </div>
                  ) : (
                      <>
                        <input type="file" ref={obsidianFileRef} accept=".md,.txt" onChange={handleScanObsidian} className="hidden" />
                        <button onClick={() => obsidianFileRef.current.click()} disabled={isScanningObsidian} className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 mb-3">
                          {isScanningObsidian ? '掃描中...' : '📄 選擇並掃描單一筆記檔案'}
                        </button>
                        
                        <div className="text-center">
                          <button onClick={() => setShowObsidianHelp(!showObsidianHelp)} className="text-sm font-bold text-slate-400 hover:text-purple-400 transition-colors">
                            {showObsidianHelp ? '🔼 隱藏 Markdown 筆記格式範例' : '❓ 點我看支援的 Markdown 筆記格式範例'}
                          </button>
                        </div>
                        
                        {showObsidianHelp && (
                          <div className="mt-4 p-4 bg-slate-800 rounded-xl border border-slate-700 text-left">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-bold text-slate-300">Markdown 筆記格式範例</span>
                              <button onClick={handleCopyTemplate} className="text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg transition-colors">📋 一鍵複製模板</button>
                            </div>
                            <pre className="text-xs text-slate-400 bg-slate-900 p-3 rounded-lg overflow-x-auto border border-slate-700 font-mono whitespace-pre-wrap">{obsidianTemplate}</pre>
                            <div className="mt-3 text-xs text-slate-500 space-y-1">
                              <p>💡 提示：</p>
                              <p>1. <span className="text-purple-400">### </span> 代表主題標籤。</p>
                              <p>2. 單字用 <span className="text-purple-400">- </span> 開頭，支援括號標示漢字（如 <span className="text-purple-400">假名(漢字)</span>）。</p>
                              <p>3. 意思必須在下一行用 <span className="text-purple-400">➜ </span> 開頭。</p>
                            </div>
                          </div>
                        )}
                      </>
                  )}
                </div>}
             </div>

             <div className="bg-amber-50 rounded-3xl border border-amber-100 mb-8">
                <button onClick={() => { const next = !showBatchSection; setShowBatchSection(next); localStorage.setItem('verbApp_showBatch', String(next)); }} className="w-full flex justify-between items-center px-6 py-4">
                  <h3 className="font-bold text-amber-800 text-lg">批次新增單字/例句</h3>
                  <span className="text-amber-600 text-sm font-bold">{showBatchSection ? '▲ 收起' : '▼ 展開'}</span>
                </button>
                {showBatchSection && <div className="px-6 pb-6">
                <div className="mb-6 bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
                  <button onClick={() => { const next = !showQuickPasteSection; setShowQuickPasteSection(next); localStorage.setItem('verbApp_showQuickPaste', String(next)); }} className="w-full flex justify-between items-center p-5">
                    <div className="flex items-center gap-2 text-sm font-bold text-amber-700"><Sparkles className="w-5 h-5"/> 快速貼上區 (智能過濾 Emoji)</div>
                    <span className="text-amber-600 text-xs font-bold">{showQuickPasteSection ? '▲ 收起' : '▼ 展開'}</span>
                  </button>
                  {showQuickPasteSection && <div className="px-5 pb-5">
                    <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder="支援加上主題標籤與例句！例如：&#10;【交通與地點】&#10;くるま（車）&#10;➜ 汽車&#10;💬 新しい車を買いました。（買了新車。）" className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-amber-500 text-sm h-32 resize-y placeholder:text-slate-400 leading-relaxed"/>
                    <button onClick={handleSmartImport} className="mt-3 w-full py-3 bg-amber-100 text-amber-800 rounded-xl font-bold hover:bg-amber-200 transition-colors flex items-center justify-center gap-2">解析文字並套用到下方表格</button>
                  </div>}
                </div>

                <div className="flex justify-between items-center mb-4 mt-8 border-t border-amber-200 pt-6">
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-amber-800">確認與編輯區</h4>
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                      {[{mode:'list',label:'☰ 清單'},{mode:'grid2',label:'▪▪ 2欄'},{mode:'grid3',label:'▪▪▪ 3欄'}].map(({mode,label}) => (
                        <button key={mode} onClick={() => { setBatchLayoutMode(mode); localStorage.setItem('verbApp_batchLayoutMode', mode); }} className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${batchLayoutMode === mode ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button onClick={handleRematchAllBatchThemes} className="text-sm text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl font-bold hover:bg-amber-100 flex items-center gap-1"><Sparkles className="w-4 h-4"/> 全部重配主題</button>
                      <button onClick={() => { if(window.confirm('確定要清空確認與編輯區的所有內容嗎？')) { setBatchInputs([{word:'', reading:'', meaning:'', tag: '未知', tags: [], example: '', note: '', isSentence: false}]); setSelectedBatchIds(new Set()); }}} className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl font-bold hover:bg-red-100 flex items-center gap-1"><Trash2 className="w-4 h-4"/> 全部清空</button>
                      <button onClick={() => setBatchInputs([...batchInputs, {word:'', reading:'', meaning:'', tag: '未知', tags: [], example: '', note: '', isSentence: false}])} className="text-sm text-amber-700 bg-amber-100 px-4 py-2 rounded-xl font-bold hover:bg-amber-200 flex items-center gap-1"><Plus className="w-4 h-4"/> 新增一列</button>
                    </div>
                    {selectedBatchIds.size > 0 && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                        <span className="text-sm font-bold text-amber-700">已選 {selectedBatchIds.size} 筆</span>
                        <button onClick={handleBatchRematchSelected} className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"><Sparkles className="w-3.5 h-3.5"/> 重配選取主題</button>
                        <button onClick={handleBatchDeleteSelected} className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5"/> 刪除選取</button>
                        <button onClick={() => setSelectedBatchIds(new Set())} className="text-xs font-bold text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">✕ 取消</button>
                      </div>
                    )}
                  </div>
                </div>
                <datalist id="theme-suggestions">{Array.from(new Set([...Object.keys(THEME_KEYWORDS), ...vocabDB.map(v => v.tag)])).filter(Boolean).map(tag => <option key={tag} value={tag} />)}</datalist>

                <div className={batchLayoutMode === 'list' ? 'space-y-3 mb-6 max-h-[640px] overflow-y-auto pr-2' : batchLayoutMode === 'grid2' ? 'grid grid-cols-2 gap-3 mb-6 max-h-[640px] overflow-y-auto pr-2' : 'grid grid-cols-3 gap-3 mb-6 max-h-[640px] overflow-y-auto pr-2'}>
                   {batchInputs.map((item, idx) => (
                     batchLayoutMode === 'list' ? (
                      <div key={idx} className={`flex flex-col gap-3 p-4 bg-white rounded-2xl border shadow-sm transition-all focus-within:shadow-md ${selectedBatchIds.has(idx) ? 'border-amber-400 bg-amber-50' : 'border-amber-100 focus-within:border-amber-400'}`}>
                        <div className="flex gap-2 items-center">
                          <input type="checkbox" checked={selectedBatchIds.has(idx)} onChange={() => toggleBatchSelect(idx)} className="w-4 h-4 cursor-pointer accent-amber-500 shrink-0"/>
                          <div className="relative w-40 flex items-center">
                            <input type="text" placeholder="主題/標籤" value={item.tag} onChange={e => {const n=[...batchInputs]; n[idx].tag=e.target.value; setBatchInputs(n);}} className={`w-full pl-3 pr-8 py-3 rounded-xl outline-none text-sm font-bold border ${getTagStyle(item.tag)}`} list="theme-suggestions" />
                            <button onClick={() => handleRematchBatchTheme(idx)} title="自動重配主題" className="absolute right-2 p-1 text-slate-400 hover:text-amber-500 transition-colors"><Sparkles className="w-4 h-4"/></button>
                          </div>
                          <input type="text" placeholder="漢字/原形 (留空即純假名)" value={item.word} onChange={e => {const n=[...batchInputs]; n[idx].word=e.target.value; setBatchInputs(n);}} className="flex-1 p-3 rounded-xl border border-slate-200 outline-none focus:border-amber-500 text-sm font-bold"/>
                          <input type="text" placeholder="平假名 (例: たべる)" value={item.reading} onChange={e => {const n=[...batchInputs]; n[idx].reading=e.target.value; setBatchInputs(n);}} className="flex-1 p-3 rounded-xl border border-slate-200 outline-none focus:border-amber-500 text-sm font-bold"/>
                          <input type="text" placeholder="中文 (例: 吃)" value={item.meaning} onChange={e => {const n=[...batchInputs]; n[idx].meaning=e.target.value; setBatchInputs(n);}} className="flex-1 p-3 rounded-xl border border-slate-200 outline-none focus:border-amber-500 text-sm font-bold"/>
                          <button onClick={() => setBatchInputs(batchInputs.filter((_, i) => i !== idx))} className="shrink-0 px-3 py-2 text-sm font-bold text-red-500 hover:text-white hover:bg-red-500 bg-red-50 rounded-xl transition-colors flex items-center gap-1"><Trash2 className="w-4 h-4"/> 刪除</button>
                        </div>
                        <div className="flex items-center gap-2 relative">
                          <MessageSquareQuote className="w-5 h-5 text-amber-400 absolute left-3" />
                          <input type="text" placeholder="附加例句 (選填，支援「漢字[假名]」注音格式。例如: 水[みず]を飲[の]みます。)" value={item.example} onChange={e => {const n=[...batchInputs]; n[idx].example=e.target.value; setBatchInputs(n);}} className="w-full pl-10 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-amber-500 focus:bg-white text-sm text-slate-600"/>
                        </div>
                        {item.example.trim() && (
                          <div className="flex items-center gap-2 relative">
                            <span className="absolute left-3 text-sm text-amber-400">🌐</span>
                            <input type="text" placeholder="例句中文翻譯 (選填)" value={item.exampleMeaning || ''} onChange={e => {const n=[...batchInputs]; n[idx].exampleMeaning=e.target.value; setBatchInputs(n);}} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-amber-500 focus:bg-white text-sm text-slate-600"/>
                          </div>
                        )}
                        <div className="flex items-center gap-2 relative">
                          <span className="absolute left-3 text-sm text-slate-400">📝</span>
                          <input type="text" placeholder="個人備註 (選填，例：容易混淆、常考)" value={item.note || ''} onChange={e => {const n=[...batchInputs]; n[idx].note=e.target.value; setBatchInputs(n);}} className="w-full pl-8 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-amber-500 focus:bg-white text-sm text-slate-600"/>
                        </div>
                        <div className="flex items-center gap-4 px-2 mt-1">
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-600 hover:text-fuchsia-600 transition-colors">
                            <input type="checkbox" checked={!!item.isSentence} onChange={e => {const n=[...batchInputs]; n[idx].isSentence=e.target.checked; setBatchInputs(n);}} className="w-4 h-4 accent-fuchsia-600"/>
                            <span>✅ 這是一句完整例句（啟用例句特訓與專屬標記）</span>
                          </label>
                        </div>
                      </div>
                     ) : (
                      <div key={idx} className={`flex flex-col gap-2 p-4 bg-white rounded-2xl border shadow-sm transition-all focus-within:shadow-md ${selectedBatchIds.has(idx) ? 'border-amber-400 bg-amber-50' : 'border-amber-100 focus-within:border-amber-400'}`}>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={selectedBatchIds.has(idx)} onChange={() => toggleBatchSelect(idx)} className="w-4 h-4 cursor-pointer accent-amber-500 shrink-0"/>
                          <div className="relative flex-1">
                            <input type="text" placeholder="主題/標籤" value={item.tag} onChange={e => {const n=[...batchInputs]; n[idx].tag=e.target.value; setBatchInputs(n);}} className={`w-full pl-3 pr-8 py-2 rounded-xl outline-none text-sm font-bold border ${getTagStyle(item.tag)}`} list="theme-suggestions" />
                            <button onClick={() => handleRematchBatchTheme(idx)} title="自動重配主題" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-500 transition-colors"><Sparkles className="w-4 h-4"/></button>
                          </div>
                          <button onClick={() => setBatchInputs(batchInputs.filter((_, i) => i !== idx))} className="shrink-0 p-2 text-red-400 hover:text-white hover:bg-red-500 bg-red-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4"/></button>
                        </div>
                        <input type="text" placeholder="漢字/原形 (留空即純假名)" value={item.word} onChange={e => {const n=[...batchInputs]; n[idx].word=e.target.value; setBatchInputs(n);}} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 text-sm font-bold"/>
                        <input type="text" placeholder="平假名 (例: たべる)" value={item.reading} onChange={e => {const n=[...batchInputs]; n[idx].reading=e.target.value; setBatchInputs(n);}} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 text-sm font-bold"/>
                        <input type="text" placeholder="中文 (例: 吃)" value={item.meaning} onChange={e => {const n=[...batchInputs]; n[idx].meaning=e.target.value; setBatchInputs(n);}} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 text-sm font-bold"/>
                        <div className="relative">
                          <MessageSquareQuote className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input type="text" placeholder="附加例句 (選填)" value={item.example} onChange={e => {const n=[...batchInputs]; n[idx].example=e.target.value; setBatchInputs(n);}} className="w-full pl-8 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-amber-500 focus:bg-white text-sm text-slate-600"/>
                        </div>
                        {item.example.trim() && (
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-amber-400">🌐</span>
                            <input type="text" placeholder="例句中文翻譯 (選填)" value={item.exampleMeaning || ''} onChange={e => {const n=[...batchInputs]; n[idx].exampleMeaning=e.target.value; setBatchInputs(n);}} className="w-full pl-8 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-amber-500 focus:bg-white text-sm text-slate-600"/>
                          </div>
                        )}
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">📝</span>
                          <input type="text" placeholder="個人備註 (選填)" value={item.note || ''} onChange={e => {const n=[...batchInputs]; n[idx].note=e.target.value; setBatchInputs(n);}} className="w-full pl-8 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-amber-500 focus:bg-white text-sm text-slate-600"/>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-500 hover:text-fuchsia-600 transition-colors px-1">
                          <input type="checkbox" checked={!!item.isSentence} onChange={e => {const n=[...batchInputs]; n[idx].isSentence=e.target.checked; setBatchInputs(n);}} className="w-4 h-4 accent-fuchsia-600"/>
                          <span>✅ 完整例句（啟用例句特訓）</span>
                        </label>
                      </div>
                     )
                   ))}
                </div>
                <div className="mb-4 mt-2">
                   <label className="flex items-center gap-3 cursor-pointer p-4 bg-amber-50 rounded-xl text-amber-800 font-bold border border-amber-200 hover:bg-amber-100 transition-colors">
                     <input type="checkbox" checked={addToReviewNow} onChange={(e)=>setAddToReviewNow(e.target.checked)} className="w-5 h-5 accent-amber-600"/>
                     <span>直接排入今日的「單字測驗」 (若取消勾選，則需透過首頁的「每日新詞解鎖」手動啟用)</span>
                   </label>
                </div>
                <button onClick={handleBatchSave} className="w-full py-4 bg-amber-600 text-white rounded-2xl font-bold text-lg hover:bg-amber-700 transition-colors shadow-sm">批次儲存到資料庫</button>
                </div>}
             </div>

             <datalist id="db-theme-suggestions">{Array.from(new Set([...Object.keys(THEME_KEYWORDS), ...vocabDB.map(v => v.tag)])).filter(Boolean).map(tag => <option key={tag} value={tag} />)}</datalist>
             <div className="overflow-x-auto">
               <div className="flex justify-end mb-2 gap-2">
                 <button
                   onClick={() => { setVocabAutoFit(v => !v); }}
                   className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${vocabAutoFit ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600' : 'text-slate-500 hover:text-amber-600 bg-slate-100 hover:bg-amber-50 border-slate-200 hover:border-amber-300'}`}
                   title={vocabAutoFit ? '自動適應視窗（點擊關閉）' : '自動適應視窗（點擊開啟）'}
                 >⚡ 自動適應</button>
                 <button
                   onClick={(e) => {
                     const cWidth = e.currentTarget.closest('.overflow-x-auto').clientWidth;
                     const avg = Math.max(50, cWidth / vocabTableColumnOrder.length);
                     const nw = {};
                     vocabTableColumnOrder.forEach(id => nw[id] = avg);
                     setVocabColWidths(nw);
                   }}
                   className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-600 bg-slate-100 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 px-3 py-1.5 rounded-lg transition-colors"
                   title="平均分配所有欄位寬度"
                 >
                   ⚖️ 平均分配
                 </button>
                 <button
                   onClick={() => { if(window.confirm('確定要重設所有欄位寬度為預設值嗎？')) { setVocabColWidths({}); } }}
                   className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-600 bg-slate-100 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 px-3 py-1.5 rounded-lg transition-colors"
                   title="重設所有欄位寬度"
                 >
                   ↩ 重設欄寬
                 </button>
               </div>
               <table className="text-left text-sm table-fixed" style={vocabAutoFit ? { width: '100%' } : { width: vocabTableColumnOrder.reduce((acc, colId) => acc + (vocabColWidths[colId] ?? VOCAB_DEFAULT_WIDTHS[colId] ?? 100), 0) }}>
                 <thead className="bg-slate-50 text-slate-600"><tr>
                    {vocabTableColumnOrder.map((colId, idx) => {
                        const def = vocabColDefinitions[colId];
                        if (!def) return null;
                        return (
                                                                                    <th key={colId} 
                                className={`p-0 relative bg-slate-50 text-slate-600 select-none ${dragVocabColIdx === idx ? 'opacity-30' : ''} ${dragOverVocabColIdx === idx && dragVocabColIdx !== idx ? (dragVocabColIdx < dragOverVocabColIdx ? 'border-r-4 border-r-amber-500' : 'border-l-4 border-l-amber-500') : ''}`}
                                style={vocabAutoFit ? { width: `${((vocabColWidths[colId] ?? VOCAB_DEFAULT_WIDTHS[colId] ?? 100) / vocabTableColumnOrder.reduce((s,c) => s+(vocabColWidths[c] ?? VOCAB_DEFAULT_WIDTHS[c] ?? 100),0)*100).toFixed(1)}%` } : { width: vocabColWidths[colId] ?? VOCAB_DEFAULT_WIDTHS[colId] }}
                            >
                                <div 
                                  draggable
                                  onDragStart={(e) => { setDragVocabColIdx(idx); e.dataTransfer.effectAllowed = 'move'; }}
                                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverVocabColIdx(idx); }}
                                  onDragEnd={() => {
                                      if (dragVocabColIdx !== null && dragOverVocabColIdx !== null && dragVocabColIdx !== dragOverVocabColIdx) {
                                          const newOrder = [...vocabTableColumnOrder];
                                          const item = newOrder.splice(dragVocabColIdx, 1)[0];
                                          newOrder.splice(dragOverVocabColIdx, 0, item);
                                          setVocabTableColumnOrder(newOrder);
                                      }
                                      setDragVocabColIdx(null);
                                      setDragOverVocabColIdx(null);
                                  }}
                                  className="p-4 cursor-grab active:cursor-grabbing hover:bg-slate-100 transition-colors flex items-center gap-1 w-full h-full overflow-hidden"
                                  onClick={() => { if(!resizingRef.current) { def.sortable && handleSort(colId); } }}
                                >
                                   <GripHorizontal className="w-3 h-3 text-slate-300 shrink-0"/>
                                   {colId === 'tag' ? (
                                     <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                       <input type="checkbox"
                                         checked={sortedVocabDB.length > 0 && sortedVocabDB.every(v => selectedVocabIds.has(v.id))}
                                         onChange={e => setSelectedVocabIds(e.target.checked ? new Set(sortedVocabDB.map(v => v.id)) : new Set())}
                                         className="w-3.5 h-3.5 cursor-pointer accent-amber-500 shrink-0"
                                       />
                                       <span>{def.label}</span>{def.sortable && renderSortIcon(colId)}
                                     </div>
                                   ) : (
                                     <>{def.label}{def.sortable && renderSortIcon(colId)}</>
                                   )}
                                </div>
                                {colId === 'tag' && selectedVocabIds.size > 0 && (
                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 min-w-max bg-amber-50 border-2 border-amber-300 rounded-lg flex flex-col items-center px-3 py-1.5 gap-2 z-10 shadow-md" onClick={e => e.stopPropagation()}>
                                    <div className="flex items-center gap-1.5">
                                      <input type="checkbox" checked onChange={() => setSelectedVocabIds(new Set())} className="w-3 h-3 cursor-pointer accent-amber-500 shrink-0"/>
                                      <span className="text-xs font-bold text-amber-700 whitespace-nowrap">已選{selectedVocabIds.size}筆</span>
                                      <button onClick={() => setSelectedVocabIds(new Set())} className="shrink-0 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors px-0.5">✕</button>
                                    </div>
                                    <button onClick={handleBatchRematchThemes} className="text-xs font-bold px-2 py-0.5 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors whitespace-nowrap">重配主題</button>
                                  </div>
                                )}
                                <div
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const startWidth = e.currentTarget.parentElement.getBoundingClientRect().width;
                                    const tEl = e.currentTarget.closest('table');
                                    const cEl = e.currentTarget.closest('.overflow-x-auto');
                                    const maxAllowedDiff = cEl.clientWidth - tEl.getBoundingClientRect().width;
                                    resizingRef.current = { tableType: 'vocab', colId, startX: e.clientX, startWidth, maxAllowedDiff };
                                    document.body.style.userSelect = 'none';
                                    document.body.style.cursor = 'col-resize';
                                  }}
                                  className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize hover:bg-amber-300/30 z-30 flex items-center justify-center group border-r border-transparent hover:border-amber-400"
                                  title="拖曳縮放"
                                >
                                  <div className="w-0.5 h-full bg-transparent group-hover:bg-amber-500 transition-colors"></div>
                                </div>
                            </th>
                        );
                    })}
                 </tr></thead>
                 <tbody>
                    {sortedVocabDB.map(v => editingVocabId === v.id ? (
                       /* 編輯中的列：高亮標記，實際編輯在 Modal */
                       <tr key={'edit-'+v.id} className="border-b-2 border-amber-400 bg-amber-50/60 ring-2 ring-inset ring-amber-300">
                         {vocabTableColumnOrder.map(colId => {
                           if (colId === 'actions') return (
                             <td key={colId} className="p-4 text-center">
                               <span className="text-xs font-bold text-amber-500 animate-pulse">編輯中…</span>
                             </td>
                           );
                           if (colId === 'word') return (
                             <td key={colId} className="p-4 text-slate-400 text-sm font-bold">
                               {v.reading && <div className="text-xs font-normal text-slate-400">{v.reading}</div>}
                               {v.word || ''}
                             </td>
                           );
                           if (['meaning', 'dateAdded'].includes(colId)) return (
                             <td key={colId} className="p-4 text-slate-400 text-sm font-bold">{v[colId] || ''}</td>
                           );
                           return <td key={colId} className="p-4"></td>;
                         })}
                       </tr>
                     ) : (
                       <tr key={v.id} id={"item-" + v.id} className={"border-b border-slate-50 hover:bg-slate-50/50 transition-colors " + (selectedVocabIds.has(v.id) ? "bg-amber-50 " : "") + (targetId === v.id ? "bg-amber-100 ring-2 ring-amber-400" : "")}>
                          {vocabTableColumnOrder.map(colId => {
                             if (colId === 'isImportant') {
                                return <td key={colId} className="p-4 text-center">
                                    <button onClick={() => {createVocabBackup(); setVocabDB(prev => prev.map(x => x.id === v.id ? { ...x, isImportant: !x.isImportant } : x))}} className={`p-2 rounded-lg transition-colors ${v.isImportant ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`} title="標記為重要"><Star className={`w-4 h-4 ${v.isImportant ? 'fill-current' : ''}`}/></button>
                                </td>;
                             }

                             if (colId === 'tag') {
                                return <td key={colId} className="p-4">
                                  <div className="flex items-center gap-1.5">
                                   <input type="checkbox" checked={selectedVocabIds.has(v.id)} onChange={() => toggleVocabSelect(v.id)} className="w-3.5 h-3.5 cursor-pointer accent-amber-500 shrink-0"/>
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
                                       <>{renderTags(v.tags, (tag) => setSearchTerm(tag))}</>
                                     )}
                                   <button onClick={() => handleRematchDbTheme(v.id, v.meaning)} title="根據中文重新自動配對主題" className="p-1 text-slate-300 hover:text-amber-500 transition-colors"><Sparkles className="w-4 h-4"/></button>
                                 </div>
                                </td>;
                             }
                             if (colId === 'type') {
                                return <td key={colId} className="p-4">
                                  {v.isSentence ? <span className="inline-block px-2.5 py-1 bg-fuchsia-100 text-fuchsia-700 rounded-lg text-xs font-bold whitespace-nowrap" title="這是一句例句">📝 例句</span> : <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold whitespace-nowrap">單字</span>}
                                </td>;
                             }
                             if (colId === 'word') {
                                const kanjis = extractKanjiFromWord(v.word);
                                return <td key={colId} className="p-4">
                                  <div className="font-bold text-slate-800 text-base">{v.word || v.reading}</div>
                                  {v.word && <div className="text-slate-500 text-xs mt-0.5 mb-1.5">{v.reading}</div>}
{renderTags(v.tags, (tag) => setSearchTerm(tag))}
                                  {kanjis.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {kanjis.map(k => (
                                        <button key={k} onClick={() => { setSearchTerm(k); setVocabManageTab('kanji'); }} className="px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md hover:bg-indigo-500 hover:text-white transition-colors" title={`查看漢字: ${k}`}>{k}</button>
                                      ))}
                                    </div>
                                  )}
                                </td>;
                             }
                             if (colId === 'meaning') {
                                return <td key={colId} className="p-4"><div className="font-bold text-slate-700">{v.meaning}</div>{v.example && <div className="text-slate-500 text-xs mt-1 bg-slate-100 p-1.5 rounded inline-block">{renderRuby(v.example)}</div>}</td>;
                             }
                             if (colId === 'status') {
                                const isNew = v.status === 'new';
                                const isMastered = v.status === 'mastered';
                                return <td key={colId} className="p-4 text-center">
                                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${isNew ? 'bg-slate-50 text-slate-400 border-slate-200' : isMastered ? 'bg-amber-50 text-amber-600 border-amber-300' : 'bg-blue-50 text-blue-600 border-blue-300'}`}>
                                    {isNew ? '📚 待學習' : isMastered ? '🏆 精通' : '🎯 已學習'}
                                  </span>
                                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                                    {isNew ? `${(v.correctDates || []).length} / 3 天` : `間隔 ${v.interval || 0} 天`}
                                  </div>
                                </td>;
                             }
                             if (colId === 'dateAdded') {
                                return <td key={colId} className="p-4 text-slate-500 font-medium">{getAddedDate(v.id)}</td>;
                             }
                             if (colId === 'nextReview') {
                                return <td key={colId} className="p-4 text-slate-500 font-medium">{v.interval === 0 ? '今天' : `${v.interval} 天後`}</td>;
                             }
                             if (colId === 'actions') {
                                return <td key={colId} className="p-4 flex gap-1">
                                   <button onClick={()=>{setEditingVocabId(v.id); setVocabEditForm({word: v.word||'', reading: v.reading||'', meaning: v.meaning||'', example: v.example||'', exampleMeaning: v.exampleMeaning||'', tags: v.tags||[]});}} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="編輯"><Edit3 className="w-4 h-4"/></button>
                                   <button onClick={()=>{if(window.confirm('確定刪除？')){createVocabBackup(); setVocabDB(vocabDB.filter(x=>x.id!==v.id));}}} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="刪除"><Trash2 className="w-4 h-4"/></button>
                                </td>;
                             }
                             return null;
                          })}
                       </tr>
                    ))}
                 </tbody>
               </table>
             </div></>)}

             {vocabManageTab === 'kanji' && (
                <div className="mt-2 animate-in fade-in">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="flex-1 relative">
                         <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                         <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="搜尋漢字或意思..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 transition-colors" />
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                      {kanjiDB.filter(k => k.kanji.includes(searchTerm) || (k.meaning && k.meaning.includes(searchTerm)) || (k.tags && k.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))).map(kanji => {
                         const associated = vocabDB.filter(v => v.word.includes(kanji.kanji));
                         const masteredCount = associated.filter(v => v.repetitions >= 5 || v.interval >= 30).length;
                         return (
                           <div key={kanji.id} id={"item-" + kanji.id} className={"bg-slate-50 border border-slate-200 rounded-3xl p-5 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col " + (editingKanjiId === kanji.id ? "" : "h-72 ") + (targetId === kanji.id ? "bg-indigo-100 ring-2 ring-indigo-500" : "")}>
                              <div className="flex items-start justify-between mb-3">
                                 <div>
                                   <div className="text-5xl font-black text-slate-800 leading-none">{kanji.kanji}</div>
                                   <div className="mt-2">{renderTags(kanji.tags, (tag) => setSearchTerm(tag))}</div>
                                 </div>
                                 <div className="text-right flex flex-col items-end gap-1">
                                   <input type="text" value={kanji.meaning} onChange={e => setKanjiDB(prev => prev.map(k => k.id === kanji.id ? {...k, meaning: e.target.value} : k))} placeholder="備註..." className="text-right text-sm font-bold text-slate-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none w-24 placeholder:text-slate-400"/>
                                   <select value={kanji.jlptLevel} onChange={e => setKanjiDB(prev => prev.map(k => k.id === kanji.id ? {...k, jlptLevel: e.target.value} : k))} className="text-xs font-bold text-slate-400 bg-transparent outline-none cursor-pointer hover:text-slate-600">
                                       <option value="Unknown">--</option>
                                       <option value="N5">N5</option>
                                       <option value="N4">N4</option>
                                       <option value="N3">N3</option>
                                       <option value="N2">N2</option>
                                       <option value="N1">N1</option>
                                   </select>
                                   <button onClick={() => setEditingKanjiId(editingKanjiId === kanji.id ? null : kanji.id)} className={`mt-1 flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg transition-colors ${editingKanjiId === kanji.id ? 'bg-indigo-500 text-white' : 'text-indigo-500 hover:bg-indigo-50 border border-indigo-200'}`} title="編輯標籤"><Pencil className="w-3 h-3"/> 標籤</button>
                                 </div>
                              </div>

                              {editingKanjiId === kanji.id ? (
                                <div className="mt-1">
                                  <TagEditor tags={kanji.tags} onChange={tags => setKanjiDB(prev => prev.map(k => k.id === kanji.id ? {...k, tags} : k))} tagStats={globalTagStats} tagKeywordsMap={tagKeywordsMap} onTagKeywordsChange={setTagKeywordsMap} />
                                  <button onClick={() => setEditingKanjiId(null)} className="w-full mt-2 py-2 bg-indigo-500 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-colors">完成</button>
                                </div>
                              ) : (
                              <div className="bg-white rounded-2xl p-4 border border-slate-100 flex-1 overflow-y-auto">
                                 <div className="flex justify-between items-center mb-2">
                                   <div className="text-xs font-bold text-slate-500">關聯單字 ({associated.length})</div>
                                   {associated.length > 0 && <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">已掌握 {masteredCount}/{associated.length}</div>}
                                 </div>
                                 {associated.length === 0 ? <div className="text-xs text-slate-400 italic">無關聯單字</div> : (
                                   <div className="space-y-2">
                                     {associated.map(v => (
                                       <div key={v.id} className="flex flex-col text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                         <div className="flex justify-between items-center">
                                           <span className="font-bold text-slate-700">{v.word} <span className="text-slate-400 text-xs font-normal ml-1">({v.reading})</span></span>
                                           {(v.repetitions >= 5 || v.interval >= 30) && <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-emerald-500"/></div>}
                                         </div>
                                         <div className="text-xs text-slate-500 mt-0.5">{v.meaning}</div>
                                       </div>
                                     ))}
                                   </div>
                                 )}
                              </div>
                              )}
                           </div>
                         );
                      })}
                   </div>
                </div>
             )}
           </div>
        </div>
      )}

      {appState === 'grammar_manage' && (
        <div className="w-[95vw] max-w-[1600px] mx-auto mt-4 animate-in fade-in">
           <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Puzzle className="w-6 h-6 text-emerald-600"/> 文法公式庫</h2>
                <div className="relative w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                   <input type="text" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="搜尋文法公式..." className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"/>
                   {searchTerm && <button onClick={()=>setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><XCircle className="w-4 h-4"/></button>}
                </div>
              </div>
              
              {/* Grammar SRS Dashboard */}
              <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-indigo-500"/>文法學習進度總覽 (Grammar SRS)</h3>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center shadow-sm">
                    <div className="text-sm font-bold text-slate-500 mb-1">📚 待學習</div>
                    <div className="text-2xl font-black text-slate-700">{grammarStats.newCount} <span className="text-sm font-normal text-slate-400">公式</span></div>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 text-center shadow-sm">
                    <div className="text-sm font-bold text-blue-600 mb-1">🎯 已學習</div>
                    <div className="text-2xl font-black text-blue-700">{grammarStats.learningCount} <span className="text-sm font-normal text-blue-500/60">公式</span></div>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-center shadow-sm">
                    <div className="text-sm font-bold text-amber-600 mb-1">🏆 精通</div>
                    <div className="text-2xl font-black text-amber-700">{grammarStats.masteredCount} <span className="text-sm font-normal text-amber-500/60">公式</span></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-center shadow-sm">
                    <div className="text-sm font-bold text-emerald-600 mb-1">🗓️ 待複習</div>
                    <div className="text-xl font-black text-emerald-700">{grammarStats.dueTotal} <span className="text-sm font-normal text-emerald-500/60">公式</span></div>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 text-center shadow-sm">
                    <div className="text-sm font-bold text-rose-600 mb-1">📒 錯題本</div>
                    <div className="text-xl font-black text-rose-700">{grammarStats.mistakeGrammarsCount} <span className="text-sm font-normal text-rose-500/60">公式</span></div>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8">
                 <div className="space-y-4 order-2 lg:order-1">
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-slate-700 text-lg">已儲存的公式</h3>
                         <div className="flex items-center gap-2">
                           <select value={grammarFilterTag} onChange={e => setGrammarFilterTag(e.target.value)} className="p-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-emerald-400 text-slate-600">
                             <option value="">所有分類</option>
                             {Array.from(new Set(customGrammars.map(g => g.tag))).filter(Boolean).map(tag => <option key={tag} value={tag}>{tag}</option>)}
                           </select>
                           <button
                             onClick={() => { if (!isGrammarReordering) setGrammarSortConfig(prev => { if (prev.key !== 'isImportant') return { key: 'isImportant', direction: 'desc' }; if (prev.direction === 'desc') return { key: 'isImportant', direction: 'asc' }; return { key: null, direction: null }; }); }}
                             className={`p-2 border rounded-lg text-sm font-bold flex items-center gap-1 transition-colors ${isGrammarReordering ? 'opacity-30 cursor-not-allowed bg-white border-slate-200 text-slate-400' : grammarSortConfig.key === 'isImportant' ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-600'}`}
                             title="依照重要標記排序"
                           >
                             <Star className={`w-4 h-4 ${grammarSortConfig.key === 'isImportant' ? 'fill-current' : ''}`}/>
                             {grammarSortConfig.key === 'isImportant' ? (grammarSortConfig.direction === 'desc' ? '星號置頂' : '星號置底') : '排序'}
                           </button>
                           <button
                             onClick={() => { if (!isGrammarReordering) setGrammarSortConfig(prev => { if (prev.key !== 'dateAdded') return { key: 'dateAdded', direction: 'desc' }; if (prev.direction === 'desc') return { key: 'dateAdded', direction: 'asc' }; return { key: null, direction: null }; }); }}
                             className={`p-2 border rounded-lg text-sm font-bold flex items-center gap-1 transition-colors ${isGrammarReordering ? 'opacity-30 cursor-not-allowed bg-white border-slate-200 text-slate-400' : grammarSortConfig.key === 'dateAdded' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600'}`}
                             title="依照加入日期排序"
                           >
                             {grammarSortConfig.key === 'dateAdded' ? (grammarSortConfig.direction === 'desc' ? '↓ 最新' : '↑ 最舊') : '↕ 日期'}
                           </button>
                           <button
                             onClick={() => { setIsGrammarReordering(v => !v); setGrammarDragIdx(null); setGrammarDragOverIdx(null); }}
                             className={`p-2 border rounded-lg text-sm font-bold flex items-center gap-1 transition-colors ${isGrammarReordering ? 'bg-indigo-100 border-indigo-400 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'}`}
                             title="拖曳調整順序"
                           >
                             ≡ {isGrammarReordering ? '完成' : '排序'}
                           </button>
                         </div>
                     <div className="flex items-center gap-2">
                       <span className="text-sm font-bold text-slate-500">💡 選擇示範單字：</span>
                       <select 
                         value={exampleVerbId}
                         onChange={e => setExampleVerbId(e.target.value)}
                         className="p-1.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 bg-slate-50 text-sm font-medium text-slate-700 max-w-[150px]"
                       >
                         {verbDB.map(v => (
                           <option key={v.jisho} value={v.jisho}>{v.type && v.type.includes("adj") ? "✨ " : "🏃 "}{stripRuby(v.jisho)}</option>
                         ))}
                       </select>
                     </div>
                   </div>
                   <datalist id="grammar-tags-list">{Array.from(new Set([...customGrammars.map(g => g.tag), ...vocabDB.map(v => v.tag)])).filter(Boolean).map(tag => <option key={tag} value={tag} />)}</datalist>
                    {(() => {
                      const getTs = (id) => { const p = String(id||'').split('_'); for (const x of p) { const n = Number(x); if (!isNaN(n) && n > 1000000000000) return n; } return 0; };
                      const rankMap = {};
                      [...customGrammars].sort((a, b) => (a.addedAt || getTs(a.id)) - (b.addedAt || getTs(b.id))).forEach((g, i) => { rankMap[g.id] = i + 1; });
                      return customGrammars.filter(g => {
                        if (grammarFilterTag && g.tag !== grammarFilterTag) return false;
                        if (!searchTerm.trim()) return true;
                        const q = searchTerm.toLowerCase();
                        return (g.name && g.name.toLowerCase().includes(q)) ||
                               (g.suffix && g.suffix.toLowerCase().includes(q)) ||
                               (g.tags && g.tags.some(t => t.toLowerCase().includes(q)));
                      }).sort((a, b) => {
                        if (grammarSortConfig.key === 'isImportant') {
                            const valA = a.isImportant ? 1 : 0;
                            const valB = b.isImportant ? 1 : 0;
                            if (valA !== valB) return grammarSortConfig.direction === 'desc' ? valB - valA : valA - valB;
                        }
                        if (isGrammarReordering) return (a.addedAt||getTs(a.id)) - (b.addedAt||getTs(b.id));
                        if (grammarSortConfig.key === 'dateAdded') {
                            const getTs2 = (id) => { const p = String(id||'').split('_'); for (const x of p) { const n = Number(x); if (!isNaN(n) && n > 1000000000000) return n; } return 0; };
                            const aVal = a.addedAt || getTs2(a.id);
                            const bVal = b.addedAt || getTs2(b.id);
                            return grammarSortConfig.direction === 'desc' ? bVal - aVal : aVal - bVal;
                        }
                        return 0;
                    }).map((g, displayIdx) => (
                      <div key={g.id} id={"item-" + g.id}
                        draggable={isGrammarReordering}
                        onDragStart={isGrammarReordering ? () => setGrammarDragIdx(displayIdx) : undefined}
                        onDragOver={isGrammarReordering ? (e) => { e.preventDefault(); setGrammarDragOverIdx(displayIdx); } : undefined}
                        onDrop={isGrammarReordering ? (e) => {
                          e.preventDefault();
                          if (grammarDragIdx === null || grammarDragIdx === displayIdx) { setGrammarDragIdx(null); setGrammarDragOverIdx(null); return; }
                          const sorted = [...customGrammars].sort((a,b) => (a.addedAt||getTs(a.id)) - (b.addedAt||getTs(b.id)));
                          const item = sorted.splice(grammarDragIdx, 1)[0];
                          sorted.splice(displayIdx, 0, item);
                          const base = Date.now();
                          setCustomGrammars(sorted.map((x, i) => ({ ...x, addedAt: base + i })));
                          setGrammarDragIdx(null); setGrammarDragOverIdx(null);
                        } : undefined}
                        onDragEnd={isGrammarReordering ? () => { setGrammarDragIdx(null); setGrammarDragOverIdx(null); } : undefined}
                        className={`p-3 border rounded-2xl flex justify-between items-center shadow-sm transition-colors ${isGrammarReordering && grammarDragOverIdx === displayIdx && grammarDragIdx !== displayIdx ? 'ring-2 ring-indigo-400' : ''} ${(() => { const cs = getBaseFormCardStyle(g.baseForm); return targetId === g.id ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-500' : `${cs.bg} ${cs.border} ${cs.hover}`; })()}`}>
                         <div className="flex-1 min-w-0 bg-white rounded-xl p-4">
                           <div className="mb-2">
                             {/* 第1列：編號 */}
                             <div className="mb-1">
                               <span className="text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-md px-1.5 py-0.5"># {rankMap[g.id]}</span>
                             </div>
                             {/* 第2列：拖曳把手 ＋ 標題 ＋ 標籤 ＋ 日期 */}
                             <div className="flex items-center gap-2 flex-wrap mb-1">
                               {isGrammarReordering && <span className="text-slate-300 text-xl cursor-grab select-none shrink-0" title="拖曳排序">⠿</span>}
                               <span className="font-bold text-slate-800 text-lg inline-block pb-0.5 border-b-2 border-slate-800">{renderFormulaText(g.name)}</span>
                               <>{renderTags(g.tags, (tag) => setSearchTerm(tag))}</>
                               {g.id.startsWith('g_custom_') && !isNaN(parseInt(g.id.replace('g_custom_', ''))) ? (
                                  <div className="text-[11px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 flex items-center gap-1 shrink-0">
                                     <Timer className="w-3 h-3"/>{new Date(parseInt(g.id.replace('g_custom_', ''))).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })}
                                  </div>
                               ) : (
                                  <div className="text-[11px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 flex items-center gap-1 shrink-0">
                                     <Library className="w-3 h-3"/>系統內建
                                  </div>
                               )}
                             </div>
                             {/* 第3列：翻譯 */}
                             <div>
                               {g.translation ? (
                                 <span className="text-slate-500 text-sm font-medium">👉 {g.translation}</span>
                               ) : null}
                             </div>
                           </div>
                           <div className="text-sm text-slate-500 flex items-center gap-2 mb-2 flex-wrap">
                              接在前面：{(() => { const label = verbForms.find(f=>f.id===g.baseForm)?.label || GRAMMAR_ADJ_FORMS.find(f=>f.id===g.baseForm)?.label; return label ? <span className={`px-2 py-0.5 rounded-md font-bold border text-xs ${getBaseFormStyle(g.baseForm)}`}>{label}</span> : <span className="px-2 py-0.5 rounded-md font-bold border text-xs bg-red-50 text-red-400 border-red-200">⚠ 已刪除的欄位</span>; })()}
                           </div>
                            {g.structureNote && (
                               <div className="w-full text-[14px] bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-lg font-medium mb-2 whitespace-pre-wrap">
                                  📐 {g.structureNote}
                               </div>
                            )}
                            {g.processExample && (
                               <div className="w-full text-[14px] bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-lg font-medium mb-2 whitespace-pre-wrap">
                                  {g.processExample}
                               </div>
                            )}
                            {g.note && (
                               <div className="w-full text-[14px] bg-amber-50/50 border border-amber-100 text-amber-800 px-3 py-2 rounded-lg font-medium mb-2 whitespace-pre-wrap flex gap-2">
                                  <span className="shrink-0">📝</span> <span>{g.note}</span>
                               </div>
                            )}
                           {g.example && (
                              <div className="space-y-1.5 mt-2">
                                <div className="w-full text-[15px] bg-blue-50/80 border border-blue-100 text-blue-900 px-4 py-2.5 rounded-xl font-bold tracking-wide">
                                  💬 {renderTextWithStrikethrough(g.example)}
                                  {g.exampleTranslation && <div className="text-sm font-medium text-blue-700 mt-1 pl-4">{g.exampleTranslation}</div>}
                                </div>
                                {(g.extraExamples||[]).filter(ex=>ex.sentence).map((ex,i)=>(
                                  <div key={i} className="w-full text-[15px] bg-blue-50/50 border border-blue-100 text-blue-900 px-4 py-2 rounded-xl font-bold tracking-wide">
                                    💬 {renderTextWithStrikethrough(ex.sentence)}
                                    {ex.translation && <div className="text-sm font-medium text-blue-700 mt-1 pl-4">{ex.translation}</div>}
                                  </div>
                                ))}
                              </div>
                           )}
                                   <button onClick={() => setCustomGrammars(prev => prev.map(x => x.id === g.id ? { ...x, isImportant: !x.isImportant } : x))} className={`p-3 rounded-xl transition-colors ${g.isImportant ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`} title="標記為重要"><Star className={`w-5 h-5 ${g.isImportant ? 'fill-current' : ''}`}/></button>
                           <button onClick={() => handleEditGrammar(g)} className="p-3 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="編輯公式"><Pencil className="w-5 h-5"/></button>
                           <button onClick={() => {if(window.confirm('確定刪除？')) setCustomGrammars(customGrammars.filter(x=>x.id!==g.id))}} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="刪除公式"><Trash2 className="w-5 h-5"/></button>
                         </div>
                      </div>
                   ));
                    })()}
                 </div>
                 {(() => {
                   const gc = editingGrammarId ? {
                     panelBg: 'bg-indigo-50', panelBorder: 'border-indigo-100',
                     title: 'text-indigo-800', label: 'text-indigo-700',
                     input: 'border-indigo-200 focus:border-indigo-500',
                     advBtn: 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200 border-indigo-200',
                     divider: 'border-indigo-200',
                     btn: 'bg-indigo-600 hover:bg-indigo-700',
                   } : {
                     panelBg: 'bg-emerald-50', panelBorder: 'border-emerald-100',
                     title: 'text-emerald-800', label: 'text-emerald-700',
                     input: 'border-emerald-200 focus:border-emerald-500',
                     advBtn: 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border-emerald-200',
                     divider: 'border-emerald-200',
                     btn: 'bg-emerald-600 hover:bg-emerald-700',
                   };
                   return (
                 <div className={`${gc.panelBg} p-8 rounded-3xl border ${gc.panelBorder} flex flex-col sticky top-6 order-1 lg:order-2`} style={{maxHeight:'calc(100vh - 3rem)'}}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className={`font-bold ${gc.title} flex items-center gap-2 text-lg`}>
                          {editingGrammarId ? <Pencil className="w-6 h-6"/> : <Plus className="w-6 h-6"/>}
                          {editingGrammarId ? '編輯文法公式' : '新增文法公式'}
                      </h3>
                      <button onClick={() => setIsGrammarFormReordering(v => !v)} className={`text-xs px-2.5 py-1.5 rounded-lg border font-bold transition-colors ${isGrammarFormReordering ? 'bg-indigo-500 text-white border-indigo-500' : `bg-white border-slate-300 text-slate-500 hover:border-indigo-300 hover:text-indigo-600`}`} title="調整欄位順序">↕ 欄位順序</button>
                    </div>
                    <div className="overflow-y-auto flex-1 pr-1">
                      {(() => {
                        const gf = {
                          name: <div><label className={`block text-sm font-bold ${gc.label} mb-1.5`}>文法名稱 (提示語)</label><div className="flex gap-2 items-center"><input id="grammar-name-input" type="text" value={newGrammar.name} onChange={e => setNewGrammar(p => ({...p, name: e.target.value.replaceAll('~', '_').replaceAll('～', '_').replaceAll('〜', '_')}))} placeholder="例：〔名〕と〔名〕とどちらが_ですか" className={`flex-1 p-4 rounded-xl border ${gc.input} outline-none`}/><button type="button" title="插入名詞佔位符" onClick={() => { const el = document.getElementById('grammar-name-input'); if (!el) return; const s = el.selectionStart ?? newGrammar.name.length; const v = newGrammar.name; const nv = v.slice(0,s)+'〔名〕'+v.slice(el.selectionEnd??s); setNewGrammar(p=>({...p,name:nv})); setTimeout(()=>{el.focus();el.setSelectionRange(s+3,s+3);},0); }} className={`px-3 py-2 rounded-xl border font-bold text-sm transition-colors shrink-0 ${gc.advBtn}`}>〔名〕</button></div></div>,
                          translation: <div><label className={`block text-sm font-bold ${gc.label} mb-1.5`}>文法中文翻譯</label><input type="text" value={newGrammar.translation || ''} onChange={e => setNewGrammar(p => ({...p, translation: e.target.value}))} placeholder="例：請不要～" className={`w-full p-4 rounded-xl border ${gc.input} outline-none`}/></div>,
                          baseForm: <div><label className={`block text-sm font-bold ${gc.label} mb-1.5`}>接續方式</label><select value={newGrammar.baseForm} onChange={e => setNewGrammar(p => ({...p, baseForm: e.target.value}))} className={`w-full p-4 rounded-xl border ${gc.input} outline-none bg-white`}><optgroup label="動詞">{verbForms.filter(opt => !opt.id.startsWith('adj_')).map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}</optgroup><optgroup label="形容詞">{GRAMMAR_ADJ_FORMS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}</optgroup><optgroup label="名詞"><option value="noun">名詞</option></optgroup></select></div>,
                          tag: null,
                          tags: (() => {
                            const currentTags = newGrammar.tags || [];
                            return (
                              <div className={`rounded-xl border ${gc.border || 'border-violet-200'} overflow-hidden`}>
                                <button type="button" onClick={() => setGrammarTagsOpen(v => !v)} className={`w-full flex items-center justify-between px-4 py-3 ${gc.bg || 'bg-violet-100'} hover:opacity-90 transition-opacity`}>
                                  <span className={`text-sm font-bold ${gc.label}`}>標籤 (選填)</span>
                                  <div className="flex items-center gap-2">
                                    {currentTags.length > 0 && (
                                      <div className="flex gap-1 flex-wrap justify-end">
                                        {currentTags.map(t => <span key={t} className="px-1.5 py-0.5 text-[10px] font-bold bg-violet-200 text-violet-800 rounded-md border border-violet-300">{t}</span>)}
                                      </div>
                                    )}
                                    {currentTags.length === 0 && <span className="text-xs text-slate-400">尚未設定</span>}
                                    <span className={`text-xs ${gc.label}`}>{grammarTagsOpen ? '▲' : '▼'}</span>
                                  </div>
                                </button>
                                {grammarTagsOpen && (
                                  <div className={`px-3 pb-3 pt-1 ${gc.bg || 'bg-violet-50'}`}>
                                    <TagEditor tags={currentTags} onChange={tags => setNewGrammar(p => ({...p, tags, tag: tags[0] || ''}))} tagStats={globalTagStats} tagKeywordsMap={tagKeywordsMap} onTagKeywordsChange={setTagKeywordsMap} />
                                  </div>
                                )}
                              </div>
                            );
                          })(),
                          structureNote: <div><label className={`block text-sm font-bold ${gc.label} mb-1.5`}>結構說明 (選填)</label><input type="text" value={newGrammar.structureNote || ''} onChange={e => setNewGrammar(p => ({...p, structureNote: e.target.value.replaceAll('~', '_').replaceAll('～', '_').replaceAll('〜', '_')}))} placeholder="例：動詞て形 ＋ ください" className={`w-full p-4 rounded-xl border ${gc.input} outline-none`}/></div>,
                          exampleBlock: <div className="space-y-3">
                            <div><label className={`block text-sm font-bold ${gc.label} mb-1.5`}>例句 (選填)</label><input type="text" value={newGrammar.example || ''} onChange={e => setNewGrammar(p => ({...p, example: e.target.value}))} placeholder="例：ここでタバコを吸わないでください" className={`w-full p-4 rounded-xl border ${gc.input} outline-none`}/></div>
                            {newGrammar.example && <div><label className={`block text-sm font-bold ${gc.label} mb-1.5`}>例句中文翻譯 (選填)</label><input type="text" value={newGrammar.exampleTranslation || ''} onChange={e => setNewGrammar(p => ({...p, exampleTranslation: e.target.value}))} placeholder="例：請不要在這裡吸菸" className={`w-full p-4 rounded-xl border ${gc.input} outline-none`}/></div>}
                            {(newGrammar.extraExamples||[]).map((ex, i) => (
                              <div key={i} className={`space-y-2 pl-3 border-l-2 border-blue-200`}>
                                <div className="flex gap-2 items-center">
                                  <input type="text" value={ex.sentence || ''} onChange={e => setNewGrammar(p => { const arr=[...(p.extraExamples||[])]; arr[i]={...arr[i],sentence:e.target.value}; return {...p,extraExamples:arr}; })} placeholder={`例句 ${i+2}`} className={`flex-1 p-3 rounded-xl border ${gc.input} outline-none text-sm`}/>
                                  <button type="button" onClick={() => setNewGrammar(p => { const arr=[...(p.extraExamples||[])]; arr.splice(i,1); return {...p,extraExamples:arr}; })} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">✕</button>
                                </div>
                                {ex.sentence && <input type="text" value={ex.translation || ''} onChange={e => setNewGrammar(p => { const arr=[...(p.extraExamples||[])]; arr[i]={...arr[i],translation:e.target.value}; return {...p,extraExamples:arr}; })} placeholder={`翻譯 ${i+2}`} className={`w-full p-3 rounded-xl border ${gc.input} outline-none text-sm`}/>}
                              </div>
                            ))}
                            {newGrammar.example && <button type="button" onClick={() => setNewGrammar(p => ({...p, extraExamples:[...(p.extraExamples||[]),{sentence:'',translation:''}]}))} className={`text-sm font-bold px-3 py-1.5 rounded-lg border ${gc.advBtn} transition-colors`}>＋ 新增例句</button>}
                          </div>,
                          advanced: <div><button type="button" onClick={() => setIsGrammarExtraOpen(v => !v)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold ${gc.advBtn} transition-colors border`}><span>進階設定（刪除字尾、加上字尾、變化筆記、備註）</span><span>{isGrammarExtraOpen ? '▲' : '▼'}</span></button>{isGrammarExtraOpen && <div className="mt-3 space-y-5"><div className="grid grid-cols-2 gap-4"><div><label className={`block text-sm font-bold ${gc.label} mb-1.5`}>刪除字尾</label><input type="text" value={newGrammar.removeStr || ''} onChange={e => setNewGrammar(p => ({...p, removeStr: e.target.value.replaceAll('~', '_').replaceAll('～', '_').replaceAll('〜', '_')}))} placeholder="例：ます" className={`w-full p-4 rounded-xl border ${gc.input} outline-none`}/></div><div><label className={`block text-sm font-bold ${gc.label} mb-1.5`}>加上字尾</label><input type="text" value={newGrammar.appendStr || ''} onChange={e => setNewGrammar(p => ({...p, appendStr: e.target.value.replaceAll('~', '_').replaceAll('～', '_').replaceAll('〜', '_')}))} placeholder="例：でください" className={`w-full p-4 rounded-xl border ${gc.input} outline-none`}/></div></div><div><label className={`block text-sm font-bold ${gc.label} mb-1.5`}>變化筆記</label><input type="text" value={newGrammar.processExample || ''} onChange={e => setNewGrammar(p => ({...p, processExample: e.target.value}))} placeholder="自由輸入，例如：飲む ➔ 飲んで ➔ 飲んでください" className={`w-full p-4 rounded-xl border ${gc.input} outline-none`}/></div><div><label className={`block text-sm font-bold ${gc.label} mb-1.5`}>個人備註</label><textarea rows={1} value={newGrammar.note || ''} onChange={e => setNewGrammar(p => ({...p, note: e.target.value}))} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} placeholder="記錄自己的心得或注意事項..." className={`w-full p-4 rounded-xl border ${gc.input} outline-none resize-none overflow-hidden leading-relaxed`}/></div></div>}</div>,
                        };
                        const fieldGroupStyle = {
                          name:          'bg-emerald-100 border border-emerald-200 rounded-xl p-3',
                          translation:   'bg-emerald-100 border border-emerald-200 rounded-xl p-3',
                          baseForm:      'bg-blue-100 border border-blue-200 rounded-xl p-3',
                          structureNote: 'bg-blue-100 border border-blue-200 rounded-xl p-3',
                          tag:           'bg-violet-100 border border-violet-200 rounded-xl p-3',
                          tags:          'bg-violet-100 border border-violet-200 rounded-xl p-3',
                          exampleBlock:  'bg-amber-100 border border-amber-200 rounded-xl p-3',
                          advanced:      '',
                        };
                        return grammarFormOrder.map((fieldId, idx) => {
                          if (!gf[fieldId]) return null;
                          return (
                            <div key={fieldId} className={`mb-3 ${fieldGroupStyle[fieldId] || ''} ${isGrammarFormReordering ? 'flex gap-2 items-start' : ''}`}>
                              {isGrammarFormReordering && (
                                <div className="flex flex-col gap-0.5 shrink-0 pt-7">
                                  <button onClick={() => setGrammarFormOrder(prev => { const a=[...prev]; [a[idx-1],a[idx]]=[a[idx],a[idx-1]]; return a; })} disabled={idx===0} className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${idx===0?'opacity-20 cursor-not-allowed text-slate-300':'text-slate-500 hover:bg-slate-200'}`}>▲</button>
                                  <button onClick={() => setGrammarFormOrder(prev => { const a=[...prev]; [a[idx],a[idx+1]]=[a[idx+1],a[idx]]; return a; })} disabled={idx===grammarFormOrder.length-1} className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${idx===grammarFormOrder.length-1?'opacity-20 cursor-not-allowed text-slate-300':'text-slate-500 hover:bg-slate-200'}`}>▼</button>
                                </div>
                              )}
                              <div className="flex-1">{gf[fieldId]}</div>
                            </div>
                          );
                        });
                      })()}
                      <div className={`flex gap-4 mt-4 shrink-0 pt-4 border-t ${gc.divider}`}>
                          <button onClick={handleAddGrammar} className={`flex-1 py-4 ${gc.btn} text-white font-bold rounded-xl transition-colors shadow-sm text-lg`}>{editingGrammarId ? '儲存編輯' : '儲存新文法'}</button>
                          {editingGrammarId && <button onClick={() => { setEditingGrammarId(null); setNewGrammar({ name: '', translation: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '', exampleTranslation: '', extraExamples: [], processExample: '', note: '', tag: '', tags: [], structureNote: '' }); }} className="py-4 px-6 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors shadow-sm text-lg">取消</button>}
                      </div>
                    </div>
                 </div>
                   );
                 })()}
              </div>
           </div>
        </div>
      )}

      {appState === 'verb_manage' && (
        <div className="w-[95vw] max-w-[1600px] mx-auto mt-4 animate-in fade-in">
           <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Library className="w-6 h-6 text-indigo-600"/> 動詞與形容詞庫</h2>
           <div className="relative flex-1 max-w-md mx-4">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input type="text" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="搜尋動詞/形容詞..." className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"/>
             {searchTerm && <button onClick={()=>setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><XCircle className="w-4 h-4"/></button>}
           </div>
                 <div className="flex items-center gap-4 ml-4">
                     <span className="text-sm font-bold text-slate-500">動詞: {verbDB.filter(v=>v.type==='verb').length} | 形容詞: {verbDB.filter(v=>v.type==='adj_i'||v.type==='adj_na').length}</span>
                     <label className="flex items-center gap-2 cursor-pointer select-none bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl font-bold border border-amber-200 hover:bg-amber-100 transition-colors">
                         <input type="checkbox" checked={showOnlyImportantVerb} onChange={(e)=>setShowOnlyImportantVerb(e.target.checked)} className="hidden"/>
                         <Star className={`w-4 h-4 ${showOnlyImportantVerb ? 'fill-amber-500 text-amber-500' : 'text-amber-500/50'}`}/>
                         只顯示重要
                     </label>
                 </div>
              </div>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
                {[{id:'all',label:'全部'},{id:'verb',label:'🏃 動詞'},{id:'adj_i',label:'い形'},{id:'adj_na',label:'な形'},{id:'adj',label:'形容詞'}].map(({id,label})=>(
                  <button key={id} onClick={()=>setVerbManageTypeTab(id)} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${verbManageTypeTab===id?'bg-white text-indigo-700 shadow-sm':'text-slate-500 bg-slate-200/50 hover:text-slate-700'}`}>{label}</button>
                ))}
              </div>
              <div className="bg-indigo-50 rounded-3xl border border-indigo-100 mb-8">
                 <button onClick={() => setShowVerbAddSection(prev => !prev)} className="w-full flex justify-between items-center px-6 py-4">
                   <h3 className="font-bold text-indigo-800 text-lg">批次與單筆新增動詞/形容詞</h3>
                   <span className="text-indigo-600 text-sm font-bold">{showVerbAddSection ? '▲ 收起' : '▼ 展開'}</span>
                 </button>
                 {showVerbAddSection && <div className="px-6 pb-6">
                 <div className="mb-6 bg-white p-5 rounded-2xl border border-indigo-200 shadow-sm">
                   <div className="flex items-center gap-2 mb-3 text-sm font-bold text-indigo-700"><Sparkles className="w-5 h-5"/> 快速貼上區 (智慧解析與自動變化)</div>
                   <textarea value={verbImportText} onChange={e => setVerbImportText(e.target.value)} placeholder="支援群組標籤與例句！例如：&#10;【第一類動詞】&#10;飲[の]む&#10;喝&#10;💬 水を飲む。&#10;&#10;【第二類動詞】&#10;食[た]べる&#10;吃" className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 text-sm h-32 resize-y placeholder:text-slate-400 leading-relaxed"/>
                   <button onClick={handleVerbSmartImport} className="mt-3 w-full py-3 bg-indigo-100 text-indigo-800 rounded-xl font-bold hover:bg-indigo-200 transition-colors flex items-center justify-center gap-2"><Sparkles className="w-4 h-4"/> 解析文字並送至確認區</button>
                 </div>
                 {verbBatchItems.length > 0 && (
                   <div className="mb-6 bg-white rounded-2xl border border-indigo-200 shadow-sm overflow-hidden">
                     <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-indigo-100 cursor-pointer select-none" onClick={() => setIsVerbBatchOpen(o => !o)}>
                       <span className="flex items-center gap-1.5">
                         <ChevronUp className={`w-4 h-4 transition-transform duration-200 text-indigo-700 ${isVerbBatchOpen ? '' : 'rotate-180'}`}/>
                         <span className="text-sm font-bold text-indigo-700">形容詞 (單次/批次) 新增（{verbBatchItems.length} 筆）</span>
                         <span className="text-xs text-slate-400 font-normal">快速批次匯入・保留原形（不自動變化）</span>
                       </span>
                       <button onClick={e => { e.stopPropagation(); if(window.confirm('確定清空確認區？')) setVerbBatchItems([]); }} className="text-xs text-red-500 hover:text-red-700 font-bold">全部清空</button>
                     </div>
                     {isVerbBatchOpen && (<>
                       <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
                         {verbBatchItems.map((item, idx) => {
                           const setType = (t) => { const n=[...verbBatchItems]; n[idx]={...n[idx], type:t, group:t==='adj_i'?'i':t==='adj_na'?'na':'1'}; setVerbBatchItems(n); };
                           const isUnknown = item.type === 'unknown';
                           const typeBtn = (t, label, active, color) => (
                             <button key={t} onClick={() => setType(t)}
                               className={`shrink-0 px-2 py-0.5 rounded-lg text-xs font-bold border transition-colors ${active ? color : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                               {label}
                             </button>
                           );
                           return (
                             <div key={idx} className={`flex items-center gap-2 p-3 rounded-xl border ${isUnknown && item.jisho ? 'bg-orange-50 border-orange-300' : 'bg-slate-50 border-slate-200'}`}>
                               <div className="relative w-36 shrink-0">
                                 <input type="text" list="theme-suggestions" value={item.tag || ''} onChange={e => { const n=[...verbBatchItems]; n[idx]={...n[idx],tag:e.target.value}; setVerbBatchItems(n); }} className={`w-full pl-3 pr-8 py-1.5 rounded-xl outline-none text-sm font-bold border ${getTagStyle(item.tag || '')}`} placeholder="主題/標籤"/>
                                 <button title="自動配對主題標籤" onClick={() => { const jWord = (item.jisho||'').trim(); const guessed = item.meaning ? guessTag(item.meaning, vocabDB) : (vocabDB.find(v=>(v.word===jWord||v.reading===jWord)&&v.tag&&v.tag!=='自訂'&&v.tag!=='未知')?.tag||null); if(guessed){const n=[...verbBatchItems];n[idx]={...n[idx],tag:guessed};setVerbBatchItems(n);}}} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-500 transition-colors"><Sparkles className="w-3.5 h-3.5"/></button>
                               </div>
                               {typeBtn('adj_na','な形', item.type==='adj_na', 'bg-violet-100 text-violet-700 border-violet-300')}
                               {typeBtn('adj_i', 'い形', item.type==='adj_i',  'bg-rose-100 text-rose-700 border-rose-300')}
                               {isUnknown && item.jisho && <span className="shrink-0 text-xs text-orange-600 font-bold">⚠ 請選擇類型</span>}
                               <input type="text" value={item.jisho || ''} onChange={e => { const n=[...verbBatchItems]; n[idx]={...n[idx],jisho:e.target.value}; setVerbBatchItems(n); }} className="flex-1 px-2 py-1 text-sm font-bold border border-slate-200 rounded-lg outline-none focus:border-indigo-400 bg-white" placeholder="辭書形"/>
                               <input type="text" value={item.meaning} onChange={e => { const n=[...verbBatchItems]; n[idx]={...n[idx],meaning:e.target.value}; setVerbBatchItems(n); }} className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 bg-white" placeholder="中文意思"/>
                               <button onClick={() => setVerbBatchItems(verbBatchItems.filter((_,i)=>i!==idx))} className="shrink-0 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                             </div>
                           );
                         })}
                       </div>
                       {(() => {
                         const filledItems = verbBatchItems.filter(v => v.jisho?.trim());
                         const unknownCount = filledItems.filter(v => v.type === 'unknown').length;
                         const validCount = filledItems.filter(v => v.type !== 'unknown').length;
                         if (filledItems.length === 0) return null;
                         return (
                           <div className="px-5 pb-4 pt-2 space-y-2">
                             {unknownCount > 0 && <p className="text-xs text-orange-600 font-bold text-center">⚠ 有 {unknownCount} 筆尚未選擇類型，請先選擇後再儲存</p>}
                             {validCount > 0 && <button onClick={handleVerbBatchSave} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">確認並儲存全部 {validCount} 筆</button>}
                           </div>
                         );
                       })()}
                     </>)}
                   </div>
                 )}
                 <div className="border-t border-indigo-200 pt-6 mt-6 mb-4">
                   <div className="flex items-baseline gap-2 mb-4">
                     <h4 className="font-bold text-indigo-800">動詞手動新增</h4>
                     <span className="text-xs text-slate-400">精細新增・自動產生完整變化型</span>
                   </div>
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                   <div><label className="block text-sm font-bold text-indigo-700 mb-1">類型</label><select value={verbInputs.type} onChange={e=>{const t=e.target.value; handleVerbInputChange('type',t); if(t==='adj_i') handleVerbInputChange('group','i'); else if(t==='adj_na') handleVerbInputChange('group','na'); else handleVerbInputChange('group','1');}} className="w-full p-3 rounded-xl border border-indigo-200"><option value="verb">動詞 (verb)</option><option value="adj_i">い形容詞 (adj_i)</option><option value="adj_na">な形容詞 (adj_na)</option></select></div>
                   <div><label className="block text-sm font-bold text-indigo-700 mb-1">群組/分類</label><select value={verbInputs.group} onChange={e=>handleVerbInputChange('group', e.target.value)} className="w-full p-3 rounded-xl border border-indigo-200" disabled={verbInputs.type !== 'verb'}>{verbInputs.type === 'adj_i' ? <option value="i">い型</option> : verbInputs.type === 'adj_na' ? <option value="na">な型</option> : <><option value="1">第一類動詞（五段動詞）</option><option value="2">第二類動詞（上一・下一段動詞）</option><option value="3">第三類動詞（不規則動詞）</option></>}</select></div>
                   <div><label className="block text-sm font-bold text-indigo-700 mb-1">難易度</label><select value={verbInputs.difficulty} onChange={e=>handleVerbInputChange('difficulty', e.target.value)} className="w-full p-3 rounded-xl border border-indigo-200"><option value="n5">N5</option><option value="n4">N4</option><option value="n3">N3</option><option value="n2">N2</option><option value="n1">N1</option></select></div>
                   <div><label className="block text-sm font-bold text-indigo-700 mb-1">中文意思</label><input type="text" value={verbInputs.meaning} onChange={e=>handleVerbInputChange('meaning', e.target.value)} placeholder="例：去" className="w-full p-3 rounded-xl border border-indigo-200"/></div>
                 </div>
                 <div className="mb-4">
                   <label className="flex items-center gap-2 cursor-pointer w-fit">
                     <input type="checkbox" checked={!!verbInputs.irregular} onChange={e=>handleVerbInputChange('irregular', e.target.checked)} className="w-4 h-4 accent-rose-500"/>
                     <span className="text-sm font-bold text-rose-600">⚠ 不規則変化</span>
                     <span className="text-xs text-slate-400">（如いい→よかった，活用形與辭書形字根不同時勾選）</span>
                   </label>
                 </div>
                 <div className="mb-4">
                   <label className="block text-sm font-bold text-indigo-700 mb-1">例句 (選填，支援漢字[假名]自動標音)</label>
                   <input type="text" value={verbInputs.example || ''} onChange={e=>handleVerbInputChange('example', e.target.value)} placeholder="例：雨[あめ]が降[ふ]るので、行[い]きません。" className="w-full p-3 rounded-xl border border-indigo-200"/>
                 </div>
                 <div className="flex justify-between items-center mb-4 mt-6"><h4 className="font-bold text-indigo-800">各變化型設定</h4><button onClick={() => {
  let jishoToUse = verbInputs.jisho;
  if (!jishoToUse && verbInputs.masu) {
    jishoToUse = deriveJishoFromMasu(verbInputs.masu, verbInputs.group);
  }
  if (!jishoToUse) return alert('請填寫普通形(辭書形/常體)或ます形！');

  let forms = {};

  if (verbInputs.type === 'adj_i') {
    const isIrregular = verbInputs.irregular || jishoToUse === 'いい' || jishoToUse === '良い' || jishoToUse === '良[よ]い';
    if (isIrregular) {
      forms = { masu: 'いいです', te: 'よくて', ta: 'よかった', nai: 'よくない', nakatta: 'よくなかった', ba: 'よければ' };
    } else if (jishoToUse.endsWith('い')) {
      const stem = jishoToUse.slice(0, -1);
      forms = { masu: jishoToUse + 'です', te: stem + 'くて', ta: stem + 'かった', nai: stem + 'くない', nakatta: stem + 'くなかった', ba: stem + 'ければ' };
    }
  } else if (verbInputs.type === 'adj_na') {
    const stem = jishoToUse.endsWith('だ') ? jishoToUse.slice(0, -1) : jishoToUse;
    forms = { masu: stem + 'です', te: stem + 'で', ta: stem + 'だった', nai: stem + 'じゃない', nakatta: stem + 'じゃなかった', ba: stem + 'なら' };
  } else {
    forms = autoConjugate(jishoToUse, verbInputs.group);
  }

  if (Object.keys(forms).length > 0) {
    const getBaseVal = (base) => {
      if (base === 'te') return forms.te || '';
      if (base === 'ta') return forms.ta || '';
      if (base === 'nai') return forms.nai || '';
      if (base === 'nai_stem') { const n = forms.nai||''; return n.endsWith('い') ? n.slice(0,-1) : n; }
      if (base === 'jisho') return jishoToUse || '';
      if (base === 'masu') return forms.masu || '';
      if (base === 'masu_stem') { const m = forms.masu||''; if (m.endsWith('ます')) return m.slice(0,-2); if (m.endsWith('です')) return m.slice(0,-2); return m; }
      return '';
    };
    const customForms = {};
    verbForms.forEach(f => { if (f.base) { const bv = getBaseVal(f.base); if (bv) customForms[f.id] = bv + (f.suffix||''); } });
    setVerbInputs(prev => ({ ...prev, jisho: jishoToUse, ...forms, ...customForms }));
  } else {
    alert('無法自動產生，請確認格式是否正確！');
  }
}} className="text-sm text-indigo-700 bg-indigo-100 px-4 py-2 rounded-xl font-bold hover:bg-indigo-200 flex items-center gap-1 transition-colors"><Sparkles className="w-4 h-4"/> 自動產生變化型</button></div><div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                   
                   {verbForms.map((f, idx) => {
                        if ((verbInputs.type === 'adj_i' || verbInputs.type === 'adj_na') && f.id === 'masu') return null;
                        return (
                        <div key={f.id}
                             draggable
                             onDragStart={(e) => { setDraggedFormIndex(idx); e.dataTransfer.effectAllowed = 'move'; }}
                             onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverFormIndex(idx); }}
                             onDragEnd={() => {
                                 if (draggedFormIndex !== null && dragOverFormIndex !== null && draggedFormIndex !== dragOverFormIndex) {
                                     const newForms = [...verbForms];
                                     const item = newForms.splice(draggedFormIndex, 1)[0];
                                     newForms.splice(dragOverFormIndex, 0, item);
                                     setVerbForms(newForms);
                                 }
                                 setDraggedFormIndex(null);
                                 setDragOverFormIndex(null);
                             }}
                             className={`transition-all duration-200 ${draggedFormIndex === idx ? 'opacity-50 scale-95' : ''} ${dragOverFormIndex === idx && draggedFormIndex !== idx ? (draggedFormIndex < dragOverFormIndex ? 'border-r-4 border-r-indigo-500' : 'border-l-4 border-l-indigo-500') : ''} p-2 -m-2 rounded-xl border border-transparent cursor-grab active:cursor-grabbing hover:bg-indigo-50/50`}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <GripHorizontal className="w-4 h-4 text-indigo-400 shrink-0 cursor-grab" title="拖曳以排序" />
                              <span className="text-sm font-bold text-indigo-700 flex-1 min-w-0 truncate">{f.label}</span>
                              {f.base && <span className="text-[10px] text-indigo-300 shrink-0">⚡</span>}
                            <button
                              type="button"
                              title="編輯"
                              onClick={e => { e.stopPropagation(); setRenamingFormLabel(f.label); setRenamingFormBase(f.base||''); setRenamingFormSuffix(f.suffix||''); setRenamingFormId(renamingFormId===f.id?null:f.id); }}
                              className={`shrink-0 transition-colors ${renamingFormId===f.id?'text-indigo-600':'text-indigo-400 hover:text-indigo-600'}`}
                            ><Pencil className="w-3 h-3" /></button>
                            <button
                              type="button"
                              title="刪除此欄位"
                              onClick={e => {
                                e.stopPropagation();
                                const builtIn = ['masu','jisho','te','ta','nai','nakatta','ba','volitional','potential','passive','causative','causative_passive'];
                                const usedCount = customGrammars.filter(g => g.baseForm === f.id).length;
                                const usedMsg = usedCount > 0 ? `\n⚠ 此欄位已被 ${usedCount} 個文法公式使用，刪除後接續方式將顯示異常！` : '';
                                const isBuiltIn = builtIn.includes(f.id);
                                if ((isBuiltIn || usedCount > 0) && !window.confirm(`確定要刪除「${f.label}」？${usedMsg}`)) return;
                                setVerbForms(prev => prev.filter(x => x.id !== f.id));
                              }}
                              className="text-slate-300 hover:text-rose-500 shrink-0 transition-colors"
                            >✕</button>
                          </div>
                          {renamingFormId === f.id && (
                            <div className="mb-2 p-2 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                              <input autoFocus type="text" value={renamingFormLabel} onChange={e=>setRenamingFormLabel(e.target.value)} placeholder="名稱" className="w-full text-sm p-1.5 rounded-lg border border-indigo-200 outline-none focus:border-indigo-400 bg-white"/>
                              {f.id.startsWith('custom_') && (
                                <div className="flex gap-2 items-center flex-wrap">
                                  <span className="text-xs font-bold text-indigo-600 shrink-0">自動推導：</span>
                                  <select value={renamingFormBase} onChange={e=>setRenamingFormBase(e.target.value)} className="text-xs p-1.5 rounded-lg border border-indigo-200 outline-none bg-white">
                                    <option value="">手動填寫（不自動產生）</option>
                                    <option value="te">て形 ＋</option>
                                    <option value="ta">た形 ＋</option>
                                    <option value="nai">ない形 ＋</option>
                                    <option value="nai_stem">ない幹（食べな〜）＋</option>
                                    <option value="jisho">辭書形 ＋</option>
                                    <option value="masu">ます形 ＋</option>
                                    <option value="masu_stem">ます幹（食べ〜）＋</option>
                                  </select>
                                  <input type="text" value={renamingFormSuffix} onChange={e=>setRenamingFormSuffix(e.target.value)} placeholder="後綴，例：ました" className="text-xs p-1.5 rounded-lg border border-indigo-200 outline-none flex-1 min-w-20 bg-white"/>
                                </div>
                              )}
                              <div className="flex gap-2">
                                <button type="button" onClick={() => {
                                  const v = renamingFormLabel.trim();
                                  if (!v) return;
                                  setVerbForms(prev => prev.map(x => x.id === f.id ? { ...x, label: v, ...(f.id.startsWith('custom_') ? { base: renamingFormBase, suffix: renamingFormSuffix.trim() } : {}) } : x));
                                  setRenamingFormId(null);
                                }} className="text-xs px-3 py-1 bg-indigo-500 text-white rounded-lg font-bold hover:bg-indigo-600">儲存</button>
                                <button type="button" onClick={()=>setRenamingFormId(null)} className="text-xs px-3 py-1 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50">取消</button>
                              </div>
                            </div>
                          )}
                          <input draggable="true" onDragStart={e => { e.preventDefault(); e.stopPropagation(); }} type="text" value={verbInputs[f.id] || ''} onChange={e=>handleVerbInputChange(f.id, e.target.value)} className="w-full p-3 rounded-xl border border-indigo-200 bg-white/80 focus:bg-white transition-colors outline-none focus:border-indigo-500 pointer-events-auto cursor-text"/>
                        </div>
                    );})}
                 </div>

                 <div className="mt-6 border-t border-indigo-100 pt-6 pb-6">
                    <h4 className="font-bold text-indigo-800 mb-3 flex items-center gap-2 text-sm"><Settings className="w-4 h-4"/> 自訂動詞變化欄位</h4>
                    {/* 快速新增常用形（折疊） */}
                    <div className="mb-3">
                      <button type="button" onClick={() => setShowQuickForms(v => !v)} className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1">
                        {showQuickForms ? '▲' : '▼'} 快速新增常用形
                      </button>
                      {showQuickForms && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {QUICK_ADD_FORMS.map(f => {
                            const already = verbForms.some(x => x.label === f.label);
                            return (
                              <button key={f.label} type="button" disabled={already}
                                onClick={() => {
                                  if (already) return;
                                  const rule = KNOWN_FORM_RULES[f.label] || {};
                                  setVerbForms(prev => [...prev, { id: 'custom_' + Date.now(), label: f.label, base: rule.base||'', suffix: rule.suffix||'' }]);
                                }}
                                className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition-colors ${already ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'}`}>
                                {already ? '✓ ' : '＋ '}{f.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {/* 手動輸入新增 */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input type="text" id="newFormLabel" placeholder="輸入任意變化型名稱（系統自動辨識規則）" className="p-3 rounded-xl border border-indigo-200 flex-1 outline-none focus:border-indigo-500"/>
                      <button onClick={() => {
                        const label = document.getElementById('newFormLabel').value.trim();
                        if (!label) return alert('請填寫變化型名稱！');
                        if (verbForms.some(f => f.label === label)) return alert('此名稱已存在！');
                        const rule = KNOWN_FORM_RULES[label] || {};
                        setVerbForms(prev => [...prev, { id: 'custom_' + Date.now(), label, base: rule.base||'', suffix: rule.suffix||'' }]);
                        document.getElementById('newFormLabel').value = '';
                      }} className="py-3 px-6 bg-indigo-100 text-indigo-700 font-bold rounded-xl hover:bg-indigo-200 transition-colors shrink-0">＋ 新增</button>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">已知型（如ました形）系統自動設定規則，新增後按「自動產生」即可填入</p>
                 </div>
                 </div><button onClick={handleAddVerb} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-sm">新增至記憶庫</button>
                 </div>}
              </div>

              <div className="overflow-x-auto">
                 <div className="flex justify-end mb-2 gap-2">
                   <button
                     onClick={() => { setVerbAutoFit(v => !v); }}
                     className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${verbAutoFit ? 'bg-indigo-500 text-white border-indigo-500 hover:bg-indigo-600' : 'text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border-slate-200 hover:border-indigo-300'}`}
                     title={verbAutoFit ? '自動適應視窗（點擊關閉）' : '自動適應視窗（點擊開啟）'}
                   >⚡ 自動適應</button>
                   <button
                     onClick={(e) => {
                       const cWidth = e.currentTarget.closest('.overflow-x-auto').clientWidth;
                       const avg = Math.max(50, cWidth / verbTableColumnOrder.length);
                       const nw = {};
                       verbTableColumnOrder.forEach(id => nw[id] = avg);
                       setVerbColWidths(nw);
                     }}
                     className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors"
                     title="平均分配所有欄位寬度"
                   >
                     ⚖️ 平均分配
                   </button>
                   <button
                     onClick={() => { if(window.confirm('確定要重設所有欄位寬度為預設值嗎？')) { setVerbColWidths({}); } }}
                     className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors"
                     title="重設所有欄位寬度"
                   >
                     ↩ 重設欄寬
                   </button>
                 </div>
               <table className="text-left text-sm table-fixed" style={verbAutoFit ? { width: '100%' } : { width: verbTableColumnOrder.reduce((acc, colId) => acc + (verbColWidths[colId] ?? (VERB_DEFAULT_WIDTHS[colId] || (verbForms.find(f => f.id === colId) ? 120 : 100))), 0) }}>
                 <thead className="bg-slate-50 text-slate-600"><tr>
                    {verbTableColumnOrder.map((colId, idx) => {
        const isBuiltIn = colDefinitions[colId];
        const isVerbForm = verbForms.find(f => f.id === colId);
        if (!isBuiltIn && !isVerbForm) return null;
        
        const label = isBuiltIn ? isBuiltIn.label : isVerbForm.label;
        const sortable = isBuiltIn ? isBuiltIn.sortable : false;
        
        return (
                                    <th key={colId} 
                className={`p-0 relative bg-slate-50 text-slate-600 select-none ${dragTableColIdx === idx ? 'opacity-30' : ''} ${dragOverTableColIdx === idx && dragTableColIdx !== idx ? (dragTableColIdx < dragOverTableColIdx ? 'border-r-4 border-r-indigo-500' : 'border-l-4 border-l-indigo-500') : ''}`}
                style={verbAutoFit ? { width: `${((verbColWidths[colId] ?? (VERB_DEFAULT_WIDTHS[colId] || (verbForms.find(f=>f.id===colId)?120:100))) / verbTableColumnOrder.reduce((s,c)=>s+(verbColWidths[c]??(VERB_DEFAULT_WIDTHS[c]||(verbForms.find(f=>f.id===c)?120:100))),0)*100).toFixed(1)}%` } : { width: verbColWidths[colId] ?? (VERB_DEFAULT_WIDTHS[colId] || (verbForms.find(f => f.id === colId) ? 120 : undefined)) }}
            >
                <div 
                  draggable
                  onDragStart={(e) => { setDragTableColIdx(idx); e.dataTransfer.effectAllowed = 'move'; }}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverTableColIdx(idx); }}
                  onDragEnd={() => {
                      if (dragTableColIdx !== null && dragOverTableColIdx !== null && dragTableColIdx !== dragOverTableColIdx) {
                          const newOrder = [...verbTableColumnOrder];
                          const item = newOrder.splice(dragTableColIdx, 1)[0];
                          newOrder.splice(dragOverTableColIdx, 0, item);
                          setVerbTableColumnOrder(newOrder);
                      }
                      setDragTableColIdx(null);
                      setDragOverTableColIdx(null);
                  }}
                  className="p-4 cursor-grab active:cursor-grabbing hover:bg-slate-100 transition-colors flex items-center gap-1 w-full h-full overflow-hidden"
                  onClick={() => { if(!resizingRef.current) { sortable && handleVerbSort(colId); } }}
                >
                   <GripHorizontal className="w-3 h-3 text-slate-300 shrink-0"/>
                   {colId === 'tag' ? (
                     <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                       <input type="checkbox"
                         checked={sortedVerbDB.length > 0 && sortedVerbDB.every(v => selectedVerbIds.has(v.id))}
                         onChange={e => setSelectedVerbIds(e.target.checked ? new Set(sortedVerbDB.map(v => v.id)) : new Set())}
                         className="w-3.5 h-3.5 cursor-pointer accent-indigo-500 shrink-0"
                       />
                       <span>{label}</span>{sortable && renderVerbSortIcon(colId)}
                     </div>
                   ) : (
                     <>{label}{sortable && renderVerbSortIcon(colId)}</>
                   )}
                </div>
                {colId === 'tag' && selectedVerbIds.size > 0 && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 min-w-max bg-indigo-50 border-2 border-indigo-300 rounded-lg flex flex-col items-center px-3 py-1.5 gap-2 z-10 shadow-md" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5">
                      <input type="checkbox" checked onChange={() => setSelectedVerbIds(new Set())} className="w-3 h-3 cursor-pointer accent-indigo-500 shrink-0"/>
                      <span className="text-xs font-bold text-indigo-700 whitespace-nowrap">已選{selectedVerbIds.size}筆</span>
                      <button onClick={() => setSelectedVerbIds(new Set())} className="shrink-0 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors px-0.5">✕</button>
                    </div>
                    <button onClick={handleBatchRematchVerbThemes} className="text-xs font-bold px-2 py-0.5 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors whitespace-nowrap">重配主題</button>
                  </div>
                )}
                <div
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const startWidth = e.currentTarget.parentElement.getBoundingClientRect().width;
                    const tEl = e.currentTarget.closest('table');
                    const cEl = e.currentTarget.closest('.overflow-x-auto');
                    const maxAllowedDiff = cEl.clientWidth - tEl.getBoundingClientRect().width;
                    resizingRef.current = { tableType: 'verb', colId, startX: e.clientX, startWidth, maxAllowedDiff };
                    document.body.style.userSelect = 'none';
                    document.body.style.cursor = 'col-resize';
                  }}
                  className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize hover:bg-indigo-300/30 z-30 flex items-center justify-center group border-r border-transparent hover:border-indigo-400"
                  title="拖曳縮放"
                >
                  <div className="w-0.5 h-full bg-transparent group-hover:bg-indigo-500 transition-colors"></div>
                </div>
            </th>
        );
    })}
                 </tr></thead>
                 <tbody>
                    {sortedVerbDB.map(v => editingVerbId === v.id ? (
                       /* 編輯中的列：只標記高亮，實際編輯在 Modal */
                       <tr key={'edit-'+v.id} className="border-b-2 border-indigo-400 bg-indigo-50/60 ring-2 ring-inset ring-indigo-300">
                          {verbTableColumnOrder.map(colId => {
                            if (colId === 'actions') return (
                              <td key={colId} className="p-4 text-center">
                                <span className="text-xs font-bold text-indigo-500 animate-pulse">編輯中…</span>
                              </td>
                            );
                            const isVerbFormCol = verbForms.some(f => f.id === colId);
                            if (isVerbFormCol && (v.type === 'adj_i' || v.type === 'adj_na')) {
                              if (!v[colId]) return <td key={colId} className="bg-indigo-50/60"></td>;
                            }
                            return <td key={colId} className="p-4 text-slate-400 text-sm">{v[colId] ? <span className="font-bold">{v[colId]}</span> : ''}</td>;
                          })}
                       </tr>
                     ) : (
                       <tr key={v.id} id={"item-" + v.id} className={"border-b border-slate-50 hover:bg-slate-50/50 transition-colors " + (selectedVerbIds.has(v.id) ? "bg-indigo-50 " : "") + (targetId === v.id ? "bg-amber-100 ring-2 ring-amber-400" : "")}>
                          {verbTableColumnOrder.map(colId => {
    if (colId === 'isImportant') {
        return <td key={colId} className="p-4 text-center">
            <button onClick={() => setVerbDB(prev => prev.map(x => x.id === v.id ? { ...x, isImportant: !x.isImportant } : x))} className={`p-2 rounded-lg transition-colors ${v.isImportant ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`} title="標記為重要"><Star className={`w-4 h-4 ${v.isImportant ? 'fill-current' : ''}`}/></button>
        </td>;
    }
    if (colId === 'status') {
        const icons = { not_started: '📚 待學習', learning: '🔥 練習中', mastered: '🏆 已掌握' };
        const colors = { not_started: 'bg-slate-100 text-slate-500 border-slate-200', learning: 'bg-orange-50 text-orange-600 border-orange-200', mastered: 'bg-amber-100 text-amber-700 border-amber-300' };
        const st = v.status || 'not_started';
        return <td key={colId} className="p-4 text-center">
            <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold border ${colors[st]}`}>
                {icons[st]}
            </span>
        </td>;
    }
    if (colId === 'accuracy') {
        let totalCorrect = 0; let totalWrong = 0;
        if (v.stats) {
            ACTIVE_VERB_FORMS.forEach(f => {
                if (v.stats[f]) { totalCorrect += v.stats[f].correct; totalWrong += v.stats[f].wrong; }
            });
        }
        const total = totalCorrect + totalWrong;
        const acc = total === 0 ? 0 : Math.round((totalCorrect / total) * 100);
        return <td key={colId} className="p-4 text-center">
            <div className="w-full bg-slate-100 rounded-full h-2 mb-1 border border-slate-200 overflow-hidden">
                <div className="bg-indigo-500 h-2" style={{ width: `${acc}%` }}></div>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500">{total > 0 ? `${acc}%` : '-'}</span>
        </td>;
    }
    if (colId === 'type') {
        return <td key={colId} className="p-4">
          <span className={`inline-block px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded border-2 border-b-4 transition-transform active:border-b-2 active:translate-y-[2px] whitespace-nowrap cursor-default ${getVerbTypeStyle(v.type, v.group)}`}>{formatVerbType(v.type, v.group)}</span>
          {v.irregular && <span className="ml-1 inline-block px-1.5 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-600 border border-rose-300 rounded-full whitespace-nowrap">⚠ 不規則</span>}
        </td>;
    }
    if (colId === 'tag') {
        return <td key={colId} className="p-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={selectedVerbIds.has(v.id)} onChange={() => toggleVerbSelect(v.id)} className="w-3.5 h-3.5 cursor-pointer accent-indigo-500 shrink-0"/>
              {editingTagId === v.id ? (
                <select autoFocus onBlur={() => setEditingTagId(null)} onChange={(e) => {
                  const newTag = e.target.value;
                  setVerbDB(verbDB.map(x => x.id === v.id ? { ...x, tag: newTag } : x));
                  setEditingTagId(null);
                }} className="bg-white border border-slate-200 rounded px-2 py-1 outline-none text-xs">
                  <option value="">選擇主題</option>
                  {getAvailableThemes().map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              ) : (
                <>
                  {renderTags(v.tags, (tag) => setSearchTerm(tag))}
                  {(!v.tags || v.tags.length === 0) && v.tag && (
                    <span onClick={() => setSearchTerm(v.tag)} className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md border cursor-pointer hover:opacity-75 transition-opacity ${getTagStyle(v.tag)}`}>{v.tag}</span>
                  )}
                </>
              )}
              <button onClick={() => handleRematchVerbDbTheme(v.id, v.meaning)} title="自動配對主題" className="p-1 text-slate-300 hover:text-indigo-500 transition-colors"><Sparkles className="w-4 h-4"/></button>
            </div>
        </td>;
    }
    if (colId === 'meaning') {
        return <td key={colId} className="p-4 font-bold text-slate-700">{v.meaning}</td>;
    }
    if (colId === 'dateAdded') {
        return <td key={colId} className="p-4 text-xs text-slate-400">{getAddedDate(v.id)}</td>;
    }
    if (colId === 'actions') {
        return <td key={colId} className="p-4 flex gap-1">
            <button onClick={()=>{setEditingVerbId(v.id); setVerbEditForm({ ...v });}} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="編輯"><Edit3 className="w-4 h-4"/></button>
            <button onClick={()=>{if(window.confirm('確定刪除？')) setVerbDB(verbDB.filter(x=>x.id!==v.id))}} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="刪除"><Trash2 className="w-4 h-4"/></button>
        </td>;
    }
    
    // Skip any column not recognized as built-in or verb form (e.g. legacy learnStatus)
    if (!colDefinitions[colId] && !verbForms.find(f => f.id === colId)) return null;
    // 形容詞：有資料的格子照常顯示，空白格子灰底 + 每格都顯示徽章
    if (verbForms.some(f => f.id === colId) && (v.type === 'adj_i' || v.type === 'adj_na')) {
        if (v[colId]) {
            return <td key={colId} className="p-4 font-bold text-slate-700">{renderRuby(v[colId])}</td>;
        }
        return <td key={colId} className="p-4 bg-slate-150 text-center" style={{backgroundColor:'#eaecf0'}}>
            <span className="inline-block text-xs font-bold text-slate-500 bg-slate-200 border border-slate-300 rounded-full px-2 py-0.5 select-none">形容詞</span>
        </td>;
    }
    return <td key={colId} className="p-4 font-bold text-slate-700">{renderRuby(v[colId])}</td>;
})}
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
                       <div key={idx} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm relative">
                          <button 
                            onClick={() => {
                               if(item.isVocab) {
                                  setVocabDB(prev => prev.map(x => x.id === item.id ? { ...x, isImportant: !x.isImportant } : x));
                               } else {
                                  setVerbDB(prev => prev.map(x => x.id === item.id ? { ...x, isImportant: !x.isImportant } : x));
                               }
                            }}
                            className={`absolute top-3 right-3 p-2 rounded-lg transition-colors ${(item.isVocab ? vocabDB.find(x=>x.id===item.id)?.isImportant : verbDB.find(x=>x.id===item.id)?.isImportant) ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-500 hover:bg-amber-50'}`} 
                            title="標記為重要">
                            <Star className={`w-5 h-5 ${(item.isVocab ? vocabDB.find(x=>x.id===item.id)?.isImportant : verbDB.find(x=>x.id===item.id)?.isImportant) ? 'fill-current' : ''}`}/>
                          </button>
                          <div className="text-sm text-slate-600 mb-2 font-bold pr-10">{item.question}</div><div className="flex gap-4 text-sm font-bold mb-3"><div className="text-red-500 line-through">你的答案: {item.userAnswer || '未作答'}</div><div className="text-green-600">正確答案: {item.correctAnswer}</div></div><div className="text-xs bg-red-50 p-2 rounded text-red-800 leading-relaxed font-medium">💡 解析：{item.explanation}</div></div>
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

      {appState === 'verb_learning_dashboard' && (
        <div className="max-w-4xl mx-auto pt-6 sm:pt-12 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setAppState('home')} className="p-3 bg-white border border-slate-200 text-slate-500 rounded-2xl hover:bg-slate-50 hover:text-slate-800 transition-colors">
              <ArrowRight className="w-6 h-6 rotate-180"/>
            </button>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">動詞變化特訓中心</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 text-center">
               <div className="text-4xl mb-2">📚</div>
               <div className="text-3xl font-black text-slate-700">{verbDB.filter(v => v.status === 'not_started').length}</div>
               <div className="text-sm font-bold text-slate-500">待學習</div>
             </div>
             <div className="bg-orange-50 rounded-3xl p-6 border border-orange-200 text-center">
               <div className="text-4xl mb-2">🔥</div>
               <div className="text-3xl font-black text-orange-600">{verbDB.filter(v => v.status === 'learning').length}</div>
               <div className="text-sm font-bold text-orange-600/70">練習中</div>
             </div>
             <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200 text-center">
               <div className="text-4xl mb-2">🏆</div>
               <div className="text-3xl font-black text-amber-600">{verbDB.filter(v => v.status === 'mastered').length}</div>
               <div className="text-sm font-bold text-amber-600/70">已掌握</div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
             <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Target className="w-6 h-6 text-indigo-500" />動詞變化弱點排行</h2>
             <div className="space-y-3">
               {getWeakestVerbForms(verbDB).map((item, idx) => {
                  const formLabel = DEFAULT_FORM_OPTIONS.find(o => o.id === item[0])?.label || item[0];
                  const acc = Math.round(item[1] * 100);
                  return (
                    <div key={item[0]} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${idx === 0 ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'}`}>{idx + 1}</div>
                       <div className="flex-1 font-bold text-slate-700">{formLabel}</div>
                       <div className="w-1/3">
                          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                             <div className={`h-2.5 rounded-full ${idx === 0 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${acc}%` }}></div>
                          </div>
                       </div>
                       <div className="w-12 text-right font-mono font-bold text-slate-500">{acc}%</div>
                    </div>
                  );
               })}
             </div>
          </div>

          <button onClick={startVerbLearningEngine} className="w-full py-5 rounded-2xl font-bold text-xl flex justify-center items-center gap-2 transition-all bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md active:scale-[0.98]">
             開始弱項打擊訓練 🎯
          </button>
        </div>
      )}

      {appState === 'verb_learning_quiz' && currentVerbQuiz && (
        <div className="max-w-2xl mx-auto pt-12 animate-in fade-in slide-in-from-bottom-4 text-center">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-2 bg-indigo-500"></div>
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setAppState('verb_learning_dashboard')} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl">結束訓練</button>
                    <div className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold border border-indigo-100">針對訓練: {DEFAULT_FORM_OPTIONS.find(o=>o.id===currentVerbQuiz.testedForm)?.label || currentVerbQuiz.testedForm}</div>
                </div>

                <div className="text-sm font-bold text-slate-400 mb-2">{DEFAULT_FORM_OPTIONS.find(o=>o.id===currentVerbQuiz.baseForm)?.label || currentVerbQuiz.baseForm}</div>
                <div className="text-4xl font-black text-slate-800 mb-8">{currentVerbQuiz.baseWord}</div>

                <div className="flex flex-col items-center gap-4">
                    <div className="text-slate-400"><ArrowRight className="w-8 h-8 rotate-90"/></div>
                    <div className="text-sm font-bold text-slate-500">{DEFAULT_FORM_OPTIONS.find(o=>o.id===currentVerbQuiz.targetForm)?.label || currentVerbQuiz.targetForm}</div>
                </div>

                <form onSubmit={e => { e.preventDefault(); processVerbLearningAnswer(); }} className="mt-8 relative">
                   <input type="text" value={verbQuizInput} onChange={e => setVerbQuizInput(e.target.value)} disabled={verbQuizFeedback !== null} placeholder="輸入日文變化..." autoFocus className={`w-full px-5 py-4 text-2xl text-center rounded-2xl border-2 outline-none ${verbQuizFeedback === 'correct' ? 'border-green-500 bg-green-50 text-green-800 font-bold' : verbQuizFeedback === 'wrong' ? 'border-red-500 bg-red-50 text-red-800 font-bold' : 'border-slate-200 focus:border-indigo-500'}`} />
                </form>

                {verbQuizFeedback === 'wrong' && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-left animate-in zoom-in">
                        <div className="font-bold text-red-600 mb-1">正確答案：</div>
                        <div className="text-3xl font-black text-slate-800">{currentVerbQuiz.correctAnswer}</div>
                    </div>
                )}

                {verbQuizFeedback !== null && (
                    <button onClick={nextVerbLearningQuestion} className={`w-full mt-6 py-4 rounded-xl font-bold text-lg ${verbQuizFeedback === 'correct' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-slate-800 text-white hover:bg-slate-700'}`} autoFocus>
                        {verbQuizFeedback === 'correct' ? '下一題 (正確) ➔' : '我知道了 ➔'}
                    </button>
                )}
            </div>
        </div>
      )}

      {/* ==== 進行中 (Playing UI) ==== */}
      {!isRoundComplete && (appState === 'vocab_playing' || appState === 'verb_playing') && (
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

            <div className="flex justify-between items-start mb-8 gap-2">
               <div className="flex flex-col gap-2">
                  <button onClick={goHome} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 transition-colors" title="中斷目前測驗，已答對的進度會保留">
                    <Save className="w-3.5 h-3.5" /> 中斷儲存並離開
                  </button>
                  {appState === 'verb_playing' && verbTestMode === 'rpg' ? (
                     <div className="flex items-center gap-3 bg-red-50 px-4 py-1.5 rounded-full border border-red-100"><Heart className={`w-5 h-5 text-red-500 ${hp > 0 ? 'fill-current animate-pulse' : ''}`} /><span className="font-black text-red-600">HP: {hp}</span><div className="ml-2 pl-3 border-l-2 border-red-200 flex gap-3 text-sm font-bold"><span className="text-slate-700">總答對: {score}</span><span className="text-amber-600">連擊: {combo}</span></div></div>
                  ) : (
                     <div className="bg-slate-100 px-4 py-1.5 rounded-full text-sm font-bold text-slate-600 w-fit">{appState === 'vocab_playing' && vocabTestMode === 'srs' ? `SRS 待處理: ${activeVocabQueue.length}` : `題目: ${questionCount} / ${TOTAL_QUESTIONS}`}</div>
                  )}
               </div>
               <div className="flex items-start gap-2 mt-1">
                 <button onClick={() => {
                     if (appState === 'vocab_playing' && currentVocab) setVocabDB(prev => prev.map(x => x.id === currentVocab.id ? { ...x, isImportant: !x.isImportant } : x));
                     if (appState === 'verb_playing' && currentVerb) setVerbDB(prev => prev.map(x => x.id === currentVerb.id ? { ...x, isImportant: !x.isImportant } : x));
                 }} className={`p-1.5 rounded-lg transition-colors border ${(appState === 'vocab_playing' ? currentVocab?.isImportant : currentVerb?.isImportant) ? 'bg-amber-50 text-amber-500 border-amber-200' : 'bg-slate-50 text-slate-300 hover:text-amber-500 border-slate-200'}`} title="標記為重要">
                    <Star className={`w-5 h-5 ${(appState === 'vocab_playing' ? currentVocab?.isImportant : currentVerb?.isImportant) ? 'fill-current' : ''}`}/>
                 </button>
                 {actualTimeLimit > 0 && (
                    <div className="flex items-center gap-2"><button onClick={() => setIsPaused(true)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg bg-slate-50 border border-slate-200"><Pause className="w-4 h-4" /></button><div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold ${timeLeft <= 3 && !feedback ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600'}`}><Timer className="w-4 h-4" /> {timeLeft}s</div></div>
                 )}
               </div>
            </div>

            {appState === 'vocab_playing' && currentVocab && (
               <>
                 {(vocabTestMode === 'sentence_srs' || vocabTestMode === 'sentence_infinite') ? (
                     <>
                       <div className="text-sm text-slate-500 mb-2">{currentQuestionDirection === 'j2c' ? '請翻譯以下例句（不顯示漢字以訓練聽力/閱讀）：' : '請將以下中文翻譯成日文（訓練輸出/寫作）：'}</div>
                       <div className="text-2xl sm:text-3xl font-black text-slate-800 tracking-wide mb-8 py-8 px-4 bg-slate-50 rounded-2xl border border-slate-200">
                          {currentQuestionDirection === 'j2c' ? parseExample(currentVocab.example || currentVocab.word || currentVocab.reading).readingOnly : (parseExample(currentVocab.example || currentVocab.word || currentVocab.reading).translation || currentVocab.meaning)}
                       </div>
                     </>
                 ) : (
                     <>
                       <>
                       {inputMode === 'kanji' ? (
                         <>
                           <div className="text-sm text-slate-500 mb-2">請打出這個單字的日文漢字：</div>
                           <div className="text-5xl font-black text-slate-800 tracking-wide mb-4 py-4">{currentVocab.reading}</div>
                           <div className="text-xl font-bold text-amber-600 mb-8">{currentVocab.meaning}</div>
                         </>
                       ) : (
                         <>
                           <div className="text-sm text-slate-500 mb-2">請問這個中文意思的平假名發音是？</div>
                           <div className="text-5xl font-black text-slate-800 tracking-wide mb-8 py-6">{currentVocab.meaning}</div>
                         </>
                       )}
                     </>
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
                        if (vocabTestMode === 'sentence_srs' || vocabTestMode === 'sentence_infinite') {
                            if (currentQuestionDirection === 'j2c') {
                                isPlainMatch = opt === (parseExample(currentVocab.example || currentVocab.word || currentVocab.reading).translation || currentVocab.meaning);
                            } else {
                                isPlainMatch = opt === (parseExample(currentVocab.example || currentVocab.word || currentVocab.reading).plainSentence || currentVocab.word || currentVocab.reading);
                            }
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
                               ? ((vocabTestMode === 'sentence_srs' || vocabTestMode === 'sentence_infinite') 
                                   ? (currentQuestionDirection === 'j2c' ? (parseExample(currentVocab.example || currentVocab.word || currentVocab.reading).translation || currentVocab.meaning) : (parseExample(currentVocab.example || currentVocab.word || currentVocab.reading).plainSentence || currentVocab.word || currentVocab.reading)) 
                                   : currentVocab.reading) 
                               : renderRuby(currentCorrectRuby)}
                       </span>
                   </div>
                   <div className="flex gap-2 bg-white/60 p-3 rounded-xl">
                       <span className="font-semibold text-red-700 whitespace-nowrap">重點提示：</span>
                       <span className="font-medium leading-relaxed">
                           {appState === 'vocab_playing' 
                               ? ((vocabTestMode === 'sentence_srs' || vocabTestMode === 'sentence_infinite')
                                   ? `核心單字：${currentVocab.word || currentVocab.reading} (${currentVocab.meaning})`
                                   : (currentVocab.word ? `日文漢字寫作「${currentVocab.word}」` : `此單字為純假名組合`))
                               : explanation}
                       </span>
                   </div>
                 </div>
               </div>
            )}

            {/* 動詞特訓正確時的額外解析 */}
            {feedback === 'correct' && appState === 'verb_playing' && explanation && (
               <div className="mt-6 p-5 bg-green-50 border border-green-200 rounded-2xl text-left animate-in slide-in-from-bottom-4">
                 <div className="flex items-center gap-2 text-green-700 font-bold mb-3"><Sparkles className="w-5 h-5" /> 變化原理解析：</div>
                 <div className="space-y-3 text-green-900">
                   <div className="flex gap-2 bg-white/60 p-3 rounded-xl">
                       <span className="font-semibold text-green-800 whitespace-nowrap">重點提示：</span>
                       <span className="font-medium leading-relaxed">
                           {explanation}
                       </span>
                   </div>
                 </div>
               </div>
            )}

         </div>
      )}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 p-3 bg-slate-700 text-white rounded-full shadow-lg hover:bg-slate-900 active:scale-95 transition-all"
          title="回到頂端"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* ===== 單字庫編輯 Modal ===== */}
      {editingVocabId && (() => {
        const title = vocabEditForm.word || vocabEditForm.reading || '編輯';
        return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setEditingVocabId(null)}>
            <div className="absolute inset-0"/>
            <div className="relative z-10 bg-white rounded-2xl w-full max-w-xl flex flex-col max-h-[85vh]" style={{boxShadow:'0 32px 80px -8px rgba(0,0,0,0.28), 0 8px 24px -4px rgba(0,0,0,0.14), 0 0 0 1.5px rgba(245,158,11,0.25)'}} onClick={e => e.stopPropagation()}>
              {/* 標題列 */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0">
                <span className="font-black text-amber-600 text-base">✏ 編輯：{title}</span>
                <button onClick={() => setEditingVocabId(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">✕</button>
              </div>
              {/* 可捲動內容區 */}
              <div className="flex flex-col gap-3 px-5 py-4 overflow-y-auto flex-1">
                <div className="flex flex-wrap gap-3">
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-xs font-bold text-amber-600 mb-1">平假名</label>
                    <input type="text" value={vocabEditForm.reading} onChange={e=>setVocabEditForm({...vocabEditForm, reading: e.target.value})} placeholder="平假名" className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-bold text-sm"/>
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-xs font-bold text-amber-600 mb-1">漢字/原形</label>
                    <input type="text" value={vocabEditForm.word} onChange={e=>setVocabEditForm({...vocabEditForm, word: e.target.value})} placeholder="漢字/原形（選填）" className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-bold text-sm"/>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">中文意思</label>
                  <input type="text" value={vocabEditForm.meaning} onChange={e=>setVocabEditForm({...vocabEditForm, meaning: e.target.value})} placeholder="中文意思" className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">例句（選填）</label>
                  <input type="text" value={vocabEditForm.example} onChange={e=>setVocabEditForm({...vocabEditForm, example: e.target.value})} placeholder="例句" className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm"/>
                </div>
                {vocabEditForm.example.trim() && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">🌐 例句中文翻譯（選填）</label>
                    <input type="text" value={vocabEditForm.exampleMeaning||''} onChange={e=>setVocabEditForm({...vocabEditForm, exampleMeaning: e.target.value})} placeholder="例句中文翻譯" className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm"/>
                  </div>
                )}
                <TagEditor tags={vocabEditForm.tags} onChange={tags => setVocabEditForm({...vocabEditForm, tags})} tagStats={globalTagStats} tagKeywordsMap={tagKeywordsMap} onTagKeywordsChange={setTagKeywordsMap} />
              </div>
              {/* 固定底部按鈕 */}
              <div className="flex justify-center gap-3 px-5 py-3 border-t border-slate-100 shrink-0">
                <button onClick={()=>{
                  setVocabDB(prev => prev.map(x => x.id === editingVocabId ? { ...x, ...vocabEditForm, isSentence: (vocabEditForm.example && vocabEditForm.example.trim().length > 0) || (vocabEditForm.reading && vocabEditForm.reading.includes('。')) } : x));
                  setEditingVocabId(null);
                }} className="px-8 py-2.5 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors flex items-center gap-2 shadow-sm">
                  <Save className="w-4 h-4"/> 儲存
                </button>
                <button onClick={() => setEditingVocabId(null)} className="px-8 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-300 transition-colors">取消</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== 動詞/形容詞編輯 Modal ===== */}
      {editingVerbId && (() => {
        const jishoForm = verbForms.find(f => f.id === 'jisho') || verbForms[0];
        const otherForms = verbForms.filter(f => f.id !== jishoForm?.id);
        const title = verbEditForm[jishoForm?.id] || verbEditForm.masu || verbEditForm.meaning || '編輯';
        return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setEditingVerbId(null)}>
            {/* 背景（無半透明效果） */}
            <div className="absolute inset-0"/>
            {/* 卡片 */}
            <div className="relative z-10 bg-white rounded-2xl w-full max-w-2xl flex flex-col max-h-[85vh]" style={{boxShadow:'0 32px 80px -8px rgba(0,0,0,0.28), 0 8px 24px -4px rgba(0,0,0,0.14), 0 0 0 1.5px rgba(99,102,241,0.18)'}} onClick={e => e.stopPropagation()}>
              {/* 標題列 */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0">
                <span className="font-black text-indigo-700 text-base">✏ 編輯：{title}</span>
                <button onClick={() => setEditingVerbId(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">✕</button>
              </div>
              {/* 可捲動內容區 */}
              <div className="flex flex-col gap-3 px-5 py-4 overflow-y-auto flex-1">
                {/* 辭書形 + 中文意思 */}
                <div className="flex flex-wrap gap-3">
                  {jishoForm && (
                    <div className="flex-1 min-w-[160px]">
                      <label className="block text-xs font-bold text-indigo-600 mb-1">{jishoForm.label}</label>
                      <input type="text" value={verbEditForm[jishoForm.id] || ''} onChange={e=>setVerbEditForm({...verbEditForm, [jishoForm.id]: e.target.value})} placeholder={jishoForm.label} className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 font-bold text-sm"/>
                    </div>
                  )}
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-xs font-bold text-slate-500 mb-1">中文意思</label>
                    <input type="text" value={verbEditForm.meaning || ''} onChange={e=>setVerbEditForm({...verbEditForm, meaning: e.target.value})} placeholder="中文意思" className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 text-sm"/>
                  </div>
                </div>
                {/* 標籤 */}
                <TagEditor tags={verbEditForm.tags} onChange={tags => setVerbEditForm({...verbEditForm, tags})} tagStats={globalTagStats} tagKeywordsMap={tagKeywordsMap} onTagKeywordsChange={setTagKeywordsMap} />
                {/* 活用型（直接顯示） */}
                {otherForms.length > 0 && (
                  <div className="flex flex-wrap gap-3 p-3 border border-indigo-100 rounded-xl bg-indigo-50/40">
                    {otherForms.map(f => (
                      <div key={f.id} className="flex-1 min-w-[140px]">
                        <label className="block text-xs font-bold text-indigo-600 mb-1">{f.label}</label>
                        <input type="text" value={verbEditForm[f.id] || ''} onChange={e=>setVerbEditForm({...verbEditForm, [f.id]: e.target.value})} placeholder={f.label} className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 font-bold text-sm"/>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* 固定底部按鈕 */}
              <div className="flex justify-center gap-3 px-5 py-3 border-t border-slate-100 shrink-0">
                <button onClick={()=>{ setVerbDB(prev => prev.map(x => x.id === editingVerbId ? { ...x, ...verbEditForm } : x)); setEditingVerbId(null); }}
                  className="px-8 py-2.5 bg-indigo-500 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-colors flex items-center gap-2 shadow-sm">
                  <Save className="w-4 h-4"/> 儲存
                </button>
                <button onClick={() => setEditingVerbId(null)} className="px-8 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-300 transition-colors">取消</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
