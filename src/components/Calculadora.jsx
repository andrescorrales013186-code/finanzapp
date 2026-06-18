import { useState } from 'react';
import { formatCurrency, calcularCuotaFija, calcularInteresMensual } from '../utils/calculations';
import { Calculator, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import MoneyInput from './MoneyInput';

export default function Calculadora() {
  const [capital, setCapital] = useState('');
  const [tasa, setTasa] = useState('');
  const [plazo, setPlazo] = useState('');
  const [modo, setModo] = useState('resumen');
  const [resultado, setResultado] = useState(null);

  const calcular = () => {
    const cap = parseFloat(capital);
    const t = parseFloat(tasa);
    const p = parseInt(plazo);
    if (!cap || !t || !p) return;

    const cuota = calcularCuotaFija(cap, t, p);
    const totalPagar = cuota * p;
    const totalInteres = totalPagar - cap;
    const tea = (Math.pow(1 + t / 100, 12) - 1) * 100;

    const tabla = [];
    let saldo = cap;
    let acumInteres = 0;
    let acumAbono = 0;
    for (let i = 1; i <= p; i++) {
      const interes = saldo * (t / 100);
      const abono = cuota - interes;
      saldo = Math.max(saldo - abono, 0);
      acumInteres += interes;
      acumAbono += abono;
      tabla.push({ mes: i, cuota, interes: Math.round(interes), abono: Math.round(abono), saldo: Math.round(saldo), acumInteres: Math.round(acumInteres), acumAbono: Math.round(acumAbono) });
    }

    setResultado({ cuota, totalPagar, totalInteres, tabla, capital: cap, tasa: t, plazo: p, tea });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Calculadora de Crédito</h2>
        <p className="text-slate-500 text-sm mt-0.5">Simula cuotas, intereses y tabla de amortización</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Calculator size={17} className="text-emerald-600" />
          </div>
          <h3 className="font-semibold text-slate-800">Parámetros del crédito</h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Capital ($)</label>
            <MoneyInput value={capital} onChange={setCapital} placeholder="Ej: 5.000.000" className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:border-slate-300 transition-colors w-full" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Tasa mensual (%)</label>
            <input type="number" min="0" step="0.01" placeholder="Ej: 2.5" value={tasa} onChange={e => setTasa(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:border-slate-300 transition-colors" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Plazo (meses)</label>
            <input type="number" min="1" step="1" placeholder="Ej: 24" value={plazo} onChange={e => setPlazo(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:border-slate-300 transition-colors" />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={calcular} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-700 font-medium text-sm shadow-sm">Calcular</button>
          <button onClick={() => { setCapital(''); setTasa(''); setPlazo(''); setResultado(null); }} className="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl hover:bg-slate-200 font-medium text-sm">Limpiar</button>
        </div>
      </div>

      {resultado && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <SCard label="Cuota mensual" value={formatCurrency(resultado.cuota)} color="blue" />
            <SCard label="Total a pagar" value={formatCurrency(resultado.totalPagar)} color="red" />
            <SCard label="Total en intereses" value={formatCurrency(resultado.totalInteres)} color="orange" />
            <SCard label="Costo del dinero" value={`${((resultado.totalInteres/resultado.capital)*100).toFixed(1)}%`} color="purple" />
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-100">
              {[['resumen','Resumen'],['grafica','Gráfica'],['tabla','Tabla amortización']].map(([v,l]) => (
                <button key={v} onClick={() => setModo(v)} className={`flex-1 py-3 text-sm font-medium transition-colors ${modo===v?'text-emerald-700 border-b-2 border-emerald-600 bg-white':'text-slate-500 hover:text-slate-700 bg-slate-50'}`}>{l}</button>
              ))}
            </div>

            {modo === 'resumen' && (
              <div className="p-6 space-y-2.5">
                <Row label="Capital prestado" value={formatCurrency(resultado.capital)} />
                <Row label="Tasa mensual" value={`${resultado.tasa}%`} />
                <Row label="Tasa efectiva anual (TEA)" value={`${resultado.tea.toFixed(2)}%`} />
                <Row label="Plazo" value={`${resultado.plazo} meses`} />
                <Row label="Cuota fija mensual" value={formatCurrency(resultado.cuota)} highlight />
                <Row label="Total pagado" value={formatCurrency(resultado.totalPagar)} />
                <Row label="Total en intereses" value={formatCurrency(resultado.totalInteres)} red />
                <Row label="Costo del dinero" value={`${((resultado.totalInteres/resultado.capital)*100).toFixed(1)}% del capital`} />
                <Row label="Interés 1er mes" value={formatCurrency(calcularInteresMensual(resultado.capital, resultado.tasa))} />
              </div>
            )}

            {modo === 'grafica' && (
              <div className="p-5">
                <p className="text-xs text-slate-500 mb-4">Evolución del saldo vs interés acumulado</p>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={resultado.tabla} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="gSaldo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gInteres" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} label={{ value: 'Mes', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tickFormatter={v => `$${(v/1000000).toFixed(1)}M`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={v => formatCurrency(v)} labelFormatter={v => `Mes ${v}`} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="saldo" name="Saldo pendiente" stroke="#3b82f6" fill="url(#gSaldo)" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="acumInteres" name="Interés acumulado" stroke="#ef4444" fill="url(#gInteres)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {modo === 'tabla' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['Mes','Cuota','Interés','Abono Capital','Saldo Pendiente'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.tabla.map((row, i) => (
                      <tr key={row.mes} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i%2===0?'bg-white':'bg-slate-50/30'}`}>
                        <td className="px-4 py-2.5 font-medium text-slate-600 text-xs">{row.mes}</td>
                        <td className="px-4 py-2.5 text-blue-700 font-medium">{formatCurrency(row.cuota)}</td>
                        <td className="px-4 py-2.5 text-red-600">{formatCurrency(row.interes)}</td>
                        <td className="px-4 py-2.5 text-emerald-600">{formatCurrency(row.abono)}</td>
                        <td className="px-4 py-2.5 text-slate-700 font-medium">{formatCurrency(row.saldo)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-900 text-white">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-xs">TOTAL</td>
                      <td className="px-4 py-3 font-bold text-blue-300">{formatCurrency(resultado.totalPagar)}</td>
                      <td className="px-4 py-3 font-bold text-red-300">{formatCurrency(resultado.totalInteres)}</td>
                      <td className="px-4 py-3 font-bold text-emerald-300">{formatCurrency(resultado.capital)}</td>
                      <td className="px-4 py-3 text-slate-400">—</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {!resultado && (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center shadow-sm">
          <TrendingDown className="mx-auto text-slate-300 mb-3" size={36} />
          <p className="text-slate-400">Ingresa los datos del crédito y presiona <strong>Calcular</strong></p>
        </div>
      )}
    </div>
  );
}

function SCard({ label, value, color }) {
  const c = { blue:'bg-blue-50 border-blue-100 text-blue-700', red:'bg-red-50 border-red-100 text-red-700', orange:'bg-orange-50 border-orange-100 text-orange-700', purple:'bg-violet-50 border-violet-100 text-violet-700' };
  return (
    <div className={`rounded-2xl border p-4 ${c[color]}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-lg font-bold mt-1">{value}</p>
    </div>
  );
}

function Row({ label, value, highlight, red }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-semibold ${highlight?'text-emerald-700':red?'text-red-600':'text-slate-800'}`}>{value}</span>
    </div>
  );
}
