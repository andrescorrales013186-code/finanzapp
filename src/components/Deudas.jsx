import { useState, useMemo } from 'react';
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp, ExternalLink, CreditCard, CheckCircle2, XCircle, Clock, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency, formatPercent, calcularInteresMensual, calcularProximoPago, diasParaProximoPago } from '../utils/calculations';
import ChartTooltip from './ChartTooltip';
import MoneyInput from './MoneyInput';

const TIPOS = ['Tarjeta de crédito','Préstamo personal','Crédito hipotecario','Crédito de vehículo','Crédito de consumo','Libranza','Deuda informal','Factura de servicio','Otro'];
const FRECUENCIAS = [
  { value: 'mensual',          label: 'Mensual'           },
  { value: 'quincenal',        label: 'Quincenal'         },
  { value: 'semanal',          label: 'Semanal'           },
  { value: 'fecha_especifica', label: 'Fecha específica'  },
];

const emptyForm = {
  nombre: '', tipoObligacion: 'Tarjeta de crédito', saldoCapital: '',
  tasaInteres: '', frecuenciaPago: 'mensual', fechaPago: '', fechaInicio: '',
  cuotaMensual: '', numeroCuotas: '', urlPortal: '', urlPSE: '', recordatorio: '3', notas: '',
};

export default function Deudas({ deudas, setDeudas }) {
  const [showForm, setShowForm]         = useState(false);
  const [editId, setEditId]             = useState(null);
  const [form, setForm]                 = useState(emptyForm);
  const [expanded, setExpanded]         = useState(null);
  const [activeTab, setActiveTab]       = useState({});
  const [errors, setErrors]             = useState({});
  const [showPagoModal, setShowPagoModal] = useState(null);
  const [pagoForm, setPagoForm]         = useState({ fechaEsperada: '', fechaPago: new Date().toISOString().split('T')[0], monto: '', pagado: true, notas: '' });

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Requerido';
    if (!form.saldoCapital || parseFloat(form.saldoCapital) < 0) e.saldoCapital = 'Requerido';
    if (!form.tasaInteres || parseFloat(form.tasaInteres) < 0) e.tasaInteres = 'Requerido';
    if (form.frecuenciaPago === 'fecha_especifica' && !form.fechaPago) e.fechaPago = 'Requerido';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (editId) {
      setDeudas(p => p.map(d => d.id === editId ? { ...d, ...form } : d));
    } else {
      setDeudas(p => [...p, { ...form, id: Date.now().toString(), historialPagos: [] }]);
    }
    reset();
  };

  const reset = () => { setShowForm(false); setEditId(null); setForm(emptyForm); setErrors({}); };
  const handleEdit   = (d) => { setForm({ ...emptyForm, ...d }); setEditId(d.id); setShowForm(true); setErrors({}); };
  const handleDelete = (id) => { if (confirm('¿Eliminar esta deuda?')) setDeudas(p => p.filter(d => d.id !== id)); };

  const registrarPago = (deudaId) => {
    setDeudas(p => p.map(d => {
      if (d.id !== deudaId) return d;
      const pago = { id: Date.now().toString(), ...pagoForm, monto: parseFloat(pagoForm.monto) };
      return { ...d, historialPagos: [...(d.historialPagos || []), pago] };
    }));
    setShowPagoModal(null);
    setPagoForm({ fechaEsperada: '', fechaPago: new Date().toISOString().split('T')[0], monto: '', pagado: true, notas: '' });
  };

  const eliminarPago = (deudaId, pagoId) => {
    setDeudas(p => p.map(d => d.id !== deudaId ? d : { ...d, historialPagos: d.historialPagos.filter(p => p.id !== pagoId) }));
  };

  const totalDeuda   = deudas.reduce((s, d) => s + parseFloat(d.saldoCapital || 0), 0);
  const totalInteres = deudas.reduce((s, d) => s + calcularInteresMensual(parseFloat(d.saldoCapital || 0), parseFloat(d.tasaInteres || 0)), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Obligaciones financieras</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Administra tus créditos, préstamos y deudas</p>
        </div>
        <button onClick={() => { reset(); setShowForm(true); }} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 text-sm font-medium shadow-sm">
          <Plus size={16} /> Nueva obligación
        </button>
      </div>

      {deudas.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#0f1826] border border-slate-100 dark:border-blue-900/40 rounded-2xl p-5 shadow-sm">
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#ef4444' }}/>
              <p style={{ fontSize:10, fontWeight:500, color:'var(--color-text-tertiary)', textTransform:'uppercase', letterSpacing:'.07em', margin:0 }}>Total capital adeudado</p>
            </div>
            <p style={{ fontSize:22, fontWeight:500, color:'var(--color-text-primary)', letterSpacing:'-.02em', margin:0 }}>{formatCurrency(totalDeuda)}</p>
          </div>
          <div className="bg-white dark:bg-[#0f1826] border border-slate-100 dark:border-blue-900/40 rounded-2xl p-5 shadow-sm">
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#f97316' }}/>
              <p style={{ fontSize:10, fontWeight:500, color:'var(--color-text-tertiary)', textTransform:'uppercase', letterSpacing:'.07em', margin:0 }}>Interés mensual total</p>
            </div>
            <p style={{ fontSize:22, fontWeight:500, color:'var(--color-text-primary)', letterSpacing:'-.02em', margin:0 }}>{formatCurrency(totalInteres)}</p>
            <p style={{ fontSize:11, color:'var(--color-text-tertiary)', margin:'4px 0 0' }}>{formatCurrency(totalInteres * 12)} al año</p>
          </div>
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-200 dark:border-blue-900/50 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-5">{editId ? 'Editar deuda' : 'Registrar nueva obligación'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <F label="Nombre / Entidad" error={errors.nombre}>
                <input type="text" placeholder="Ej: Banco XYZ - Tarjeta" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} className={inp(errors.nombre)} />
              </F>
              <F label="Tipo de obligación">
                <select value={form.tipoObligacion} onChange={e => setForm(p => ({ ...p, tipoObligacion: e.target.value }))} className={inp()}>
                  {TIPOS.map(t => <option key={t}>{t}</option>)}
                </select>
              </F>
              <F label="Saldo capital ($)" error={errors.saldoCapital}>
                <MoneyInput value={form.saldoCapital} onChange={v => setForm(p => ({ ...p, saldoCapital: v }))} placeholder="0" className={inp(errors.saldoCapital)} />
              </F>
              <F label="Tasa de interés mensual (%)" error={errors.tasaInteres}>
                <input type="number" min="0" step="0.01" placeholder="Ej: 2.5" value={form.tasaInteres} onChange={e => setForm(p => ({ ...p, tasaInteres: e.target.value }))} className={inp(errors.tasaInteres)} />
              </F>
              <F label="Cuota mensual ($) — opcional">
                <MoneyInput value={form.cuotaMensual} onChange={v => setForm(p => ({ ...p, cuotaMensual: v }))} placeholder="0" className={inp()} />
              </F>
              <F label="Número de cuotas — opcional">
                <input
                  type="number" min="1" step="1"
                  placeholder="Ej: 12 (dejar vacío si es indefinido)"
                  value={form.numeroCuotas}
                  onChange={e => {
                    const n = e.target.value;
                    setForm(p => {
                      // Auto-calcular cuota si hay capital y tasa
                      const cap  = parseFloat(p.saldoCapital || 0);
                      const tasa = parseFloat(p.tasaInteres || 0) / 100;
                      let cuota  = p.cuotaMensual;
                      if (n && cap && tasa >= 0) {
                        // Factor por frecuencia: quincenal/semanal ajustan la tasa
                        const factor = p.frecuenciaPago === 'quincenal' ? 0.5 : p.frecuenciaPago === 'semanal' ? 0.25 : 1;
                        const tasaPeriodo = tasa * factor;
                        const intPeriodo  = cap * tasaPeriodo;
                        const capitalCuota = cap / parseInt(n);
                        cuota = Math.round(capitalCuota + intPeriodo).toString();
                      }
                      return { ...p, numeroCuotas: n, cuotaMensual: cuota };
                    });
                  }}
                  className={inp()}
                />
                {form.numeroCuotas && form.saldoCapital && (
                  <p style={{ fontSize:11, color:'var(--color-text-tertiary)', marginTop:4 }}>
                    Cuota estimada: {formatCurrency(parseFloat(form.cuotaMensual || 0))} ·
                    {form.frecuenciaPago === 'quincenal' ? ` cada 15 días` : form.frecuenciaPago === 'semanal' ? ` semanal` : ` mensual`}
                  </p>
                )}
              </F>
              <F label="Frecuencia de pago">
                <select value={form.frecuenciaPago} onChange={e => setForm(p => ({ ...p, frecuenciaPago: e.target.value }))} className={inp()}>
                  {FRECUENCIAS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </F>
              {form.frecuenciaPago === 'fecha_especifica' ? (
                <F label="Fecha de pago" error={errors.fechaPago}>
                  <input type="date" value={form.fechaPago} onChange={e => setForm(p => ({ ...p, fechaPago: e.target.value }))} className={inp(errors.fechaPago)} />
                </F>
              ) : (
                <F label="Fecha primer pago">
                  <input type="date" value={form.fechaInicio} onChange={e => setForm(p => ({ ...p, fechaInicio: e.target.value }))} className={inp()} />
                </F>
              )}
              <F label="Recordar (días antes del vencimiento)">
                <select value={form.recordatorio} onChange={e => setForm(p => ({ ...p, recordatorio: e.target.value }))} className={inp()}>
                  {[['0','No recordar'],['1','1 día antes'],['3','3 días antes'],['5','5 días antes'],['7','1 semana antes'],['15','2 semanas antes']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </F>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-1">
              <F label="Portal del banco (URL para pagar)">
                <div className="flex gap-2">
                  <input type="url" placeholder="https://banco.com/pagar" value={form.urlPortal} onChange={e => setForm(p => ({ ...p, urlPortal: e.target.value }))} className={`${inp()} flex-1`} />
                  {form.urlPortal && <a href={form.urlPortal} target="_blank" rel="noopener noreferrer" className="p-2 border border-slate-200 dark:border-blue-900/50 rounded-lg hover:bg-slate-50 dark:hover:bg-[#162032] text-slate-500 dark:text-slate-400"><ExternalLink size={15} /></a>}
                </div>
              </F>
              <F label="Link PSE (pago en línea)">
                <div className="flex gap-2">
                  <input type="url" placeholder="https://pse.com.co/pagar" value={form.urlPSE} onChange={e => setForm(p => ({ ...p, urlPSE: e.target.value }))} className={`${inp()} flex-1`} />
                  {form.urlPSE && <a href={form.urlPSE} target="_blank" rel="noopener noreferrer" className="p-2 border border-slate-200 dark:border-blue-900/50 rounded-lg hover:bg-slate-50 dark:hover:bg-[#162032] text-slate-500 dark:text-slate-400"><ExternalLink size={15} /></a>}
                </div>
              </F>
            </div>

            <F label="Notas">
              <textarea rows={2} value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} className={inp()} />
            </F>

            {form.saldoCapital && form.tasaInteres && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl p-3 text-sm text-amber-800 dark:text-amber-400 grid grid-cols-2 gap-2">
                <div><span className="text-amber-600 dark:text-amber-500">Interés mensual:</span> <strong>{formatCurrency(calcularInteresMensual(parseFloat(form.saldoCapital || 0), parseFloat(form.tasaInteres || 0)))}</strong></div>
                <div><span className="text-amber-600 dark:text-amber-500">Interés anual:</span> <strong>{formatCurrency(calcularInteresMensual(parseFloat(form.saldoCapital || 0), parseFloat(form.tasaInteres || 0)) * 12)}</strong></div>
                <div><span className="text-amber-600 dark:text-amber-500">TEA:</span> <strong>{((Math.pow(1 + parseFloat(form.tasaInteres || 0) / 100, 12) - 1) * 100).toFixed(2)}%</strong></div>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="submit" className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 font-medium text-sm">{editId ? 'Actualizar' : 'Guardar'}</button>
              <button type="button" onClick={reset} className="bg-slate-100 dark:bg-[#162032] text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-[#1e2d42] font-medium text-sm">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Lista deudas */}
      <div className="space-y-3">
        {deudas.length === 0 && !showForm && (
          <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-100 dark:border-blue-900/40 p-10 text-center text-slate-400 dark:text-slate-500 shadow-sm">No tienes deudas registradas.</div>
        )}
        {deudas.map(d => <DeudaCard key={d.id} d={d} expanded={expanded} activeTab={activeTab} setExpanded={setExpanded} setActiveTab={setActiveTab} handleEdit={handleEdit} handleDelete={handleDelete} setShowPagoModal={setShowPagoModal} setPagoForm={setPagoForm} eliminarPago={eliminarPago} totalDeuda={totalDeuda} />)}
      </div>

      {/* Modal registrar pago */}
      {showPagoModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white dark:bg-[#0f1826] rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-sm shadow-xl max-h-[92vh] overflow-y-auto border-t border-blue-900/30">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Registrar pago</h3>
            <div className="space-y-3">
              <F label="Monto pagado ($)">
                <MoneyInput value={pagoForm.monto} onChange={v => setPagoForm(p => ({ ...p, monto: v }))} placeholder="0" className={inp()} />
              </F>
              <F label="Fecha del pago">
                <input type="date" value={pagoForm.fechaPago} onChange={e => setPagoForm(p => ({ ...p, fechaPago: e.target.value }))} className={inp()} />
              </F>
              <F label="Fecha esperada (opcional)">
                <input type="date" value={pagoForm.fechaEsperada} onChange={e => setPagoForm(p => ({ ...p, fechaEsperada: e.target.value }))} className={inp()} />
              </F>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={pagoForm.pagado} onChange={e => setPagoForm(p => ({ ...p, pagado: e.target.checked }))} className="w-4 h-4 accent-emerald-600" />
                  <span className="text-sm text-slate-700 dark:text-slate-200">Marcado como pagado</span>
                </label>
              </div>
              <F label="Notas">
                <input type="text" value={pagoForm.notas} onChange={e => setPagoForm(p => ({ ...p, notas: e.target.value }))} className={inp()} />
              </F>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => registrarPago(showPagoModal)} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700">Guardar pago</button>
              <button onClick={() => setShowPagoModal(null)} className="flex-1 bg-slate-100 dark:bg-[#162032] text-slate-700 dark:text-slate-200 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-[#1e2d42]">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DeudaCard({ d, expanded, activeTab, setExpanded, setActiveTab, handleEdit, handleDelete, setShowPagoModal, setPagoForm, eliminarPago, totalDeuda }) {
  const interesMensual = calcularInteresMensual(parseFloat(d.saldoCapital || 0), parseFloat(d.tasaInteres || 0));
  const proxFecha = d.frecuenciaPago === 'fecha_especifica' ? new Date(d.fechaPago) : calcularProximoPago(d.frecuenciaPago, d.fechaInicio);
  const dias    = diasParaProximoPago(proxFecha);
  const isOpen  = expanded === d.id;
  const tab     = activeTab[d.id] || 'detalle';
  const pagados = (d.historialPagos || []).filter(p => p.pagado).length;
  const perdidos= (d.historialPagos || []).filter(p => !p.pagado).length;
  const pct     = totalDeuda > 0 ? ((parseFloat(d.saldoCapital || 0) / totalDeuda) * 100).toFixed(1) : 0;

  const chartData = (d.historialPagos || []).slice(-6).map(p => ({
    fecha: p.fechaPago ? new Date(p.fechaPago).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' }) : p.fechaEsperada ? new Date(p.fechaEsperada).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' }) : '?',
    monto: parseFloat(p.monto || 0),
    pagado: p.pagado,
  }));

  return (
    <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-100 dark:border-blue-900/40 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-slate-100 dark:bg-[#162032] rounded-xl flex items-center justify-center shrink-0">
            <CreditCard size={16} className="text-slate-600 dark:text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-800 dark:text-white truncate">{d.nombre}</span>
              <span className="text-xs bg-slate-100 dark:bg-[#162032] text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">{d.tipoObligacion}</span>
              {dias >= 0 && dias <= 5 && <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">⚠ Vence en {dias}d</span>}
              {perdidos > 0 && <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">{perdidos} pago{perdidos>1?'s':''} pendiente{perdidos>1?'s':''}</span>}
            </div>
            <div className="flex items-center gap-4 mt-1 flex-wrap">
              <span className="text-xs text-slate-500 dark:text-slate-400">Capital: <strong className="text-slate-700 dark:text-slate-200">{formatCurrency(d.saldoCapital)}</strong></span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Interés: <strong className="text-slate-600 dark:text-slate-300">{formatPercent(d.tasaInteres)}/mes</strong></span>
              <span className="text-xs text-slate-400 dark:text-slate-500">{pct}% del total</span>
            </div>
            <div className="mt-2 h-1 bg-slate-100 dark:bg-[#162032] rounded-full overflow-hidden">
              <div className="h-full bg-orange-400 rounded-full" style={{ width: `${Math.min(parseFloat(pct), 100)}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-1 ml-1 shrink-0">
            {d.urlPSE && <a href={d.urlPSE} target="_blank" rel="noopener noreferrer" className="p-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 px-2">PSE</a>}
            {d.urlPortal && <a href={d.urlPortal} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"><ExternalLink size={14} /></a>}
            <button onClick={() => handleEdit(d)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"><Edit2 size={14} /></button>
            <button onClick={() => handleDelete(d.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={14} /></button>
            <button onClick={() => setExpanded(isOpen ? null : d.id)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#162032] rounded-lg">
              {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-slate-100 dark:border-blue-900/40">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 dark:border-blue-900/40 bg-slate-50 dark:bg-[#080d16]">
            {[['detalle','Detalle'],['pagos','Historial pagos'],['grafica','Gráfica']].map(([v, l]) => (
              <button key={v} onClick={() => setActiveTab(p => ({ ...p, [d.id]: v }))} className={`flex-1 py-2 text-xs font-medium transition-colors ${
                tab === v
                  ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-500 bg-white dark:bg-[#0f1826]'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}>
                {l}
              </button>
            ))}
          </div>

          {/* Tab: Detalle */}
          {tab === 'detalle' && (
            <div className="p-5 grid sm:grid-cols-3 gap-3">
              <Info label="Interés mensual"    value={formatCurrency(interesMensual)} />
              <Info label="Interés anual"      value={formatCurrency(interesMensual * 12)} />
              <Info label="TEA"                value={`${((Math.pow(1 + parseFloat(d.tasaInteres||0)/100, 12)-1)*100).toFixed(2)}%`} />
              {d.cuotaMensual && <Info label="Cuota mensual"   value={formatCurrency(d.cuotaMensual)} />}
              <Info label="Frecuencia"         value={FRECUENCIAS.find(f=>f.value===d.frecuenciaPago)?.label||d.frecuenciaPago} />
              <Info label="Próximo pago"       value={proxFecha.toLocaleDateString('es-CO')} />
              <Info label="Días restantes"     value={dias>=0?`${dias} días`:'Vencido'} highlight={dias<=3} />
              <Info label="% del total deuda"  value={`${pct}%`} />
              {d.recordatorio > 0 && <Info label="Recordatorio" value={`${d.recordatorio} días antes`} />}
              {d.notas && <div className="sm:col-span-3"><Info label="Notas" value={d.notas} /></div>}
              {d.urlPortal && <div className="sm:col-span-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Portal bancario</p>
                <a href={d.urlPortal} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">{d.urlPortal} <ExternalLink size={10}/></a>
              </div>}
              {d.urlPSE && <div className="sm:col-span-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Enlace PSE</p>
                <a href={d.urlPSE} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">{d.urlPSE} <ExternalLink size={10}/></a>
              </div>}
            </div>
          )}

          {/* Tab: Pagos */}
          {tab === 'pagos' && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-4 text-xs">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={12}/> {pagados} realizados</span>
                  <span className="flex items-center gap-1 text-red-500 dark:text-red-400"><XCircle size={12}/> {perdidos} no realizados</span>
                </div>
                <button onClick={() => { setShowPagoModal(d.id); setPagoForm(p => ({ ...p, monto: d.cuotaMensual || '' })); }} className="flex items-center gap-1 text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700">
                  <Plus size={12}/> Registrar pago
                </button>
              </div>
              {(d.historialPagos || []).length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No hay pagos registrados.</p>
              ) : (
                <div className="space-y-2">
                  {[...(d.historialPagos || [])].reverse().map(p => (
                    <div key={p.id} className={`flex items-center gap-3 p-4 rounded-xl border text-sm ${
                      p.pagado
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40'
                        : 'bg-red-50    dark:bg-red-950/20    border-red-100    dark:border-red-900/40'
                    }`}>
                      {p.pagado ? <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0"/> : <XCircle size={15} className="text-red-500 dark:text-red-400 shrink-0"/>}
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-slate-700 dark:text-slate-200">{formatCurrency(p.monto)}</span>
                        {p.fechaPago && <span className="text-slate-500 dark:text-slate-400 ml-2 text-xs">{new Date(p.fechaPago).toLocaleDateString('es-CO')}</span>}
                        {p.notas && <span className="text-slate-400 dark:text-slate-500 ml-2 text-xs">· {p.notas}</span>}
                      </div>
                      <button onClick={() => eliminarPago(d.id, p.id)} className="p-1 text-slate-300 dark:text-slate-600 hover:text-red-500 rounded"><Trash2 size={12}/></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Gráfica */}
          {tab === 'grafica' && (
            <div className="p-5">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Últimos 6 pagos registrados</p>
              {chartData.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">Registra pagos para ver la gráfica.</p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e3a6e" vertical={false} />
                    <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="monto" radius={[4,4,0,0]} maxBarSize={40}>
                      {chartData.map((entry, i) => <Cell key={i} fill={entry.pagado ? '#10b981' : '#ef4444'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
              <div className="flex gap-4 mt-1 text-xs text-slate-500 dark:text-slate-400 justify-center">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Pagado</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> No pagado</span>
              </div>
            </div>
          )}
        </div>
      )}
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

function Info({ label, value, highlight }) {
  return (
    <div>
      <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
      <p className={`text-sm font-semibold mt-0.5 ${highlight ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}`}>{value}</p>
    </div>
  );
}

function inp(error) {
  return `w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
    error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'
  }`;
}
