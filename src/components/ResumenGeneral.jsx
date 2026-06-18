import { useMemo, useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import { formatCurrency, calcularInteresMensual } from '../utils/calculations';
import { TrendingUp, TrendingDown, CreditCard, ShoppingCart, Users, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const FREQ_I = { mensual: 1, quincenal: 2, semanal: 4, unico: 1 };
const FREQ_G = { diario: 30, semanal: 4, quincenal: 2, mensual: 1, unico: 0 };
const COLORS  = ['#f97316','#3b82f6','#10b981','#a855f7','#ef4444','#eab308'];

function readProfileData(pid, key) {
  try { return JSON.parse(localStorage.getItem(`finanzapp_${key}_${pid}`)) || []; } catch { return []; }
}

export default function ResumenGeneral() {
  const { profiles } = useProfile();
  const [selected, setSelected] = useState(() => profiles.map(p => p.id));

  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const all    = () => setSelected(profiles.map(p => p.id));
  const none   = () => setSelected([]);

  const perfilStats = useMemo(() => profiles.map((p, i) => {
    const deudas   = readProfileData(p.id, 'deudas');
    const ingresos = readProfileData(p.id, 'ingresos');
    const gastos   = readProfileData(p.id, 'gastos');
    const totalDeuda    = deudas.reduce((s, d) => s + parseFloat(d.saldoCapital || 0), 0);
    const totalInteresM = deudas.reduce((s, d) => s + calcularInteresMensual(parseFloat(d.saldoCapital || 0), parseFloat(d.tasaInteres || 0)), 0);
    const totalIngresoM = ingresos.reduce((s, i) => s + parseFloat(i.monto || 0) * (FREQ_I[i.frecuencia] || 1), 0);
    const totalGastoM   = gastos.reduce((s, g) => s + parseFloat(g.monto || 0) * (FREQ_G[g.frecuencia] || 1), 0);
    const disponible    = totalIngresoM - totalGastoM - totalInteresM;
    return { ...p, totalDeuda, totalInteresM, totalIngresoM, totalGastoM, disponible, color: COLORS[i % COLORS.length] };
  }), [profiles]);

  const activos = perfilStats.filter(p => selected.includes(p.id));

  const totales = useMemo(() => ({
    deuda:    activos.reduce((s, p) => s + p.totalDeuda, 0),
    interesM: activos.reduce((s, p) => s + p.totalInteresM, 0),
    ingresoM: activos.reduce((s, p) => s + p.totalIngresoM, 0),
    gastoM:   activos.reduce((s, p) => s + p.totalGastoM, 0),
    libre:    activos.reduce((s, p) => s + p.disponible, 0),
  }), [activos]);

  const barData = activos.map(p => ({
    name: p.name,
    Ingresos:  p.totalIngresoM,
    Gastos:    p.totalGastoM,
    Intereses: p.totalInteresM,
    Libre:     Math.max(p.disponible, 0),
    color:     p.color,
  }));

  if (profiles.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Resumen general</h2>
        <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-100 dark:border-blue-900/40 p-10 text-center text-slate-400 dark:text-slate-500">
          Crea al menos dos perfiles para ver el resumen combinado.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Resumen general</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Vista consolidada de los perfiles que selecciones</p>
      </div>

      {/* Selector de perfiles */}
      <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-100 dark:border-blue-900/40 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Users size={15} className="text-orange-500"/> Perfiles a incluir
          </p>
          <div className="flex gap-2">
            <button onClick={all}  className="text-xs text-orange-600 dark:text-orange-400 hover:underline">Todos</button>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <button onClick={none} className="text-xs text-slate-400 hover:underline">Ninguno</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {perfilStats.map((p, i) => {
            const active = selected.includes(p.id);
            return (
              <button key={p.id} onClick={() => toggle(p.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${active ? 'border-orange-300 dark:border-orange-700/50 bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400' : 'border-slate-200 dark:border-blue-900/40 bg-slate-50 dark:bg-[#162032] text-slate-500 dark:text-slate-400'}`}
              >
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, display: 'inline-block', flexShrink: 0 }} />
                {p.name}
                {active && <Check size={12} />}
              </button>
            );
          })}
        </div>
      </div>

      {activos.length === 0 ? (
        <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-100 dark:border-blue-900/40 p-10 text-center text-slate-400 dark:text-slate-500">
          Selecciona al menos un perfil para ver el resumen.
        </div>
      ) : (
        <>
          {/* KPIs consolidados */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={TrendingUp}   label="Ingresos / mes"  value={formatCurrency(totales.ingresoM)}  color="green" />
            <KpiCard icon={CreditCard}   label="Deuda total"     value={formatCurrency(totales.deuda)}     color="red"   />
            <KpiCard icon={ShoppingCart} label="Gastos / mes"    value={formatCurrency(totales.gastoM)}    color="orange"/>
            <KpiCard icon={totales.libre >= 0 ? TrendingUp : TrendingDown} label="Flujo libre / mes" value={formatCurrency(totales.libre)} color={totales.libre >= 0 ? 'blue' : 'red'} />
          </div>

          {/* Tabla por perfil */}
          <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-100 dark:border-blue-900/40 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-blue-900/40">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Desglose por perfil</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-[#080d16] border-b border-slate-100 dark:border-blue-900/40">
                  <tr>
                    {['Perfil','Ingresos/mes','Deuda total','Gastos/mes','Interés/mes','Flujo libre'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activos.map((p, i) => (
                    <tr key={p.id} className={`border-b border-slate-50 dark:border-blue-900/30 ${i % 2 === 0 ? 'bg-white dark:bg-[#0f1826]' : 'bg-slate-50/30 dark:bg-[#162032]/30'}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, display: 'inline-block', flexShrink: 0 }} />
                          <span className="font-semibold text-slate-800 dark:text-slate-100">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(p.totalIngresoM)}</td>
                      <td className="px-4 py-3 text-red-600 dark:text-red-400 font-medium">{formatCurrency(p.totalDeuda)}</td>
                      <td className="px-4 py-3 text-orange-600 dark:text-orange-400">{formatCurrency(p.totalGastoM)}</td>
                      <td className="px-4 py-3 text-orange-700 dark:text-orange-400">{formatCurrency(p.totalInteresM)}</td>
                      <td className={`px-4 py-3 font-semibold ${p.disponible >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(p.disponible)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-900 text-white">
                  <tr>
                    <td className="px-4 py-3 font-bold text-sm">TOTAL</td>
                    <td className="px-4 py-3 font-bold text-emerald-300">{formatCurrency(totales.ingresoM)}</td>
                    <td className="px-4 py-3 font-bold text-red-300">{formatCurrency(totales.deuda)}</td>
                    <td className="px-4 py-3 font-bold text-orange-300">{formatCurrency(totales.gastoM)}</td>
                    <td className="px-4 py-3 font-bold text-orange-300">{formatCurrency(totales.interesM)}</td>
                    <td className={`px-4 py-3 font-bold ${totales.libre >= 0 ? 'text-blue-300' : 'text-red-300'}`}>{formatCurrency(totales.libre)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Gráfica comparativa */}
          {activos.length > 1 && (
            <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-100 dark:border-blue-900/40 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Comparativo mensual por perfil</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3a6e" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `$${(v/1000000).toFixed(1)}M`} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background: '#0f1826', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 8, color: '#f1f5f9' }} />
                  <Bar dataKey="Ingresos"  fill="#10b981" radius={[4,4,0,0]} maxBarSize={32} />
                  <Bar dataKey="Gastos"    fill="#f97316" radius={[4,4,0,0]} maxBarSize={32} />
                  <Bar dataKey="Intereses" fill="#ef4444" radius={[4,4,0,0]} maxBarSize={32} />
                  <Bar dataKey="Libre"     fill="#3b82f6" radius={[4,4,0,0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                {[['bg-emerald-500','Ingresos'],['bg-orange-400','Gastos'],['bg-red-500','Intereses'],['bg-blue-500','Flujo libre']].map(([bg, label]) => (
                  <span key={label} className="flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-full ${bg}`}/>{label}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, color }) {
  const c = {
    green:  'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400',
    red:    'bg-red-50    dark:bg-red-950/20    border-red-100    dark:border-red-900/50    text-red-700    dark:text-red-400',
    orange: 'bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/50 text-orange-700 dark:text-orange-400',
    blue:   'bg-blue-50   dark:bg-blue-950/20   border-blue-100   dark:border-blue-900/50   text-blue-700   dark:text-blue-400',
  };
  return (
    <div className={`rounded-2xl border p-5 ${c[color]}`}>
      <div className="flex items-center gap-2 mb-2"><Icon size={14} className="opacity-70"/><p className="text-xs font-medium opacity-70">{label}</p></div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
