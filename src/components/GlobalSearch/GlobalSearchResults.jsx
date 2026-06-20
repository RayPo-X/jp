import React from 'react';
import { BookOpen, Layers, Puzzle, BookType } from 'lucide-react';

const GlobalSearchResults = ({ results, onResultClick, renderTags }) => {
    if (!results) return null;

    if (results.vocab.length === 0 && results.verb.length === 0 && results.grammar.length === 0 && results.kanji.length === 0) {
        return <div className="p-8 text-center font-bold text-slate-400">找不到任何符合的資料</div>;
    }

    return (
        <div className="overflow-y-auto p-4 space-y-6">
           {results.vocab.length > 0 && (
              <div>
                 <h3 className="font-bold text-slate-500 mb-2 px-2 flex items-center gap-2"><BookOpen className="w-4 h-4"/> 單字庫 ({results.vocab.length})</h3>
                 <div className="space-y-1">
                    {results.vocab.slice(0, 10).map((res, i) => (
                       <button key={'s_v_'+i} onClick={() => onResultClick('vocab', res.item.word || res.item.reading, res.item.id)} className="w-full text-left p-3 hover:bg-blue-50 rounded-xl flex items-center justify-between group transition-colors">
                          <div className="flex items-center gap-3">
                             <div className="font-bold text-slate-800 text-lg group-hover:text-blue-700">{res.item.word || res.item.reading}</div>
                             {res.item.word && <div className="text-sm text-slate-500">{res.item.reading}</div>}
                             {renderTags(res.item.tags)}
                          </div>
                          <div className="text-sm text-slate-500 line-clamp-1 text-right max-w-[40%] font-medium">{res.item.meaning}</div>
                       </button>
                    ))}
                    {results.vocab.length > 10 && <div className="text-center text-xs font-bold text-slate-400 p-2">還有 {results.vocab.length - 10} 筆符合</div>}
                 </div>
              </div>
           )}
           {results.verb.length > 0 && (
              <div>
                 <h3 className="font-bold text-slate-500 mb-2 px-2 flex items-center gap-2"><Layers className="w-4 h-4"/> 動詞庫 ({results.verb.length})</h3>
                 <div className="space-y-1">
                    {results.verb.slice(0, 10).map((res, i) => (
                       <button key={'s_vb_'+i} onClick={() => onResultClick('verb', res.item.jisho, res.item.id)} className="w-full text-left p-3 hover:bg-indigo-50 rounded-xl flex items-center justify-between group transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="font-bold text-slate-800 text-lg group-hover:text-indigo-700">{res.item.jisho}</div>
                            {renderTags(res.item.tags)}
                          </div>
                          <div className="text-sm text-slate-500 line-clamp-1 text-right max-w-[50%] font-medium">{res.item.meaning}</div>
                       </button>
                    ))}
                 </div>
              </div>
           )}
           {results.grammar.length > 0 && (
              <div>
                 <h3 className="font-bold text-slate-500 mb-2 px-2 flex items-center gap-2"><Puzzle className="w-4 h-4"/> 文法公式 ({results.grammar.length})</h3>
                 <div className="space-y-1">
                    {results.grammar.slice(0, 10).map((res, i) => (
                       <button key={'s_g_'+i} onClick={() => onResultClick('grammar', res.item.name, res.item.id)} className="w-full text-left p-3 hover:bg-emerald-50 rounded-xl flex items-center justify-between group transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="font-bold text-slate-800 text-lg group-hover:text-emerald-700">{res.item.name}</div>
                            {renderTags(res.item.tags)}
                          </div>
                          <div className="text-sm text-slate-500 font-medium">{res.item.suffix}</div>
                       </button>
                    ))}
                 </div>
              </div>
           )}
           {results.kanji.length > 0 && (
              <div>
                 <h3 className="font-bold text-slate-500 mb-2 px-2 flex items-center gap-2"><BookType className="w-4 h-4"/> 漢字庫 ({results.kanji.length})</h3>
                 <div className="grid grid-cols-2 gap-2">
                    {results.kanji.slice(0, 10).map((res, i) => (
                       <button key={'s_k_'+i} onClick={() => onResultClick('kanji', res.item.kanji, res.item.id)} className="text-left p-3 hover:bg-rose-50 rounded-xl flex items-center justify-between group transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl font-black text-slate-800 group-hover:text-rose-700 leading-none">{res.item.kanji}</div>
                            {renderTags(res.item.tags)}
                          </div>
                          <div className="text-sm font-bold text-slate-500">{res.item.meaning}</div>
                       </button>
                    ))}
                 </div>
              </div>
           )}
        </div>
    );
};

export default GlobalSearchResults;
