// ─────────────────────────────────────────────────────────────────────────────
// Layout.jsx — Estructura principal de la app (sidebar + nav móvil)
//
// QUÉ CAMBIÓ:
//   • Sidebar rediseñado: más limpio, secciones agrupadas
//   • Finn/Finna aparece en el sidebar según el género del perfil activo
//   • Nuevos items de nav: Cuéntanos, Acerca de, Contáctanos, Tratamiento de datos
//   • Nav móvil mejorado con mismo agrupamiento
//   • Indicador de página activa: punto naranja sutil
//
// PATRÓN IMPORTANTE — "children":
//   En React, {children} permite que un componente envuelva a otros.
//   Layout envuelve toda la app: <Layout> → <Dashboard/>, <Deudas/>, etc.
//   El contenido de adentro llega como la prop especial "children".
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import {
  LayoutDashboard, CreditCard, TrendingUp, ShoppingCart,
  Calculator, Menu, X, Table2, Bell, ChevronRight, ListChecks,
  BookOpen, HelpCircle, LogOut, Heart, Users, Info, Phone,
  FileText, ChevronDown,
} from 'lucide-react';
import ThemePicker from './ThemePicker';
import { useTheme } from '../context/ThemeContext';
import { useProfile } from '../context/ProfileContext';
import Finn from './Finn';
import Finna from './Finna';

// ── Navegación agrupada por secciones ──────────────────────────────────────
// Separar datos de diseño: si necesitas añadir una sección,
// solo tocas este array — el componente NavLink se dibuja solo.
const NAV_GROUPS = [
  {
    label: 'Principal',
    items: [
      { id: 'dashboard',       label: 'Dashboard',                icon: LayoutDashboard },
      { id: 'tabla',           label: 'Tabla Resumen',            icon: Table2 },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { id: 'deudas',          label: 'Obligaciones',             icon: CreditCard },
      { id: 'checklist',       label: 'Checklist de pagos',       icon: ListChecks },
      { id: 'ingresos',        label: 'Ingresos',                 icon: TrendingUp },
      { id: 'gastos',          label: 'Gastos',                   icon: ShoppingCart },
      { id: 'recordatorios',   label: 'Recordatorios',            icon: Bell },
    ],
  },
  {
    label: 'Herramientas',
    items: [
      { id: 'calculadora',     label: 'Calculadora',              icon: Calculator },
      { id: 'libreta',         label: 'Libreta',                  icon: BookOpen },
      { id: 'resumen-general', label: 'Resumen general',          icon: Users },
    ],
  },
  {
    label: 'Info',
    items: [
      { id: 'cuentanos',        label: 'Cuéntanos',               icon: Heart },
      { id: 'acerca-de',        label: 'Acerca de nosotros',      icon: Info },
      { id: 'contactenos',      label: 'Contáctanos',             icon: Phone },
      { id: 'tratamiento',      label: 'Tratamiento de datos',    icon: FileText },
      { id: 'guia',             label: 'Guía de uso',             icon: HelpCircle },
    ],
  },
];

// Tabs del nav inferior móvil (solo los más importantes)
const BOTTOM_TABS = [
  { id: 'dashboard', label: 'Inicio',  icon: LayoutDashboard },
  { id: 'deudas',    label: 'Deudas',  icon: CreditCard },
  { id: 'checklist', label: 'Pagos',   icon: ListChecks },
  { id: 'gastos',    label: 'Gastos',  icon: ShoppingCart },
];

export default function Layout({ children, activePage, onNavigate, badgeRecordatorios, onSwitchProfile, onLogout }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const { theme } = useTheme();
  const { activeProfile } = useProfile();

  // Determina qué mascota mostrar según el género del perfil activo
  // Si no hay género definido (perfiles viejos), muestra Finn por defecto
  const isFemale = activeProfile?.gender === 'f';

  const goTo = (id) => { onNavigate(id); setMoreOpen(false); };

  // ── NavLink: botón de navegación individual ──────────────────────────────
  // Recibe el item del menú y sabe si está activo comparando con activePage
  const NavLink = ({ id, label, icon: Icon }) => {
    const active = activePage === id;
    return (
      <button
        onClick={() => goTo(id)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150 relative ${
          active
            ? 'bg-orange-500/10 text-orange-400 font-medium'
            : 'text-slate-500 hover:bg-white/5 hover:text-slate-300 font-normal'
        }`}
      >
        <Icon size={15} className={active ? 'text-orange-400' : 'text-slate-600'}/>
        <span className="flex-1 text-left text-xs">{label}</span>
        {/* Badge recordatorios */}
        {id === 'recordatorios' && badgeRecordatorios > 0 && (
          <span className="bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
            {badgeRecordatorios}
          </span>
        )}
        {/* Indicador de activo: punto naranja sutil */}
        {active && <div className="w-1.5 h-1.5 rounded-full bg-orange-400"/>}
      </button>
    );
  };

  // ── Contenido del sidebar ─────────────────────────────────────────────────
  const SidebarContent = () => (
    <>
      {/* Logo + mascota pequeña */}
      <div style={{ padding: '16px 14px 12px', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          {/* Logo moneda */}
          <svg width="28" height="28" viewBox="0 0 120 120" style={{ borderRadius: 7, flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="120" rx="28" fill="#080f1e"/>
            <defs>
              <radialGradient id="logoC" cx="35%" cy="28%" r="68%">
                <stop offset="0%" stopColor="#FFF5B0"/>
                <stop offset="25%" stopColor="#F5C040"/>
                <stop offset="60%" stopColor="#D4880A"/>
                <stop offset="100%" stopColor="#7A4200"/>
              </radialGradient>
              <radialGradient id="logoR" cx="50%" cy="50%" r="50%">
                <stop offset="68%" stopColor="transparent"/>
                <stop offset="100%" stopColor="#4A2800" stopOpacity="0.6"/>
              </radialGradient>
              <radialGradient id="logoS" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.75"/>
                <stop offset="100%" stopColor="#fff" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <circle cx="60" cy="60" r="52" fill="none" stroke="#C87818" strokeWidth="4.5" strokeDasharray="6 3.2"/>
            <circle cx="60" cy="63" r="45" fill="#4A2800" opacity="0.4"/>
            <circle cx="60" cy="60" r="45" fill="url(#logoC)"/>
            <circle cx="60" cy="60" r="45" fill="url(#logoR)"/>
            <circle cx="60" cy="60" r="45" fill="none" stroke="#8B5200" strokeWidth="1.5"/>
            <circle cx="60" cy="60" r="37" fill="none" stroke="#7A4200" strokeWidth="1.2" opacity="0.6"/>
            <ellipse cx="43" cy="34" rx="14" ry="9" fill="url(#logoS)" transform="rotate(-28 43 34)" opacity="0.8"/>
            <text x="61" y="79" textAnchor="middle" fontSize="52" fontWeight="700" fill="#3A1800" fontFamily="Georgia,serif" opacity="0.8">F$</text>
            <text x="59" y="77" textAnchor="middle" fontSize="52" fontWeight="700" fill="#FFF8D0" fontFamily="Georgia,serif" opacity="0.6">F$</text>
          </svg>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#f1f5f9' }}>FinanzApp</div>
            <div style={{ fontSize: 10, color: '#475569' }}>Toma el control</div>
          </div>
        </div>

        {/* Perfil activo con mascota */}
        <button
          onClick={onSwitchProfile}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.04)',
            border: '0.5px solid rgba(255,255,255,0.07)',
            borderRadius: 10, padding: '8px 10px',
            display: 'flex', alignItems: 'center', gap: 10,
            cursor: 'pointer', transition: 'background .15s',
          }}
        >
          {/* Mascota del perfil — tamaño pequeño */}
          <div style={{ flexShrink: 0, marginTop: -2 }}>
            {isFemale
              ? <Finna mood="happy" size={32}/>
              : <Finn  mood="happy" size={32}/>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeProfile?.name || 'Mi perfil'}
            </div>
            <div style={{ fontSize: 10, color: '#475569' }}>Cambiar perfil</div>
          </div>
          <ChevronDown size={12} color="#475569"/>
        </button>
      </div>

      {/* Grupos de navegación */}
      <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
        {NAV_GROUPS.map(group => (
          <div key={group.label} style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 9, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', padding: '8px 12px 4px' }}>
              {group.label}
            </div>
            {group.items.map(item => <NavLink key={item.id} {...item}/>)}
          </div>
        ))}
      </nav>

      {/* Footer sidebar: logout + theme */}
      <div style={{ padding: '12px 14px', borderTop: '0.5px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={onLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#475569', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 8 }}
        >
          <LogOut size={12}/> Cerrar sesión
        </button>
        <ThemePicker/>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-[#080d16]">

      {/* ── SIDEBAR DESKTOP ── */}
      <aside
        className="hidden lg:flex flex-col w-56 sticky top-0 h-screen shrink-0 border-r border-blue-900/20"
        style={{ background: 'var(--sidebar-bg)' }}
      >
        <SidebarContent/>
      </aside>

      {/* ── BOTTOM SHEET MÓVIL ── */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/60"/>
          <div
            className="relative w-full rounded-t-3xl shadow-2xl z-10 max-h-[92vh] overflow-y-auto"
            style={{ background: '#0c111d', borderTop: '0.5px solid rgba(249,115,22,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: 36, height: 4, background: '#1e3a6e', borderRadius: 2 }}/>
            </div>

            <div style={{ padding: '0 16px 32px' }}>

              {/* Header perfil */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingTop: 4 }}>
                <button onClick={onSwitchProfile} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)',
                  borderRadius: 14, padding: '8px 14px 8px 8px', cursor: 'pointer',
                }}>
                  {isFemale ? <Finna mood="happy" size={36}/> : <Finn mood="happy" size={36}/>}
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#f1f5f9' }}>{activeProfile?.name}</div>
                    <div style={{ fontSize: 10, color: '#f97316' }}>Cambiar perfil</div>
                  </div>
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <ThemePicker/>
                  <button onClick={() => setMoreOpen(false)} style={{
                    background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)',
                    borderRadius: 10, padding: '8px 10px', cursor: 'pointer', color: '#64748b',
                  }}>
                    <X size={16}/>
                  </button>
                </div>
              </div>

              {/* Secciones agrupadas */}
              {NAV_GROUPS.map(group => (
                <div key={group.label} style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 9, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '.1em', margin: '0 0 8px 4px' }}>
                    {group.label}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {group.items.map(({ id, label, icon: Icon }) => {
                      const active = activePage === id;
                      return (
                        <button key={id} onClick={() => goTo(id)} style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                          padding: '12px 6px 10px',
                          borderRadius: 14,
                          border: `0.5px solid ${active ? 'rgba(249,115,22,0.5)' : 'rgba(255,255,255,0.06)'}`,
                          background: active ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.03)',
                          cursor: 'pointer', transition: 'all .15s', position: 'relative',
                        }}>
                          {/* Ícono con fondo */}
                          <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: active ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.05)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative',
                          }}>
                            <Icon size={18} strokeWidth={active ? 2.5 : 1.75} color={active ? '#f97316' : '#64748b'}/>
                            {id === 'recordatorios' && badgeRecordatorios > 0 && (
                              <span style={{
                                position: 'absolute', top: -4, right: -4,
                                background: '#ef4444', color: '#fff', fontSize: 8,
                                borderRadius: '50%', width: 14, height: 14,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                              }}>
                                {badgeRecordatorios}
                              </span>
                            )}
                          </div>
                          <span style={{
                            fontSize: 10, fontWeight: active ? 600 : 400,
                            color: active ? '#fb923c' : '#94a3b8',
                            textAlign: 'center', lineHeight: 1.3,
                          }}>
                            {label}
                          </span>
                          {/* Punto indicador activo */}
                          {active && (
                            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#f97316' }}/>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Cerrar sesión */}
              <button onClick={onLogout} style={{
                width: '100%', marginTop: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontSize: 12, color: '#475569', background: 'none', border: 'none',
                cursor: 'pointer', padding: '12px 0',
              }}>
                <LogOut size={13}/> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ÁREA PRINCIPAL ── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Header móvil */}
        <header
          className="lg:hidden sticky top-0 z-40 border-b border-slate-100 dark:border-blue-900/40 shadow-sm"
          style={{ background: 'var(--sidebar-bgd)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Logo móvil */}
              <svg width="26" height="26" viewBox="0 0 120 120" style={{ borderRadius: 7 }} xmlns="http://www.w3.org/2000/svg">
                <rect width="120" height="120" rx="28" fill="#080f1e"/>
                <defs>
                  <radialGradient id="mlogoC" cx="35%" cy="28%" r="68%">
                    <stop offset="0%" stopColor="#FFF5B0"/>
                    <stop offset="25%" stopColor="#F5C040"/>
                    <stop offset="60%" stopColor="#D4880A"/>
                    <stop offset="100%" stopColor="#7A4200"/>
                  </radialGradient>
                  <radialGradient id="mlogoR" cx="50%" cy="50%" r="50%">
                    <stop offset="68%" stopColor="transparent"/>
                    <stop offset="100%" stopColor="#4A2800" stopOpacity="0.6"/>
                  </radialGradient>
                </defs>
                <circle cx="60" cy="60" r="52" fill="none" stroke="#C87818" strokeWidth="5" strokeDasharray="6 3.2"/>
                <circle cx="60" cy="63" r="45" fill="#4A2800" opacity="0.4"/>
                <circle cx="60" cy="60" r="45" fill="url(#mlogoC)"/>
                <circle cx="60" cy="60" r="45" fill="url(#mlogoR)"/>
                <circle cx="60" cy="60" r="37" fill="none" stroke="#7A4200" strokeWidth="1.5" opacity="0.6"/>
                <text x="61" y="79" textAnchor="middle" fontSize="52" fontWeight="700" fill="#3A1800" fontFamily="Georgia,serif" opacity="0.8">F$</text>
                <text x="59" y="77" textAnchor="middle" fontSize="52" fontWeight="700" fill="#FFF8D0" fontFamily="Georgia,serif" opacity="0.6">F$</text>
              </svg>
              <span style={{ fontWeight: 600, color: '#fff', fontSize: 13 }}>FinanzApp</span>
              <span style={{ fontSize: 11, color: '#475569' }}>· {activeProfile?.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {/* Mascota pequeña en móvil */}
              <button onClick={onSwitchProfile} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                {isFemale ? <Finna mood="happy" size={28}/> : <Finn mood="happy" size={28}/>}
              </button>
              <button onClick={() => goTo('recordatorios')} style={{ position: 'relative', padding: 6, background: 'none', border: 'none', cursor: 'pointer' }}>
                <Bell size={18} color="#94a3b8"/>
                {badgeRecordatorios > 0 && (
                  <span style={{ position: 'absolute', top: 2, right: 2, background: '#ef4444', color: '#fff', fontSize: 8, borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {badgeRecordatorios}
                  </span>
                )}
              </button>
              <button onClick={() => setMoreOpen(true)} style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <Menu size={20}/>
              </button>
            </div>
          </div>
          {/* Nombre de página activa */}
          <div style={{ padding: '0 16px 8px' }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#f97316' }}>
              {NAV_GROUPS.flatMap(g => g.items).find(n => n.id === activePage)?.label || ''}
            </p>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-12 lg:py-8 max-w-5xl w-full mx-auto">
          {children}
          {/* Espaciador móvil para la barra inferior + FAB */}
          <div className="lg:hidden" style={{ height: 'calc(7rem + env(safe-area-inset-bottom, 0px))' }} aria-hidden="true"/>
        </main>

        {/* ── BOTÓN FLOTANTE GASTO HORMIGA ────────────────────────────────
            Visible en todas las pantallas excepto en la de gastos.
            El objetivo: que registrar un gasto pequeño sea tan fácil
            que el usuario lo haga en el momento que ocurre.
            Posición: sobre la barra de navegación inferior en móvil,
            esquina inferior derecha en desktop. */}
        {activePage !== 'gastos' && (
          <button
            onClick={() => goTo('gastos')}
            title="Registrar gasto hormiga"
            style={{
              position: 'fixed',
              bottom: 'calc(4rem + env(safe-area-inset-bottom, 12px) + 12px)',
              right: 20,
              zIndex: 50,
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#f97316',
              border: 'none',
              boxShadow: '0 4px 20px rgba(249,115,22,0.45)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 1,
              transition: 'transform .15s, box-shadow .15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.08)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(249,115,22,0.6)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(249,115,22,0.45)';
            }}
          >
            {/* Ícono de dólar + signo más — indica "agregar gasto" */}
            <span style={{ fontSize: 20, lineHeight: 1, color: '#fff', fontWeight: 700 }}>$</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: 600, letterSpacing: '.02em' }}>+</span>
          </button>
        )}

        {/* Nav inferior móvil */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 dark:border-blue-900/50"
          style={{ background: 'var(--sidebar-bgd)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div style={{ display: 'flex', alignItems: 'stretch', height: 56, padding: '0 4px' }}>
            {BOTTOM_TABS.map(({ id, label, icon: Icon }) => {
              const active = activePage === id;
              return (
                <button key={id} onClick={() => goTo(id)} style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 3,
                  background: 'none', border: 'none', cursor: 'pointer',
                }}>
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.75} color={active ? '#f97316' : '#475569'}/>
                  <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, color: active ? '#f97316' : '#475569' }}>{label}</span>
                </button>
              );
            })}
            {/* Botón "Más" */}
            <button onClick={() => setMoreOpen(true)} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 3,
              background: 'none', border: 'none', cursor: 'pointer', position: 'relative',
            }}>
              <div style={{ position: 'relative' }}>
                <Menu size={20} strokeWidth={1.75} color="#475569"/>
                {badgeRecordatorios > 0 && (
                  <span style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: '#fff', fontSize: 8, borderRadius: '50%', width: 12, height: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {badgeRecordatorios}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 9, fontWeight: 500, color: '#475569' }}>Más</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
