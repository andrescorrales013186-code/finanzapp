import { useState } from 'react';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import { ThemeProvider } from './context/ThemeContext';
import ProfileSelector from './components/ProfileSelector';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Deudas from './components/Deudas';
import Ingresos from './components/Ingresos';
import Gastos from './components/Gastos';
import Calculadora from './components/Calculadora';
import TablaResumen from './components/TablaResumen';
import Recordatorios from './components/Recordatorios';
import ChecklistPagos from './components/ChecklistPagos';
import ResumenGeneral from './components/ResumenGeneral';
import { useLocalStorage } from './hooks/useLocalStorage';
import { exportarExcel, exportarCSV, exportarJSON, importarExcel, importarJSON } from './utils/exportImport';
import { X, FileSpreadsheet, FileJson, FileText, Trash2, AlertTriangle, Upload } from 'lucide-react';
import { diasParaProximoPago, calcularProximoPago } from './utils/calculations';
import './index.css';

export default function App() {
  return (
    <ProfileProvider>
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </ProfileProvider>
  );
}

function AppRouter() {
  const { activeProfile } = useProfile();
  const [showSelector, setShowSelector] = useState(!activeProfile);
  if (showSelector || !activeProfile) {
    return <ProfileSelector onSelect={() => setShowSelector(false)} />;
  }
  return <AppInner key={activeProfile.id} profile={activeProfile} onSwitchProfile={() => setShowSelector(true)} />;
}

function AppInner({ profile, onSwitchProfile }) {
  const pid = profile.id;
  const [page, setPage]         = useState('dashboard');
  const [deudas,   setDeudas]   = useLocalStorage(`finanzapp_deudas_${pid}`,   []);
  const [ingresos, setIngresos] = useLocalStorage(`finanzapp_ingresos_${pid}`, []);
  const [gastos,   setGastos]   = useLocalStorage(`finanzapp_gastos_${pid}`,   []);
  const [showIO,   setShowIO]   = useState(false);
  const [importMsg, setImportMsg]   = useState('');
  const [showBorrar, setShowBorrar] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [selBorrar, setSelBorrar]   = useState({ deudas: false, ingresos: false, gastos: false });

  const badgeRecordatorios = deudas.filter(d => {
    const fecha = d.frecuenciaPago === 'fecha_especifica'
      ? new Date(d.fechaPago)
      : calcularProximoPago(d.frecuenciaPago, d.fechaInicio);
    const dias = diasParaProximoPago(fecha);
    return dias >= 0 && dias <= parseInt(d.recordatorio || 3);
  }).length;

  const handleImport = async (e, tipo) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = tipo === 'excel' ? await importarExcel(file) : await importarJSON(file);
      if (data.deudas?.length)   setDeudas(p   => [...p, ...data.deudas]);
      if (data.ingresos?.length) setIngresos(p => [...p, ...data.ingresos]);
      if (data.gastos?.length)   setGastos(p   => [...p, ...data.gastos]);
      setImportMsg(`Importado: ${data.deudas?.length||0} deudas, ${data.ingresos?.length||0} ingresos, ${data.gastos?.length||0} gastos`);
    } catch { setImportMsg('Error al importar el archivo.'); }
    e.target.value = '';
  };

  const borrarSeleccion = () => {
    if (selBorrar.deudas)   setDeudas([]);
    if (selBorrar.ingresos) setIngresos([]);
    if (selBorrar.gastos)   setGastos([]);
    setShowBorrar(false); setConfirmText('');
    setSelBorrar({ deudas: false, ingresos: false, gastos: false });
    setPage('dashboard');
  };

  const hayAlgoSeleccionado = Object.values(selBorrar).some(Boolean);

  const renderPage = () => {
    switch (page) {
      case 'dashboard':        return <Dashboard deudas={deudas} ingresos={ingresos} gastos={gastos} onNavigate={setPage} />;
      case 'tabla':            return <TablaResumen deudas={deudas} ingresos={ingresos} gastos={gastos} />;
      case 'deudas':           return <Deudas deudas={deudas} setDeudas={setDeudas} />;
      case 'ingresos':         return <Ingresos ingresos={ingresos} setIngresos={setIngresos} />;
      case 'gastos':           return <Gastos gastos={gastos} setGastos={setGastos} />;
      case 'checklist':        return <ChecklistPagos deudas={deudas} setDeudas={setDeudas} ingresos={ingresos} gastos={gastos} setGastos={setGastos} />;
      case 'recordatorios':    return <Recordatorios deudas={deudas} setDeudas={setDeudas} />;
      case 'calculadora':      return <Calculadora />;
      case 'resumen-general':  return <ResumenGeneral />;
      default:                 return null;
    }
  };

  return (
    <Layout activePage={page} onNavigate={setPage} badgeRecordatorios={badgeRecordatorios} onSwitchProfile={onSwitchProfile}>

      <div className="flex justify-end gap-2 mb-5">
        <button onClick={() => { setShowIO(p => !p); setImportMsg(''); }}
          className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-blue-900/50 bg-white dark:bg-[#0f1826] px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#162032] font-medium shadow-sm">
          <FileSpreadsheet size={13}/> Exportar / Importar
        </button>
        <button onClick={() => { setShowBorrar(true); setConfirmText(''); }}
          className="flex items-center gap-1.5 text-xs text-red-500 border border-red-200 dark:border-red-900/50 bg-white dark:bg-[#0f1826] px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 font-medium shadow-sm">
          <Trash2 size={13}/> Borrar todo
        </button>
      </div>

      {showIO && (
        <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-200 dark:border-blue-900/50 p-5 shadow-sm mb-5 relative">
          <button onClick={() => setShowIO(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={16}/></button>
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-2">
            <FileSpreadsheet size={15}/> Exportar / Importar — <span className="text-orange-500">{profile.name}</span>
          </h3>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Exportar</p>
              <div className="space-y-2">
                <ExBtn icon={FileSpreadsheet} label="Exportar a Excel (.xlsx)" sub="Deudas, Ingresos, Gastos" onClick={() => exportarExcel(deudas, ingresos, gastos)} color="green" />
                <ExBtn icon={FileText}        label="Exportar a CSV"           sub="Un archivo con todos los registros" onClick={() => exportarCSV(deudas, ingresos, gastos)} color="blue" />
                <ExBtn icon={FileJson}        label="Exportar a JSON (backup)" sub="Respaldo completo" onClick={() => exportarJSON(deudas, ingresos, gastos)} color="purple" />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Importar</p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-blue-900/50 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-[#162032] transition-colors group">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center shrink-0"><Upload size={14} className="text-emerald-600 dark:text-emerald-400"/></div>
                  <div className="flex-1"><p className="text-xs font-medium text-slate-700 dark:text-slate-200">Importar desde Excel</p><p className="text-xs text-slate-400">Usa el mismo formato del export</p></div>
                  <input type="file" accept=".xlsx,.xls" className="hidden" onChange={e => handleImport(e, 'excel')} />
                </label>
                <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-blue-900/50 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-[#162032] transition-colors group">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center shrink-0"><FileJson size={14} className="text-blue-600 dark:text-blue-400"/></div>
                  <div className="flex-1"><p className="text-xs font-medium text-slate-700 dark:text-slate-200">Importar desde JSON</p><p className="text-xs text-slate-400">Restaura un backup completo</p></div>
                  <input type="file" accept=".json" className="hidden" onChange={e => handleImport(e, 'json')} />
                </label>
                {importMsg && (
                  <p className={`text-xs px-3 py-2 rounded-xl ${importMsg.startsWith('Error') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'}`}>{importMsg}</p>
                )}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">Los datos se <strong>agregan</strong> a los existentes.</p>
            </div>
          </div>
        </div>
      )}

      {renderPage()}

      {showBorrar && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white dark:bg-[#0f1826] rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden">
            <div className="bg-red-600 px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0"><AlertTriangle size={22} className="text-white"/></div>
              <div>
                <h3 className="font-bold text-white text-lg">Borrar datos</h3>
                <p className="text-red-200 text-xs">Perfil: {profile.name}</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                {[
                  { key: 'deudas',   label: 'Obligaciones financieras', count: deudas.length   },
                  { key: 'ingresos', label: 'Ingresos',                  count: ingresos.length },
                  { key: 'gastos',   label: 'Gastos',                    count: gastos.length   },
                ].map(({ key, label, count }) => (
                  <label key={key} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-blue-900/40 cursor-pointer bg-white dark:bg-[#162032]">
                    <input type="checkbox" checked={selBorrar[key]} onChange={e => setSelBorrar(p => ({ ...p, [key]: e.target.checked }))} className="w-4 h-4 accent-red-600 cursor-pointer" />
                    <span className="flex-1 text-sm text-slate-800 dark:text-slate-100">{label}</span>
                    <span className="text-xs bg-slate-100 dark:bg-[#0f1826] text-slate-500 px-2 py-0.5 rounded-full">{count} registros</span>
                  </label>
                ))}
              </div>
              {hayAlgoSeleccionado && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Escribe <span className="font-mono bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded">BORRAR</span> para confirmar:
                  </label>
                  <input type="text" value={confirmText} onChange={e => setConfirmText(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" autoFocus />
                </div>
              )}
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={borrarSeleccion} disabled={!hayAlgoSeleccionado || confirmText !== 'BORRAR'}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 ${hayAlgoSeleccionado && confirmText === 'BORRAR' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-100 dark:bg-[#162032] text-slate-400 cursor-not-allowed'}`}>
                <Trash2 size={15}/> Borrar
              </button>
              <button onClick={() => { setShowBorrar(false); setConfirmText(''); setSelBorrar({ deudas: false, ingresos: false, gastos: false }); }}
                className="flex-1 bg-slate-100 dark:bg-[#162032] text-slate-700 dark:text-slate-200 py-2.5 rounded-xl font-medium text-sm hover:bg-slate-200 dark:hover:bg-[#1e2d42]">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function ExBtn({ icon: Icon, label, sub, onClick, color }) {
  const c = { green: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400', blue: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400', purple: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400' };
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-3 border border-slate-200 dark:border-blue-900/50 rounded-xl hover:bg-slate-50 dark:hover:bg-[#162032] transition-colors text-left">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${c[color]}`}><Icon size={14}/></div>
      <div><p className="text-xs font-medium text-slate-700 dark:text-slate-200">{label}</p><p className="text-xs text-slate-400">{sub}</p></div>
    </button>
  );
}
