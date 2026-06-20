import React from 'react';
import { Search, XCircle, History } from 'lucide-react';
import GlobalSearchResults from './GlobalSearchResults';

const GlobalSearch = ({
  globalSearchTerm,
  setGlobalSearchTerm,
  showGlobalSearch,
  setShowGlobalSearch,
  recentSearches,
  setRecentSearches,
  globalSearchResults,
  handleGlobalSearchClick,
  renderTags
}) => {
  return (
      <div className="relative z-50">
         <div className="relative bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden group hover:border-blue-400 transition-colors focus-within:border-blue-500 focus-within:shadow-md focus-within:ring-4 focus-within:ring-blue-500/10">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              value={globalSearchTerm} 
              onChange={e => { setGlobalSearchTerm(e.target.value); setShowGlobalSearch(true); }}
              onFocus={() => setShowGlobalSearch(true)}
              placeholder="🔍 搜尋單字、動詞、文法、漢字、標籤..." 
              className="w-full pl-14 pr-12 py-4 text-lg bg-transparent focus:outline-none placeholder:text-slate-400 font-bold"
            />
            {globalSearchTerm && (
              <button onClick={() => {setGlobalSearchTerm(''); setShowGlobalSearch(false);}} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><XCircle className="w-5 h-5"/></button>
            )}
         </div>

         {showGlobalSearch && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowGlobalSearch(false)}></div>
              <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-[70vh] flex flex-col">
                 {!globalSearchTerm.trim() ? (
                    <div className="p-4">
                       <div className="flex justify-between items-center px-2 mb-3">
                         <div className="text-sm font-bold text-slate-400 flex items-center gap-2"><History className="w-4 h-4"/> 最近搜尋</div>
                         {recentSearches.length > 0 && <button onClick={() => setRecentSearches([])} className="text-xs text-slate-400 hover:text-red-500 font-medium border border-transparent hover:border-red-200 px-2 py-1 rounded">清空</button>}
                       </div>
                       {recentSearches.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 text-sm">目前沒有搜尋紀錄</div>
                       ) : (
                          <div className="flex flex-wrap gap-2 px-2">
                             {recentSearches.map((term, i) => (
                                <button key={'hs'+i} onClick={() => { setGlobalSearchTerm(term); setShowGlobalSearch(true); }} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm font-bold text-slate-700 border border-slate-200 transition-colors shadow-sm">{term}</button>
                             ))}
                          </div>
                       )}
                    </div>
                 ) : (
                    <GlobalSearchResults 
                        results={globalSearchResults} 
                        onResultClick={handleGlobalSearchClick} 
                        renderTags={renderTags} 
                    />
                 )}
              </div>
            </>
         )}
      </div>
  );
};

export default GlobalSearch;
