// ─────────────────────────────────────────────────────────────────────────────
// Dashboard.jsx — Rediseño visual completo
//
// CAMBIOS:
// 1. StatCard rediseñado: fondo neutro, punto de color, números prominentes
// 2. Finn/Finna reactivos: el mood cambia según la salud financiera
//    - compromisoRatio < 50%  → excited  (todo bien)
//    - compromisoRatio 50-79% → happy    (normal)
//    - compromisoRatio 80-99% → worried  (alerta)
//    - compromisoRatio >= 100% o déficit → worried (crítico)
// 3. PageHeader muestra la mascota del perfil activo con mood reactivo
// 4. Barra de distribución más delgada y elegante
// 5. Sección vacía rediseñada con Finn thinking
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingDown, TrendingUp, AlertCircle, DollarSign, CreditCard, ShoppingCart, ArrowRight } from 'lucide-react';
import { formatCurrency, calcularInteresMensual, diasParaProximoPago, calcularProximoPago } from '../utils/calculations';
import ChartTooltip from './ChartTooltip';
import { useProfile } from '../context/ProfileContext';
import Finn from './Finn';
import Finna from './Finna';

const COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899','#14b8a6'];
const FREQ_FACTOR = { mensual: 1, quincenal: 2, semanal: 4, unico: 1 };

// Determina el mood de la mascota según la salud financiera
// Esto hace que Finn/Finna reaccionen visualmente a los datos reales
function getMood(compromisoRatio, disponible) {
  if (disponible < 0 || compromisoRatio >= 100) return 'worried';
  if (compromisoRatio >= 80) return 'worried';
  if (compromisoRatio >= 50) return 'happy';
  return 'excited'; // menos del 50% comprometido = excelente
}

// Mascota correcta según género del perfil
function Mascot({ mood, size }) {
  const { activeProfile } = useProfile();
  return activeProfile?.gender === 'f'
    ? <Finna mood={mood} size={size} />
    : <Finn  mood={mood} size={size} />;
}

export default function Dashboard({ deudas, ingresos, gastos, onNavigate }) {
  const stats = useMemo(() => {
    const totalDeuda    = deudas.reduce((s, d) => s + parseFloat(d.saldoCapital || 0), 0);
    const totalInteresM = deudas.reduce((s, d) => s + calcularInteresMensual(parseFloat(d.saldoCapital || 0), parseFloat(d.tasaInteres || 0)), 0);
    const totalIngresoM = ingresos.reduce((s, i) => s + parseFloat(i.monto || 0) * (FREQ_FACTOR[i.frecuencia] || 1), 0);
    const totalGastoM   = gastos.reduce((s, g) => {
      const f = { diario: 30, semanal: 4, quincenal: 2, mensual: 1, unico: 0 }[g.frecuencia] || 1;
      return s + parseFloat(g.monto || 0) * f;
    }, 0);
    const gastoHormiga = gastos.filter(g => g.esHormiga).reduce((s, g) => {
      const f = { diario: 30, semanal: 4, quincenal: 2, mensual: 1, unico: 0 }[g.frecuencia] || 1;
      return s + parseFloat(g.monto || 0) * f;
    }, 0);
    const disponible       = totalIngresoM - totalGastoM - totalInteresM;
    const compromisoRatio  = totalIngresoM > 0 ? ((totalGastoM + totalInteresM) / totalIngresoM) * 100 : 0;
    return { totalDeuda, totalInteresM, totalIngresoM, totalGastoM, gastoHormiga, disponible, compromisoRatio };
  }, [deudas, ingresos, gastos]);

  const mood = getMood(stats.compromisoRatio, stats.disponible);

  const pieData = deudas.map(d => ({ name: d.nombre, value: parseFloat(d.saldoCapital || 0) })).filter(d => d.value > 0);

  const proximosPagos = useMemo(() => deudas
    .map(d => {
      const fecha = d.frecuenciaPago === 'fecha_especifica'
        ? new Date(d.fechaPago)
        : calcularProximoPago(d.frecuenciaPago, d.fechaInicio);
      return { ...d, proximaFecha: fecha, dias: diasParaProximoPago(fecha) };
    })
    .filter(d => d.dias >= 0 && d.dias <= 30)
    .sort((a, b) => a.dias - b.dias)
    .slice(0, 6), [deudas]);

  const barData = [
    { name: 'Ingresos',  valor: stats.totalIngresoM,          fill: '#10b981' },
    { name: 'Gastos',    valor: stats.totalGastoM,            fill: '#f97316' },
    { name: 'Intereses', valor: stats.totalInteresM,          fill: '#ef4444' },
    { name: 'Libre',     valor: Math.max(stats.disponible, 0),fill: '#3b82f6' },
  ];

  const isEmpty = deudas.length === 0 && ingresos.length === 0 && gastos.length === 0;

  // ── Pantalla vacía ──────────────────────────────────────────────────────
  if (isEmpty) return (
    <div className="space-y-6">
      <PageHeader mood="thinking"/>
      <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-100 dark:border-blue-900/40 p-10 shadow-sm">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
          <Mascot mood="thinking" size={100}/>
          <div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Comienza registrando tus datos
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-sm mx-auto">
              Agrega tus obligaciones, ingresos y gastos para ver tu situación financiera completa.
            </p>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <Btn onClick={() => onNavigate('deudas')}   label="Agregar deuda"   primary />
            <Btn onClick={() => onNavigate('ingresos')} label="Agregar ingreso" />
            <Btn onClick={() => onNavigate('gastos')}   label="Agregar gasto"   />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">

      {/* Header con mascota reactiva */}
      <PageHeader mood={mood} stats={stats}/>

      {/* Alerta déficit */}
      {stats.disponible < 0 && (
        <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'12px 14px', background:'var(--color-background-secondary)', borderRadius:10, border:'0.5px solid var(--color-border-tertiary)' }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#ef4444', flexShrink:0, marginTop:5 }}/>
          <div>
            <p style={{ fontSize:13, fontWeight:500, color:'var(--color-text-primary)', margin:0 }}>
              Déficit mensual de {formatCurrency(Math.abs(stats.disponible))}
            </p>
            <p style={{ fontSize:11, color:'var(--color-text-tertiary)', margin:'3px 0 0' }}>
              Tus gastos e intereses superan tus ingresos. Revisa tus gastos para mejorar tu flujo.
            </p>
          </div>
        </div>
      )}

      {/* KPI cards — diseño limpio con punto de color */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard label="Obligación total"       value={formatCurrency(stats.totalDeuda)}    sub={`${deudas.length} obligación${deudas.length !== 1 ? 'es' : ''}`}   color="red"    onClick={() => onNavigate('deudas')}   />
        <StatCard label="Interés mensual"   value={formatCurrency(stats.totalInteresM)} sub={`${stats.compromisoRatio.toFixed(0)}% de compromiso`}               color="orange" />
        <StatCard label="Ingresos / mes"    value={formatCurrency(stats.totalIngresoM)} sub={`${ingresos.length} fuente${ingresos.length !== 1 ? 's' : ''}`}     color="green"  onClick={() => onNavigate('ingresos')} />
        <StatCard label="Gastos mensuales"  value={formatCurrency(stats.totalGastoM)}   sub="fijos + hormiga"                                                    color="yellow" onClick={() => onNavigate('gastos')}   />
        <StatCard label="Gastos hormiga"    value={formatCurrency(stats.gastoHormiga)}  sub={stats.totalGastoM > 0 ? `${((stats.gastoHormiga / stats.totalGastoM) * 100).toFixed(0)}% de tus gastos` : ''} color="purple" />
        <StatCard
          label="Flujo libre"
          value={formatCurrency(stats.disponible)}
          sub={stats.disponible >= 0 ? 'disponible al mes' : 'en déficit'}
          color={stats.disponible >= 0 ? 'blue' : 'red'}
        />
      </div>

      {/* Barra distribución */}
      {stats.totalIngresoM > 0 && (
        <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-100 dark:border-blue-900/40 p-5 shadow-sm">
          <div className="flex justify-between text-xs mb-3">
            <span className="font-medium text-slate-700 dark:text-slate-200">Distribución de ingresos</span>
            <span className="text-slate-400">{stats.compromisoRatio.toFixed(0)}% comprometido</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-[#162032] rounded-full overflow-hidden flex gap-px">
            <div className="bg-red-400 h-full rounded-l-full transition-all"
              style={{ width: `${Math.min((stats.totalInteresM / stats.totalIngresoM) * 100, 100)}%` }}/>
            <div className="bg-orange-400 h-full transition-all"
              style={{ width: `${Math.min((stats.totalGastoM / stats.totalIngresoM) * 100, 100 - (stats.totalInteresM / stats.totalIngresoM) * 100)}%` }}/>
            <div className="bg-emerald-400 h-full rounded-r-full flex-1 transition-all"/>
          </div>
          <div className="flex gap-4 mt-2.5 text-xs">
            <LegendDot color="bg-red-400"     label="Intereses"/>
            <LegendDot color="bg-orange-400"  label="Gastos"/>
            <LegendDot color="bg-emerald-400" label="Libre"/>
          </div>
        </div>
      )}

      {/* Gráficas */}
      <div className="grid lg:grid-cols-2 gap-4">
        {pieData.length > 0 && (
          <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-100 dark:border-blue-900/40 p-5 shadow-sm">
            <SectionHeader title="Distribución de deudas" action={() => onNavigate('tabla')} actionLabel="Ver tabla"/>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={2}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Pie>
                <Tooltip content={<ChartTooltip/>}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-1">
              {pieData.map((d, i) => {
                const total = pieData.reduce((s, x) => s + x.value, 0);
                return (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }}/>
                    <span className="flex-1 text-slate-600 dark:text-slate-300 truncate">{d.name}</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{formatCurrency(d.value)}</span>
                    <span className="text-slate-400 w-8 text-right">{total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-100 dark:border-blue-900/40 p-5 shadow-sm">
          <SectionHeader title="Balance mensual"/>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a6e" vertical={false} opacity={0.4}/>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTooltip/>} cursor={{ fill: 'rgba(255,255,255,0.03)' }}/>
              <Bar dataKey="valor" radius={[5, 5, 0, 0]} maxBarSize={44}>
                {barData.map((entry, i) => <Cell key={i} fill={entry.fill}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Próximos vencimientos */}
      {proximosPagos.length > 0 && (
        <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-100 dark:border-blue-900/40 p-5 shadow-sm">
          <SectionHeader title="Próximos vencimientos (30 días)" action={() => onNavigate('recordatorios')} actionLabel="Ver todos"/>
          <div className="space-y-2 mt-3">
            {proximosPagos.map(d => (
              <div key={d.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#162032] border border-transparent dark:border-blue-900/20">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  d.dias <= 3 ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400' :
                  d.dias <= 7 ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400' :
                  'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                }`}>
                  {d.dias === 0 ? 'Hoy' : d.dias === 1 ? '1d' : `${d.dias}d`}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{d.nombre}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{d.tipoObligacion} · {d.proximaFecha.toLocaleDateString('es-CO')}</p>
                </div>
                <span className="text-sm font-medium text-slate-800 dark:text-white shrink-0">{formatCurrency(d.saldoCapital)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── PageHeader con mascota reactiva ──────────────────────────────────────────
// Muestra un mensaje diferente según el mood para dar contexto emocional
function PageHeader({ mood, stats }) {
  const { activeProfile } = useProfile();

  const messages = {
    excited: { title: '¡Excelente manejo!',  sub: 'Tienes menos del 50% de tus ingresos comprometidos.' },
    happy:   { title: 'Dashboard',           sub: 'Resumen financiero de tu situación actual.' },
    worried: { title: 'Atención necesaria',  sub: 'Tus compromisos financieros están en nivel de alerta.' },
    thinking:{ title: 'Dashboard',           sub: 'Comienza registrando tus datos financieros.' },
  };

  const msg = messages[mood] || messages.happy;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ flexShrink: 0 }}>
        <Mascot mood={mood} size={64}/>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white leading-tight">{msg.title}</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{msg.sub}</p>
      </div>
    </div>
  );
}

function SectionHeader({ title, action, actionLabel }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200">{title}</h3>
      {action && (
        <button onClick={action} className="text-xs text-orange-500 hover:text-orange-400 flex items-center gap-0.5 font-medium">
          {actionLabel} <ArrowRight size={11}/>
        </button>
      )}
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
      <span className={`w-2 h-2 rounded-full ${color}`}/>
      {label}
    </div>
  );
}

// StatCard rediseñado: fondo neutro, punto de color, número prominente
// Sin fondos de colores por tarjeta — más limpio y profesional
function StatCard({ label, value, sub, color, onClick }) {
  const dots = {
    red:    '#ef4444',
    orange: '#f97316',
    green:  '#10b981',
    yellow: '#f59e0b',
    purple: '#8b5cf6',
    blue:   '#3b82f6',
  };
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-[#0f1826] border border-slate-100 dark:border-blue-900/40 rounded-2xl p-4 shadow-sm ${onClick ? 'cursor-pointer hover:border-slate-200 dark:hover:border-blue-700 transition-colors' : ''}`}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: dots[color] || '#f97316', flexShrink: 0 }}/>
        <span className="text-xs text-slate-400 dark:text-slate-500 leading-none">{label}</span>
      </div>
      <p className="text-lg font-medium text-slate-800 dark:text-white leading-none tracking-tight">{value}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{sub}</p>}
    </div>
  );
}

function Btn({ onClick, label, primary }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
      primary
        ? 'bg-orange-500 text-white hover:bg-orange-600'
        : 'bg-slate-100 dark:bg-[#162032] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#1e2d42]'
    }`}>
      {label}
    </button>
  );
}
