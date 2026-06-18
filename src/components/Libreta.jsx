import { useState, useMemo } from 'react';
import {
  BookOpen, ShoppingCart, FileText, Sparkles, Plus, Trash2,
  ChevronLeft, Check, Pencil, X, Tag, Bell, BellOff,
} from 'lucide-react';
import { requestNotificationPermission, getPermissionState } from '../utils/notifications';
import { formatCurrency, calcularInteresMensual } from '../utils/calculations';

// ── Helpers ──────────────────────────────────────────────────────────────────

const FREQ_I = { mensual: 1, quincenal: 2, semanal: 4, unico: 1 };
const FREQ_G = { diario: 30, semanal: 4, quincenal: 2, mensual: 1, unico: 0 };

function calcDisponible(ingresos, gastos, deudas) {
  const ing = ingresos.reduce((s, i) => s + parseFloat(i.monto || 0) * (FREQ_I[i.frecuencia] || 1), 0);
  const gas = gastos.reduce((s, g) => s + parseFloat(g.monto || 0) * (FREQ_G[g.frecuencia] || 1), 0);
  const int = deudas.reduce((s, d) => s + calcularInteresMensual(parseFloat(d.saldoCapital || 0), parseFloat(d.tasaInteres || 0)), 0);
  return ing - gas - int;
}

function newId() {
  return 'n_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
}

function formatFecha(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const TIPO_META = {
  libre:         { label: 'Libre',        Icon: FileText,     colorChip: 'bg-blue-500/10 text-blue-400 border-blue-500/20',    colorSel: 'border-blue-500 bg-blue-500/10',    colorIcon: 'text-blue-400'    },
  compras:       { label: 'Compras',      Icon: ShoppingCart, colorChip: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', colorSel: 'border-emerald-500 bg-emerald-500/10', colorIcon: 'text-emerald-400' },
  personalizado: { label: 'Personalizado',Icon: Sparkles,     colorChip: 'bg-violet-500/10 text-violet-400 border-violet-500/20',  colorSel: 'border-violet-500 bg-violet-500/10',  colorIcon: 'text-violet-400'  },
};

// ── Vista: Lista de notas ─────────────────────────────────────────────────────

function VistaLista({ apuntes, onNueva, onAbrir, onEliminar }) {
  const [confirmId, setConfirmId] = useState(null);

  const sorted = [...apuntes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (confirmId === id) { onEliminar(id); setConfirmId(null); }
    else { setConfirmId(id); setTimeout(() => setConfirmId(c => c === id ? null : c), 3000); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500/15 rounded-xl flex items-center justify-center">
            <BookOpen size={18} className="text-orange-400" />
          </div>
          <h2 className="text-slate-800 dark:text-white font-bold text-lg">Libreta de apuntes</h2>
        </div>
        <button
          onClick={onNueva}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-orange-500/20"
        >
          <Plus size={15} /> Nueva nota
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen size={28} className="text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-semibold text-base">Sin apuntes todavía</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Crea tu primera nota con el botón de arriba</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {sorted.map(nota => {
            const meta = TIPO_META[nota.tipo] || TIPO_META.libre;
            const label = nota.tipo === 'personalizado' ? nota.tipoNombre : meta.label;
            const preview = nota.tipo === 'compras'
              ? `${nota.items?.length || 0} ítem${nota.items?.length !== 1 ? 's' : ''}${nota.items?.some(i => i.precio) ? ' · ' + formatCurrency(nota.items.reduce((s, i) => s + (parseFloat(i.precio || 0) * (parseFloat(i.cantidad) || 1)), 0)) : ''}`
              : (nota.contenido || '').slice(0, 80) || 'Sin contenido';
            const isConfirm = confirmId === nota.id;
            return (
              <div
                key={nota.id}
                onClick={() => !isConfirm && onAbrir(nota.id)}
                className="bg-white dark:bg-[#0f1826] border border-slate-100 dark:border-blue-900/40 rounded-2xl p-4 shadow-sm cursor-pointer hover:border-orange-500/30 dark:hover:border-orange-500/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${meta.colorChip}`}>
                    {label}
                  </span>
                  <button
                    onClick={e => handleDelete(e, nota.id)}
                    className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${isConfirm ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'}`}
                    title={isConfirm ? 'Toca de nuevo para confirmar' : 'Eliminar'}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <p className="font-semibold text-slate-800 dark:text-white text-sm mb-1 truncate">{nota.titulo}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed">{preview}</p>
                <p className="text-slate-400 dark:text-slate-600 text-xs mt-2">{formatFecha(nota.updatedAt)}</p>
                {isConfirm && <p className="text-red-400 text-xs mt-1 font-medium">Toca el ícono rojo para confirmar</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Vista: Nueva nota ─────────────────────────────────────────────────────────

function VistaNueva({ onVolver, onCreate }) {
  const [tipo, setTipo] = useState(null);
  const [tipoNombre, setTipoNombre] = useState('');
  const [titulo, setTitulo] = useState('');

  const tipos = [
    { id: 'libre',         label: 'Libre',         Icon: FileText,     desc: 'Escribe libremente'         },
    { id: 'compras',       label: 'Compras',        Icon: ShoppingCart, desc: 'Lista con presupuesto'      },
    { id: 'personalizado', label: 'Personalizado',  Icon: Sparkles,     desc: 'Elige el nombre del tipo'   },
  ];

  const canCreate = tipo && titulo.trim() && (tipo !== 'personalizado' || tipoNombre.trim());

  const handleCreate = () => {
    if (!canCreate) return;
    const now = new Date().toISOString();
    const base = {
      id: newId(),
      tipo,
      tipoNombre: tipo === 'personalizado' ? tipoNombre.trim() : TIPO_META[tipo].label,
      titulo: titulo.trim(),
      createdAt: now,
      updatedAt: now,
    };
    onCreate(tipo === 'compras'
      ? { ...base, items: [], saldoConfig: 'app', saldoManual: '' }
      : { ...base, contenido: '' }
    );
  };

  return (
    <div>
      <button onClick={onVolver} className="flex items-center gap-2 text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm mb-6 transition-colors">
        <ChevronLeft size={16} /> Volver
      </button>
      <h2 className="text-slate-800 dark:text-white font-bold text-xl mb-6">Nueva nota</h2>

      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Tipo de nota</p>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {tipos.map(({ id, label, Icon, desc }) => {
          const meta = TIPO_META[id];
          const isSelected = tipo === id;
          return (
            <button
              key={id}
              onClick={() => setTipo(id)}
              className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                isSelected ? meta.colorSel : 'border-slate-200 dark:border-blue-900/40 bg-white dark:bg-[#0f1826] hover:border-slate-300 dark:hover:border-blue-700/50'
              }`}
            >
              <Icon size={26} className={isSelected ? meta.colorIcon : 'text-slate-400'} />
              <span className={`text-xs font-bold text-center leading-tight ${isSelected ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-300'}`}>{label}</span>
              <span className="text-[10px] text-slate-400 text-center leading-tight hidden sm:block">{desc}</span>
            </button>
          );
        })}
      </div>

      {tipo === 'personalizado' && (
        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
            <Tag size={11} /> Nombre del tipo
          </label>
          <input
            type="text" value={tipoNombre} onChange={e => setTipoNombre(e.target.value)}
            placeholder="Ej: Trabajo, Ideas, Recetas..." maxLength={30} autoFocus
            className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-blue-900/50 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-orange-500/60"
          />
        </div>
      )}

      <div className="mb-6">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Título de la nota</label>
        <input
          type="text" value={titulo} onChange={e => setTitulo(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
          placeholder="Dale un nombre a tu nota..." maxLength={60}
          className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-blue-900/50 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-orange-500/60"
        />
      </div>

      <button
        onClick={handleCreate} disabled={!canCreate}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl text-sm transition-colors shadow-lg shadow-orange-500/20"
      >
        Crear nota
      </button>
    </div>
  );
}

// ── Vista: Detalle Libre / Personalizado ──────────────────────────────────────

function VistaLibre({ nota, onVolver, onChange }) {
  const [editTitle, setEditTitle] = useState(false);
  const [titulo, setTitulo] = useState(nota.titulo);
  const meta = TIPO_META[nota.tipo] || TIPO_META.libre;

  const saveTitle = () => {
    const t = titulo.trim();
    if (t) onChange({ titulo: t });
    else setTitulo(nota.titulo);
    setEditTitle(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onVolver} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors flex-shrink-0">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          {editTitle ? (
            <input
              autoFocus type="text" value={titulo}
              onChange={e => setTitulo(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setTitulo(nota.titulo); setEditTitle(false); } }}
              className="w-full bg-transparent border-b-2 border-orange-500 text-slate-800 dark:text-white font-bold text-lg focus:outline-none pb-0.5"
              maxLength={60}
            />
          ) : (
            <button onClick={() => setEditTitle(true)} className="flex items-center gap-2 group w-full text-left min-w-0">
              <span className="text-slate-800 dark:text-white font-bold text-lg truncate">{nota.titulo}</span>
              <Pencil size={13} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors flex-shrink-0" />
            </button>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full border mt-1 inline-block ${meta.colorChip}`}>
            {nota.tipo === 'personalizado' ? nota.tipoNombre : meta.label}
          </span>
        </div>
      </div>

      <textarea
        value={nota.contenido}
        onChange={e => onChange({ contenido: e.target.value })}
        placeholder="Escribe aquí tus apuntes..."
        className="w-full bg-slate-50 dark:bg-[#0a1120] border border-slate-100 dark:border-blue-900/30 rounded-2xl p-5 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-orange-500/40 resize-none leading-relaxed"
        style={{ minHeight: '50vh' }}
      />
      <p className="text-xs text-slate-400 dark:text-slate-600 mt-2 text-right">{(nota.contenido || '').length} caracteres</p>
      <RecordatorioSection nota={nota} onChange={onChange} />
    </div>
  );
}

// ── Vista: Detalle Compras ────────────────────────────────────────────────────

function VistaCompras({ nota, onVolver, onChange, disponible }) {
  const [editTitle, setEditTitle] = useState(false);
  const [titulo, setTitulo] = useState(nota.titulo);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaCant, setNuevaCant] = useState('1');
  const [nuevoPrecio, setNuevoPrecio] = useState('');

  const items = nota.items || [];

  const totalLista = items.reduce((s, it) => s + parseFloat(it.precio || 0) * (parseFloat(it.cantidad) || 1), 0);
  const totalComprado = items.filter(it => it.comprado).reduce((s, it) => s + parseFloat(it.precio || 0) * (parseFloat(it.cantidad) || 1), 0);

  const saldoBase = nota.saldoConfig === 'app' ? disponible
    : nota.saldoConfig === 'manual' ? parseFloat(nota.saldoManual || 0)
    : null;
  const restante = saldoBase !== null ? saldoBase - totalLista : null;

  const saveTitle = () => {
    const t = titulo.trim();
    if (t) onChange({ titulo: t });
    else setTitulo(nota.titulo);
    setEditTitle(false);
  };

  const addItem = () => {
    if (!nuevoNombre.trim()) return;
    const item = {
      id: newId(),
      nombre: nuevoNombre.trim(),
      cantidad: parseFloat(nuevaCant) || 1,
      precio: nuevoPrecio !== '' ? parseFloat(nuevoPrecio) : null,
      comprado: false,
    };
    onChange({ items: [...items, item] });
    setNuevoNombre(''); setNuevaCant('1'); setNuevoPrecio('');
  };

  const toggleItem = id => onChange({ items: items.map(it => it.id === id ? { ...it, comprado: !it.comprado } : it) });
  const removeItem = id => onChange({ items: items.filter(it => it.id !== id) });

  const SALDO_OPTS = [
    { id: 'app',     label: 'Saldo de la app'  },
    { id: 'manual',  label: 'Monto manual'      },
    { id: 'ninguno', label: 'Sin saldo'         },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onVolver} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors flex-shrink-0">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          {editTitle ? (
            <input
              autoFocus type="text" value={titulo}
              onChange={e => setTitulo(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setTitulo(nota.titulo); setEditTitle(false); } }}
              className="w-full bg-transparent border-b-2 border-orange-500 text-slate-800 dark:text-white font-bold text-lg focus:outline-none pb-0.5"
              maxLength={60}
            />
          ) : (
            <button onClick={() => setEditTitle(true)} className="flex items-center gap-2 group w-full text-left min-w-0">
              <span className="text-slate-800 dark:text-white font-bold text-lg truncate">{nota.titulo}</span>
              <Pencil size={13} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors flex-shrink-0" />
            </button>
          )}
          <span className="text-xs px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 mt-1 inline-block">Compras</span>
        </div>
      </div>

      {/* Presupuesto */}
      <div className="bg-white dark:bg-[#0f1826] border border-slate-100 dark:border-blue-900/40 rounded-2xl p-4 mb-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Presupuesto</p>
        <div className="flex gap-2 mb-3">
          {SALDO_OPTS.map(opt => (
            <button
              key={opt.id}
              onClick={() => onChange({ saldoConfig: opt.id })}
              className={`flex-1 text-xs font-semibold py-2.5 px-1 rounded-xl border transition-all ${
                nota.saldoConfig === opt.id
                  ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                  : 'border-slate-200 dark:border-blue-900/50 text-slate-500 dark:text-slate-400 hover:border-orange-400 hover:text-orange-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {nota.saldoConfig === 'manual' && (
          <input
            type="number" value={nota.saldoManual}
            onChange={e => onChange({ saldoManual: e.target.value })}
            placeholder="Ingresa el monto disponible"
            className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-blue-900/50 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-orange-500/60 mb-3"
          />
        )}

        {saldoBase !== null && (
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 dark:bg-[#162032] rounded-xl p-3 text-center">
              <p className="text-[10px] text-slate-400 mb-1 leading-tight">Disponible</p>
              <p className="text-sm font-bold text-emerald-400 leading-tight">{formatCurrency(saldoBase)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-[#162032] rounded-xl p-3 text-center">
              <p className="text-[10px] text-slate-400 mb-1 leading-tight">Total lista</p>
              <p className="text-sm font-bold text-orange-400 leading-tight">{formatCurrency(totalLista)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-[#162032] rounded-xl p-3 text-center">
              <p className="text-[10px] text-slate-400 mb-1 leading-tight">Restante</p>
              <p className={`text-sm font-bold leading-tight ${restante >= 0 ? 'text-slate-800 dark:text-white' : 'text-red-400'}`}>{formatCurrency(restante)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Agregar ítem */}
      <div className="bg-white dark:bg-[#0f1826] border border-slate-100 dark:border-blue-900/40 rounded-2xl p-4 mb-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Agregar ítem</p>
        <div className="flex gap-2 mb-2">
          <input
            type="text" value={nuevoNombre}
            onChange={e => setNuevoNombre(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder="Nombre del producto"
            className="flex-1 bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-blue-900/50 rounded-xl px-3 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-orange-500/60"
          />
          <input
            type="number" value={nuevaCant}
            onChange={e => setNuevaCant(e.target.value)}
            placeholder="x1" min="1"
            className="w-16 bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-blue-900/50 rounded-xl px-2 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-orange-500/60 text-center"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="number" value={nuevoPrecio}
            onChange={e => setNuevoPrecio(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder="Precio (opcional)"
            className="flex-1 bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-blue-900/50 rounded-xl px-3 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-orange-500/60"
          />
          <button
            onClick={addItem} disabled={!nuevoNombre.trim()}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white px-4 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center gap-1.5"
          >
            <Plus size={16} /> Añadir
          </button>
        </div>
      </div>

      {/* Lista de ítems */}
      <RecordatorioSection nota={nota} onChange={onChange} />

      {items.length === 0 ? (
        <div className="text-center py-10">
          <ShoppingCart size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-400 dark:text-slate-500">Agrega ítems a tu lista</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0f1826] border border-slate-100 dark:border-blue-900/40 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-blue-900/30 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Lista · {items.length} ítem{items.length !== 1 ? 's' : ''}
            </p>
            {totalComprado > 0 && (
              <span className="text-xs text-emerald-400 font-semibold">✓ {formatCurrency(totalComprado)}</span>
            )}
          </div>
          <div className="divide-y divide-slate-50 dark:divide-blue-900/20">
            {items.map(item => (
              <div key={item.id} className={`flex items-center gap-3 px-4 py-3.5 transition-opacity ${item.comprado ? 'opacity-55' : ''}`}>
                <button
                  onClick={() => toggleItem(item.id)}
                  className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all active:scale-90 ${
                    item.comprado ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400'
                  }`}
                >
                  {item.comprado && <Check size={14} className="text-white" strokeWidth={3} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium text-slate-800 dark:text-white ${item.comprado ? 'line-through' : ''}`}>
                    {item.cantidad > 1 ? `x${item.cantidad} ` : ''}{item.nombre}
                  </p>
                  {item.precio != null && (
                    <p className="text-xs text-orange-400 font-semibold mt-0.5">
                      {formatCurrency(item.precio * (item.cantidad || 1))}
                      {item.cantidad > 1 && <span className="text-slate-400 font-normal"> ({formatCurrency(item.precio)} c/u)</span>}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sección de recordatorio (reutilizable) ────────────────────────────────────

function RecordatorioSection({ nota, onChange }) {
  const [permiso, setPermiso] = useState(getPermissionState());
  const rec = nota.recordatorio || { activo: false, fecha: '', hora: '08:00', mensaje: '' };

  const pedirPermiso = async () => {
    const result = await requestNotificationPermission();
    setPermiso(result);
  };

  const updateRec = (cambios) => onChange({ recordatorio: { ...rec, ...cambios } });

  const hoy = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white dark:bg-[#0f1826] border border-slate-100 dark:border-blue-900/40 rounded-2xl p-4 shadow-sm mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-orange-400" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recordatorio</p>
        </div>
        <button
          onClick={() => updateRec({ activo: !rec.activo })}
          className={`relative w-11 h-6 rounded-full transition-colors ${rec.activo ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-600'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${rec.activo ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      {rec.activo && (
        <>
          {permiso !== 'granted' ? (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3 mb-3 flex items-center justify-between gap-3">
              <p className="text-xs text-amber-700 dark:text-amber-400">Activa las notificaciones para recibir el aviso</p>
              {permiso === 'unsupported' ? (
                <span className="text-xs text-slate-400 flex items-center gap-1"><BellOff size={12}/> No soportado</span>
              ) : (
                <button onClick={pedirPermiso} className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap">
                  Activar
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs text-emerald-500 flex items-center gap-1 mb-3"><Bell size={11}/> Notificaciones activas</p>
          )}

          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Fecha</label>
              <input
                type="date" value={rec.fecha} min={hoy}
                onChange={e => updateRec({ fecha: e.target.value })}
                className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-blue-900/50 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-orange-500/60"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Hora</label>
              <input
                type="time" value={rec.hora || '08:00'}
                onChange={e => updateRec({ hora: e.target.value })}
                className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-blue-900/50 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-orange-500/60"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Mensaje (opcional)</label>
            <input
              type="text" value={rec.mensaje || ''}
              onChange={e => updateRec({ mensaje: e.target.value })}
              placeholder="Mensaje del recordatorio..."
              maxLength={80}
              className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-blue-900/50 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-orange-500/60"
            />
          </div>

          {rec.fecha && (
            <p className="text-xs text-slate-400 mt-2">
              Avisará el {new Date(`${rec.fecha}T${rec.hora || '08:00'}:00`).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} a las {rec.hora || '08:00'}
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function Libreta({ apuntes, setApuntes, deudas, ingresos, gastos }) {
  const [view, setView]             = useState('lista');
  const [notaActivaId, setNotaActivaId] = useState(null);

  const disponible = useMemo(() => calcDisponible(ingresos, gastos, deudas), [ingresos, gastos, deudas]);
  const notaActiva = apuntes.find(n => n.id === notaActivaId) || null;

  const updateNota = (id, changes) =>
    setApuntes(prev => prev.map(n =>
      n.id === id ? { ...n, ...changes, updatedAt: new Date().toISOString() } : n
    ));

  const deleteNota = id => setApuntes(prev => prev.filter(n => n.id !== id));

  const createNota = nota => {
    setApuntes(prev => [nota, ...prev]);
    setNotaActivaId(nota.id);
    setView('detalle');
  };

  const goLista = () => { setView('lista'); setNotaActivaId(null); };

  if (view === 'nueva') {
    return <VistaNueva onVolver={goLista} onCreate={createNota} />;
  }

  if (view === 'detalle') {
    if (!notaActiva) { goLista(); return null; }
    const onChange = changes => updateNota(notaActiva.id, changes);
    if (notaActiva.tipo === 'compras') {
      return <VistaCompras nota={notaActiva} onVolver={goLista} onChange={onChange} disponible={disponible} />;
    }
    return <VistaLibre nota={notaActiva} onVolver={goLista} onChange={onChange} />;
  }

  return (
    <VistaLista
      apuntes={apuntes}
      onNueva={() => setView('nueva')}
      onAbrir={id => { setNotaActivaId(id); setView('detalle'); }}
      onEliminar={deleteNota}
    />
  );
}
