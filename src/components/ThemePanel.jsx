import React, { useState, useEffect, useRef } from 'react';

const SWATCHES = [
  { c: '#f8fafc', name: '預設' }, { c: '#ebe3d4', name: '暖米' },
  { c: '#e6ebe0', name: '淺綠' }, { c: '#e6e9f0', name: '淺藍' },
  { c: '#f0e8e6', name: '暖粉' }, { c: '#eae6ef', name: '淡紫' },
  { c: '#ffffff', name: '純白' },
];

export default function ThemePanel() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => { try { return localStorage.getItem('jp_dark') === '1'; } catch { return false; } });
  const [bg, setBg] = useState(() => { try { return localStorage.getItem('jp_bg') || '#f8fafc'; } catch { return '#f8fafc'; } });
  const ref = useRef(null);

  useEffect(() => { document.documentElement.classList.toggle('dark', dark); try { localStorage.setItem('jp_dark', dark ? '1' : '0'); } catch {} }, [dark]);
  useEffect(() => { document.documentElement.style.setProperty('--page-bg', bg); try { localStorage.setItem('jp_bg', bg); } catch {} }, [bg]);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm">
        🎨 <span className="hidden sm:inline">配色</span>
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-[200] w-52 p-4 rounded-2xl bg-white dark:bg-slate-100 border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
          <div className="text-xs font-extrabold text-slate-400 tracking-wider mb-2">外觀</div>
          <button onClick={() => setDark(d => !d)} className="w-full flex items-center justify-center gap-2 py-2.5 mb-4 rounded-xl bg-slate-100 dark:bg-slate-200 border border-slate-200 text-slate-700 font-extrabold text-sm hover:opacity-80 transition-opacity">
            {dark ? '☀️ 淺色' : '🌙 深色'}
          </button>
          <div className="text-xs font-extrabold text-slate-400 tracking-wider mb-2.5">頁面底色 {dark && <span className="font-normal">(淺色模式生效)</span>}</div>
          <div className="grid grid-cols-3 gap-2.5">
            {SWATCHES.map(s => (
              <button key={s.c} onClick={() => setBg(s.c)} title={s.name} className={`h-10 rounded-xl border-2 transition-all ${bg === s.c ? 'border-blue-500 scale-105' : 'border-slate-200'}`} style={{ backgroundColor: s.c }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
