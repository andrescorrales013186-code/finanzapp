import { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, Lightbulb } from 'lucide-react';
import Finn from './Finn';

const SECCIONES = [
  { num: '01', nombre: 'Dashboard',                sub: 'Tu resumen financiero',
    pasos: ['El Dashboard se abre automáticamente al entrar a la app.','Las tarjetas muestran obligación total, ingresos mensuales y flujo disponible.','La barra de distribución muestra en qué va tu dinero.','Las gráficas muestran la distribución de deudas y el balance mensual.','Los próximos vencimientos aparecen al final de la pantalla.'],
    tip: 'Revísalo cada lunes para saber cómo empiezas la semana.' },
  { num: '02', nombre: 'Obligaciones financieras', sub: 'Lo que debes pagar',
    pasos: ['Toca "+ Nueva obligación" para agregar una obligación.','Escribe el nombre, el saldo que debes y la tasa de interés.','Elige cada cuánto pagas: mensual, quincenal o semanal.','La app calcula automáticamente cuánto pagas de interés cada mes.','Para eliminar una obligación ya pagada, tócala y busca el ícono de basurero.'],
    tip: 'Empieza por las deudas más importantes como el arriendo o el banco.' },
  { num: '03', nombre: 'Checklist de pagos',       sub: 'Tu lista mensual',
    pasos: ['Verás una lista con todas tus obligaciones del mes.','Cuando hagas un pago, toca el botón "Pagado".','Si no pudiste pagar algo, toca "No pagado" para registrarlo.','Los pagos marcados quedan guardados en el historial.','Al final del mes puedes ver cuántos pagaste y cuántos quedaron pendientes.'],
    tip: 'Revisa esta pantalla el día que recibes tu sueldo para saber qué pagar primero.' },
  { num: '04', nombre: 'Ingresos',                 sub: 'El dinero que recibes',
    pasos: ['Toca "+ Nuevo ingreso" para agregar una fuente de dinero.','Escribe el nombre (ej: "Sueldo empresa", "Arriendo local").','Escribe el monto y elige cada cuánto lo recibes.','La app suma todos tus ingresos para saber cuánto recibes al mes.','Si un ingreso cambia, tócalo y edítalo con el nuevo valor.'],
    tip: 'Incluye todos los ingresos, incluso los pequeños. Todo suma.' },
  { num: '05', nombre: 'Gastos',                   sub: 'En qué se va tu dinero',
    pasos: ['Toca "+ Nuevo gasto" para agregar un gasto.','Escribe qué es (ej: "Mercado", "Transporte", "Netflix").','Elige la categoría: Alimentación, Vivienda, Transporte, etc.','Activa "Gasto hormiga" si es un gasto pequeño y frecuente.','La app muestra una gráfica para que veas en qué categoría gastas más.'],
    tip: 'Los gastos hormiga parecen pequeños, pero al mes pueden ser una suma grande.' },
  { num: '06', nombre: 'Recordatorios',            sub: 'Para no olvidar pagos',
    pasos: ['La pantalla muestra en colores qué tan urgente es cada pago.','Rojo = urgente, amarillo = pronto, verde = tiempo de sobra.','Activa notificaciones en tu celular para recibir avisos automáticos.','Puedes marcar un pago como "Pagado" directamente desde esta pantalla.','El número rojo en el ícono de campana indica cuántos pagos están cerca.'],
    tip: 'El número rojo que aparece en el ícono de campana te indica cuántos pagos están cerca.' },
  { num: '07', nombre: 'Calculadora',              sub: 'Crédito y calculadora básica',
    pasos: ['Elige el modo: Crédito para simular préstamos, o Calculadora básica para operaciones rápidas.','Escribe la tasa de interés que te ofrecen.','Escribe en cuántos meses lo pagarías.','La app calcula la cuota, el total a pagar y una tabla de amortización mes a mes.','La calculadora básica tiene los botones numéricos completos para cálculos rápidos.'],
    tip: 'Si la cuota mensual es mayor al 30% de tu ingreso, busca un plazo más largo.' },
  { num: '08', nombre: 'Libreta de apuntes',       sub: 'Notas y listas de compras',
    pasos: ['Toca "+ Nueva nota" para crear un apunte.','Elige el tipo: Libre, Compras o Personalizado.','En la nota de Compras puedes agregar productos con su precio.','Activa "Presupuesto" para ver cuánto dinero te queda mientras compras.','Activa "Recordatorio" para que la app te avise en la fecha que elijas.'],
    tip: 'Usa la lista de compras antes de ir al mercado para no gastar más de lo planeado.' },
  { num: '09', nombre: 'Tabla Resumen',            sub: 'Todo en un solo lugar',
    pasos: ['Aquí ves un resumen completo de toda tu información financiera.','Puedes exportar todo a Excel, CSV o JSON.','Las gráficas muestran el comparativo entre ingresos, gastos e intereses.','Si tienes varios perfiles, puedes ver el resumen de cada uno.','Usa el buscador para encontrar una obligación o gasto específico.'],
    tip: 'Exporta la tabla a Excel a fin de mes para llevar un archivo personal.' },
  { num: '10', nombre: 'Perfiles',                 sub: 'Una app para toda la familia',
    pasos: ['Al abrir la app por primera vez, crea tu primer perfil.','Elige tu mascota: Finn (masculino), Finna (femenino) o neutro.','Toca el ícono de tu perfil para cambiar a otro o crear uno nuevo.','Puedes tener hasta 6 perfiles diferentes.','Los datos de todos los perfiles se guardan en la nube con tu cuenta.'],
    tip: 'Crea un perfil "Hogar" para los gastos del hogar y otro personal para los tuyos.' },
];

function SeccionCard({ s }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-100 dark:border-blue-900/30 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-[#0f1826] transition-colors"
      >
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500 min-w-[24px]">{s.num}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 dark:text-white">{s.nombre}</p>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500 mr-3 hidden sm:block">{s.sub}</span>
        {open
          ? <ChevronDown size={15} className="text-slate-400 shrink-0"/>
          : <ChevronRight size={15} className="text-slate-400 shrink-0"/>}
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-slate-100 dark:border-blue-900/30 pt-4">
          <div className="space-y-3 mb-4">
            {s.pasos.map((paso, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-xs text-slate-400 dark:text-slate-500 min-w-[18px] mt-0.5">{i + 1}.</span>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{paso}</p>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg px-4 py-3">
            <Lightbulb size={14} className="text-orange-400 shrink-0 mt-0.5"/>
            <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed">{s.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Guia() {
  return (
    <div className="space-y-5 max-w-2xl mx-auto">

      {/* Hero */}
      <div style={{ background: '#0c111d', borderRadius: 16, padding: '24px 24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flexShrink: 0, marginTop: -4 }}>
            <Finn mood="thinking" size={64}/>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 500, color: '#f97316', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>
              Guía de uso
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 500, color: '#fff', margin: '0 0 6px', lineHeight: 1.25 }}>
              Aprende a usar FinanzApp
            </h1>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
              Toca cada sección para ver cómo funciona paso a paso.
            </p>
          </div>
        </div>
      </div>

      {/* Primeros pasos */}
      <div className="bg-white dark:bg-[#0f1826] border border-slate-100 dark:border-blue-900/40 rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">Para empezar — 3 pasos</p>
        <div className="space-y-3">
          {[
            { num: '1', texto: 'Crea tu perfil y elige tu mascota (Finn o Finna).' },
            { num: '2', texto: 'Agrega tus ingresos — el dinero que recibes cada mes.' },
            { num: '3', texto: 'Agrega tus gastos y deudas — deja que la app haga los cálculos.' },
          ].map(({ num, texto }) => (
            <div key={num} className="flex items-start gap-4">
              <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center text-white font-semibold text-xs shrink-0">
                {num}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">{texto}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Acordeón secciones */}
      <div className="bg-white dark:bg-[#0f1826] border border-slate-100 dark:border-blue-900/40 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-blue-900/30 flex items-center gap-2">
          <BookOpen size={14} className="text-orange-400"/>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Guía por sección</p>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-blue-900/20">
          {SECCIONES.map(s => <SeccionCard key={s.num} s={s}/>)}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white dark:bg-[#0f1826] border border-slate-100 dark:border-blue-900/40 rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">Preguntas frecuentes</p>
        <div className="space-y-4">
          {[
            { q: '¿Mis datos están seguros?', a: 'Sí. Tus datos se guardan en la nube de Google (Firebase) con tu cuenta. Nadie más puede verlos.' },
            { q: '¿Puedo usar la app en varios dispositivos?', a: 'Sí. Inicia sesión con la misma cuenta en cualquier dispositivo y todos tus datos estarán ahí.' },
            { q: '¿Qué pasa si borro la app?', a: 'No pasa nada. Tus datos están en la nube. Cuando vuelvas a instalarla e inicies sesión, todo estará igual.' },
            { q: '¿La app tiene costo?', a: 'No. FinanzApp es completamente sin costo adicional.' },
            { q: '¿Puedo usarla sin internet?', a: 'Puedes ver la información guardada, pero para guardar cambios necesitas conexión.' },
          ].map(({ q, a }) => (
            <div key={q} className="border-b border-slate-100 dark:border-blue-900/30 pb-4 last:border-0 last:pb-0">
              <p className="text-sm font-medium text-slate-800 dark:text-white mb-1">{q}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
