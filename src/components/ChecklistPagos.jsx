import { useState, useMemo } from 'react';
import {
  CheckCircle2, Circle, ChevronDown, ChevronUp,
  AlertCircle, TrendingDown, X, Plus, Coffee, Home, ShoppingCart,
} from 'lucide-react';
import { formatCurrency, calcularInteresMensual, calcularProximoPago, diasParaProximoPago } from '../utils/calculations';
import MoneyInput from './MoneyInput';

const CATEGORIAS_FIJO = [
  'Arriendo / Vivienda','Servicios públicos','Alimentación','Transporte',
  'Salud','Educación','Mascotas','Seguros','Crédito / Cuota','Otro',
];
const CATEGORIAS_HORMIGA = [
  'Café / Bebidas','Snacks / Antojos','Comidas rápidas','Entretenimiento',
  'Aplicaciones / Suscripciones','Ropa / Accesorios','Belleza / Cuidado personal',
  'Cigarrillos / Vaping','Apuestas / Lotería','Compras impulsivas','Otro',
];
const FREQ_FACTOR = { diario: 30, semanal: 4, quincenal: 2, mensual: 1, unico: 0 };
const FREQ_ING    = { mensual: 1, quincenal: 2, semanal: 4, unico: 1 };

const mesKey     = (y, m) => `${y}-${String(m + 1).padStart(2, '0')}`;
const hoy        = () => new Date().toISOString().split('T')[0];
const getMensualG = (g) => parseFloat(g.monto || 0) * (g.frecuencia === 'unico' ? 1 : (FREQ_FACTOR[g.frecuencia] ?? 1));
const pagoMes    = (item, key) => (item.historialPagos || []).find(p => p.mesClave === key);

const emptyGasto = { descripcion: '', tipo: 'fijo', categoria: 'Arriendo / Vivienda', monto: '', notas: '' };

export default function ChecklistPagos({ deudas, setDeudas, ingresos, gastos, setGastos }) {
  const ahora = new Date();
  const [anio,         setAnio]         = useState(ahora.getFullYear());
  const [mes,          setMes]          = useState(ahora.getMonth());
  const [modal,        setModal]        = useState(null);
  const [form,         setForm]         = useState({});
  const [expandido,    setExpandido]    = useState(null);
  const [tabGastos,    setTabGastos]    = useState('fijo');
  const [showFG,       setShowFG]       = useState(false);
  const [formGasto,    setFormGasto]    = useState(emptyGasto);
  const [errsGasto,    setErrsGasto]    = useState({});

  const clave     = mesKey(anio, mes);
  const nombreMes = new Date(anio, mes).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

  /* ── Ingresos totales ── */
  const totalIngresos = useMemo(() =>
    (ingresos || []).reduce((s, i) => s + parseFloat(i.monto || 0) * (FREQ_ING[i.frecuencia] || 1), 0),
  [ingresos]);

  /* ── Filas obligaciones ── */
  const filas = useMemo(() => deudas.map(d => {
    const capital    = parseFloat(d.saldoCapital || 0);
    const tasa       = parseFloat(d.tasaInteres  || 0);
    const interesMes = calcularInteresMensual(capital, tasa);
    const cuota      = parseFloat(d.cuotaMensual || 0);
    const proxFecha  = d.frecuenciaPago === 'fecha_especifica'
      ? new Date(d.fechaPago)
      : calcularProximoPago(d.frecuenciaPago, d.fechaInicio);
    const dias = diasParaProximoPago(proxFecha);
    const pago = pagoMes(d, clave);
    return { ...d, capital, tasa, interesMes, cuota, proxFecha, dias, pago };
  }), [deudas, clave]);

  const totales = useMemo(() => ({
    totalCapital:   filas.reduce((s, f) => s + f.capital, 0),
    totalInteres:   filas.reduce((s, f) => s + f.interesMes, 0),
    totalCuota:     filas.reduce((s, f) => s + f.cuota, 0),
    pagados:        filas.filter(f => f.pago?.pagado).length,
    total:          filas.length,
    abonoCapTotal:  filas.reduce((s, f) => s + parseFloat(f.pago?.abonoCapital || 0), 0),
    pagadoMes:      filas.filter(f => f.pago?.pagado).reduce((s, f) => s + parseFloat(f.pago?.montoPagado || 0), 0),
  }), [filas]);

  /* ── Gastos enriquecidos ── */
  const gastosCP = useMemo(() => (gastos || []).map(g => ({
    ...g, pago: pagoMes(g, clave), montoMes: getMensualG(g),
  })), [gastos, clave]);

  const gastosFijosCP   = useMemo(() => gastosCP.filter(g => !g.esHormiga), [gastosCP]);
  const gastosHormigaCP = useMemo(() => gastosCP.filter(g =>  g.esHormiga), [gastosCP]);
  const totalGasPagados = useMemo(() =>
    gastosCP.filter(g => g.pago?.pagado).reduce((s, g) => s + parseFloat(g.pago?.montoPagado || 0), 0),
  [gastosCP]);

  /* ── Presupuesto ── */
  const totalUsado = totales.pagadoMes + totalGasPagados;
  const disponible = totalIngresos - totalUsado;
  const oblPct     = totalIngresos > 0 ? Math.min((totales.pagadoMes  / totalIngresos) * 100, 100) : 0;
  const gasPct     = totalIngresos > 0 ? Math.min((totalGasPagados    / totalIngresos) * 100, 100) : 0;
  const usadoPct   = oblPct + gasPct;

  /* ── Navegación ── */
  const cambiarMes = (d) => {
    let m = mes + d, a = anio;
    if (m < 0)  { m = 11; a--; }
    if (m > 11) { m = 0;  a++; }
    setMes(m); setAnio(a);
  };

  /* ── Obligaciones: pagar / desmarcar ── */
  const abrirModal = (fila) => {
    const cuota = fila.cuota || fila.interesMes;
    setForm({
      fechaPago:    hoy(),
      montoPagado:  String(Math.round(cuota)),
      interesMes:   String(Math.round(fila.interesMes)),
      abonoCapital: String(Math.max(Math.round(cuota - fila.interesMes), 0)),
      notas: '',
    });
    setModal(fila);
  };

  const recalcular = (campo, valor) => {
    setForm(prev => {
      const next = { ...prev, [campo]: valor };
      if (campo === 'montoPagado')
        next.abonoCapital = String(Math.max(Math.round(parseFloat(valor||0) - parseFloat(next.interesMes||0)), 0));
      return next;
    });
  };

  const guardarPago = () => {
    if (!modal) return;
    const montoPagado  = parseFloat(form.montoPagado  || 0);
    const interesMes   = parseFloat(form.interesMes   || 0);
    const abonoCapital = parseFloat(form.abonoCapital || 0);
    const saldoAnterior = modal.capital;
    const nuevoSaldo    = Math.max(saldoAnterior - abonoCapital, 0);
    const reg = { id: Date.now().toString(), mesClave: clave, fechaPago: form.fechaPago, montoPagado, interesMes, abonoCapital, saldoAnterior, nuevoSaldo, pagado: true, notas: form.notas };
    setDeudas(prev => prev.map(d => {
      if (d.id !== modal.id) return d;
      return { ...d, saldoCapital: nuevoSaldo.toString(), historialPagos: [...(d.historialPagos||[]).filter(p => p.mesClave !== clave), reg] };
    }));
    setModal(null);
  };

  const desmarcarDeuda = (fila) => {
    if (!confirm(`¿Revertir el pago de ${fila.nombre} para ${nombreMes}? El saldo volverá a ${formatCurrency(fila.pago.saldoAnterior)}.`)) return;
    setDeudas(prev => prev.map(d => {
      if (d.id !== fila.id) return d;
      return { ...d, saldoCapital: fila.pago.saldoAnterior.toString(), historialPagos: (d.historialPagos||[]).filter(p => p.mesClave !== clave) };
    }));
  };

  /* ── Gastos: marcar / desmarcar ── */
  const marcarGastoPagado = (g) => {
    const reg = { id: Date.now().toString(), mesClave: clave, fechaPago: hoy(), montoPagado: g.montoMes, pagado: true };
    setGastos(prev => prev.map(x => x.id !== g.id ? x : { ...x, historialPagos: [...(x.historialPagos||[]).filter(p => p.mesClave !== clave), reg] }));
  };

  const desmarcarGasto = (g) => {
    setGastos(prev => prev.map(x => x.id !== g.id ? x : { ...x, historialPagos: (x.historialPagos||[]).filter(p => p.mesClave !== clave) }));
  };

  /* ── Guardar gasto rápido ── */
  const guardarGastoRapido = () => {
    const errs = {};
    if (!formGasto.descripcion.trim()) errs.descripcion = 'Requerido';
    if (!formGasto.monto || parseFloat(formGasto.monto) <= 0) errs.monto = 'Monto válido requerido';
    if (Object.keys(errs).length) { setErrsGasto(errs); return; }
    const esHormiga = formGasto.tipo === 'hormiga';
    const monto     = parseFloat(formGasto.monto);
    const nuevo = {
      id: Date.now().toString(),
      descripcion: formGasto.descripcion, categoria: formGasto.categoria,
      monto: formGasto.monto, frecuencia: 'mensual', fecha: hoy(),
      notas: formGasto.notas, esHormiga,
      historialPagos: [{ id: (Date.now()+1).toString(), mesClave: clave, fechaPago: hoy(), montoPagado: monto, pagado: true }],
    };
    setGastos(prev => [...prev, nuevo]);
    setShowFG(false); setFormGasto(emptyGasto); setErrsGasto({});
  };

  const pct = totales.total > 0 ? (totales.pagados / totales.total) * 100 : 0;
  const listaActiva = tabGastos === 'fijo' ? gastosFijosCP : gastosHormigaCP;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Checklist de Pagos</h2>
        <p className="text-slate-500 text-sm mt-0.5">Registra pagos y gastos del mes — el disponible se actualiza en tiempo real</p>
      </div>

      {/* Selector de mes */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
        <button onClick={() => cambiarMes(-1)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 font-bold text-lg">&lsaquo;</button>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-800 capitalize">{nombreMes}</p>
          <p className="text-xs text-slate-400">
            {totales.pagados}/{totales.total} obligaciones · {gastosCP.filter(g=>g.pago?.pagado).length}/{gastosCP.length} gastos
          </p>
        </div>
        <button onClick={() => cambiarMes(1)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 font-bold text-lg">&rsaquo;</button>
      </div>

      {/* Banner presupuesto */}
      {totalIngresos > 0 && (
        <div className={`rounded-2xl border p-5 shadow-sm ${disponible < 0 ? 'bg-red-50 border-red-200' : disponible < totalIngresos * 0.15 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-100'}`}>
          <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ingresos del mes</p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalIngresos)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Disponible</p>
              <p className={`text-2xl font-bold ${disponible < 0 ? 'text-red-600' : disponible < totalIngresos * 0.15 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {formatCurrency(disponible)}
              </p>
            </div>
          </div>

          {/* Barra apilada */}
          <div className="h-4 bg-white/70 rounded-full overflow-hidden flex mb-3 border border-white/50">
            {oblPct > 0 && <div className="h-full bg-red-400 transition-all duration-500" style={{ width: `${oblPct}%` }} title="Obligaciones pagadas" />}
            {gasPct  > 0 && <div className="h-full bg-orange-400 transition-all duration-500" style={{ width: `${gasPct}%` }} title="Gastos registrados" />}
          </div>

          <div className="flex flex-wrap gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block"/>
              <span className="text-slate-600">Obligaciones: <strong>{formatCurrency(totales.pagadoMes)}</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block"/>
              <span className="text-slate-600">Gastos: <strong>{formatCurrency(totalGasPagados)}</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block"/>
              <span className="text-slate-600">Libre: <strong>{(100 - Math.min(usadoPct, 100)).toFixed(0)}%</strong></span>
            </span>
          </div>

          {disponible < 0 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-red-700 bg-red-100 rounded-xl px-3 py-2">
              <AlertCircle size={13}/>
              Los pagos superan los ingresos en <strong className="ml-1">{formatCurrency(Math.abs(disponible))}</strong>
            </div>
          )}
        </div>
      )}

      {/* Progreso obligaciones */}
      {deudas.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span className="font-medium text-slate-700">Progreso obligaciones</span>
            <span>{pct.toFixed(0)}% completado</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${pct===100?'bg-emerald-500':pct>=50?'bg-blue-500':'bg-amber-400'}`} style={{ width: `${pct}%` }}/>
          </div>
        </div>
      )}

      {/* Mini-cards */}
      {deudas.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MiniCard label="Capital total actual" value={formatCurrency(totales.totalCapital)} color="red"/>
          <MiniCard label="Interés del mes" value={formatCurrency(totales.totalInteres)} color="orange"/>
          <MiniCard label="Total cuotas mes" value={formatCurrency(totales.totalCuota)} color="blue"/>
          <MiniCard label="Abono a capital" value={formatCurrency(totales.abonoCapTotal)} color="green" sub={totales.abonoCapTotal>0?'acumulado este mes':'sin abono aún'}/>
        </div>
      )}

      {/* ══ OBLIGACIONES ══ */}
      <div>
        <h3 className="font-semibold text-slate-700 text-sm mb-3">Obligaciones financieras</h3>
        {deudas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400 shadow-sm">No tienes obligaciones registradas.</div>
        ) : (
          <div className="space-y-3">
            {filas.map(fila => {
              const pagado   = !!fila.pago?.pagado;
              const isOpen   = expandido === fila.id;
              const hayAbono = parseFloat(fila.pago?.abonoCapital || 0) > 0;
              return (
                <div key={fila.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${pagado?'border-emerald-200':fila.dias<=3?'border-red-200':'border-slate-100'}`}>
                  <div className="flex items-center gap-3 p-5">
                    <button
                      onClick={() => pagado ? desmarcarDeuda(fila) : abrirModal(fila)}
                      className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${pagado?'bg-emerald-100 text-emerald-600 hover:bg-emerald-200':'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                      {pagado ? <CheckCircle2 size={18}/> : <Circle size={18}/>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-semibold text-sm ${pagado?'text-emerald-700':'text-slate-800'}`}>{fila.nombre}</span>
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{fila.tipoObligacion}</span>
                        {pagado && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">✓ Pagado{hayAbono?' + capital':''}</span>}
                        {!pagado && fila.dias<=3 && fila.dias>=0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">⚠ Vence en {fila.dias}d</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-slate-500">
                        <span>Capital: <strong className={pagado?'text-emerald-600':'text-red-600'}>{formatCurrency(fila.capital)}</strong></span>
                        <span>Interés/mes: <strong className="text-orange-600">{formatCurrency(fila.interesMes)}</strong></span>
                        {fila.cuota>0 && <span>Cuota: <strong className="text-blue-600">{formatCurrency(fila.cuota)}</strong></span>}
                        <span>Vence: {fila.proxFecha.toLocaleDateString('es-CO')}</span>
                      </div>
                      {pagado && hayAbono && (
                        <div className="mt-1.5 flex items-center gap-2 text-xs">
                          <span className="text-slate-400 line-through">{formatCurrency(fila.pago.saldoAnterior)}</span>
                          <span className="text-emerald-600 font-bold">→ {formatCurrency(fila.pago.nuevoSaldo)}</span>
                          <span className="text-emerald-500">(−{formatCurrency(fila.pago.abonoCapital)} capital)</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!pagado && (
                        <button onClick={() => abrirModal(fila)} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 font-medium whitespace-nowrap">
                          Registrar pago
                        </button>
                      )}
                      <button onClick={() => setExpandido(isOpen ? null : fila.id)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">
                        {isOpen ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
                      </button>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50 p-5">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Historial de pagos</p>
                      {(fila.historialPagos||[]).length===0 ? (
                        <p className="text-xs text-slate-400">Sin pagos registrados.</p>
                      ) : (
                        <div className="space-y-2">
                          {[...(fila.historialPagos||[])].reverse().map((p,i) => (
                            <div key={p.id||i} className="flex items-start gap-3 p-3 rounded-xl border text-xs bg-emerald-50 border-emerald-100">
                              <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0"/>
                              <div className="flex-1 space-y-0.5">
                                <div className="flex gap-3 flex-wrap">
                                  <span className="font-semibold text-slate-700">{formatCurrency(p.montoPagado)}</span>
                                  <span className="text-slate-500">{p.fechaPago ? new Date(p.fechaPago).toLocaleDateString('es-CO') : '—'}</span>
                                  {p.mesClave && <span className="text-slate-400">{p.mesClave}</span>}
                                </div>
                                <div className="flex gap-3 flex-wrap text-slate-500">
                                  {p.interesMes>0    && <span>Interés: {formatCurrency(p.interesMes)}</span>}
                                  {p.abonoCapital>0  && <span className="text-emerald-600 font-medium">Capital: −{formatCurrency(p.abonoCapital)}</span>}
                                  {p.nuevoSaldo!==undefined && <span>Nuevo saldo: {formatCurrency(p.nuevoSaldo)}</span>}
                                </div>
                                {p.notas && <p className="text-slate-400 italic">{p.notas}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══ GASTOS DEL MES ══ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
            <ShoppingCart size={15} className="text-orange-500"/>
            Gastos del mes
          </h3>
          <button
            onClick={() => { setShowFG(true); setFormGasto(emptyGasto); setErrsGasto({}); }}
            className="flex items-center gap-1.5 text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 font-medium"
          >
            <Plus size={12}/> Nuevo gasto
          </button>
        </div>

        {/* Formulario rápido */}
        {showFG && (
          <div className="bg-white border border-orange-200 rounded-2xl p-5 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-800 text-sm">Agregar gasto del mes</h4>
              <button onClick={() => setShowFG(false)} className="text-slate-400 hover:text-slate-600"><X size={15}/></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <CF label="Descripción" error={errsGasto.descripcion}>
                <input type="text" placeholder="Ej: Arriendo, café…" value={formGasto.descripcion}
                  onChange={e => setFormGasto(p=>({...p, descripcion: e.target.value}))} className={inpF(errsGasto.descripcion)}/>
              </CF>
              <CF label="Tipo">
                <select value={formGasto.tipo}
                  onChange={e => setFormGasto(p=>({...p, tipo: e.target.value, categoria: e.target.value==='hormiga' ? 'Café / Bebidas' : 'Arriendo / Vivienda'}))}
                  className={inpF()}>
                  <option value="fijo">Gasto fijo</option>
                  <option value="hormiga">Gasto hormiga</option>
                </select>
              </CF>
              <CF label="Categoría">
                <select value={formGasto.categoria}
                  onChange={e => setFormGasto(p=>({...p, categoria: e.target.value}))} className={inpF()}>
                  {(formGasto.tipo==='hormiga' ? CATEGORIAS_HORMIGA : CATEGORIAS_FIJO).map(c=><option key={c}>{c}</option>)}
                </select>
              </CF>
              <CF label="Monto ($)" error={errsGasto.monto}>
                <MoneyInput value={formGasto.monto} onChange={v=>setFormGasto(p=>({...p,monto:v}))} placeholder="0" className={inpF(errsGasto.monto)}/>
              </CF>
            </div>
            <div className="mt-3">
              <CF label="Notas (opcional)">
                <input type="text" placeholder="Referencia u observación…" value={formGasto.notas}
                  onChange={e => setFormGasto(p=>({...p,notas:e.target.value}))} className={inpF()}/>
              </CF>
            </div>
            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-emerald-500"/>
              Se guardará en el módulo de Gastos y quedará marcado como pagado en {nombreMes}.
            </p>
            <div className="flex gap-3 mt-4">
              <button onClick={guardarGastoRapido} className="bg-orange-500 text-white px-5 py-2 rounded-xl hover:bg-orange-600 font-medium text-sm">
                Guardar y marcar pagado
              </button>
              <button onClick={()=>setShowFG(false)} className="bg-slate-100 text-slate-700 px-5 py-2 rounded-xl hover:bg-slate-200 font-medium text-sm">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Tabs fijos / hormiga */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100">
            <TabG active={tabGastos==='fijo'} onClick={()=>setTabGastos('fijo')} icon={<Home size={13}/>}
              label="Gastos Fijos" total={gastosFijosCP.length}
              pagados={gastosFijosCP.filter(g=>g.pago?.pagado).length} color="orange"/>
            <TabG active={tabGastos==='hormiga'} onClick={()=>setTabGastos('hormiga')} icon={<Coffee size={13}/>}
              label="Gastos Hormiga" total={gastosHormigaCP.length}
              pagados={gastosHormigaCP.filter(g=>g.pago?.pagado).length} color="violet"/>
          </div>

          <div className="p-4">
            {listaActiva.length === 0 ? (
              <div className="text-center text-slate-400 text-sm py-6">
                No hay {tabGastos==='fijo'?'gastos fijos':'gastos hormiga'} registrados.
                <br/>
                <button onClick={()=>{ setFormGasto(p=>({...p, tipo: tabGastos, categoria: tabGastos==='hormiga'?'Café / Bebidas':'Arriendo / Vivienda'})); setShowFG(true); }}
                  className="text-orange-600 underline text-xs mt-1">Agregar uno ahora</button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {listaActiva.map(g => {
                  const pagado = !!g.pago?.pagado;
                  const isH    = g.esHormiga;
                  return (
                    <div key={g.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${pagado?(isH?'bg-violet-50 border-violet-200':'bg-orange-50 border-orange-200'):'bg-white border-slate-100 hover:border-slate-200'}`}
                    >
                      <button
                        onClick={() => pagado ? desmarcarGasto(g) : marcarGastoPagado(g)}
                        className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${pagado?(isH?'bg-violet-200 text-violet-700':'bg-orange-200 text-orange-700'):'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                        title={pagado?'Clic para desmarcar':'Marcar como pagado'}
                      >
                        {pagado ? <CheckCircle2 size={15}/> : <Circle size={15}/>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-medium text-sm ${pagado?(isH?'text-violet-700':'text-orange-700'):'text-slate-800'}`}>{g.descripcion}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${isH?'bg-violet-100 text-violet-600':'bg-orange-100 text-orange-600'}`}>{g.categoria}</span>
                          {pagado && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">✓</span>}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Mensual: <strong className={pagado?(isH?'text-violet-600':'text-orange-600'):'text-slate-700'}>{formatCurrency(g.montoMes)}</strong>
                          {g.frecuencia!=='mensual' && g.frecuencia!=='unico' && <span className="text-slate-400 ml-1">({g.frecuencia})</span>}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {listaActiva.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-3 flex justify-between text-xs text-slate-500 bg-slate-50">
              <span>Total mensual: <strong className="text-slate-700">{formatCurrency(listaActiva.reduce((s,g)=>s+g.montoMes,0))}</strong></span>
              <span>Pagado: <strong className={tabGastos==='hormiga'?'text-violet-600':'text-orange-600'}>{formatCurrency(listaActiva.filter(g=>g.pago?.pagado).reduce((s,g)=>s+parseFloat(g.pago?.montoPagado||0),0))}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Modal obligación */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden max-h-[92vh] overflow-y-auto">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Registrar pago</p>
                <h3 className="font-bold text-white">{modal.nombre}</h3>
              </div>
              <button onClick={()=>setModal(null)} className="text-slate-400 hover:text-white"><X size={18}/></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-3">
                <IR label="Saldo capital" value={formatCurrency(modal.capital)} color="text-red-600"/>
                <IR label="Interés del mes" value={formatCurrency(modal.interesMes)} color="text-orange-600"/>
                <IR label="Cuota sugerida" value={modal.cuota>0?formatCurrency(modal.cuota):'—'} color="text-blue-600"/>
                <IR label="Mes" value={nombreMes} color="text-slate-700"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <C label="Fecha del pago">
                  <input type="date" value={form.fechaPago} onChange={e=>setForm(p=>({...p,fechaPago:e.target.value}))} className={iCls}/>
                </C>
                <C label="Monto total ($)">
                  <MoneyInput value={form.montoPagado} onChange={v=>recalcular('montoPagado',v)} placeholder="0" className={iCls}/>
                </C>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Desglose del pago</p>
                <div className="grid grid-cols-2 gap-4">
                  <C label="Porción de interés ($)">
                    <MoneyInput value={form.interesMes} onChange={v=>setForm(p=>({...p,interesMes:v}))} placeholder="0" className={iCls}/>
                  </C>
                  <C label="Abono a capital ($)">
                    <MoneyInput value={form.abonoCapital} onChange={v=>setForm(p=>({...p,abonoCapital:v}))} placeholder="0" className={iCls}/>
                  </C>
                </div>
                {parseFloat(form.abonoCapital||0) > 0 && (
                  <div className="bg-white border border-emerald-200 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingDown size={16} className="text-emerald-600 shrink-0"/>
                      <span className="text-slate-600">Nuevo saldo capital:</span>
                      <span className="font-bold text-emerald-700 ml-auto">{formatCurrency(Math.max(modal.capital-parseFloat(form.abonoCapital||0),0))}</span>
                    </div>
                    <div className="mt-2">
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{width:`${Math.min((parseFloat(form.abonoCapital||0)/modal.capital)*100,100)}%`}}/>
                      </div>
                      <p className="text-right text-xs text-emerald-600 mt-0.5">
                        {modal.capital>0?((parseFloat(form.abonoCapital||0)/modal.capital)*100).toFixed(2):0}% del capital
                      </p>
                    </div>
                  </div>
                )}
                {parseFloat(form.abonoCapital||0) === 0 && (
                  <p className="text-xs text-amber-600 flex items-center gap-1.5"><AlertCircle size={12}/> Solo cubre interés. El capital no se reduce.</p>
                )}
              </div>
              <C label="Notas (opcional)">
                <input type="text" placeholder="Referencia, banco…" value={form.notas} onChange={e=>setForm(p=>({...p,notas:e.target.value}))} className={iCls}/>
              </C>
            </div>
            <div className="px-5 pb-5 flex gap-3">
              <button onClick={guardarPago} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 flex items-center justify-center gap-2">
                <CheckCircle2 size={16}/> Guardar pago
              </button>
              <button onClick={()=>setModal(null)} className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-medium text-sm hover:bg-slate-200">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Auxiliares ── */
function MiniCard({ label, value, color, sub }) {
  const c = { red:'bg-red-50 border-red-100 text-red-700', orange:'bg-orange-50 border-orange-100 text-orange-700', blue:'bg-blue-50 border-blue-100 text-blue-700', green:'bg-emerald-50 border-emerald-100 text-emerald-700' };
  return (
    <div className={`rounded-2xl border p-4 ${c[color]}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-lg font-bold mt-1">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
  );
}

function IR({ label, value, color }) {
  return <div><p className="text-xs text-slate-400">{label}</p><p className={`font-bold text-sm ${color}`}>{value}</p></div>;
}

function C({ label, children }) {
  return <div className="flex flex-col gap-1"><label className="text-xs font-medium text-slate-500">{label}</label>{children}</div>;
}

function CF({ label, children, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      {children}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

function TabG({ active, onClick, icon, label, total, pagados, color }) {
  const cls = { orange: active?'text-orange-700 border-b-2 border-orange-500 bg-white':'text-slate-500 hover:text-orange-600', violet: active?'text-violet-700 border-b-2 border-violet-500 bg-white':'text-slate-500 hover:text-violet-600' };
  return (
    <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${cls[color]}`}>
      {icon} {label}
      {total > 0 && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${active?(color==='orange'?'bg-orange-100 text-orange-700':'bg-violet-100 text-violet-700'):'bg-slate-100 text-slate-500'}`}>
          {pagados}/{total}
        </span>
      )}
    </button>
  );
}

const iCls  = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:border-slate-300 transition-colors bg-white';
const inpF  = (err) => `w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors ${err?'border-red-300 bg-red-50':'border-slate-200 bg-white hover:border-slate-300'}`;
