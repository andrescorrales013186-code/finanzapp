import { useState } from 'react';
import { formatCurrency, calcularCuotaFija, calcularInteresMensual } from '../utils/calculations';
import { Calculator, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import MoneyInput from './MoneyInput';
import ChartTooltip from './ChartTooltip';

export default function Calculadora() {
  const [capital, setCapital] = useState('');
  const [tasa, setTasa]       = useState('');
  const [plazo, setPlazo]     = useState('');
  const [tabMode, setTabMode] = useState('credito'); // 'credito' | 'basica'
  const [modo, setModo]       = useState('resumen'); // tabs internos crédito
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
    <div className="space-y-5">
      <div>
        <h2 style={{ fontSize:22, fontWeight:500, color:'var(--color-text-primary)', letterSpacing:'-.02em', margin:0 }}>Calculadora</h2>
        <p style={{ fontSize:12, color:'var(--color-text-tertiary)', marginTop:4 }}>Simulador de crédito y calculadora básica</p>
      </div>

      {/* Tabs principales */}
      <div style={{ display:'flex', gap:8 }}>
        {[['credito','Crédito'],['basica','Calculadora básica']].map(([v,l]) => (
          <button key={v} onClick={() => setTabMode(v)}
            style={{
              padding:'7px 16px', borderRadius:20, fontSize:13, fontWeight:500, cursor:'pointer', border:'0.5px solid',
              background: tabMode === v ? '#f97316' : 'var(--color-background-primary)',
              color: tabMode === v ? '#fff' : 'var(--color-text-secondary)',
              borderColor: tabMode === v ? '#f97316' : 'var(--color-border-tertiary)',
            }}
          >{l}</button>
        ))}
      </div>

      {/* CALCULADORA BÁSICA */}
      {tabMode === 'basica' && <CalculadoraBasica />}

      {/* SIMULADOR DE CRÉDITO */}
      {tabMode !== 'basica' && <>

      <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-100 dark:border-blue-900/40 p-6 shadow-sm">
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#f97316' }}/>
          <h3 style={{ fontSize:13, fontWeight:500, color:'var(--color-text-primary)', margin:0 }}>Parámetros del crédito</h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Capital ($)</label>
            <MoneyInput value={capital} onChange={setCapital} placeholder="Ej: 5.000.000" className="border border-slate-200 dark:border-blue-900/50 dark:bg-[#162032] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 hover:border-slate-300 transition-colors w-full dark:text-white" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Tasa mensual (%)</label>
            <input type="number" min="0" step="0.01" placeholder="Ej: 2.5" value={tasa} onChange={e => setTasa(e.target.value)} className="border border-slate-200 dark:border-blue-900/50 dark:bg-[#162032] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 hover:border-slate-300 transition-colors dark:text-white" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Plazo (meses)</label>
            <input type="number" min="1" step="1" placeholder="Ej: 24" value={plazo} onChange={e => setPlazo(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:border-slate-300 transition-colors" />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={calcular} style={{ background:'#f97316', color:'#fff', padding:'8px 20px', borderRadius:10, border:'none', fontWeight:500, fontSize:14, cursor:'pointer' }}>Calcular</button>
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
                    <Tooltip content={<ChartTooltip labelFormat={v => `Mes ${v}`} />} />
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
        <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-100 dark:border-blue-900/40 p-10 text-center shadow-sm">
          <TrendingDown className="mx-auto text-slate-300 mb-3" size={36} />
          <p style={{ fontSize:13, color:'var(--color-text-tertiary)' }}>Ingresa los datos del crédito y presiona <strong>Calcular</strong></p>
        </div>
      )}
      </>}
    </div>
  );
}

function SCard({ label, value, color }) {
  const dots = { blue:'#3b82f6', red:'#ef4444', orange:'#f97316', purple:'#8b5cf6' };
  return (
    <div className="bg-white dark:bg-[#0f1826] border border-slate-100 dark:border-blue-900/40 rounded-2xl p-4 shadow-sm">
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
        <div style={{ width:5, height:5, borderRadius:'50%', background: dots[color] || '#f97316' }}/>
        <p style={{ fontSize:10, fontWeight:500, color:'var(--color-text-tertiary)', textTransform:'uppercase', letterSpacing:'.07em', margin:0 }}>{label}</p>
      </div>
      <p style={{ fontSize:18, fontWeight:500, color:'var(--color-text-primary)', margin:0 }}>{value}</p>
    </div>
  );
}

function Row({ label, value, highlight, red }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'0.5px solid var(--color-border-tertiary)' }} className="last:border-0">
      <span style={{ fontSize:13, color:'var(--color-text-secondary)' }}>{label}</span>
      <span style={{ fontSize:13, fontWeight:500, color: highlight ? '#f97316' : red ? '#ef4444' : 'var(--color-text-primary)' }}>{value}</span>
    </div>
  );
}

// ── CALCULADORA BÁSICA ────────────────────────────────────────────────────
function CalculadoraBasica() {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev]       = useState(null);
  const [op, setOp]           = useState(null);
  const [reset, setReset]     = useState(false);

  const press = (val) => {
    if (display.length >= 12 && !reset) return;
    if (reset) { setDisplay(val === '.' ? '0.' : val); setReset(false); return; }
    if (val === '.') {
      if (display.includes('.')) return;
      setDisplay(display + '.');
      return;
    }
    setDisplay(display === '0' ? val : display + val);
  };

  const operate = (nextOp) => {
    const cur = parseFloat(display);
    if (prev !== null && op && !reset) {
      const res = calc(prev, cur, op);
      setDisplay(fmt(res));
      setPrev(res);
    } else {
      setPrev(cur);
    }
    setOp(nextOp);
    setReset(true);
  };

  const calc = (a, b, o) => {
    if (o === '+') return a + b;
    if (o === '-') return a - b;
    if (o === '×') return a * b;
    if (o === '÷') return b !== 0 ? a / b : 0;
    return b;
  };

  const fmt = (n) => {
    if (Math.abs(n) >= 1e12) return 'Error';
    const s = parseFloat(n.toFixed(8)).toString();
    return s;
  };

  const equal = () => {
    if (prev === null || !op) return;
    const res = calc(prev, parseFloat(display), op);
    setDisplay(fmt(res));
    setPrev(null); setOp(null); setReset(true);
  };

  const clear = () => { setDisplay('0'); setPrev(null); setOp(null); setReset(false); };
  const pct   = () => setDisplay(fmt(parseFloat(display) / 100));
  const neg   = () => setDisplay(fmt(parseFloat(display) * -1));

  const btn = (label, onClick, type = 'num') => {
    const colors = {
      fn:  { bg:'var(--color-background-secondary)', color:'var(--color-text-primary)' },
      op:  { bg:'#f97316', color:'#fff' },
      eq:  { bg:'#f97316', color:'#fff' },
      num: { bg:'var(--color-background-primary)', color:'var(--color-text-primary)', border:'0.5px solid var(--color-border-tertiary)' },
    };
    const s = colors[type] || colors.num;
    return (
      <button onClick={onClick} style={{
        padding:'18px', borderRadius:12, fontSize:18, fontWeight:500,
        cursor:'pointer', border: s.border || 'none',
        background:s.bg, color:s.color, transition:'opacity .1s',
      }}
        onMouseDown={e => e.currentTarget.style.opacity = '.7'}
        onMouseUp={e => e.currentTarget.style.opacity = '1'}
      >{label}</button>
    );
  };

  return (
    <div className="bg-white dark:bg-[#0f1826] border border-slate-100 dark:border-blue-900/40 rounded-2xl shadow-sm overflow-hidden" style={{ maxWidth:340 }}>
      {/* Display */}
      <div style={{ padding:'20px 20px 12px', textAlign:'right', background:'var(--color-background-secondary)' }}>
        <div style={{ fontSize:11, color:'var(--color-text-tertiary)', minHeight:16, marginBottom:4 }}>
          {prev !== null ? `${prev} ${op || ''}` : ''}
        </div>
        <div style={{ fontSize:36, fontWeight:300, color:'var(--color-text-primary)', letterSpacing:'-.02em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {parseFloat(display).toLocaleString('es-CO', { maximumFractionDigits: 8 })}
        </div>
      </div>
      {/* Teclado */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, padding:12 }}>
        {btn('C',   clear, 'fn')}
        {btn('+/-', neg,   'fn')}
        {btn('%',   pct,   'fn')}
        {btn('÷',   () => operate('÷'), 'op')}
        {btn('7', () => press('7'))}
        {btn('8', () => press('8'))}
        {btn('9', () => press('9'))}
        {btn('×', () => operate('×'), 'op')}
        {btn('4', () => press('4'))}
        {btn('5', () => press('5'))}
        {btn('6', () => press('6'))}
        {btn('-', () => operate('-'), 'op')}
        {btn('1', () => press('1'))}
        {btn('2', () => press('2'))}
        {btn('3', () => press('3'))}
        {btn('+', () => operate('+'), 'op')}
        {/* 0 ocupa 2 columnas */}
        <button onClick={() => press('0')} style={{ gridColumn:'span 2', padding:'18px', borderRadius:12, fontSize:18, fontWeight:500, cursor:'pointer', border:'0.5px solid var(--color-border-tertiary)', background:'var(--color-background-primary)', color:'var(--color-text-primary)', textAlign:'left', paddingLeft:24 }}>0</button>
        {btn('.', () => press('.'))}
        {btn('=', equal, 'eq')}
      </div>
    </div>
  );
}
