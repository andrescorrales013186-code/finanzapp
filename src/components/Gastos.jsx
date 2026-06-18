import { useState, useMemo } from 'react';
import { Plus, Trash2, Edit2, Coffee, ShoppingCart, Home, Zap } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';
import MoneyInput from './MoneyInput';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import ChartTooltip from './ChartTooltip';

const CATEGORIAS_FIJO = [
  'Arriendo / Vivienda', 'Servicios públicos', 'Alimentación', 'Transporte',
  'Salud', 'Educación', 'Mascotas', 'Seguros', 'Crédito / Cuota', 'Otro',
];
const CATEGORIAS_HORMIGA = [
  'Café / Bebidas', 'Snacks / Antojos', 'Comidas rápidas', 'Entretenimiento',
  'Aplicaciones / Suscripciones', 'Ropa / Accesorios', 'Belleza / Cuidado personal',
  'Cigarrillos / Vaping', 'Apuestas / Lotería', 'Compras impulsivas', 'Otro',
];
const COLORS_FIJO    = ['#f97316','#ef4444','#eab308','#22c55e','#3b82f6','#8b5cf6','#14b8a6','#f43f5e','#64748b','#84cc16'];
const COLORS_HORMIGA = ['#a855f7','#ec4899','#06b6d4','#d97706','#4f46e5','#7c3aed','#be185d','#0369a1','#b45309','#64748b'];
const FRECUENCIAS = [
  { value: 'diario',    label: 'Diario',    factor: 30 },
  { value: 'semanal',   label: 'Semanal',   factor: 4  },
  { value: 'quincenal', label: 'Quincenal', factor: 2  },
  { value: 'mensual',   label: 'Mensual',   factor: 1  },
  { value: 'unico',     label: 'Único',     factor: 0  },
];

const getMensual = (g) =>
  parseFloat(g.monto || 0) * (FRECUENCIAS.find(f => f.value === g.frecuencia)?.factor ?? 1);

const emptyFijo    = { descripcion: '', categoria: 'Arriendo / Vivienda', monto: '', frecuencia: 'mensual', fecha: hoy(), notas: '', esHormiga: false };
const emptyHormiga = { descripcion: '', categoria: 'Café / Bebidas',       monto: '', frecuencia: 'diario',   fecha: hoy(), notas: '', esHormiga: true  };

function hoy() { return new Date().toISOString().split('T')[0]; }

export default function Gastos({ gastos, setGastos, quickHormiga = false }) {
  const [tab, setTab] = useState(quickHormiga ? 'hormiga' : 'fijo');
  const [showQuick, setShowQuick] = useState(quickHormiga);
  const [quickForm, setQuickForm] = useState({ descripcion: '', monto: '', categoria: 'Café / Bebidas' });
  const [quickError, setQuickError] = useState('');

  const gastosFijos   = useMemo(() => gastos.filter(g => !g.esHormiga), [gastos]);
  const gastosHormiga = useMemo(() => gastos.filter(g =>  g.esHormiga), [gastos]);

  const totalFijoM    = useMemo(() => gastosFijos.reduce((s, g)   => s + getMensual(g), 0), [gastosFijos]);
  const totalHormigaM = useMemo(() => gastosHormiga.reduce((s, g) => s + getMensual(g), 0), [gastosHormiga]);
  const totalM        = totalFijoM + totalHormigaM;

  const handleQuickSave = () => {
    if (!quickForm.descripcion.trim()) { setQuickError('Escribe qué fue el gasto'); return; }
    if (!quickForm.monto || isNaN(quickForm.monto)) { setQuickError('Escribe el monto'); return; }
    const nuevo = {
      ...emptyHormiga,
      id: Date.now().toString(),
      descripcion: quickForm.descripcion.trim(),
      monto: quickForm.monto,
      categoria: quickForm.categoria,
      esHormiga: true,
      fecha: hoy(),
    };
    setGastos(prev => [...prev, nuevo]);
    setQuickForm({ descripcion: '', monto: '', categoria: 'Café / Bebidas' });
    setQuickError('');
    setShowQuick(false);
    setTab('hormiga');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Gastos</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Administra tus gastos fijos y gastos hormiga por separado</p>
      </div>

      {/* ── CONSEJO GASTO HORMIGA ── */}
      <div style={{
        background: 'linear-gradient(135deg, #4c1d95 0%, #2e1065 100%)',
        borderRadius: 14, padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{ fontSize: 28, flexShrink: 0 }}>🐜</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#e9d5ff', margin: '0 0 3px' }}>
            Registra tus gastos hormiga al instante
          </p>
          <p style={{ fontSize: 11, color: '#a78bfa', margin: 0, lineHeight: 1.5 }}>
            El café, el snack, el domicilio — regístralos ahora antes de olvidar. Al mes sorprende cuánto suman.
          </p>
        </div>
        <button
          onClick={() => setShowQuick(true)}
          style={{
            background: '#7c3aed', border: 'none', borderRadius: 10,
            padding: '8px 14px', color: '#fff', fontSize: 12,
            fontWeight: 600, cursor: 'pointer', flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          + Registrar
        </button>
      </div>

      {/* ── MODAL RÁPIDO GASTO HORMIGA ── */}
      {showQuick && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 60, display: 'flex', alignItems: 'flex-end',
          justifyContent: 'center', padding: '0 0 0 0',
        }}
          onClick={() => setShowQuick(false)}
        >
          <div
            style={{
              background: 'var(--color-background-primary, #0f1826)',
              borderRadius: '20px 20px 0 0',
              padding: '20px 20px 32px',
              width: '100%', maxWidth: 480,
              boxShadow: '0 -8px 40px rgba(0,0,0,0.4)',
              border: '0.5px solid rgba(124,58,237,0.3)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ width: 36, height: 4, background: '#334155', borderRadius: 2 }}/>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <span style={{ fontSize: 22 }}>🐜</span>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Gasto hormiga rápido</p>
                <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>Regístralo antes de olvidarlo</p>
              </div>
            </div>

            {/* Categorías rápidas */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {['Café / Bebidas','Comida rápida','Transporte','Snacks','Suscripción','Otro'].map(cat => (
                <button key={cat} onClick={() => setQuickForm(p => ({ ...p, categoria: cat }))} style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                  border: `1.5px solid ${quickForm.categoria === cat ? '#7c3aed' : 'var(--color-border-tertiary)'}`,
                  background: quickForm.categoria === cat ? 'rgba(124,58,237,0.15)' : 'transparent',
                  color: quickForm.categoria === cat ? '#a78bfa' : 'var(--color-text-tertiary)',
                  cursor: 'pointer', transition: 'all .12s',
                }}>
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 5 }}>¿Qué fue?</label>
                <input
                  autoFocus
                  placeholder="Ej: Café en la oficina"
                  value={quickForm.descripcion}
                  onChange={e => { setQuickForm(p => ({ ...p, descripcion: e.target.value })); setQuickError(''); }}
                  onKeyDown={e => { if (e.key === 'Enter') handleQuickSave(); }}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10,
                    border: '0.5px solid var(--color-border-secondary)',
                    background: 'var(--color-background-secondary)',
                    color: 'var(--color-text-primary)', fontSize: 14,
                    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 5 }}>Monto</label>
                <input
                  type="number"
                  placeholder="0"
                  value={quickForm.monto}
                  onChange={e => { setQuickForm(p => ({ ...p, monto: e.target.value })); setQuickError(''); }}
                  onKeyDown={e => { if (e.key === 'Enter') handleQuickSave(); }}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10,
                    border: '0.5px solid var(--color-border-secondary)',
                    background: 'var(--color-background-secondary)',
                    color: 'var(--color-text-primary)', fontSize: 14,
                    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            {quickError && <p style={{ color: '#ef4444', fontSize: 12, margin: '0 0 10px' }}>{quickError}</p>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleQuickSave} style={{
                flex: 1, padding: 12, background: '#7c3aed', border: 'none',
                borderRadius: 12, color: '#fff', fontWeight: 600,
                fontSize: 14, cursor: 'pointer',
              }}>
                Guardar gasto
              </button>
              <button onClick={() => setShowQuick(false)} style={{
                padding: '12px 16px', background: 'var(--color-background-secondary)',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 12, color: 'var(--color-text-secondary)',
                fontSize: 14, cursor: 'pointer',
              }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {gastos.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <SumCard label="Total mensual"  value={formatCurrency(totalM)}        sub={`${gastos.length} gasto${gastos.length !== 1 ? 's' : ''}`} color="slate"  />
          <SumCard label="Gastos fijos"   value={formatCurrency(totalFijoM)}    sub={totalM > 0 ? `${((totalFijoM/totalM)*100).toFixed(0)}%` : ''}             color="orange" />
          <SumCard label="Gastos hormiga" value={formatCurrency(totalHormigaM)} sub={totalM > 0 ? `${((totalHormigaM/totalM)*100).toFixed(0)}%` : ''}          color="violet" />
        </div>
      )}

      <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-100 dark:border-blue-900/40 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 dark:border-blue-900/40">
          <TabBtn active={tab === 'fijo'}    onClick={() => setTab('fijo')}    icon={<Home   size={15} />} label="Gastos Fijos"   count={gastosFijos.length}   color="orange" />
          <TabBtn active={tab === 'hormiga'} onClick={() => setTab('hormiga')} icon={<Coffee size={15} />} label="Gastos Hormiga" count={gastosHormiga.length} color="violet" />
        </div>

        <div className="p-5">
          {tab === 'fijo' && (
            <SubSeccion
              titulo="Gastos Fijos"
              descripcionTitulo="Gastos recurrentes y necesarios (arriendo, servicios, alimentación…)"
              gastos={gastosFijos}
              setGastos={setGastos}
              allGastos={gastos}
              categorias={CATEGORIAS_FIJO}
              colors={COLORS_FIJO}
              emptyForm={emptyFijo}
              esHormiga={false}
              colorAcento="orange"
            />
          )}
          {tab === 'hormiga' && (
            <SubSeccion
              titulo="Gastos Hormiga"
              descripcionTitulo="Pequeños gastos diarios que suman mucho al mes (café, snacks, suscripciones…)"
              gastos={gastosHormiga}
              setGastos={setGastos}
              allGastos={gastos}
              categorias={CATEGORIAS_HORMIGA}
              colors={COLORS_HORMIGA}
              emptyForm={emptyHormiga}
              esHormiga={true}
              colorAcento="violet"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function SubSeccion({ titulo, descripcionTitulo, gastos, setGastos, allGastos, categorias, colors, emptyForm, esHormiga, colorAcento }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [errors, setErrors]     = useState({});

  const totalMensual = useMemo(() => gastos.reduce((s, g) => s + getMensual(g), 0), [gastos]);

  const pieData = useMemo(() => {
    const acc = {};
    gastos.forEach(g => { acc[g.categoria] = (acc[g.categoria] || 0) + getMensual(g); });
    return Object.entries(acc).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [gastos]);

  const validate = () => {
    const e = {};
    if (!form.descripcion.trim()) e.descripcion = 'Requerido';
    if (!form.monto || parseFloat(form.monto) <= 0) e.monto = 'Monto válido requerido';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const item = { ...form, esHormiga, id: editId || Date.now().toString() };
    if (editId) {
      setGastos(prev => prev.map(g => g.id === editId ? item : g));
    } else {
      setGastos(prev => [...prev, item]);
    }
    reset();
  };

  const reset       = () => { setShowForm(false); setEditId(null); setForm(emptyForm); setErrors({}); };
  const handleEdit  = (g) => { setForm({ ...g }); setEditId(g.id); setShowForm(true); setErrors({}); };
  const handleDelete = (id) => { if (confirm('¿Eliminar este gasto?')) setGastos(prev => prev.filter(g => g.id !== id)); };

  const isV = colorAcento === 'violet';
  const acento = {
    bg:      isV ? 'bg-violet-50  dark:bg-violet-950/20' : 'bg-orange-50  dark:bg-orange-950/20',
    border:  isV ? 'border-violet-100 dark:border-violet-900/40' : 'border-orange-100 dark:border-orange-900/40',
    text:    isV ? 'text-violet-700 dark:text-violet-400' : 'text-orange-700 dark:text-orange-400',
    textSub: isV ? 'text-violet-500 dark:text-violet-400' : 'text-orange-500 dark:text-orange-400',
    iconBg:  isV ? 'bg-violet-100 dark:bg-violet-900/40' : 'bg-orange-100 dark:bg-orange-900/40',
    iconTxt: isV ? 'text-violet-600 dark:text-violet-400' : 'text-orange-600 dark:text-orange-400',
    badge:   isV ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400' : 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400',
    ring:    isV ? 'focus:ring-violet-500' : 'focus:ring-orange-400',
    listBorder: isV ? 'border-violet-100 dark:border-violet-900/30 bg-violet-50/30 dark:bg-violet-950/10' : 'border-orange-100 dark:border-orange-900/30 bg-orange-50/20 dark:bg-orange-950/10',
  };

  return (
    <div className="space-y-5">
      {/* Resumen + gráfica */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className={`${acento.bg} border ${acento.border} rounded-2xl p-4`}>
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${acento.textSub} mb-2`}>
            {isV ? <Coffee size={12}/> : <Home size={12}/>}
            {titulo}
          </div>
          <p className={`text-3xl font-bold ${acento.text}`}>{formatCurrency(totalMensual)}</p>
          <p className={`text-xs ${acento.textSub} mt-1`}>{gastos.length} gasto{gastos.length !== 1 ? 's' : ''} registrado{gastos.length !== 1 ? 's' : ''}</p>
          <p className={`text-xs ${acento.textSub} mt-0.5`}>{descripcionTitulo}</p>
        </div>

        {pieData.length > 0 && (
          <div className="bg-white dark:bg-[#162032] border border-slate-100 dark:border-blue-900/40 rounded-2xl p-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Por categoría (mensual)</p>
            <div className="flex gap-3 items-center">
              <ResponsiveContainer width={110} height={110}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" paddingAngle={2}>
                    {pieData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1 overflow-y-auto max-h-28">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
                    <span className="flex-1 text-slate-600 dark:text-slate-300 truncate">{d.name}</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200 shrink-0">{formatCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botón nuevo */}
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-400 dark:text-slate-500">{gastos.length === 0 ? 'Aún no hay gastos registrados en esta sección.' : ''}</p>
        <button
          onClick={() => { reset(); setShowForm(true); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-sm text-white transition-colors ${isV ? 'bg-violet-600 hover:bg-violet-700' : 'bg-orange-500 hover:bg-orange-600'}`}
        >
          <Plus size={15}/> Nuevo {isV ? 'gasto hormiga' : 'gasto fijo'}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-200 dark:border-blue-900/50 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 text-sm">
            {editId ? 'Editar' : 'Nuevo'} {isV ? 'gasto hormiga' : 'gasto fijo'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <F label="Descripción" error={errors.descripcion}>
                <input
                  type="text"
                  placeholder={isV ? 'Ej: Café diario' : 'Ej: Arriendo apartamento'}
                  value={form.descripcion}
                  onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                  className={inp(errors.descripcion)}
                />
              </F>
              <F label="Categoría">
                <select value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))} className={inp()}>
                  {categorias.map(c => <option key={c}>{c}</option>)}
                </select>
              </F>
              <F label="Monto ($)" error={errors.monto}>
                <MoneyInput value={form.monto} onChange={v => setForm(p => ({ ...p, monto: v }))} placeholder="0" className={inp(errors.monto)} />
              </F>
              <F label="Frecuencia">
                <select value={form.frecuencia} onChange={e => setForm(p => ({ ...p, frecuencia: e.target.value }))} className={inp()}>
                  {FRECUENCIAS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </F>
              <F label="Fecha">
                <input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} className={inp()} />
              </F>
            </div>

            {form.monto && form.frecuencia !== 'mensual' && form.frecuencia !== 'unico' && (
              <div className={`${acento.bg} border ${acento.border} rounded-xl p-3 text-sm ${acento.text}`}>
                <strong>Equivalente mensual:</strong>{' '}
                {formatCurrency(parseFloat(form.monto || 0) * (FRECUENCIAS.find(f => f.value === form.frecuencia)?.factor || 1))}
                {isV && form.frecuencia === 'diario' && (
                  <span className="ml-2 text-xs opacity-75">· {formatCurrency(parseFloat(form.monto || 0) * 365)} al año</span>
                )}
              </div>
            )}

            <F label="Notas">
              <textarea rows={2} value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} className={inp()} />
            </F>

            <div className="flex gap-3 pt-1">
              <button type="submit" className={`text-white px-5 py-2.5 rounded-xl font-medium text-sm ${isV ? 'bg-violet-600 hover:bg-violet-700' : 'bg-orange-500 hover:bg-orange-600'}`}>
                {editId ? 'Actualizar' : 'Guardar'}
              </button>
              <button type="button" onClick={reset} className="bg-slate-100 dark:bg-[#162032] text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-[#1e2d42] font-medium text-sm">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-2.5">
        {gastos.map(g => (
          <div key={g.id} className={`flex items-center gap-3 p-5 rounded-2xl border shadow-sm ${acento.listBorder} hover:shadow transition-shadow`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${acento.iconBg}`}>
              {isV ? <Coffee size={15} className={acento.iconTxt}/> : <ShoppingCart size={15} className={acento.iconTxt}/>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{g.descripcion}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${acento.badge}`}>{g.categoria}</span>
                <span className="text-xs bg-slate-100 dark:bg-[#162032] text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
                  {FRECUENCIAS.find(f => f.value === g.frecuencia)?.label}
                </span>
              </div>
              <div className="flex gap-4 mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                <span>Monto: <strong className={acento.text}>{formatCurrency(g.monto)}</strong></span>
                {g.frecuencia !== 'mensual' && g.frecuencia !== 'unico' && (
                  <span>Mensual: <strong className={acento.text}>{formatCurrency(getMensual(g))}</strong></span>
                )}
                {g.frecuencia === 'diario' && (
                  <span className="text-slate-400 dark:text-slate-500">
                    Año: <strong>{formatCurrency(parseFloat(g.monto || 0) * 365)}</strong>
                  </span>
                )}
                {g.notas && <span className="text-slate-400 dark:text-slate-500 truncate max-w-40">{g.notas}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => handleEdit(g)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg">
                <Edit2 size={14}/>
              </button>
              <button onClick={() => handleDelete(g.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg">
                <Trash2 size={14}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      {isV && totalMensual > 0 && (
        <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 rounded-2xl p-4 text-xs text-violet-700 dark:text-violet-400">
          <p className="font-semibold mb-1">Sabías que…</p>
          <p>
            Tus gastos hormiga suman <strong>{formatCurrency(totalMensual)}</strong> al mes,{' '}
            <strong>{formatCurrency(totalMensual * 12)}</strong> al año.
            Reducirlos un 30% te ahorraría <strong>{formatCurrency(totalMensual * 0.3 * 12)}</strong> anuales.
          </p>
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, icon, label, count, color }) {
  const colors = {
    orange: active ? 'text-orange-700 dark:text-orange-400 border-b-2 border-orange-500 bg-white dark:bg-[#0f1826]' : 'text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400',
    violet: active ? 'text-violet-700 dark:text-violet-400 border-b-2 border-violet-500 bg-white dark:bg-[#0f1826]' : 'text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400',
  };
  return (
    <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${colors[color]}`}>
      {icon}
      {label}
      {count > 0 && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${active
          ? color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400' : 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400'
          : 'bg-slate-100 dark:bg-[#162032] text-slate-500 dark:text-slate-400'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

function SumCard({ label, value, sub, color }) {
  const c = {
    slate:  'bg-slate-50  dark:bg-[#162032]       border-slate-200  dark:border-blue-900/40  text-slate-700  dark:text-slate-200',
    orange: 'bg-orange-50 dark:bg-orange-950/20   border-orange-100 dark:border-orange-900/40 text-orange-700 dark:text-orange-400',
    violet: 'bg-violet-50 dark:bg-violet-950/20   border-violet-100 dark:border-violet-900/40 text-violet-700 dark:text-violet-400',
  };
  return (
    <div className={`rounded-2xl border p-4 ${c[color]}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
  );
}

function F({ label, children, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</label>
      {children}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

function inp(error) {
  return `w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
    error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'
  }`;
}
