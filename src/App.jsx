import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { autoConjugate } from './conjugator';
import { BUILT_IN_DICTIONARY, getAvailableThemes, getWordsByTheme } from './dictionary';
import { 
  Settings, Play, CheckCircle2, XCircle, ArrowRight, BookOpen, 
  Timer, RotateCcw, AlertCircle, Trophy, Keyboard, ListTodo, 
  Pause, SlidersHorizontal, Layers, FolderHeart, ShieldAlert, Trash2, Award, Medal,
  Heart, Swords, Skull, Flame, Home, Puzzle, Plus, Edit3, 
  Map as MapIcon, Library, BookType, Sparkles, Coffee, Car, Shirt, SmilePlus,
  MessageSquareQuote, PenTool, RefreshCcw, Save, Pencil, Search
} from 'lucide-react';

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

const DEFAULT_FORM_OPTIONS = [
  { id: 'jisho', label: '普通形(辭書形/常體)' },
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

const DEFAULT_GRAMMARS = [
  { id: 'g_tai', name: '想要 ( ＿たい)', baseForm: 'masu', removeStr: 'ます', appendStr: 'たい', appliesTo: ['verb'], example: '私は日本へ行きたいです' },
  { id: 'g_nakereba', name: '必須 ( ＿なければなりません)', baseForm: 'nai', removeStr: 'い', appendStr: 'ければなりません', appliesTo: ['verb'], example: '明日早く起きなければなりません' }
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
    '服裝與配件': /衣|褲|鞋|帽|穿|脫|襪|裙|外套|西裝|領帶|手套|圍巾|背包|包|袋|眼鏡|手錶|戒指|項鍊|耳環|扣|拉鍊|布|絲|棉|毛|換|試|件|雙|條|洋裝|T恤|牛仔|短|長|大衣|羽絨|運動服|制服|和服|大|小|高|低|重|輕|美|麗|漂|亮|帥|醜/,
    '身體與健康': /病|痛|手|腳|頭|身|心|累|醫|目|耳|鼻|口|齒|牙|舌|眼|臉|肩|背|腰|胸|腹|膝|指|髮|皮|骨|血|藥|院|診|治|休|睡|死|生|活|熱|冷|咳|發燒|感冒|過敏|受傷|健康|體|力|氣|元氣|疲|精|神/,
    '想法與意見': /想|認|覺|意|思|空想|考|決|選|信|疑|望|願|夢|希|怕|擔|煩|喜|怒|哀|悲|愛|恨|感|情|氣|懂|知|明|白|記|忘|猜|判|評|論|答|問|解|惜|悔|驚|嚇|興|趣|好奇|滿|足/,
    '購物與金錢': /買|賣|錢|店|購|百|元|付|找|換|借|還|貴|便宜|免費|折|價|值|算|數|多|少|零|萬|千|收|存|花|稅|帳|卡|現金|信用|打折|特價|商|品|貨|訂|網購|市場|超商/,
    '居住與生活': /家|住|宿|房|洗|掃|門|窗|牆|屋|樓|廳|室|廚|浴|廁|床|桌|椅|燈|電|冷氣|暖|冰箱|微波|洗衣|垃圾|鑰匙|鄰|租|搬|修|裝|掛|放|收|整理|打掃|煮飯|日常|起床|刷牙|化妝|開|關|閉|安|靜|吵|鬧/,
    '學習與教育': /學|讀|書|寫|教|課|字|文|語|算|數|考|試|題|答|分|成績|合格|畢業|入|班|級|校|師|生|先|筆|紙|本|黑板|作業|練|複|預|背|查|典|翻|譯|文法|單字|漢字|假名|片假名|平假名|難|易|簡|單/,
    '工作與職場': /工|班|職|業|勤|休|假|會|議|辦|公|社|長|部|課|組|報|告|計|畫|案|客|戶|電話|郵|信|寄|收|打|印|複|掃|傳|真|上班|下班|加班|出差|薪|資|履歷|面試|同事|老闆|主管|員|做|作|急|忙/,
    '娛樂與休閒': /玩|遊|樂|歌|休|唱|跑|游|泳|爬|山|海|旅|行|拍|照|影|畫|看|聽|電影|電視|音|漫|動|網|遊戲|運動|球|棒|籃|足|網球|釣|散步|野餐|露營|節|祭|派對|舞|跳|演|練/,
    '自然與天氣': /天|雨|雪|風|雲|晴|陰|霧|雷|暴|溫|熱|冷|涼|暖|春|夏|秋|冬|花|草|木|林|森|山|川|河|海|湖|島|石|土|星|月|日|空|地|水|火|光|暗|色|紅|藍|綠|黃|白|黑|動物|貓|狗|鳥|蟲/,
    '時間與日期': /時|分|秒|點|年|月|日|週|曜|今|昨|明|後|前|早|晚|午|夜|朝|夕|間|期|始|終|久|短|長|快|慢|新|舊|古|先|次|每|常|常常|偶|總|已|還|才|剛|馬上|立刻|將|要|過去|未來|現在|等|待/,
    '問候與社交': /你|我|他|她|們|人|名|姓|歲|男|女|子|父|母|兄|弟|姐|妹|友|家人|親|戚|夫|妻|孩|老|少|先生|小姐|同|伴|見面|打招呼|介紹|謝|歉|拜託|請|好|再見|歡迎|祝|福|禮|邀|約|聚|說|講|談/
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

  // ==== 單字系統 State ====
  const [vocabDB, setVocabDB] = useState(() => {
    try {
      const saved = localStorage.getItem('verbApp_vocabDB');
      if (saved) {
         let parsed = JSON.parse(saved);
         if (!Array.isArray(parsed)) throw new Error('Invalid DB');
         parsed = parsed.filter(v => v !== null && v !== undefined).map(v => {
           if (!v.status) return { ...v, status: v.repetitions >= 5 ? 'mastered' : 'new' };
           return v;
         });
return parsed;
      }
      return INITIAL_VOCAB_DB.map(v => ({ ...v, status: 'new' }));
    } catch { return INITIAL_VOCAB_DB.map(v => ({ ...v, status: 'new' })); }
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
  
  const [referenceAmount, setReferenceAmount] = useState(5);
  const [referenceTheme, setReferenceTheme] = useState('random');
  const [referenceQueue, setReferenceQueue] = useState([]);
  
  useEffect(() => { localStorage.setItem('verbApp_vocabDB', JSON.stringify(vocabDB)); }, [vocabDB]);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayQueue = vocabDB.filter(v => !((v.example && v.example.trim().length > 0) || v.isSentence) && v.status !== 'new' && v.nextReview <= Date.now());
  const todaySentenceQueue = vocabDB.filter(v => ((v.example && v.example.trim().length > 0) || v.isSentence) && v.status !== 'new' && v.nextReview <= Date.now());
  const reviewedTodayQueue = vocabDB.filter(v => v.lastReviewed && v.lastReviewed >= todayStart.getTime());

  // ==== 動詞系統 State ====
  const [verbDB, setVerbDB] = useState(() => {
    try {
      const saved = localStorage.getItem('verbApp_verbDB');
      if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
      }
      return INITIAL_VERB_DB;
    } catch { return INITIAL_VERB_DB; }
  });
  useEffect(() => { localStorage.setItem('verbApp_verbDB', JSON.stringify(verbDB)); }, [verbDB]);

  const [verbForms, setVerbForms] = useState(() => {
    try {
      const saved = localStorage.getItem('verbApp_verbForms');
      if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
      }
      return DEFAULT_FORM_OPTIONS;
    } catch { return DEFAULT_FORM_OPTIONS; }
  });
  useEffect(() => { localStorage.setItem('verbApp_verbForms', JSON.stringify(verbForms)); }, [verbForms]);

  const [sourceForm, setSourceForm] = useState('masu'); 
  const [targetForms, setTargetForms] = useState(['te', 'ta', 'nai', 'jisho']); 
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
                if (g && g.name && g.name.includes('〜')) {
                    return { ...g, name: g.name.replace(/〜/g, ' ＿') };
                }
                return g;
            });
            return parsed;
        }
      }
      return DEFAULT_GRAMMARS;
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
    let sorted = [...vocabDB];
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
          aVal = getTs(a.id); bVal = getTs(b.id); break;
      }
      if (aVal < bVal) return vocabSortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return vocabSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [vocabDB, vocabSortConfig]);

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
          aVal = getTs(a.id); bVal = getTs(b.id); break;
      }
      if (aVal < bVal) return verbSortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return verbSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [verbDB, verbSortConfig]);

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
  const [showManualModal, setShowManualModal] = useState(false);

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
    
    
    if (inputMode === 'kanji') {
      queue = queue.filter(v => v.word && v.word.trim() !== '' && v.word !== v.reading);
      if (queue.length === 0) { alert('目前的單字範圍內沒有包含漢字的單字，無法進行漢字測驗！'); return; }
    }
    if (queue.length === 0) { alert('這個模式目前沒有題目喔！'); return; }
    queue = queue.sort(() => Math.random() * 0.5);
    
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

    setRoundHistory(prev => [...prev, {
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
      if (customGrammars.length === 0) { alert('您的自訂文法庫為空！請先新增。'); goHome(); return; }
      verbDB.forEach(word => {
        customGrammars.forEach(grammar => { if (grammar.appliesTo.includes(word.type) && word[grammar.baseForm]) { availablePool.push({ word, target: grammar.id, grammarDef: grammar }); } });
      });
    }
    else if (mode === 'custom') {
      if (customWordIds.length === 0) { alert('請先到設定勾選自訂單字！'); goHome(); return; }
      const customWords = verbDB.filter(w => customWordIds.includes(w.id));
      customWords.forEach(word => validTargets.forEach(target => { if (word[target]) availablePool.push({ word, target, grammarDef: null }); }));
    }
    else {
      let filteredWords = verbDB.filter(w => activeWordTypes.includes(w.type));
      if (filteredWords.length === 0) return;
      filteredWords.forEach(word => validTargets.forEach(target => { if (word[target]) availablePool.push({ word, target, grammarDef: null }); }));
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
       const baseName = verbForms.find(f => f.id === currentGrammarDef.baseForm)?.label || currentGrammarDef.baseForm;
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
    } else {
      setCombo(0);
      if (verbTestMode === 'rpg') setHp(prev => prev - 1);
      setMistakeBank(prev => ({ ...prev, [`${currentVerb.id}_${currentTarget}`]: { wordObj: currentVerb, target: currentTarget, grammarDef: currentGrammarDef } }));
    }

    setRoundHistory(prev => [...prev, { question: qTitle, userAnswer: finalAnswer, correctAnswer: currentCorrectPlain, userIsCorrect: isCorrect, explanation: exp }]);

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
    const defaultOpt = verbForms.find(f => f.id === id);
    if (defaultOpt) return defaultOpt.label;
    const customOpt = customGrammars.find(g => g.id === id);
    if (customOpt) return customOpt.name;
    return id;
  };

  const [batchInputs, setBatchInputs] = useState(Array.from({ length: 5 }, () => ({ word: '', reading: '', meaning: '', tag: '自訂', example: '', isSentence: false })));
  const [autoUnlock, setAutoUnlock] = useState(false);
  const obsidianFileRef = React.useRef(null);
  const [obsidianScannedWords, setObsidianScannedWords] = useState([]);
  const [isScanningObsidian, setIsScanningObsidian] = useState(false);
  const [importText, setImportText] = useState('');
  const [editingVocabId, setEditingVocabId] = useState(null);
  const [vocabEditForm, setVocabEditForm] = useState({ word: '', reading: '', meaning: '', example: '' });

  const [verbImportText, setVerbImportText] = useState(''); 
  const [addToReviewNow, setAddToReviewNow] = useState(true);
  const [showObsidianHelp, setShowObsidianHelp] = useState(false);

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

  const handleRematchVerbDbTheme = (id, meaning) => {
    if (!meaning) return;
    const newTag = guessThemeByMeaning(meaning, vocabDB);
    setVerbDB(prev => prev.map(v => v.id === id ? { ...v, tag: newTag } : v));
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
        example: v.example.trim(),
        isSentence: !!v.isSentence,
        ef: 2.5, interval: 0, repetitions: 0, nextReview: 0, status: addToReviewNow ? 'learning' : 'new'
    }));
    if (newVocabs.length > 0) {
        setVocabDB(prev => [...prev, ...newVocabs]);
        setBatchInputs(Array.from({ length: 5 }, () => ({ word: '', reading: '', meaning: '', tag: '自訂', example: '', isSentence: false })));
        alert(`成功加入 ${newVocabs.length} 個單字/例句到學習序列！`);
    } else alert('沒有找到可儲存的內容，請確認至少填寫「中文」與「平假名」或「例句」。');
  };

  


  const handleSmartImport = () => {
    createVocabBackup();
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
            newItems.push({ word: parts[0], reading: parts[1], meaning: parts[2], tag: currentTheme || '自訂', example: '', isSentence: false });
        } else if (parts.length >= 2) {
            newItems.push({ word: hasKanji(parts[0]) ? parts[0] : '', reading: hasKanji(parts[0]) ? '' : parts[0], meaning: parts[1], tag: currentTheme || '自訂', example: '', isSentence: false });
        } else if (parts.length === 1) {
            let word = ''; let reading = ''; let meaning = '';
            const bracketMatch = trimmed.match(/^([^\(（]+)[\(（]([^\)）]+)[\)）]$/);
            
            if (bracketMatch) {
                const outside = bracketMatch[1].trim(); const inside = bracketMatch[2].trim();
                
                if (hasKanji(outside) && !hasKanji(inside)) {
                    // 服(ふく) -> 漢字(假名)
                    word = outside; reading = inside;
                } else if (!hasKanji(outside) && hasKanji(inside)) {
                    // ふく(衣服) -> 假名(中文)
                    reading = outside; meaning = inside;
                } else if (hasKanji(outside) && hasKanji(inside)) {
                    // 勉強(讀書) -> 日文漢字(中文)
                    word = outside; meaning = inside;
                } else {
                    reading = outside; meaning = inside;
                }
            } else {
                if (!hasKanji(trimmed)) { reading = trimmed; word = ''; } 
                else { word = trimmed; reading = ''; }
            }
            newItems.push({ word, reading, meaning, tag: currentTheme || '自訂', example: '', isSentence: false });
        }
    });

    const validNewItems = newItems.filter(item => (item.word || item.reading || item.example) && item.meaning);
    if (validNewItems.length > 0) {
        validNewItems.forEach(item => {
            if (item.tag === '自訂') {
                item.tag = guessThemeByMeaning(item.meaning, vocabDB);
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
  const [newGrammar, setNewGrammar] = useState({ name: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '' });
  
  const handleEditGrammar = (g) => {
    setEditingGrammarId(g.id);
    setNewGrammar({
      name: g.name || '',
      baseForm: g.baseForm || 'te',
      removeStr: g.removeStr || '',
      appendStr: g.appendStr || '',
      appliesTo: g.appliesTo || ['verb'],
      example: g.example || ''
    });
  };

  const handleAddGrammar = () => {
    if (!newGrammar.name || !newGrammar.appendStr) { alert('請填寫文法名稱與加上字尾！'); return; }
    
    if (editingGrammarId) {
        setCustomGrammars(prev => prev.map(g => g.id === editingGrammarId ? { ...g, ...newGrammar } : g));
        setEditingGrammarId(null);
    } else {
        setCustomGrammars(prev => [...prev, { ...newGrammar, id: `g_custom_${Date.now()}` }]);
    }
    setNewGrammar({ name: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '' });
  };

  const getInitialVerbInputs = () => {
      const base = { type: 'verb', group: '1', difficulty: 'n5', masu: '', meaning: '' };
      verbForms.forEach(f => { base[f.id] = ''; });
      return base;
  };
  const [verbInputs, setVerbInputs] = useState(getInitialVerbInputs);

  const handleVerbInputChange = (key, value) => {
      setVerbInputs(prev => {
          const next = { ...prev, [key]: value };
          if ((key === 'masu' || key === 'group' || key === 'type') && next.type === 'verb' && next.masu) {
              const autoGen = autoConjugateVerb(next.masu, next.group);
              if (autoGen) {
                  return { ...next, ...autoGen };
              }
          }
          return next;
      });
  };

    const handleVerbSmartImport = () => {
    if (!verbImportText.trim()) return;
    const lines = verbImportText.split('\n');
    const newVerbs = [];
    let currentGroup = '1';
    let currentType = 'verb';

    const removeEmojis = (str) => str.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, (m) => ['💬', '💡'].includes(m) ? m : '');

    lines.forEach(line => {
        let trimmed = removeEmojis(line).trim();
        if(!trimmed) return;
        trimmed = trimmed.replace(/^[\-\*\•\+]\s+/, '');

        const headerMatch = trimmed.match(/^[【\[\(#](.+?)[】\]\)]?$/);
        if (headerMatch && !trimmed.includes('➜') && !trimmed.includes('->')) {
            const h = headerMatch[1].trim();
            if (h.includes('第一') || h.includes('1')) currentGroup = '1';
            else if (h.includes('第二') || h.includes('2')) currentGroup = '2';
            else if (h.includes('第三') || h.includes('3') || h.includes('不規則')) currentGroup = '3';
            else if (h.includes('い形') || h.includes('i')) { currentGroup = 'i'; currentType = 'adj_i'; }
            else if (h.includes('な形') || h.includes('na')) { currentGroup = 'na'; currentType = 'adj_na'; }
            return;
        }

        const exampleMatch = trimmed.match(/^(?:💬|例：|例:|💡)\s*(.*)$/);
        if (exampleMatch) {
            if (newVerbs.length > 0) newVerbs[newVerbs.length - 1].example = exampleMatch[1].trim();
            return;
        }

        if (newVerbs.length === 0 || (newVerbs[newVerbs.length - 1].meaning !== '' && !exampleMatch)) {
             const verbObj = getInitialVerbInputs();
             verbObj.type = currentType;
             verbObj.group = currentGroup;
             verbObj.jisho = trimmed;
             if (currentType === 'verb') {
                 const forms = autoConjugate(trimmed, currentGroup);
                 if (forms && Object.keys(forms).length > 0) Object.assign(verbObj, forms);
             }
             newVerbs.push(verbObj);
        } else {
             newVerbs[newVerbs.length - 1].meaning = trimmed;
        }
    });

    const validVerbs = newVerbs.filter(v => v.jisho && v.meaning);
    if (validVerbs.length > 0) {
        setVerbDB(prev => [...prev, ...validVerbs.map((v, i) => ({ ...v, tag: guessThemeByMeaning(v.meaning, vocabDB), id: v.type + '_custom_' + Date.now() + '_' + i }))]);
        setVerbImportText('');
        alert('成功匯入 ' + validVerbs.length + ' 個詞彙！');
    } else {
        alert('解析失敗，請確認格式是否為「辭書形」換行「中文意思」。');
    }
  };

  const handleAddVerb = () => {
    if (!verbInputs.masu || !verbInputs.meaning) return alert('請填寫至少 masu, meaning');
    const newTag = guessThemeByMeaning(verbInputs.meaning, vocabDB);
    setVerbDB(prev => [...prev, { ...verbInputs, tag: newTag, id: `${verbInputs.type}_custom_${Date.now()}` }]);
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

      {appState === 'home' && (
        <div className="max-w-6xl mx-auto pt-6 sm:pt-12 animate-in fade-in slide-in-from-bottom-4">

          {/* Hero Header */}
          <div className="text-center mb-10 relative">
            <div className="inline-flex p-5 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-3xl mb-4">
              <BookOpen className="w-14 h-14"/>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight mb-3">日文綜合特訓中心</h1>
            <p className="text-slate-400 text-base font-medium">每天一點點，透過科學方法建立直覺與長久記憶。</p>
            <button onClick={() => setShowManualModal(true)} className="absolute top-0 right-0 sm:right-4 p-3 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-100 transition-colors flex items-center gap-2 font-bold shadow-sm">
              <BookOpen className="w-5 h-5"/>
              <span className="hidden sm:inline">使用說明書</span>
            </button>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-amber-600 leading-none mb-1.5">{todayQueue.length}</div>
                  <div className="text-xs font-bold text-amber-700/70">單字待複習</div>
                </div>
                <div className="bg-fuchsia-50 border border-fuchsia-100 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-fuchsia-600 leading-none mb-1.5">{todaySentenceQueue.length}</div>
                  <div className="text-xs font-bold text-fuchsia-700/70">例句待複習</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-slate-700 leading-none mb-1.5">{vocabDB.length}</div>
                  <div className="text-xs font-bold text-slate-400">單字庫/例句 總共</div>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-red-500 leading-none mb-1.5">{Object.keys(vocabMistakes).length}</div>
                  <div className="text-xs font-bold text-red-400">累積錯題</div>
                </div>
              </div>

              {/* Primary Action */}
              {todayQueue.length > 0 ? (
                <button
                  onClick={() => startVocabSession('srs')}
                  className="w-full py-5 rounded-2xl font-bold text-lg flex justify-center items-center gap-2 transition-all bg-amber-500 text-white hover:bg-amber-600 shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                  🌅 開始今日複習 ({todayQueue.length} 題)
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
                  className="py-4 bg-blue-50 border border-blue-100 text-blue-700 rounded-2xl font-bold hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all text-sm flex flex-col items-center gap-1.5">
                  <span className="text-xl">🎮</span>主題單字闖關
                </button>
                <button onClick={() => startVocabSession('mistakes')}
                  disabled={Object.keys(vocabMistakes).length === 0}
                  className="py-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all text-sm flex flex-col items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
                  <span className="text-xl">🔥</span>單字錯題特訓
                </button>
              </div>

              {/* 例句特訓區 */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button onClick={() => startVocabSession('sentence_srs')}
                  disabled={todaySentenceQueue.length === 0}
                  className="py-4 bg-fuchsia-50 border border-fuchsia-100 text-fuchsia-700 rounded-2xl font-bold hover:bg-fuchsia-500 hover:text-white hover:border-fuchsia-500 transition-all text-sm flex flex-col items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
                  <span className="text-xl">🎯</span>例句專屬 SRS {todaySentenceQueue.length > 0 ? `(${todaySentenceQueue.length})` : '(完成)'}
                </button>
                <button onClick={() => startVocabSession('sentence_infinite')}
                  disabled={vocabDB.filter(v => (v.example && v.example.trim().length > 0) || v.isSentence).length === 0}
                  className="py-4 bg-purple-50 border border-purple-100 text-purple-700 rounded-2xl font-bold hover:bg-purple-500 hover:text-white hover:border-purple-500 transition-all text-sm flex flex-col items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
                  <span className="text-xl">♾️</span>例句無極限特訓
                </button>
              </div>

              {/* Management */}
              <button onClick={() => setAppState('vocab_manage')}
                 className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all text-sm flex justify-center items-center gap-2">
                 <BookType className="w-5 h-5"/>管理記憶庫
              </button>
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
                    <div className="font-bold text-slate-800">文法測驗</div>
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
                <Puzzle className="w-4 h-4"/>文法公式庫
              </button>
              <button onClick={() => setAppState('verb_manage')}
                className="w-full py-4 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-2xl font-bold hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all flex items-center justify-center gap-2">
                <Library className="w-4 h-4"/>動詞與形容詞庫
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
        <div className="max-w-5xl mx-auto mt-4 animate-in fade-in">
           <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
             <div className="flex justify-between items-center mb-6">
  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><BookType className="w-6 h-6 text-amber-500"/> 管理單字記憶庫</h2>
  <button onClick={() => {
    if(window.confirm('確定要將所有單字的複習進度重置為今天嗎？這將會讓所有單字出現在今日待複習清單中！')) {
      setVocabDB(vocabDB.map(v => ({ ...v, status: 'learning', interval: 0, repetitions: 0, nextReview: Date.now() })));
      alert('已強制解鎖並重置所有單字！請回首頁開始複習。');
      setAppState('home');
    }
  }} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2 text-sm shadow-sm">
    <RefreshCcw className="w-4 h-4"/> 從今天重新計算
  </button>
</div>
             
             
             <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 mb-8 shadow-lg">
                <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-white text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-400"/> Obsidian 智慧同步 (僅支援單字與例句)</h3></div>
                <div className="bg-slate-700/50 p-5 rounded-2xl border border-slate-600">
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
                </div>
             </div>

             <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 mb-8">
                <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-amber-800 text-lg">批次新增單字/例句</h3></div>
                <div className="mb-6 bg-white p-5 rounded-2xl border border-amber-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3 text-sm font-bold text-amber-700"><Sparkles className="w-5 h-5"/> 快速貼上區 (智能過濾 Emoji)</div>
                  <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder="支援加上主題標籤與例句！例如：&#10;【交通與地點】&#10;くるま（車）&#10;➜ 汽車&#10;💬 新しい車を買いました。（買了新車。）" className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-amber-500 text-sm h-32 resize-y placeholder:text-slate-400 leading-relaxed"/>
                  <button onClick={handleSmartImport} className="mt-3 w-full py-3 bg-amber-100 text-amber-800 rounded-xl font-bold hover:bg-amber-200 transition-colors flex items-center justify-center gap-2">解析文字並套用到下方表格</button>
                </div>

                <div className="flex justify-between items-center mb-4 mt-8 border-t border-amber-200 pt-6">
                  <h4 className="font-bold text-amber-800">確認與編輯區</h4>
                  <div className="flex gap-2">
                    <button onClick={() => { if(window.confirm('確定要清空確認與編輯區的所有內容嗎？')) setBatchInputs([{word:'', reading:'', meaning:'', tag: '自訂', example: '', isSentence: false}]) }} className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl font-bold hover:bg-red-100 flex items-center gap-1"><Trash2 className="w-4 h-4"/> 全部清空</button>
                    <button onClick={() => setBatchInputs([...batchInputs, {word:'', reading:'', meaning:'', tag: '自訂', example: '', isSentence: false}])} className="text-sm text-amber-700 bg-amber-100 px-4 py-2 rounded-xl font-bold hover:bg-amber-200 flex items-center gap-1"><Plus className="w-4 h-4"/> 新增一列</button>
                  </div>
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
                          <button onClick={() => setBatchInputs(batchInputs.filter((_, i) => i !== idx))} className="shrink-0 px-3 py-2 text-sm font-bold text-red-500 hover:text-white hover:bg-red-500 bg-red-50 rounded-xl transition-colors flex items-center gap-1"><Trash2 className="w-4 h-4"/> 刪除</button>
                        </div>
                        <div className="flex items-center gap-2 relative">
                          <MessageSquareQuote className="w-5 h-5 text-amber-400 absolute left-3" />
                          <input type="text" placeholder="附加例句 (選填，支援「漢字[假名]」注音格式。例如: 水[みず]を飲[の]みます。)" value={item.example} onChange={e => {const n=[...batchInputs]; n[idx].example=e.target.value; setBatchInputs(n);}} className="w-full pl-10 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-amber-500 focus:bg-white text-sm text-slate-600"/>
                        </div>
                        <div className="flex items-center gap-4 px-2 mt-1">
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-600 hover:text-fuchsia-600 transition-colors">
                            <input type="checkbox" checked={!!item.isSentence} onChange={e => {const n=[...batchInputs]; n[idx].isSentence=e.target.checked; setBatchInputs(n);}} className="w-4 h-4 accent-fuchsia-600"/>
                            <span>✅ 這是一句完整例句（啟用例句特訓與專屬標記）</span>
                          </label>
                        </div>
                      </div>
                   ))}
                </div>
                <div className="mb-4 mt-2">
                   <label className="flex items-center gap-3 cursor-pointer p-4 bg-amber-50 rounded-xl text-amber-800 font-bold border border-amber-200 hover:bg-amber-100 transition-colors">
                     <input type="checkbox" checked={addToReviewNow} onChange={(e)=>setAddToReviewNow(e.target.checked)} className="w-5 h-5 accent-amber-600"/>
                     <span>直接排入今日的「單字測驗」 (若取消勾選，則需透過首頁的「每日新詞解鎖」手動啟用)</span>
                   </label>
                </div>
                <button onClick={handleBatchSave} className="w-full py-4 bg-amber-600 text-white rounded-2xl font-bold text-lg hover:bg-amber-700 transition-colors shadow-sm">批次儲存到資料庫</button>
             </div>

             <datalist id="db-theme-suggestions">{Array.from(new Set(vocabDB.map(v => v.tag))).filter(Boolean).map(tag => <option key={tag} value={tag} />)}</datalist>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 text-slate-600"><tr>
                    <th className="p-4 rounded-tl-xl cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('tag')}>主題標籤{renderSortIcon('tag')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('type')}>類型{renderSortIcon('type')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('word')}>單字 (平假名){renderSortIcon('word')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('meaning')}>中文 / 例句{renderSortIcon('meaning')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('status')}>熟練度{renderSortIcon('status')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('dateAdded')}>加入日期{renderSortIcon('dateAdded')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('nextReview')}>下次複習{renderSortIcon('nextReview')}</th>
                    <th className="p-4 rounded-tr-xl">操作</th>
                 </tr></thead>
                 <tbody>
                    {sortedVocabDB.map(v => editingVocabId === v.id ? (
                       <tr key={'edit-'+v.id} className="border-b border-amber-200 bg-amber-50">
                          <td colSpan={7} className="p-4">
                             <div className="flex flex-col gap-2">
                               <div className="flex gap-2">
                                 <input type="text" value={vocabEditForm.reading} onChange={e=>setVocabEditForm({...vocabEditForm, reading: e.target.value})} placeholder="平假名" className="flex-1 p-2 border border-slate-300 rounded-lg outline-none focus:border-amber-500 font-bold text-sm"/>
                                 <input type="text" value={vocabEditForm.word} onChange={e=>setVocabEditForm({...vocabEditForm, word: e.target.value})} placeholder="漢字/原形" className="flex-1 p-2 border border-slate-300 rounded-lg outline-none focus:border-amber-500 font-bold text-sm"/>
                                 <input type="text" value={vocabEditForm.meaning} onChange={e=>setVocabEditForm({...vocabEditForm, meaning: e.target.value})} placeholder="中文意思" className="flex-1 p-2 border border-slate-300 rounded-lg outline-none focus:border-amber-500 font-bold text-sm"/>
                               </div>
                               <div className="flex gap-2">
                                 <input type="text" value={vocabEditForm.example} onChange={e=>setVocabEditForm({...vocabEditForm, example: e.target.value})} placeholder="例句" className="flex-1 p-2 border border-slate-300 rounded-lg outline-none focus:border-amber-500 text-sm"/>
                                 <button onClick={()=>{
                                     setVocabDB(prev => prev.map(x => x.id === v.id ? { ...x, ...vocabEditForm, isSentence: (vocabEditForm.example && vocabEditForm.example.trim().length > 0) || (vocabEditForm.reading && vocabEditForm.reading.includes('。')) } : x));
                                     setEditingVocabId(null);
                                 }} className="px-4 py-2 bg-amber-500 text-white rounded-lg font-bold text-sm hover:bg-amber-600 transition-colors flex items-center gap-1"><Save className="w-4 h-4"/> 儲存</button>
                                 <button onClick={()=>setEditingVocabId(null)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-300 transition-colors">取消</button>
                               </div>
                             </div>
                          </td>
                       </tr>
                     ) : (
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
                          <td className="p-4">
                            {v.isSentence ? <span className="inline-block px-2.5 py-1 bg-fuchsia-100 text-fuchsia-700 rounded-lg text-xs font-bold whitespace-nowrap" title="這是一句例句">📝 例句</span> : <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold whitespace-nowrap">單字</span>}
                          </td>
                          <td className="p-4"><div className="font-bold text-slate-800 text-base">{v.word || v.reading}</div>{v.word && <div className="text-slate-500 text-xs mt-0.5">{v.reading}</div>}</td>
                          <td className="p-4"><div className="font-bold text-slate-700">{v.meaning}</div>{v.example && <div className="text-slate-500 text-xs mt-1 bg-slate-100 p-1.5 rounded inline-block">{renderRuby(v.example)}</div>}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">{getVocabBadge(v).emoji}</span>
                              <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg font-mono text-xs border border-emerald-100">EF {v.ef.toFixed(1)}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-500 font-medium">{getAddedDate(v.id)}</td>
                          <td className="p-4 text-slate-500 font-medium">{v.interval === 0 ? '今天' : `${v.interval} 天後`}</td>
                          <td className="p-4"><button onClick={()=>{if(window.confirm('確定刪除？')){createVocabBackup(); setVocabDB(vocabDB.filter(x=>x.id!==v.id));}}} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button></td>
                       </tr>
                    ))}
                 </tbody>
               </table>
             </div>
           </div>
        </div>
      )}

      {appState === 'grammar_manage' && (
        <div className="max-w-6xl mx-auto mt-4 animate-in fade-in">
           <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-8"><Puzzle className="w-6 h-6 text-emerald-600"/> 文法公式庫</h2>
              <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8">
                 <div className="space-y-4">
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-slate-700 text-lg">已儲存的公式</h3>
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
                   {customGrammars.map(g => (
                      <div key={g.id} className="p-5 bg-white border border-slate-200 rounded-2xl flex justify-between items-center shadow-sm hover:border-emerald-300 transition-colors">
                         <div>
                           <div className="flex items-center gap-2 mb-1.5 flex-nowrap">
                               <div className="font-bold text-slate-800 text-lg whitespace-nowrap">{g.name}</div>
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
                           <div className="text-sm text-slate-500 flex items-center gap-2 mb-2 flex-wrap">
                              接在前面：{verbForms.find(f=>f.id===g.baseForm)?.label && <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium border border-slate-200">{verbForms.find(f=>f.id===g.baseForm)?.label}</span>}
                               <span className="ml-1 text-slate-600 font-bold flex items-center flex-wrap gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 shadow-sm">
                                  {(() => {
                                      const selectedVerb = verbDB.find(v => v.jisho === exampleVerbId) || verbDB[0];
                                      const baseWord = selectedVerb && selectedVerb[g.baseForm] ? stripRuby(selectedVerb[g.baseForm]) : '〇〇';
                                      let displayStr = baseWord;
                                      let resultStr = baseWord;
                                      if (g.removeStr) {
                                          if (baseWord.endsWith(g.removeStr)) {
                                              displayStr = baseWord.slice(0, -g.removeStr.length) + `~~${g.removeStr}~~`;
                                              resultStr = baseWord.slice(0, -g.removeStr.length);
                                          } else {
                                              displayStr = baseWord + `~~${g.removeStr}~~`;
                                          }
                                      }
                                      resultStr += (g.appendStr || '');
                                      return (
                                        <>
                                          <span className="text-slate-400 text-[13px] font-normal mr-0.5">例如</span>
                                          <span>{renderTextWithStrikethrough(displayStr)}</span>
                                          {g.appendStr && (
                                            <>
                                              <span className="text-emerald-500 font-black px-0.5">+</span>
                                              <span className="text-emerald-600 font-bold">{g.appendStr}</span>
                                            </>
                                          )}
                                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 mx-0.5" />
                                          <span className="text-indigo-600 font-bold">{resultStr}</span>
                                        </>
                                      );
                                  })()}
                               </span>
                           </div>
                           {g.example && (
                              <div className="text-[15px] bg-blue-50/80 border border-blue-100 text-blue-900 px-4 py-2.5 rounded-xl font-bold tracking-wide mt-2">
                                💬 例句：{renderTextWithStrikethrough(g.example)}
                              </div>
                           )}
                         </div>
                         <div className="flex items-center gap-2 shrink-0">
                           <button onClick={() => handleEditGrammar(g)} className="p-3 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="編輯公式"><Pencil className="w-5 h-5"/></button>
                           <button onClick={() => {if(window.confirm('確定刪除？')) setCustomGrammars(customGrammars.filter(x=>x.id!==g.id))}} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="刪除公式"><Trash2 className="w-5 h-5"/></button>
                         </div>
                      </div>
                   ))}
                 </div>
                 <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 h-fit">
                    <h3 className="font-bold text-emerald-800 mb-6 flex items-center gap-2 text-lg">
                        {editingGrammarId ? <Pencil className="w-6 h-6"/> : <Plus className="w-6 h-6"/>} 
                        {editingGrammarId ? '編輯文法公式' : '新增文法公式'}
                    </h3>
                    <div className="space-y-5">
                      <div><label className="block text-sm font-bold text-emerald-700 mb-1.5">文法名稱 (提示語)</label><input type="text" value={newGrammar.name} onChange={e => setNewGrammar(p => ({...p, name: e.target.value}))} placeholder="例：請不要... ( ＿ないでください)" className="w-full p-4 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500"/></div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div><label className="block text-sm font-bold text-emerald-700 mb-1.5">接續基礎形</label><select value={newGrammar.baseForm} onChange={e => setNewGrammar(p => ({...p, baseForm: e.target.value}))} className="w-full p-4 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500 bg-white">{verbForms.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}</select></div>
                        <div><label className="block text-sm font-bold text-emerald-700 mb-1.5">刪除字尾 (選填)</label><input type="text" value={newGrammar.removeStr || ''} onChange={e => setNewGrammar(p => ({...p, removeStr: e.target.value}))} placeholder="例：ます" className="w-full p-4 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500"/></div>
                        <div><label className="block text-sm font-bold text-emerald-700 mb-1.5">加上字尾</label><input type="text" value={newGrammar.appendStr || ''} onChange={e => setNewGrammar(p => ({...p, appendStr: e.target.value}))} placeholder="例：でください" className="w-full p-4 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500"/></div>
                      </div>
                      <div><label className="block text-sm font-bold text-emerald-700 mb-1.5">例句 (選填)</label><input type="text" value={newGrammar.example} onChange={e => setNewGrammar(p => ({...p, example: e.target.value}))} placeholder="例：ここでタバコを吸わないでください" className="w-full p-4 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500"/></div>
                      <div className="flex gap-4 mt-4">
                          <button onClick={handleAddGrammar} className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm text-lg">{editingGrammarId ? '儲存編輯' : '儲存新文法'}</button>
                          {editingGrammarId && <button onClick={() => { setEditingGrammarId(null); setNewGrammar({ name: '', baseForm: 'te', removeStr: '', appendStr: '', appliesTo: ['verb'], example: '' }); }} className="py-4 px-6 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors shadow-sm text-lg">取消</button>}
                      </div>
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
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Library className="w-6 h-6 text-indigo-600"/> 動詞與形容詞庫</h2>
              </div>
              <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 mb-8">
                                  <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-indigo-800 text-lg">批次與單筆新增動詞/形容詞</h3></div>
                 <div className="mb-6 bg-white p-5 rounded-2xl border border-indigo-200 shadow-sm">
                   <div className="flex items-center gap-2 mb-3 text-sm font-bold text-indigo-700"><Sparkles className="w-5 h-5"/> 快速貼上區 (智慧解析與自動變化)</div>
                   <textarea value={verbImportText} onChange={e => setVerbImportText(e.target.value)} placeholder="支援群組標籤與例句！例如：&#10;【第一類動詞】&#10;飲[の]む&#10;喝&#10;💬 水を飲む。&#10;&#10;【第二類動詞】&#10;食[た]べる&#10;吃" className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 text-sm h-32 resize-y placeholder:text-slate-400 leading-relaxed"/>
                   <button onClick={handleVerbSmartImport} className="mt-3 w-full py-3 bg-indigo-100 text-indigo-800 rounded-xl font-bold hover:bg-indigo-200 transition-colors flex items-center justify-center gap-2">解析文字並自動產生所有變化後存檔</button>
                 </div>
                 <div className="border-t border-indigo-200 pt-6 mt-6 mb-4">
                   <h4 className="font-bold text-indigo-800 mb-4">手動單筆新增</h4>
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                   <div><label className="block text-sm font-bold text-indigo-700 mb-1">類型</label><select value={verbInputs.type} onChange={e=>handleVerbInputChange('type', e.target.value)} className="w-full p-3 rounded-xl border border-indigo-200"><option value="verb">動詞 (verb)</option><option value="adj_i">い形容詞 (adj_i)</option><option value="adj_na">な形容詞 (adj_na)</option></select></div>
                   <div><label className="block text-sm font-bold text-indigo-700 mb-1">群組/分類</label><select value={verbInputs.group} onChange={e=>handleVerbInputChange('group', e.target.value)} className="w-full p-3 rounded-xl border border-indigo-200"><option value="1">第一類動詞 (1)</option><option value="2">第二類動詞 (2)</option><option value="3">第三類動詞 (3)</option><option value="i">い形容詞 (i)</option><option value="na">な形容詞 (na)</option></select></div>
                   <div><label className="block text-sm font-bold text-indigo-700 mb-1">難易度</label><select value={verbInputs.difficulty} onChange={e=>handleVerbInputChange('difficulty', e.target.value)} className="w-full p-3 rounded-xl border border-indigo-200"><option value="n5">N5</option><option value="n4">N4</option><option value="n3">N3</option><option value="n2">N2</option><option value="n1">N1</option></select></div>
                   <div><label className="block text-sm font-bold text-indigo-700 mb-1">中文意思</label><input type="text" value={verbInputs.meaning} onChange={e=>handleVerbInputChange('meaning', e.target.value)} placeholder="例：去" className="w-full p-3 rounded-xl border border-indigo-200"/></div>
                 </div>
                 <div className="mb-4">
                   <label className="block text-sm font-bold text-indigo-700 mb-1">例句 (選填，支援漢字[假名]自動標音)</label>
                   <input type="text" value={verbInputs.example || ''} onChange={e=>handleVerbInputChange('example', e.target.value)} placeholder="例：雨[あめ]が降[ふ]るので、行[い]きません。" className="w-full p-3 rounded-xl border border-indigo-200"/>
                 </div>
                 <div className="flex justify-between items-center mb-4 mt-6"><h4 className="font-bold text-indigo-800">各變化型設定</h4><button onClick={() => {if (!verbInputs.jisho) return alert('請先填寫普通形(辭書形/常體)！'); const forms = autoConjugate(verbInputs.jisho, verbInputs.group); if (Object.keys(forms).length > 0) { setVerbInputs(prev => ({ ...prev, ...forms })); } else { alert('無法自動產生，請確認格式是否正確！'); } }} className="text-sm text-indigo-700 bg-indigo-100 px-4 py-2 rounded-xl font-bold hover:bg-indigo-200 flex items-center gap-1 transition-colors"><Sparkles className="w-4 h-4"/> 自動產生變化型</button></div><div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                   <div><label className="block text-sm font-bold text-indigo-700 mb-1">ます形 (支援漢字[假名])</label><input type="text" value={verbInputs.masu || ''} onChange={e=>handleVerbInputChange('masu', e.target.value)} placeholder="例：行[い]きます" className="w-full p-3 rounded-xl border border-indigo-200"/></div>
                   {verbForms.map(f => (
                       <div key={f.id}><label className="block text-sm font-bold text-indigo-700 mb-1">{f.label}</label><input type="text" value={verbInputs[f.id] || ''} onChange={e=>handleVerbInputChange(f.id, e.target.value)} className="w-full p-3 rounded-xl border border-indigo-200"/></div>
                   ))}
                 </div>

                 <div className="mt-6 border-t border-indigo-100 pt-6 pb-6">
                    <h4 className="font-bold text-indigo-800 mb-4 flex items-center gap-2 text-sm"><Settings className="w-4 h-4"/> 自訂動詞變化欄位</h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                       <input type="text" id="newFormId" placeholder="代號 (例: ba)" className="p-3 rounded-xl border border-indigo-200 flex-1 outline-none focus:border-indigo-500" />
                       <input type="text" id="newFormLabel" placeholder="名稱 (例: 條件形)" className="p-3 rounded-xl border border-indigo-200 flex-1 outline-none focus:border-indigo-500" />
                       <button onClick={() => {
                           const id = document.getElementById('newFormId').value.trim();
                           const label = document.getElementById('newFormLabel').value.trim();
                           if (!id || !label) return alert('請填寫代號與名稱！');
                           if (verbForms.some(f => f.id === id)) return alert('代號已存在！');
                           setVerbForms(prev => [...prev, { id, label }]);
                           document.getElementById('newFormId').value = '';
                           document.getElementById('newFormLabel').value = '';
                       }} className="py-3 px-6 bg-indigo-100 text-indigo-700 font-bold rounded-xl hover:bg-indigo-200 transition-colors">新增欄位</button>
                    </div>
                 </div>
                 </div><button onClick={handleAddVerb} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-sm">新增至記憶庫</button>
              </div>

              <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 text-slate-600"><tr>
                    <th className="p-4 rounded-tl-xl cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleVerbSort('type')}>類型/群組{renderVerbSortIcon('type')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleVerbSort('tag')}>標籤/主題{renderVerbSortIcon('tag')}</th>
                    <th className="p-4">ます形</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleVerbSort('word')}>辭書/て形{renderVerbSortIcon('word')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleVerbSort('meaning')}>中文意思{renderVerbSortIcon('meaning')}</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleVerbSort('dateAdded')}>加入日期{renderVerbSortIcon('dateAdded')}</th>
                    <th className="p-4 rounded-tr-xl">操作</th>
                 </tr></thead>
                 <tbody>
                    {sortedVerbDB.map(v => (
                       <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="p-4"><span className={`inline-block px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded border-2 border-b-4 transition-transform active:border-b-2 active:translate-y-[2px] whitespace-nowrap cursor-default ${getVerbTypeStyle(v.type, v.group)}`}>{formatVerbType(v.type, v.group)}</span></td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
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
                                <span onClick={() => setEditingTagId(v.id)} className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg border whitespace-nowrap cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all ${getTagStyle(v.tag)}`}>
                                  {v.tag || '無'}
                                </span>
                              )}
                              <button onClick={() => handleRematchVerbDbTheme(v.id, v.meaning)} title="自動配對主題" className="p-1 text-slate-300 hover:text-indigo-500 transition-colors"><Sparkles className="w-4 h-4"/></button>
                            </div>
                          </td>
                          <td className="p-4 font-bold text-slate-800">{renderRuby(v.masu)}</td>
                          <td className="p-4 text-slate-600">{renderRuby(v.jisho)} / {renderRuby(v.te)}</td>
                          <td className="p-4 font-bold text-slate-700">{v.meaning}</td>
                          <td className="p-4 text-xs text-slate-400 whitespace-nowrap">{getAddedDate(v.id)}</td>
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
               {actualTimeLimit > 0 && (
                  <div className="flex items-center gap-2 mt-1"><button onClick={() => setIsPaused(true)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg bg-slate-50 border border-slate-200"><Pause className="w-4 h-4" /></button><div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold ${timeLeft <= 3 && !feedback ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600'}`}><Timer className="w-4 h-4" /> {timeLeft}s</div></div>
               )}
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
         </div>
      )}
    </div>
  );
}
