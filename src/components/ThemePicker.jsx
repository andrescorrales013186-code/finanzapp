import { useState, useRef, useEffect } from 'react';
import { Palette, Check, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemePicker() {
  const { theme, themes, cats, applyTheme } = useTheme();
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const panelRef = useRef(null);
  const inputRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Foco en búsqueda al abrir
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setQuery('');
  }, [open]);

  // Esc para cerrar
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  const filtered = query.trim()
    ? themes.filter(t => t.name.toLowerCase().includes(query.toLowerCase()))
    : themes;

  return (
    <div ref={panelRef} className="relative">

      {/* Botón disparador */}
      <button
        onClick={() => setOpen(p => !p)}
        title="Color Theme"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors text-xs font-medium"
      >
        <Palette size={15} />
        <span className="hidden sm:inline max-w-[90px] truncate">{theme.name}</span>
      </button>

      {/* Panel estilo VS Code */}
      {open && (
        <div
          className="absolute bottom-full mb-2 right-0 z-50 w-72 rounded-xl overflow-hidden shadow-2xl border border-white/10"
          style={{ background: '#1e1e1e', color: '#ccc' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-3 py-2 border-b"
            style={{ background: '#111', borderColor: '#333', fontSize: 11, letterSpacing: '.06em', color: '#888' }}
          >
            <span>COLOR THEME</span>
            <button onClick={() => setOpen(false)} style={{ color: '#888', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>
              <X size={14} />
            </button>
          </div>

          {/* Búsqueda */}
          <div style={{ padding: '7px 10px', borderBottom: '1px solid #333' }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar tema..."
              style={{
                width: '100%', background: '#3c3c3c', border: '1px solid #555',
                borderRadius: 4, padding: '4px 8px', color: '#ccc',
                fontSize: 12, fontFamily: 'inherit', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = '#0078d4'}
              onBlur={e => e.target.style.borderColor = '#555'}
            />
          </div>

          {/* Lista */}
          <div style={{ maxHeight: 320, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#555 transparent' }}>
            {cats.map(cat => {
              const items = filtered.filter(t => t.cat === cat);
              if (!items.length) return null;
              return (
                <div key={cat}>
                  <div style={{ padding: '5px 12px 3px', fontSize: 10, letterSpacing: '.07em', color: '#666', textTransform: 'uppercase' }}>
                    {cat}
                  </div>
                  {items.map(t => {
                    const active = t.id === theme.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => { applyTheme(t.id); setOpen(false); }}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center',
                          gap: 10, padding: '7px 14px', cursor: 'pointer', border: 'none',
                          background: active ? '#04395e' : 'transparent',
                          color: active ? '#fff' : '#ccc',
                          textAlign: 'left', fontSize: 13,
                          transition: 'background .1s',
                        }}
                        onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#2a2d2e'; }}
                        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {/* Check */}
                        <Check size={13} style={{ opacity: active ? 1 : 0, color: '#75bfff', flexShrink: 0 }} />
                        {/* Nombre */}
                        <span style={{ flex: 1 }}>{t.name}</span>
                        {/* Swatches */}
                        <div style={{ display: 'flex', gap: 3 }}>
                          {t.swatches.map((c, i) => (
                            <div key={i} style={{
                              width: 12, height: 12, borderRadius: 2, background: c,
                              border: '0.5px solid rgba(255,255,255,.15)',
                            }} />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div style={{ padding: '16px', textAlign: 'center', color: '#555', fontSize: 12 }}>
                Sin resultados para "{query}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
