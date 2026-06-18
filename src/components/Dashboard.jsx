import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingDown, TrendingUp, AlertCircle, DollarSign, CreditCard, ShoppingCart, ArrowRight, Bell } from 'lucide-react';
import { formatCurrency, calcularInteresMensual, diasParaProximoPago, calcularProximoPago } from '../utils/calculations';

const COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899','#14b8a6'];
const FREQ_FACTOR = { mensual: 1, quincenal: 2, semanal: 4, unico: 1 };

export default function Dashboard({ deudas, ingresos, gastos, onNavigate }) {
  const stats = useMemo(() => {
    const totalDeuda = deudas.reduce((s, d) => s + parseFloat(d.saldoCapital || 0), 0);
    const totalInteresM = deudas.reduce((s, d) => s + calcularInteresMensual(parseFloat(d.saldoCapital || 0), parseFloat(d.tasaInteres || 0)), 0);
    const totalIngresoM = ingresos.reduce((s, i) => s + parseFloat(i.monto || 0) * (FREQ_FACTOR[i.frecuencia] || 1), 0);
    const totalGastoM = gastos.reduce((s, g) => {
      const f = { diario: 30, semanal: 4, quincenal: 2, mensual: 1, unico: 0 }[g.frecuencia] || 1;
      return s + parseFloat(g.monto || 0) * f;
    }, 0);
    const gastoHormiga = gastos.filter(g => g.esHormiga).reduce((s, g) => {
      const f = { diario: 30, semanal: 4, quincenal: 2, mensual: 1, unico: 0 }[g.frecuencia] || 1;
      return s + parseFloat(g.monto || 0) * f;
    }, 0);
    const disponible = totalIngresoM - totalGastoM - totalInteresM;
    const compromisoRatio = totalIngresoM > 0 ? ((totalGastoM + totalInteresM) / totalIngresoM) * 100 : 0;
    return { totalDeuda, totalInteresM, totalIngresoM, totalGastoM, gastoHormiga, disponible, compromisoRatio };
  }, [deudas, ingresos, gastos]);

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
    { name: 'Ingresos', valor: stats.totalIngresoM, fill: '#10b981' },
    { name: 'Gastos',   valor: stats.totalGastoM,   fill: '#f97316' },
    { name: 'Intereses',valor: stats.totalInteresM, fill: '#ef4444' },
    { name: 'Libre',    valor: Math.max(stats.disponible, 0), fill: '#3b82f6' },
  ];

  const isEmpty = deudas.length === 0 && ingresos.length === 0 && gastos.length === 0;

  if (isEmpty) return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Bienvenido a FinanzApp" />
      <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-100 dark:border-blue-900/40 p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <DollarSign className="text-emerald-500" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Comienza registrando tus datos</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Agrega tus deudas, ingresos y gastos para ver tu situación financiera completa.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Btn onClick={() => onNavigate('deudas')} label="Agregar deuda" primary />
          <Btn onClick={() => onNavigate('ingresos')} label="Agregar ingreso" />
          <Btn onClick={() => onNavigate('gastos')} label="Agregar gasto" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Resumen financiero de tu situación actual" />

      {/* Alerta déficit */}
      {stats.disponible < 0 && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-semibold text-red-700 dark:text-red-400 text-sm">Déficit mensual de {formatCurrency(Math.abs(stats.disponible))}</p>
            <p className="text-xs text-red-600 dark:text-red-400/80 mt-0.5">Tus gastos e intereses superan tus ingresos. Revisa tus gastos para mejorar tu flujo.</p>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard icon={CreditCard} label="Deuda total" value={formatCurrency(stats.totalDeuda)} sub={`${deudas.length} obligación${deudas.length !== 1 ? 'es' : ''}`} color="red" onClick={() => onNavigate('deudas')} />
        <StatCard icon={AlertCircle} label="Interés mensual" value={formatCurrency(stats.totalInteresM)} sub={`${stats.compromisoRatio.toFixed(0)}% de compromiso`} color="orange" />
        <StatCard icon={TrendingUp} label="Ingresos mensuales" value={formatCurrency(stats.totalIngresoM)} sub={`${ingresos.length} fuente${ingresos.length !== 1 ? 's' : ''}`} color="green" onClick={() => onNavigate('ingresos')} />
        <StatCard icon={ShoppingCart} label="Gastos mensuales" value={formatCurrency(stats.totalGastoM)} sub="fijos + hormiga" color="yellow" onClick={() => onNavigate('gastos')} />
        <StatCard icon={DollarSign} label="Gastos hormiga" value={formatCurrency(stats.gastoHormiga)} sub={stats.totalGastoM > 0 ? `${((stats.gastoHormiga / stats.totalGastoM) * 100).toFixed(0)}% de tus gastos` : ''} color="purple" />
        <StatCard
          icon={stats.disponible >= 0 ? TrendingUp : TrendingDown}
          label="Flujo libre"
          value={formatCurrency(stats.disponible)}
          sub={stats.disponible >= 0 ? 'disponible al mes' : 'en déficit'}
          color={stats.disponible >= 0 ? 'blue' : 'red'}
        />
      </div>

      {/* Ratio bar */}
      {stats.totalIngresoM > 0 && (
        <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-100 dark:border-blue-900/40 p-6 shadow-sm">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-medium text-slate-700 dark:text-slate-200">Distribución de ingresos</span>
            <span>{stats.compromisoRatio.toFixed(0)}% comprometido</span>
          </div>
          <div className="h-3 bg-slate-100 dark:bg-[#162032] rounded-full overflow-hidden flex gap-0.5">
            <div className="bg-red-400 h-full rounded-l-full transition-all" style={{ width: `${Math.min((stats.totalInteresM / stats.totalIngresoM) * 100, 100)}%` }} title="Intereses" />
            <div className="bg-orange-400 h-full transition-all" style={{ width: `${Math.min((stats.totalGastoM / stats.totalIngresoM) * 100, 100 - (stats.totalInteresM / stats.totalIngresoM) * 100)}%` }} title="Gastos" />
            <div className="bg-emerald-400 h-full rounded-r-full flex-1 transition-all" title="Libre" />
          </div>
          <div className="flex gap-4 mt-2 text-xs">
            <LegendDot color="bg-red-400" label="Intereses" />
            <LegendDot color="bg-orange-400" label="Gastos" />
            <LegendDot color="bg-emerald-400" label="Libre" />
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Distribución deudas */}
        {pieData.length > 0 && (
          <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-100 dark:border-blue-900/40 p-6 shadow-sm">
            <SectionHeader title="Distribución de deudas" action={() => onNavigate('tabla')} actionLabel="Ver tabla" />
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: '#0f1826', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 8, color: '#f1f5f9' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {pieData.map((d, i) => {
                const total = pieData.reduce((s, x) => s + x.value, 0);
                return (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="flex-1 text-slate-600 dark:text-slate-300 truncate">{d.name}</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{formatCurrency(d.value)}</span>
                    <span className="text-slate-400 dark:text-slate-500 w-10 text-right">{total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Balance mensual */}
        <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-100 dark:border-blue-900/40 p-5 shadow-sm">
          <SectionHeader title="Balance mensual" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a6e" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => formatCurrency(v)} cursor={{ fill: '#162032' }} contentStyle={{ background: '#0f1826', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 8, color: '#f1f5f9' }} />
              <Bar dataKey="valor" radius={[6, 6, 0, 0]} maxBarSize={50}>
                {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Próximos vencimientos */}
      {proximosPagos.length > 0 && (
        <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-100 dark:border-blue-900/40 p-6 shadow-sm">
          <SectionHeader title="Próximos vencimientos (30 días)" action={() => onNavigate('recordatorios')} actionLabel="Ver todos" />
          <div className="space-y-2 mt-3">
            {proximosPagos.map(d => (
              <div key={d.id} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-[#162032] hover:bg-slate-100 dark:hover:bg-[#1e2d42] transition-colors border border-transparent dark:border-blue-900/30">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
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
                <span className="text-sm font-semibold text-slate-800 dark:text-white shrink-0">{formatCurrency(d.saldoCapital)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PageHeader({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{title}</h2>
      {subtitle && <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{subtitle}</p>}
    </div>
  );
}

function SectionHeader({ title, action, actionLabel }) {
  return (
    <div className="flex items-center justify-between mb-1">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
      {action && (
        <button onClick={action} className="text-xs text-emerald-600 dark:text-orange-400 hover:text-emerald-700 dark:hover:text-orange-300 flex items-center gap-0.5 font-medium">
          {actionLabel} <ArrowRight size={12} />
        </button>
      )}
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {label}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, onClick }) {
  const styles = {
    red:    { bg: 'bg-red-50    dark:bg-red-950/20',    border: 'border-red-100    dark:border-red-900/50',    icon: 'text-red-500    bg-red-100    dark:bg-red-900/40    dark:text-red-400',    value: 'text-red-700    dark:text-red-400'    },
    orange: { bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-100 dark:border-orange-900/50', icon: 'text-orange-500 bg-orange-100 dark:bg-orange-900/40 dark:text-orange-400', value: 'text-orange-700 dark:text-orange-400' },
    green:  { bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-100 dark:border-emerald-900/50', icon: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400', value: 'text-emerald-700 dark:text-emerald-400' },
    yellow: { bg: 'bg-amber-50  dark:bg-amber-950/20',  border: 'border-amber-100  dark:border-amber-900/50',  icon: 'text-amber-600  bg-amber-100  dark:bg-amber-900/40  dark:text-amber-400',  value: 'text-amber-700  dark:text-amber-400'  },
    purple: { bg: 'bg-violet-50 dark:bg-violet-950/20', border: 'border-violet-100 dark:border-violet-900/50', icon: 'text-violet-600 bg-violet-100 dark:bg-violet-900/40 dark:text-violet-400', value: 'text-violet-700 dark:text-violet-400' },
    blue:   { bg: 'bg-blue-50   dark:bg-blue-950/20',   border: 'border-blue-100   dark:border-blue-900/50',   icon: 'text-blue-600   bg-blue-100   dark:bg-blue-900/40   dark:text-blue-400',   value: 'text-blue-700   dark:text-blue-400'   },
  };
  const s = styles[color];
  return (
    <div onClick={onClick} className={`${s.bg} border ${s.border} rounded-2xl p-5 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.icon}`}>
          <Icon size={15} />
        </span>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <p className={`text-xl font-bold ${s.value} leading-none`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

function Btn({ onClick, label, primary }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${primary ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-100 dark:bg-[#162032] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#1e2d42]'}`}>
      {label}
    </button>
  );
}
