import { useState, useMemo } from 'react';
import {
  ArrowUpDown, Download, ExternalLink,
  AlertTriangle, AlertCircle, CheckCircle2, TrendingUp, TrendingDown,
  CreditCard, ShoppingCart, Coffee, DollarSign, Info,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend, RadialBarChart, RadialBar,
} from 'recharts';
import ChartTooltip from './ChartTooltip';
import {
  formatCurrency, formatPercent, calcularInteresMensual,
  calcularProximoPago, diasParaProximoPago,
} from '../utils/calculations';
import { exportarTablaExcel, exportarCSV } from '../utils/exportImport';

const FREQ_LABEL = { mensual: 'Mensual', quincenal: 'Quincenal', semanal: 'Semanal', fecha_especifica: 'Fecha fija' };
const FREQ_FACTOR_I = { mensual: 1, quincenal: 2, semanal: 4, unico: 1 };
const FREQ_FACTOR_G = { diario: 30, semanal: 4, quincenal: 2, mensual: 1, unico: 0 };

function mensualIngreso(i) { return parseFloat(i.monto || 0) * (FREQ_FACTOR_I[i.frecuencia] || 1); }
function mensualGasto(g)   { return parseFloat(g.monto || 0) * (FREQ_FACTOR_G[g.frecuencia] || 1); }

/* ──────────────────────────────────────────────────────────────────────── */
export default function TablaResumen({ deudas, ingresos, gastos }) {
  const [tab, setTab] = useState('resumen');
  const [sortKey, setSortKey] = useState('saldoCapital');
  const [sortDir, setSortDir] = useState('desc');

  /* ── Métricas globales ── */
  const m = useMemo(() => {
    const totalCapital      = deudas.reduce((s, d) => s + parseFloat(d.saldoCapital || 0), 0);
    const totalInteresM     = deudas.reduce((s, d) => s + calcularInteresMensual(parseFloat(d.saldoCapital || 0), parseFloat(d.tasaInteres || 0)), 0);
    const totalCuotaM       = deudas.reduce((s, d) => s + parseFloat(d.cuotaMensual || 0), 0);
    const totalIngresoM     = ingresos.reduce((s, i) => s + mensualIngreso(i), 0);
    const gastosFijos       = gastos.filter(g => !g.esHormiga);
    const gastosHormiga     = gastos.filter(g =>  g.esHormiga);
    const totalGastoFijoM   = gastosFijos.reduce((s, g) => s + mensualGasto(g), 0);
    const totalGastoHormigaM= gastosHormiga.reduce((s, g) => s + mensualGasto(g), 0);
    const totalGastoM       = totalGastoFijoM + totalGastoHormigaM;
    const totalEgresoM      = totalInteresM + totalGastoM;
    const disponible        = totalIngresoM - totalEgresoM;
    const ratio             = totalIngresoM > 0 ? (totalEgresoM / totalIngresoM) * 100 : 0;
    const ratioObligaciones = totalIngresoM > 0 ? (totalInteresM / totalIngresoM) * 100 : 0;
    const ratioGastos       = totalIngresoM > 0 ? (totalGastoM / totalIngresoM) * 100 : 0;
    return {
      totalCapital, totalInteresM, totalCuotaM, totalIngresoM,
      totalGastoFijoM, totalGastoHormigaM, totalGastoM,
      totalEgresoM, disponible, ratio, ratioObligaciones, ratioGastos,
    };
  }, [deudas, ingresos, gastos]);

  /* ── Filas tabla obligaciones ── */
  const rows = useMemo(() => {
    return deudas.map(d => {
      const capital = parseFloat(d.saldoCapital || 0);
      const tasa    = parseFloat(d.tasaInteres || 0);
      const interesMensual = calcularInteresMensual(capital, tasa);
      const proxFecha = d.frecuenciaPago === 'fecha_especifica'
        ? new Date(d.fechaPago)
        : calcularProximoPago(d.frecuenciaPago, d.fechaInicio);
      const dias    = diasParaProximoPago(proxFecha);
      const pctTotal= m.totalCapital > 0 ? (capital / m.totalCapital) * 100 : 0;
      const pagados = (d.historialPagos || []).filter(p =>  p.pagado).length;
      const perdidos= (d.historialPagos || []).filter(p => !p.pagado).length;
      return { ...d, capital, tasa, interesMensual, proxFecha, dias, pctTotal, pagados, perdidos };
    }).sort((a, b) => {
      const v = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'nombre')        return v * a.nombre.localeCompare(b.nombre);
      if (sortKey === 'saldoCapital')  return v * (a.capital - b.capital);
      if (sortKey === 'tasaInteres')   return v * (a.tasa - b.tasa);
      if (sortKey === 'interesMensual')return v * (a.interesMensual - b.interesMensual);
      if (sortKey === 'dias')          return v * (a.dias - b.dias);
      return 0;
    });
  }, [deudas, sortKey, sortDir, m.totalCapital]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };
  const SortBtn = ({ k, label }) => (
    <button onClick={() => toggleSort(k)} className="flex items-center gap-1 hover:text-slate-700">
      {label}
      <ArrowUpDown size={11} className={sortKey === k ? 'text-emerald-600' : 'text-slate-400'} />
    </button>
  );

  /* ── Nivel de alerta ── */
  const alertLevel = m.ratio >= 100 ? 'critico'
    : m.ratio >= 80  ? 'alto'
    : m.ratio >= 60  ? 'medio'
    : 'saludable';

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tabla Resumen</h2>
          <p className="text-slate-500 text-sm mt-0.5">Vista consolidada de todas tus finanzas</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportarTablaExcel(deudas)} className="flex items-center gap-1.5 text-xs bg-emerald-600 text-white px-3 py-2 rounded-xl hover:bg-emerald-700 font-medium">
            <Download size={13}/> Excel
          </button>
          <button onClick={() => exportarCSV(deudas, ingresos, gastos)} className="flex items-center gap-1.5 text-xs bg-slate-700 text-white px-3 py-2 rounded-xl hover:bg-slate-800 font-medium">
            <Download size={13}/> CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100">
          {[
            ['resumen',      'Resumen vs Ingresos'],
            ['obligaciones', 'Tabla de Obligaciones'],
          ].map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                tab === v
                  ? 'text-emerald-700 border-b-2 border-emerald-600 bg-white'
                  : 'text-slate-500 hover:text-slate-700 bg-slate-50'
              }`}>
              {l}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-6">

          {/* ════════════ TAB: RESUMEN VS INGRESOS ════════════ */}
          {tab === 'resumen' && (
            <ResumenVsIngresos m={m} deudas={deudas} ingresos={ingresos} gastos={gastos} alertLevel={alertLevel} />
          )}

          {/* ════════════ TAB: TABLA OBLIGACIONES ════════════ */}
          {tab === 'obligaciones' && (
            <TablaObligaciones rows={rows} m={m} SortBtn={SortBtn} />
          )}

        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PANEL: RESUMEN VS INGRESOS
══════════════════════════════════════════════════════════════════════════ */
function ResumenVsIngresos({ m, deudas, ingresos, gastos, alertLevel }) {

  /* ── Alertas ── */
  const alertas = [];
  if (m.ratio >= 100)
    alertas.push({ nivel: 'critico', texto: `Tus egresos superan tus ingresos en ${formatCurrency(Math.abs(m.disponible))} al mes. Situación crítica.` });
  else if (m.ratio >= 80)
    alertas.push({ nivel: 'alto', texto: `El ${m.ratio.toFixed(0)}% de tus ingresos está comprometido. Margen muy reducido.` });
  else if (m.ratio >= 60)
    alertas.push({ nivel: 'medio', texto: `El ${m.ratio.toFixed(0)}% de tus ingresos está comprometido. Considera reducir gastos.` });

  if (m.totalGastoHormigaM > m.totalIngresoM * 0.15)
    alertas.push({ nivel: 'medio', texto: `Tus gastos hormiga (${formatCurrency(m.totalGastoHormigaM)}/mes) representan más del 15% de tus ingresos.` });

  if (deudas.some(d => (d.historialPagos || []).some(p => !p.pagado)))
    alertas.push({ nivel: 'alto', texto: 'Tienes pagos no realizados en tu historial de obligaciones.' });

  /* ── Datos para gráficas ── */
  const barData = [
    { name: 'Ingresos',    valor: m.totalIngresoM,      fill: '#10b981' },
    { name: 'Intereses',   valor: m.totalInteresM,      fill: '#ef4444' },
    { name: 'Gastos fijos',valor: m.totalGastoFijoM,    fill: '#f97316' },
    { name: 'Hormiga',     valor: m.totalGastoHormigaM, fill: '#8b5cf6' },
    { name: 'Disponible',  valor: Math.max(m.disponible, 0), fill: '#3b82f6' },
  ];

  const pieData = [
    { name: 'Intereses oblig.',   value: m.totalInteresM,      fill: '#ef4444' },
    { name: 'Gastos fijos',       value: m.totalGastoFijoM,    fill: '#f97316' },
    { name: 'Gastos hormiga',     value: m.totalGastoHormigaM, fill: '#8b5cf6' },
    { name: 'Disponible',         value: Math.max(m.disponible, 0), fill: '#10b981' },
  ].filter(d => d.value > 0);

  /* ── Datos por obligación (capital + interés) ── */
  const barOblig = deudas.map(d => ({
    name: d.nombre.length > 14 ? d.nombre.slice(0, 13) + '…' : d.nombre,
    capital: parseFloat(d.saldoCapital || 0),
    interes: +calcularInteresMensual(parseFloat(d.saldoCapital || 0), parseFloat(d.tasaInteres || 0)).toFixed(0),
  })).sort((a, b) => b.capital - a.capital).slice(0, 8);

  const colorAlerta = {
    critico:   { bg: 'bg-red-50',    border: 'border-red-200',   icon: 'text-red-500',    text: 'text-red-800'    },
    alto:      { bg: 'bg-amber-50',  border: 'border-amber-200', icon: 'text-amber-500',  text: 'text-amber-800'  },
    medio:     { bg: 'bg-yellow-50', border: 'border-yellow-200',icon: 'text-yellow-600', text: 'text-yellow-800' },
    saludable: { bg: 'bg-emerald-50',border: 'border-emerald-200',icon: 'text-emerald-500',text: 'text-emerald-800'},
  };

  const nivelColor = {
    critico:   'bg-red-600',
    alto:      'bg-amber-500',
    medio:     'bg-yellow-500',
    saludable: 'bg-emerald-500',
  };

  const nivelLabel = { critico: 'CRÍTICO', alto: 'ALTO', medio: 'MODERADO', saludable: 'SALUDABLE' };

  return (
    <div className="space-y-6">

      {/* ── Alertas ── */}
      {alertas.length > 0 && (
        <div className="space-y-2">
          {alertas.map((a, i) => {
            const c = colorAlerta[a.nivel];
            const Icon = a.nivel === 'critico' ? AlertCircle : AlertTriangle;
            return (
              <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border ${c.bg} ${c.border}`}>
                <Icon size={17} className={`${c.icon} shrink-0 mt-0.5`} />
                <p className={`text-sm font-medium ${c.text}`}>{a.texto}</p>
              </div>
            );
          })}
          {alertas.length === 0 && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-emerald-50 border-emerald-200">
              <CheckCircle2 size={17} className="text-emerald-500 shrink-0" />
              <p className="text-sm font-medium text-emerald-800">Tu situación financiera es saludable. Buen trabajo.</p>
            </div>
          )}
        </div>
      )}
      {alertas.length === 0 && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-emerald-50 border-emerald-200">
          <CheckCircle2 size={17} className="text-emerald-500 shrink-0" />
          <p className="text-sm font-medium text-emerald-800">Tu situación financiera es saludable. Buen trabajo.</p>
        </div>
      )}

      {/* ── KPIs principales ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={TrendingUp}   label="Ingresos/mes"       value={formatCurrency(m.totalIngresoM)}     color="green"  sub={`${ingresos.length} fuente${ingresos.length !== 1 ? 's' : ''}`} />
        <KpiCard icon={CreditCard}   label="Intereses/mes"      value={formatCurrency(m.totalInteresM)}     color="red"    sub={formatCurrency(m.totalInteresM * 12) + ' / año'} />
        <KpiCard icon={ShoppingCart} label="Gastos/mes"         value={formatCurrency(m.totalGastoM)}       color="orange" sub={`Fijos ${formatCurrency(m.totalGastoFijoM)}`} />
        <KpiCard
          icon={m.disponible >= 0 ? TrendingUp : TrendingDown}
          label="Disponible/mes"
          value={formatCurrency(m.disponible)}
          color={m.disponible >= 0 ? 'blue' : 'red'}
          sub={m.disponible >= 0 ? 'flujo libre' : 'déficit'}
        />
      </div>

      {/* ── Medidor de compromiso ── */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Nivel de compromiso financiero</h3>
            <p className="text-xs text-slate-400 mt-0.5">Qué porcentaje de tus ingresos está comprometido</p>
          </div>
          <span className={`text-xs font-bold text-white px-3 py-1 rounded-full ${nivelColor[alertLevel]}`}>
            {nivelLabel[alertLevel]}
          </span>
        </div>

        {/* Barra segmentada */}
        <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex mb-3">
          <div className="h-full bg-red-500 transition-all"     style={{ width: `${Math.min(m.ratioObligaciones, 100)}%` }} title="Intereses" />
          <div className="h-full bg-orange-400 transition-all"  style={{ width: `${Math.min(m.ratioGastos * (m.totalGastoFijoM / (m.totalGastoM || 1)), 100 - m.ratioObligaciones)}%` }} title="Gastos fijos" />
          <div className="h-full bg-violet-400 transition-all"  style={{ width: `${Math.min(m.ratioGastos * (m.totalGastoHormigaM / (m.totalGastoM || 1)), 100 - m.ratioObligaciones - m.ratioGastos * (m.totalGastoFijoM / (m.totalGastoM || 1)))}%` }} title="Gastos hormiga" />
          <div className="h-full bg-emerald-400 flex-1"         title="Disponible" />
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
          <LegDot color="bg-red-500"     label={`Intereses ${m.ratioObligaciones.toFixed(0)}%`} />
          <LegDot color="bg-orange-400"  label={`Gastos fijos ${m.totalIngresoM > 0 ? ((m.totalGastoFijoM/m.totalIngresoM)*100).toFixed(0) : 0}%`} />
          <LegDot color="bg-violet-400"  label={`Hormiga ${m.totalIngresoM > 0 ? ((m.totalGastoHormigaM/m.totalIngresoM)*100).toFixed(0) : 0}%`} />
          <LegDot color="bg-emerald-400" label={`Libre ${m.totalIngresoM > 0 ? Math.max(100 - m.ratio, 0).toFixed(0) : 0}%`} />
        </div>

        {/* Escala referencia */}
        <div className="mt-4 grid grid-cols-4 gap-1 text-center text-xs">
          {[
            ['0–40%',  'bg-emerald-100', 'text-emerald-700', 'Saludable'],
            ['40–60%', 'bg-yellow-100',  'text-yellow-700',  'Moderado' ],
            ['60–80%', 'bg-amber-100',   'text-amber-700',   'Alto'     ],
            ['+80%',   'bg-red-100',     'text-red-700',     'Crítico'  ],
          ].map(([rng, bg, txt, lbl]) => (
            <div key={rng} className={`${bg} rounded-lg py-1.5 px-1`}>
              <p className={`font-bold text-[11px] ${txt}`}>{rng}</p>
              <p className={`text-[10px] ${txt} opacity-80`}>{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Gráficas comparativas ── */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Barras: ingresos vs egresos vs disponible */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Comparativo mensual</h3>
          <p className="text-xs text-slate-400 mb-4">Ingresos frente a cada categoría de egreso</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${(v/1000000).toFixed(1)}M`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="valor" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {barData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Dona: distribución del ingreso */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Distribución del ingreso</h3>
          <p className="text-xs text-slate-400 mb-2">En qué se va cada peso que entra</p>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={75} dataKey="value" paddingAngle={2}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-1">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.fill }} />
                    <span className="flex-1 text-slate-600">{d.name}</span>
                    <span className="font-semibold text-slate-700">{formatCurrency(d.value)}</span>
                    <span className="text-slate-400 w-10 text-right">
                      {m.totalIngresoM > 0 ? ((d.value / m.totalIngresoM) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-slate-400 text-sm text-center py-8">Agrega ingresos y gastos para ver la distribución.</p>
          )}
        </div>
      </div>

      {/* ── Capital vs interés por obligación ── */}
      {barOblig.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Capital e interés por obligación</h3>
          <p className="text-xs text-slate-400 mb-4">Saldo capital vs. interés mensual de cada obligación</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barOblig} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${(v/1000000).toFixed(1)}M`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="capital" name="Saldo capital"     fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="interes" name="Interés mensual"   fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Tabla detallada ingresos vs egresos ── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Estado financiero mensual</h3>
          <p className="text-xs text-slate-400 mt-0.5">Todos los conceptos, uno a uno</p>
        </div>

        <div className="divide-y divide-slate-50">

          {/* Ingresos */}
          <GrupoFilas
            titulo="INGRESOS"
            colorTitulo="text-emerald-700 bg-emerald-50"
            filas={ingresos.map(i => ({
              nombre: i.nombre,
              sub: i.tipo + ' · ' + i.frecuencia,
              valor: mensualIngreso(i),
              colorValor: 'text-emerald-700',
            }))}
            total={m.totalIngresoM}
            colorTotal="text-emerald-700 bg-emerald-50"
            signo="+"
          />

          {/* Obligaciones (intereses) */}
          <GrupoFilas
            titulo="OBLIGACIONES (intereses mensuales)"
            colorTitulo="text-red-700 bg-red-50"
            filas={deudas.map(d => ({
              nombre: d.nombre,
              sub: d.tipoObligacion + ' · ' + formatPercent(d.tasaInteres) + '/mes',
              valor: calcularInteresMensual(parseFloat(d.saldoCapital || 0), parseFloat(d.tasaInteres || 0)),
              colorValor: 'text-red-600',
            }))}
            total={m.totalInteresM}
            colorTotal="text-red-700 bg-red-50"
            signo="−"
          />

          {/* Gastos fijos */}
          {gastos.filter(g => !g.esHormiga).length > 0 && (
            <GrupoFilas
              titulo="GASTOS FIJOS"
              colorTitulo="text-orange-700 bg-orange-50"
              filas={gastos.filter(g => !g.esHormiga).map(g => ({
                nombre: g.descripcion,
                sub: g.categoria + ' · ' + g.frecuencia,
                valor: mensualGasto(g),
                colorValor: 'text-orange-600',
              }))}
              total={m.totalGastoFijoM}
              colorTotal="text-orange-700 bg-orange-50"
              signo="−"
            />
          )}

          {/* Gastos hormiga */}
          {gastos.filter(g => g.esHormiga).length > 0 && (
            <GrupoFilas
              titulo="GASTOS HORMIGA"
              colorTitulo="text-violet-700 bg-violet-50"
              filas={gastos.filter(g => g.esHormiga).map(g => ({
                nombre: g.descripcion,
                sub: g.categoria + ' · ' + g.frecuencia,
                valor: mensualGasto(g),
                colorValor: 'text-violet-600',
              }))}
              total={m.totalGastoHormigaM}
              colorTotal="text-violet-700 bg-violet-50"
              signo="−"
            />
          )}

          {/* Resultado neto */}
          <div className={`px-5 py-4 flex items-center justify-between ${m.disponible >= 0 ? 'bg-emerald-900' : 'bg-red-900'}`}>
            <div>
              <p className="text-xs font-bold text-white/60 uppercase tracking-wider">Flujo libre mensual</p>
              <p className="text-white text-xs mt-0.5 opacity-70">Ingresos − Intereses − Gastos</p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${m.disponible >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                {m.disponible >= 0 ? '+' : ''}{formatCurrency(m.disponible)}
              </p>
              <p className="text-white/50 text-xs">{m.ratio.toFixed(0)}% comprometido</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PANEL: TABLA DE OBLIGACIONES
══════════════════════════════════════════════════════════════════════════ */
function TablaObligaciones({ rows, m, SortBtn }) {
  if (rows.length === 0)
    return <p className="text-center text-slate-400 py-8">No tienes obligaciones registradas.</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <TCard label="Total capital"       value={formatCurrency(m.totalCapital)}      sub={`${rows.length} obligación${rows.length !== 1 ? 'es' : ''}`} color="red" />
        <TCard label="Interés mensual total" value={formatCurrency(m.totalInteresM)}   sub={formatCurrency(m.totalInteresM * 12) + ' / año'} color="orange" />
        <TCard label="Total cuotas/mes"    value={formatCurrency(m.totalCuotaM)}       color="blue" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <Th><SortBtn k="nombre"        label="Nombre / Entidad" /></Th>
              <Th>Tipo</Th>
              <Th><SortBtn k="saldoCapital"  label="Saldo Capital" /></Th>
              <Th>% Total</Th>
              <Th><SortBtn k="tasaInteres"   label="Tasa Mensual" /></Th>
              <Th>TEA</Th>
              <Th><SortBtn k="interesMensual" label="Interés/Mes" /></Th>
              <Th>Cuota</Th>
              <Th>Frecuencia</Th>
              <Th><SortBtn k="dias"          label="Próximo Pago" /></Th>
              <Th>Estado pagos</Th>
              <Th>Links</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d, i) => (
              <tr key={d.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800 text-sm">{d.nombre}</div>
                  {d.perdidos > 0 && <div className="text-xs text-red-500 mt-0.5">{d.perdidos} pago{d.perdidos > 1 ? 's' : ''} pendiente{d.perdidos > 1 ? 's' : ''}</div>}
                </td>
                <td className="px-4 py-3"><span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{d.tipoObligacion}</span></td>
                <td className="px-4 py-3 font-semibold text-red-600">{formatCurrency(d.capital)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: `${Math.min(d.pctTotal, 100)}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">{d.pctTotal.toFixed(1)}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-orange-600 font-medium">{formatPercent(d.tasa)}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{((Math.pow(1 + d.tasa / 100, 12) - 1) * 100).toFixed(2)}%</td>
                <td className="px-4 py-3 font-medium text-orange-700">{formatCurrency(d.interesMensual)}</td>
                <td className="px-4 py-3 text-slate-600">{d.cuotaMensual ? formatCurrency(d.cuotaMensual) : <span className="text-slate-300">—</span>}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{FREQ_LABEL[d.frecuenciaPago] || d.frecuenciaPago}</td>
                <td className="px-4 py-3">
                  <div className="text-xs text-slate-600">{d.proxFecha.toLocaleDateString('es-CO')}</div>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                    d.dias <= 0 ? 'bg-red-100 text-red-700' :
                    d.dias <= 3 ? 'bg-red-100 text-red-700' :
                    d.dias <= 7 ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {d.dias === 0 ? 'Hoy' : d.dias < 0 ? 'Vencido' : `${d.dias}d`}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {d.pagados > 0 && <span className="text-xs text-emerald-600 font-medium">{d.pagados} ✓</span>}
                    {d.perdidos > 0 && <span className="text-xs text-red-500 font-medium">{d.perdidos} ✗</span>}
                    {d.pagados === 0 && d.perdidos === 0 && <span className="text-xs text-slate-300">—</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {d.urlPSE && <a href={d.urlPSE} target="_blank" rel="noopener noreferrer" className="text-xs font-bold bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700">PSE</a>}
                    {d.urlPortal && <a href={d.urlPortal} target="_blank" rel="noopener noreferrer" className="p-1 text-slate-400 hover:text-blue-600 rounded"><ExternalLink size={13} /></a>}
                    {!d.urlPSE && !d.urlPortal && <span className="text-slate-300 text-xs">—</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-900 text-white">
            <tr>
              <td className="px-4 py-3 font-semibold text-sm" colSpan={2}>TOTAL</td>
              <td className="px-4 py-3 font-bold text-red-300">{formatCurrency(m.totalCapital)}</td>
              <td className="px-4 py-3 text-slate-400">100%</td>
              <td className="px-4 py-3 text-slate-400">—</td>
              <td className="px-4 py-3 text-slate-400">—</td>
              <td className="px-4 py-3 font-bold text-orange-300">{formatCurrency(m.totalInteresM)}</td>
              <td className="px-4 py-3 font-bold text-blue-300">{formatCurrency(m.totalCuotaM)}</td>
              <td className="px-4 py-3" colSpan={4} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   COMPONENTES AUXILIARES
══════════════════════════════════════════════════════════════════════════ */
function GrupoFilas({ titulo, colorTitulo, filas, total, colorTotal, signo }) {
  return (
    <>
      <div className={`px-5 py-2 ${colorTitulo}`}>
        <p className="text-xs font-bold uppercase tracking-wider">{titulo}</p>
      </div>
      {filas.map((f, i) => (
        <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
          <div className="min-w-0">
            <p className="text-sm text-slate-700 font-medium truncate">{f.nombre}</p>
            <p className="text-xs text-slate-400">{f.sub}</p>
          </div>
          <span className={`text-sm font-semibold shrink-0 ml-4 ${f.colorValor}`}>
            {signo}{formatCurrency(f.valor)}
          </span>
        </div>
      ))}
      {filas.length === 0 && (
        <div className="px-5 py-3 text-xs text-slate-400 italic">Sin registros</div>
      )}
      <div className={`px-5 py-3 flex items-center justify-between ${colorTotal}`}>
        <p className="text-xs font-bold uppercase tracking-wider">Subtotal</p>
        <span className="text-sm font-bold">{signo}{formatCurrency(total)}</span>
      </div>
    </>
  );
}

function KpiCard({ icon: Icon, label, value, color, sub }) {
  const c = {
    green:  'bg-emerald-50 border-emerald-100 text-emerald-700',
    red:    'bg-red-50     border-red-100     text-red-700',
    orange: 'bg-orange-50  border-orange-100  text-orange-700',
    blue:   'bg-blue-50    border-blue-100    text-blue-700',
  };
  return (
    <div className={`rounded-2xl border p-4 ${c[color]}`}>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={14} className="opacity-70" />
        <p className="text-xs font-medium opacity-70">{label}</p>
      </div>
      <p className="text-xl font-bold">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
  );
}

function TCard({ label, value, sub, color }) {
  const c = {
    red:    'bg-red-50    border-red-100    text-red-700',
    orange: 'bg-orange-50 border-orange-100 text-orange-700',
    blue:   'bg-blue-50   border-blue-100   text-blue-700',
  };
  return (
    <div className={`rounded-2xl border p-4 ${c[color]}`}>
      <p className="text-xs font-medium opacity-75">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
  );
}

function LegDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5 text-slate-500">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
      {label}
    </div>
  );
}

function Th({ children }) {
  return <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">{children}</th>;
}
