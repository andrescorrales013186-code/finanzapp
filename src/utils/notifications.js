import { calcularProximoPago, diasParaProximoPago, formatCurrency } from './calculations';

const LOG_KEY = 'finanzapp_notif_log';

function hoy() { return new Date().toISOString().split('T')[0]; }

function getLog() {
  try { return JSON.parse(localStorage.getItem(LOG_KEY)) || {}; } catch { return {}; }
}

function saveLog(log) {
  // Conservar solo últimos 7 días
  const cutoff = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  Object.keys(log).forEach(k => { if (k < cutoff) delete log[k]; });
  localStorage.setItem(LOG_KEY, JSON.stringify(log));
}

function yaNotificadoHoy(id) {
  return (getLog()[hoy()] || []).includes(id);
}

function marcarNotificado(id) {
  const log = getLog();
  if (!log[hoy()]) log[hoy()] = [];
  if (!log[hoy()].includes(id)) log[hoy()].push(id);
  saveLog(log);
}

// ── Permiso ──────────────────────────────────────────────────────────────────

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  return Notification.requestPermission();
}

export function getPermissionState() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

// ── Mostrar notificación ──────────────────────────────────────────────────────

export async function showNotification(title, body, tag = 'finanzapp') {
  if (getPermissionState() !== 'granted') return;
  const opts = {
    body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-64x64.png',
    vibrate: [200, 100, 200, 100, 200],
    tag,
    requireInteraction: false,
  };
  try {
    if ('serviceWorker' in navigator) {
      const sw = await navigator.serviceWorker.ready;
      await sw.showNotification(title, opts);
    } else {
      new Notification(title, opts);
    }
  } catch {
    try { new Notification(title, opts); } catch {}
  }
}

// ── Chequear deudas ───────────────────────────────────────────────────────────

export async function checkDeudaNotifications(deudas) {
  if (getPermissionState() !== 'granted' || !deudas?.length) return;
  for (const d of deudas) {
    try {
      const fecha = d.frecuenciaPago === 'fecha_especifica'
        ? new Date(d.fechaPago)
        : calcularProximoPago(d.frecuenciaPago, d.fechaInicio);
      const dias = diasParaProximoPago(fecha);
      const limite = parseInt(d.recordatorio || 3);
      if (dias >= 0 && dias <= limite) {
        const id = `deuda_${d.id}_${hoy()}`;
        if (!yaNotificadoHoy(id)) {
          const titulo = dias === 0 ? '⚠️ Pago vence HOY' : `📅 Pago en ${dias} día${dias !== 1 ? 's' : ''}`;
          const cuerpo = `${d.nombre}${d.cuotaMensual ? ' · ' + formatCurrency(parseFloat(d.cuotaMensual)) : ''}`;
          await showNotification(titulo, cuerpo, id);
          marcarNotificado(id);
        }
      }
    } catch {}
  }
}

// ── Chequear libreta ──────────────────────────────────────────────────────────

export async function checkLibretaNotifications(apuntes, onDisable) {
  if (getPermissionState() !== 'granted' || !apuntes?.length) return;
  const ahora = new Date();
  for (const nota of apuntes) {
    try {
      if (!nota.recordatorio?.activo || !nota.recordatorio?.fecha) continue;
      const dt = new Date(`${nota.recordatorio.fecha}T${nota.recordatorio.hora || '08:00'}:00`);
      if (dt <= ahora) {
        const id = `libreta_${nota.id}_${nota.recordatorio.fecha}`;
        if (!yaNotificadoHoy(id)) {
          await showNotification(
            `🔔 ${nota.titulo}`,
            nota.recordatorio.mensaje || `Recordatorio de tu nota "${nota.titulo}"`,
            id
          );
          marcarNotificado(id);
          if (onDisable) onDisable(nota.id);
        }
      }
    } catch {}
  }
}
