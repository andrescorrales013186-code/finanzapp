import { useState } from 'react';
import { Plus, Trash2, Edit2, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';
import MoneyInput from './MoneyInput';

const TIPOS = ['Salario','Freelance','Negocio propio','Arriendo','Pensión','Inversiones','Bono / Comisión','Otro'];
const FRECUENCIAS = [
  { value: 'mensual',   label: 'Mensual',          factor: 1 },
  { value: 'quincenal', label: 'Quincenal',         factor: 2 },
  { value: 'semanal',   label: 'Semanal',           factor: 4 },
  { value: 'unico',     label: 'Único / Irregular', factor: 1 },
];

const emptyForm = { nombre: '', tipo: 'Salario', monto: '', frecuencia: 'mensual', fecha: '', notas: '' };

export default function Ingresos({ ingresos, setIngresos }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Requerido';
    if (!form.monto || parseFloat(form.monto) <= 0) e.monto = 'Monto válido requerido';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (editId) {
      setIngresos(p => p.map(i => i.id === editId ? { ...form, id: editId } : i));
    } else {
      setIngresos(p => [...p, { ...form, id: Date.now().toString() }]);
    }
    reset();
  };

  const reset = () => { setShowForm(false); setEditId(null); setForm(emptyForm); setErrors({}); };
  const handleEdit   = (i) => { setForm({ ...i }); setEditId(i.id); setShowForm(true); setErrors({}); };
  const handleDelete = (id) => { if (confirm('¿Eliminar este ingreso?')) setIngresos(p => p.filter(i => i.id !== id)); };

  const totalMensual = ingresos.reduce((s, i) => s + parseFloat(i.monto || 0) * (FRECUENCIAS.find(f => f.value === i.frecuencia)?.factor || 1), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Ingresos</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Registra tus fuentes de ingreso</p>
        </div>
        <button onClick={() => { reset(); setShowForm(true); }} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 text-sm font-medium shadow-sm">
          <Plus size={16} /> Nuevo ingreso
        </button>
      </div>

      {ingresos.length > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={20} />
          </div>
          <div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Total ingresos mensuales</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(totalMensual)}</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-200 dark:border-blue-900/50 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-5">{editId ? 'Editar ingreso' : 'Nuevo ingreso'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <F label="Descripción" error={errors.nombre}>
                <input type="text" placeholder="Ej: Salario empresa ABC" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} className={inp(errors.nombre)} />
              </F>
              <F label="Tipo">
                <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} className={inp()}>
                  {TIPOS.map(t => <option key={t}>{t}</option>)}
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
              <F label="Fecha de recibo">
                <input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} className={inp()} />
              </F>
            </div>
            <F label="Notas">
              <textarea rows={2} value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} className={inp()} />
            </F>
            {form.monto && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-3 text-sm text-emerald-700 dark:text-emerald-400">
                <strong>Equivalente mensual:</strong> {formatCurrency(parseFloat(form.monto||0) * (FRECUENCIAS.find(f=>f.value===form.frecuencia)?.factor||1))}
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button type="submit" className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 font-medium text-sm">{editId ? 'Actualizar' : 'Guardar'}</button>
              <button type="button" onClick={reset} className="bg-slate-100 dark:bg-[#162032] text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-[#1e2d42] font-medium text-sm">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {ingresos.length === 0 && !showForm && (
          <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-100 dark:border-blue-900/40 p-10 text-center text-slate-400 dark:text-slate-500 shadow-sm">No tienes ingresos registrados.</div>
        )}
        {ingresos.map(i => {
          const factor = FRECUENCIAS.find(f => f.value === i.frecuencia)?.factor || 1;
          return (
            <div key={i.id} className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-100 dark:border-blue-900/40 p-5 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center shrink-0">
                <TrendingUp size={15} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{i.nombre}</span>
                  <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">{i.tipo}</span>
                  <span className="text-xs bg-slate-100 dark:bg-[#162032] text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">{FRECUENCIAS.find(f=>f.value===i.frecuencia)?.label}</span>
                </div>
                <div className="flex gap-4 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  <span>Monto: <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(i.monto)}</strong></span>
                  {factor > 1 && <span>Mensual: <strong className="text-emerald-700 dark:text-emerald-400">{formatCurrency(parseFloat(i.monto||0)*factor)}</strong></span>}
                  {i.fecha && <span>{new Date(i.fecha).toLocaleDateString('es-CO')}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleEdit(i)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"><Edit2 size={14}/></button>
                <button onClick={() => handleDelete(i.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={14}/></button>
              </div>
            </div>
          );
        })}
      </div>
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
