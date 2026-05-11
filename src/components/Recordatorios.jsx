import { useState, useMemo, useEffect } from 'react';
import { Bell, CheckCircle2, XCircle, Clock, AlertTriangle, BellOff } from 'lucide-react';
import { formatCurrency, calcularProximoPago, diasParaProximoPago } from '../utils/calculations';

export default function Recordatorios({ deudas, setDeudas }) {
  const [notifPermiso, setNotifPermiso] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported');

  useEffect(() => {
    if (notifPermiso === 'granted') {
      const vencen = pagosProximos.filter(p => p.dias >= 0 && p.dias <= parseInt(p.recordatorio || 3));
      vencen.forEach(p => {
        try {
          new Notification(`Recordatorio: ${p.nombre}`, {
            body: `Pago de ${formatCurrency(p.saldoCapital)} vence ${p.dias === 0 ? 'HOY' : `en ${p.dias} días`}`,
            icon: '/vite.svg',
          });
        } catch {}
      });
    }
  }, []);

  const pedirPermiso = async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setNotifPermiso(result);
  };

  const marcarPagado = (deudaId) => {
    const hoy = new Date().toISOString().split('T')[0];
    setDeudas(p => p.map(d => {
      if (d.id !== deudaId) return d;
      const pago = { id: Date.now().toString(), fechaEsperada: hoy, fechaPago: hoy, monto: parseFloat(d.cuotaMensual || 0), pagado: true, notas: 'Marcado desde recordatorios' };
      return { ...d, historialPagos: [...(d.historialPagos || []), pago] };
    }));
  };

  const marcarNoPagado = (deudaId) => {
    const hoy = new Date().toISOString().split('T')[0];
    setDeudas(p => p.map(d => {
      if (d.id !== deudaId) return d;
      const pago = { id: Date.now().toString(), fechaEsperada: hoy, fechaPago: null, monto: parseFloat(d.cuotaMensual || 0), pagado: false, notas: 'No pagado — desde recordatorios' };
      return { ...d, historialPagos: [...(d.historialPagos || []), pago] };
    }));
  };

  const pagosProximos = useMemo(() => {
    return deudas.map(d => {
      const proxFecha = d.frecuenciaPago === 'fecha_especifica'
        ? new Date(d.fechaPago)
        : calcularProximoPago(d.frecuenciaPago, d.fechaInicio);
      const dias = diasParaProximoPago(proxFecha);
      return { ...d, proxFecha, dias };
    }).sort((a, b) => a.dias - b.dias);
  }, [deudas]);

  const vencidos   = pagosProximos.filter(p => p.dias < 0);
  const hoy        = pagosProximos.filter(p => p.dias === 0);
  const proximos7  = pagosProximos.filter(p => p.dias > 0 && p.dias <= 7);
  const proximos30 = pagosProximos.filter(p => p.dias > 7 && p.dias <= 30);
  const futuros    = pagosProximos.filter(p => p.dias > 30);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Recordatorios</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Pagos próximos y vencidos de tus obligaciones</p>
        </div>
        {notifPermiso === 'unsupported' ? (
          <span className="text-xs text-slate-400 flex items-center gap-1"><BellOff size={13}/> Tu navegador no soporta notificaciones</span>
        ) : notifPermiso === 'granted' ? (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 px-3 py-1.5 rounded-xl"><Bell size={13}/> Notificaciones activas</span>
        ) : (
          <button onClick={pedirPermiso} className="flex items-center gap-1.5 text-xs bg-amber-500 text-white px-3 py-2 rounded-xl hover:bg-amber-600 font-medium">
            <Bell size={13}/> Activar notificaciones
          </button>
        )}
      </div>

      {deudas.length === 0 && (
        <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-100 dark:border-blue-900/40 p-10 text-center text-slate-400 dark:text-slate-500 shadow-sm">No tienes deudas registradas.</div>
      )}

      {deudas.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <MiniCard label="Vencidos"     count={vencidos.length}   color="red"   icon={XCircle}       />
          <MiniCard label="Vencen hoy"   count={hoy.length}        color="red"   icon={AlertTriangle} />
          <MiniCard label="Esta semana"  count={proximos7.length}  color="amber" icon={Clock}         />
          <MiniCard label="Este mes"     count={proximos30.length} color="blue"  icon={Bell}          />
        </div>
      )}

      {vencidos.length > 0 && (
        <Section title="Vencidos" color="red" icon={XCircle}>
          {vencidos.map(d => <PagoCard key={d.id} d={d} onPagado={marcarPagado} onNoPagado={marcarNoPagado} />)}
        </Section>
      )}

      {hoy.length > 0 && (
        <Section title="Vence hoy" color="red" icon={AlertTriangle}>
          {hoy.map(d => <PagoCard key={d.id} d={d} onPagado={marcarPagado} onNoPagado={marcarNoPagado} />)}
        </Section>
      )}

      {proximos7.length > 0 && (
        <Section title="Esta semana (próximos 7 días)" color="amber" icon={Clock}>
          {proximos7.map(d => <PagoCard key={d.id} d={d} onPagado={marcarPagado} onNoPagado={marcarNoPagado} />)}
        </Section>
      )}

      {proximos30.length > 0 && (
        <Section title="Este mes (8 a 30 días)" color="blue" icon={Bell}>
          {proximos30.map(d => <PagoCard key={d.id} d={d} onPagado={marcarPagado} onNoPagado={marcarNoPagado} />)}
        </Section>
      )}

      {futuros.length > 0 && (
        <Section title="Más adelante (+30 días)" color="slate" icon={CheckCircle2}>
          {futuros.map(d => <PagoCard key={d.id} d={d} onPagado={marcarPagado} onNoPagado={marcarNoPagado} mini />)}
        </Section>
      )}

      {deudas.some(d => (d.historialPagos||[]).some(p => !p.pagado)) && (
        <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-100 dark:border-blue-900/40 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-blue-900/40 bg-red-50 dark:bg-red-950/30 flex items-center gap-2">
            <XCircle size={16} className="text-red-500" />
            <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">Pagos no realizados en historial</h3>
          </div>
          <div className="p-5 space-y-2">
            {deudas.flatMap(d =>
              (d.historialPagos||[]).filter(p => !p.pagado).map(p => (
                <div key={p.id} className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-xl text-sm">
                  <XCircle size={15} className="text-red-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{d.nombre}</span>
                    <span className="text-slate-500 dark:text-slate-400 ml-2">· {p.fechaEsperada ? new Date(p.fechaEsperada).toLocaleDateString('es-CO') : 'sin fecha'}</span>
                    {p.monto > 0 && <span className="text-red-600 dark:text-red-400 font-semibold ml-2">{formatCurrency(p.monto)}</span>}
                    {p.notas && <span className="text-slate-400 dark:text-slate-500 ml-2 text-xs">· {p.notas}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, color, icon: Icon, children }) {
  const colors = {
    red:   'bg-red-50   dark:bg-red-950/30   border-red-100   dark:border-red-900/40   text-red-700   dark:text-red-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/40 text-amber-700 dark:text-amber-400',
    blue:  'bg-blue-50  dark:bg-blue-950/30  border-blue-100  dark:border-blue-900/40  text-blue-700  dark:text-blue-400',
    slate: 'bg-slate-50 dark:bg-[#162032]    border-slate-200 dark:border-blue-900/40  text-slate-600 dark:text-slate-300',
  };
  return (
    <div className="bg-white dark:bg-[#0f1826] rounded-2xl border border-slate-100 dark:border-blue-900/40 shadow-sm overflow-hidden">
      <div className={`px-5 py-3 border-b ${colors[color]} flex items-center gap-2`}>
        <Icon size={15} />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="p-5 space-y-3">{children}</div>
    </div>
  );
}

function PagoCard({ d, onPagado, onNoPagado, mini }) {
  const urgente = d.dias <= 3;
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
      urgente
        ? 'border-red-100 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20'
        : 'border-slate-100 dark:border-blue-900/30 bg-slate-50 dark:bg-[#162032]'
    }`}>
      <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center text-xs font-bold shrink-0 ${
        d.dias < 0  ? 'bg-red-200   dark:bg-red-900/50   text-red-800   dark:text-red-300'   :
        d.dias === 0 ? 'bg-red-100   dark:bg-red-900/40   text-red-700   dark:text-red-400'   :
        d.dias <= 7  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400' :
                       'bg-blue-100  dark:bg-blue-900/40  text-blue-700  dark:text-blue-400'
      }`}>
        {d.dias < 0  ? <><span>-{Math.abs(d.dias)}</span><span className="text-[9px] font-normal">días</span></> :
         d.dias === 0 ? 'HOY' :
         <><span>{d.dias}</span><span className="text-[9px] font-normal">días</span></>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{d.nombre}</p>
        <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
          <span>{d.tipoObligacion}</span>
          {!mini && <><span>Capital: <strong className="text-slate-700 dark:text-slate-200">{formatCurrency(d.saldoCapital)}</strong></span>
          {d.cuotaMensual && <span>Cuota: <strong className="text-slate-700 dark:text-slate-200">{formatCurrency(d.cuotaMensual)}</strong></span>}</>}
          <span>{d.proxFecha.toLocaleDateString('es-CO')}</span>
        </div>
      </div>
      {!mini && (
        <div className="flex gap-1.5 shrink-0">
          <button onClick={() => onPagado(d.id)} title="Marcar como pagado" className="flex items-center gap-1 text-xs bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-emerald-700 font-medium">
            <CheckCircle2 size={12}/> Pagado
          </button>
          <button onClick={() => onNoPagado(d.id)} title="Registrar como no pagado" className="flex items-center gap-1 text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-2.5 py-1.5 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 font-medium">
            <XCircle size={12}/> No pagado
          </button>
        </div>
      )}
      {d.urlPSE && !mini && (
        <a href={d.urlPSE} target="_blank" rel="noopener noreferrer" className="text-xs font-bold bg-blue-600 text-white px-2 py-1.5 rounded-lg hover:bg-blue-700 shrink-0">PSE</a>
      )}
    </div>
  );
}

function MiniCard({ label, count, color, icon: Icon }) {
  const colors = {
    red:   'bg-red-50   dark:bg-red-950/30   border-red-100   dark:border-red-900/50   text-red-700   dark:text-red-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50 text-amber-700 dark:text-amber-400',
    blue:  'bg-blue-50  dark:bg-blue-950/30  border-blue-100  dark:border-blue-900/50  text-blue-700  dark:text-blue-400',
    slate: 'bg-slate-50 dark:bg-[#162032]    border-slate-100 dark:border-blue-900/40  text-slate-600 dark:text-slate-300',
  };
  return (
    <div className={`rounded-2xl border p-5 flex items-center gap-3 ${colors[color]}`}>
      <Icon size={18} className="shrink-0 opacity-70" />
      <div>
        <p className="text-2xl font-bold">{count}</p>
        <p className="text-xs opacity-75">{label}</p>
      </div>
    </div>
  );
}
