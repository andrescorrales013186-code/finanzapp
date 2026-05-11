import { useState } from 'react';
import {
  LayoutDashboard, CreditCard, TrendingUp, ShoppingCart,
  Calculator, Menu, X, Table2, Bell, ChevronRight, ListChecks,
  Users, UserCircle, ChevronDown,
} from 'lucide-react';
import ThemePicker from './ThemePicker';
import { useTheme } from '../context/ThemeContext';
import { useProfile } from '../context/ProfileContext';

const navItems = [
  { id: 'dashboard',       label: 'Dashboard',                icon: LayoutDashboard },
  { id: 'tabla',           label: 'Tabla Resumen',            icon: Table2 },
  { id: 'deudas',          label: 'Obligaciones financieras', icon: CreditCard },
  { id: 'checklist',       label: 'Checklist de Pagos',       icon: ListChecks },
  { id: 'ingresos',        label: 'Ingresos',                 icon: TrendingUp },
  { id: 'gastos',          label: 'Gastos',                   icon: ShoppingCart },
  { id: 'recordatorios',   label: 'Recordatorios',            icon: Bell },
  { id: 'calculadora',     label: 'Calculadora',              icon: Calculator },
  { id: 'resumen-general', label: 'Resumen general',          icon: Users },
];

const bottomTabs = [
  { id: 'dashboard', label: 'Inicio',  icon: LayoutDashboard },
  { id: 'deudas',    label: 'Deudas',  icon: CreditCard },
  { id: 'checklist', label: 'Pagos',   icon: ListChecks },
  { id: 'gastos',    label: 'Gastos',  icon: ShoppingCart },
];

const AVATARS = ['🟠','🔵','🟢','🟣','🔴','🟡'];

export default function Layout({ children, activePage, onNavigate, badgeRecordatorios, onSwitchProfile }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const { theme } = useTheme();
  const { activeProfile, profiles } = useProfile();

  const avatarIdx = profiles.findIndex(p => p.id === activeProfile?.id);
  const avatar    = AVATARS[avatarIdx >= 0 ? avatarIdx % AVATARS.length : 0];

  const goTo = (id) => { onNavigate(id); setMoreOpen(false); };

  const NavLink = ({ id, label, icon: Icon }) => {
    const active = activePage === id;
    const isRG   = id === 'resumen-general';
    return (
      <button
        onClick={() => goTo(id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative ${
          active
            ? 'bg-orange-500/15 text-orange-400 shadow-sm'
            : isRG
              ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-dashed border-white/10 mt-1'
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
        }`}
      >
        <Icon size={17} className={active ? 'text-orange-400' : isRG ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-500 group-hover:text-slate-300'} />
        <span className="flex-1 text-left">{label}</span>
        {id === 'recordatorios' && badgeRecordatorios > 0 && (
          <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{badgeRecordatorios}</span>
        )}
        {active && <ChevronRight size={14} className="text-orange-400" />}
      </button>
    );
  };

  const ProfileBtn = ({ mobile = false }) => (
    <button
      onClick={onSwitchProfile}
      className={`flex items-center gap-2 rounded-xl transition-colors ${mobile ? 'p-2 hover:bg-slate-100 dark:hover:bg-[#162032]' : 'px-2 py-1.5 hover:bg-white/10 w-full'}`}
      title="Cambiar perfil"
    >
      <span className="text-base leading-none">{avatar}</span>
      {!mobile && (
        <>
          <span className="flex-1 text-left text-xs text-slate-300 font-medium truncate max-w-[90px]">{activeProfile?.name}</span>
          <ChevronDown size={12} className="text-slate-500" />
        </>
      )}
    </button>
  );

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-white">FinanzApp</h1>
            <p className="text-xs text-slate-500 truncate">Control financiero</p>
          </div>
        </div>
        {/* Perfil activo */}
        <div className="mt-3 bg-white/5 rounded-xl px-2 py-1">
          <ProfileBtn />
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider px-3 mb-2 mt-1">Menú</p>
        {navItems.map(item => <NavLink key={item.id} {...item} />)}
      </nav>
      <div className="p-3 border-t border-white/5 flex items-center justify-between gap-2">
        <p className="text-xs text-slate-600">Datos guardados localmente</p>
        <ThemePicker />
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-[#080d16]">

      {/* Sidebar desktop */}
      <aside
        className="hidden lg:flex flex-col w-60 sticky top-0 h-screen shrink-0 border-r border-blue-900/30"
        style={{ background: 'var(--sidebar-bg)' }}
      >
        <SidebarContent />
      </aside>

      {/* Bottom-sheet móvil */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full bg-white dark:bg-[#0f1826] rounded-t-3xl shadow-2xl z-10 max-h-[85vh] overflow-y-auto border-t border-blue-900/30" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" /></div>
            <div className="px-5 pb-6 pt-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-800 dark:text-white text-base">Navegación</h2>
                <div className="flex items-center gap-2">
                  <button onClick={onSwitchProfile} className="flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-[#162032] text-slate-600 dark:text-slate-300 px-3 py-2 rounded-xl">
                    <span>{avatar}</span> {activeProfile?.name}
                  </button>
                  <div className="p-1 rounded-xl bg-slate-100 dark:bg-[#162032]"><ThemePicker /></div>
                  <button onClick={() => setMoreOpen(false)} className="p-2 rounded-xl bg-slate-100 dark:bg-[#162032] text-slate-500 dark:text-slate-300"><X size={16} /></button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {navItems.map(({ id, label, icon: Icon }) => {
                  const active = activePage === id;
                  return (
                    <button key={id} onClick={() => goTo(id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all active:scale-95 ${
                        active
                          ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-700/50 text-orange-700 dark:text-orange-400'
                          : 'bg-slate-50 dark:bg-[#162032] border-slate-100 dark:border-blue-900/40 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <div className="relative">
                        <Icon size={24} strokeWidth={active ? 2.5 : 1.75} />
                        {id === 'recordatorios' && badgeRecordatorios > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{badgeRecordatorios}</span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-center leading-tight">{label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-5">Datos guardados en tu navegador</p>
            </div>
          </div>
        </div>
      )}

      {/* Área principal */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Header móvil */}
        <header className="lg:hidden sticky top-0 z-40 border-b border-slate-100 dark:border-blue-900/40 shadow-sm" style={{ background: 'var(--sidebar-bgd)' }}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xs">F</span>
              </div>
              <span className="font-bold text-white text-sm">FinanzApp</span>
              <span className="text-xs text-slate-400">· {activeProfile?.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={onSwitchProfile} className="p-2 rounded-xl hover:bg-white/10 transition-colors text-base" title="Cambiar perfil">{avatar}</button>
              <button onClick={() => goTo('recordatorios')} className="relative p-2 rounded-xl hover:bg-white/10 transition-colors">
                <Bell size={19} className="text-slate-300" />
                {badgeRecordatorios > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{badgeRecordatorios}</span>}
              </button>
              <button onClick={() => setMoreOpen(true)} className="p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-300"><Menu size={20} /></button>
            </div>
          </div>
          <div className="px-4 pb-2">
            <p className="text-xs font-semibold text-orange-400">{navItems.find(n => n.id === activePage)?.label || ''}</p>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-16 lg:py-10 max-w-5xl w-full mx-auto pb-28 lg:pb-10">
          {children}
        </main>

        {/* Barra navegación inferior móvil */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#04080f] border-t border-slate-200 dark:border-blue-900/50 z-40 shadow-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="flex items-stretch h-16 px-1">
            {bottomTabs.map(({ id, label, icon: Icon }) => {
              const active = activePage === id;
              return (
                <button key={id} onClick={() => goTo(id)} className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 transition-all active:scale-95">
                  <Icon size={22} strokeWidth={active ? 2.5 : 1.75} className={active ? 'text-orange-500 dark:text-orange-400' : 'text-slate-400 dark:text-slate-500'} />
                  <span className={`text-[10px] font-semibold leading-none ${active ? 'text-orange-500 dark:text-orange-400' : 'text-slate-400 dark:text-slate-500'}`}>{label}</span>
                </button>
              );
            })}
            <button onClick={() => setMoreOpen(true)} className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 transition-all active:scale-95 relative">
              <div className="relative">
                <Menu size={22} strokeWidth={1.75} className="text-slate-400 dark:text-slate-500" />
                {badgeRecordatorios > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">{badgeRecordatorios}</span>}
              </div>
              <span className="text-[10px] font-semibold leading-none text-slate-400 dark:text-slate-500">Más</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
