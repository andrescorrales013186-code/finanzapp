import { createContext, useContext, useEffect, useState } from 'react';

/* ─── 13 temas ────────────────────────────────────────────────────────────── */
export const THEMES = [
  // ── Oscuros ──────────────────────────────────────────────────────────────
  {
    id: 'dark-modern', name: 'Dark Modern', cat: 'Oscuros', isDark: true,
    sidebar: '#0f172a', sidebarD: '#04080f',
    a50:'#fff7ed',a100:'#ffedd5',a200:'#fed7aa',a400:'#fb923c',
    a500:'#f97316',a600:'#ea580c',a700:'#c2410c',a800:'#9a3412',a950:'#431407',
    swatches: ['#0f172a','#04080f','#f97316','#fb923c'],
  },
  {
    id: 'one-dark-pro', name: 'One Dark Pro', cat: 'Oscuros', isDark: true,
    sidebar: '#21252b', sidebarD: '#181b1f',
    a50:'#eff6ff',a100:'#dbeafe',a200:'#bfdbfe',a400:'#61afef',
    a500:'#3b82f6',a600:'#2563eb',a700:'#1d4ed8',a800:'#1e40af',a950:'#172554',
    swatches: ['#21252b','#282c34','#61afef','#e06c75'],
  },
  {
    id: 'dracula', name: 'Dracula', cat: 'Oscuros', isDark: true,
    sidebar: '#21222c', sidebarD: '#1a1b23',
    a50:'#faf5ff',a100:'#f3e8ff',a200:'#e9d5ff',a400:'#c084fc',
    a500:'#a855f7',a600:'#9333ea',a700:'#7e22ce',a800:'#6b21a8',a950:'#3b0764',
    swatches: ['#21222c','#282a36','#bd93f9','#50fa7b'],
  },
  {
    id: 'night-owl', name: 'Night Owl', cat: 'Oscuros', isDark: true,
    sidebar: '#0b253a', sidebarD: '#071c2d',
    a50:'#eff6ff',a100:'#dbeafe',a200:'#bfdbfe',a400:'#82aaff',
    a500:'#5b8def',a600:'#3b6fd8',a700:'#2550b8',a800:'#1a3d94',a950:'#0d1f5c',
    swatches: ['#0b253a','#011627','#82aaff','#7fdbca'],
  },
  {
    id: 'tokyo-night', name: 'Tokyo Night', cat: 'Oscuros', isDark: true,
    sidebar: '#16161e', sidebarD: '#0d0d13',
    a50:'#eef2ff',a100:'#e0e7ff',a200:'#c7d2fe',a400:'#7aa2f7',
    a500:'#6366f1',a600:'#4f46e5',a700:'#4338ca',a800:'#3730a3',a950:'#1e1b4b',
    swatches: ['#16161e','#1a1b26','#7aa2f7','#9ece6a'],
  },
  {
    id: 'monokai', name: 'Monokai', cat: 'Oscuros', isDark: true,
    sidebar: '#1e1f1c', sidebarD: '#161715',
    a50:'#f0fdf4',a100:'#dcfce7',a200:'#bbf7d0',a400:'#a6e22e',
    a500:'#22c55e',a600:'#16a34a',a700:'#15803d',a800:'#166534',a950:'#052e16',
    swatches: ['#1e1f1c','#272822','#a6e22e','#e6db74'],
  },
  {
    id: 'solarized-dark', name: 'Solarized Dark', cat: 'Oscuros', isDark: true,
    sidebar: '#073642', sidebarD: '#042830',
    a50:'#eff6ff',a100:'#dbeafe',a200:'#bfdbfe',a400:'#60a5fa',
    a500:'#268bd2',a600:'#1a6bad',a700:'#1450a3',a800:'#0e3a82',a950:'#071a4a',
    swatches: ['#073642','#002b36','#268bd2','#2aa198'],
  },
  {
    id: 'gruvbox-dark', name: 'Gruvbox Dark', cat: 'Oscuros', isDark: true,
    sidebar: '#1d2021', sidebarD: '#151718',
    a50:'#fefce8',a100:'#fef9c3',a200:'#fef08a',a400:'#facc15',
    a500:'#d79921',a600:'#b07818',a700:'#8a5c0f',a800:'#6e460a',a950:'#3a2203',
    swatches: ['#1d2021','#282828','#d79921','#8ec07c'],
  },
  // ── Claros ───────────────────────────────────────────────────────────────
  {
    id: 'light-modern', name: 'Light Modern', cat: 'Claros', isDark: false,
    sidebar: '#1e3a5f', sidebarD: '#152e4d',
    a50:'#eff6ff',a100:'#dbeafe',a200:'#bfdbfe',a400:'#0078d4',
    a500:'#0066b4',a600:'#005599',a700:'#004480',a800:'#003366',a950:'#001133',
    swatches: ['#1e3a5f','#f0f4f8','#0078d4','#005fb8'],
  },
  {
    id: 'github-light', name: 'GitHub Light', cat: 'Claros', isDark: false,
    sidebar: '#24292f', sidebarD: '#1b1f24',
    a50:'#eff6ff',a100:'#dbeafe',a200:'#bfdbfe',a400:'#0969da',
    a500:'#0550ae',a600:'#033d8b',a700:'#022b6e',a800:'#011a55',a950:'#000d2e',
    swatches: ['#24292f','#f6f8fa','#0969da','#fd8c73'],
  },
  {
    id: 'solarized-light', name: 'Solarized Light', cat: 'Claros', isDark: false,
    sidebar: '#073642', sidebarD: '#042830',
    a50:'#eff6ff',a100:'#dbeafe',a200:'#bfdbfe',a400:'#60a5fa',
    a500:'#268bd2',a600:'#1a6bad',a700:'#1450a3',a800:'#0e3a82',a950:'#071a4a',
    swatches: ['#073642','#fdf6e3','#268bd2','#cb4b16'],
  },
  // ── Alto Contraste ────────────────────────────────────────────────────────
  {
    id: 'hc-dark', name: 'HC Oscuro', cat: 'Alto Contraste', isDark: true,
    sidebar: '#000000', sidebarD: '#000000',
    a50:'#ecfeff',a100:'#cffafe',a200:'#a5f3fc',a400:'#1aebff',
    a500:'#06b6d4',a600:'#0891b2',a700:'#0e7490',a800:'#155e75',a950:'#083344',
    swatches: ['#000000','#111111','#1aebff','#ffff00'],
  },
  {
    id: 'hc-light', name: 'HC Claro', cat: 'Alto Contraste', isDark: false,
    sidebar: '#000000', sidebarD: '#000000',
    a50:'#e8e8ff',a100:'#d0d0ff',a200:'#b8b8ff',a400:'#5555ff',
    a500:'#0000ee',a600:'#0000cc',a700:'#0000aa',a800:'#000088',a950:'#000044',
    swatches: ['#000000','#ffffff','#0000ee','#000000'],
  },
];

const CATS = ['Oscuros', 'Claros', 'Alto Contraste'];
const KEY  = 'finanzapp_theme';

const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(
    () => localStorage.getItem(KEY) || 'dark-modern'
  );

  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];

  useEffect(() => {
    const r = document.documentElement;
    r.dataset.theme = theme.id;
    r.classList.toggle('dark', theme.isDark);

    // CSS accent vars
    const vars = {
      '--accent-50': theme.a50, '--accent-100': theme.a100,
      '--accent-200': theme.a200, '--accent-400': theme.a400,
      '--accent-500': theme.a500, '--accent-600': theme.a600,
      '--accent-700': theme.a700, '--accent-800': theme.a800,
      '--accent-950': theme.a950,
      '--sidebar-bg':  theme.sidebar,
      '--sidebar-bgd': theme.sidebarD,
    };
    Object.entries(vars).forEach(([k, v]) => r.style.setProperty(k, v));
  }, [theme]);

  const applyTheme = (id) => {
    setThemeId(id);
    localStorage.setItem(KEY, id);
  };

  return (
    <ThemeCtx.Provider value={{ theme, themes: THEMES, cats: CATS, applyTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
