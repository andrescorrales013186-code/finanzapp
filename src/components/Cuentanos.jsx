import Finn from './Finn';

const STORY = [
  { num: '01', title: 'La obligación que nadie vio venir', text: 'No fue un gasto enorme. Fue el café de cada mañana, el domicilio del viernes, el dato del celular, la salida del sábado. Gastos pequeños que nunca se anotaron — y que al final del mes dejaban la cuenta en rojo sin saber por qué.' },
  { num: '02', title: 'El problema no era el dinero', text: 'Era la información. No había forma de saber exactamente cuánto se gastaba, en qué, y cuándo llegaba el próximo vencimiento. Las apps que existían eran complicadas, en inglés, o pensadas para empresas — no para personas reales.' },
  { num: '03', title: 'La idea que se convirtió en app', text: 'FinanzApp nació de esa frustración. Simple, en español, diseñada para el día a día. Sin términos financieros complicados. Sin funciones que nadie usa. Solo lo esencial: saber dónde va tu dinero.' },
  { num: '04', title: 'Colombia primero, el mundo después', text: 'Empezamos en Medellín con la convicción de que el control financiero no debería ser privilegio de pocos. Hoy nuestra visión es que cualquier persona de habla hispana, en cualquier país, pueda tener el poder de su dinero en sus manos.' },
];

export default function Cuentanos() {
  return (
    <div className="space-y-5 max-w-2xl mx-auto">

      {/* Hero */}
      <div style={{ background: '#0c111d', borderRadius: 16, padding: '28px 28px 24px', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', right: -10, bottom: -16, opacity: 0.12, pointerEvents: 'none' }}>
          <Finn mood="happy" size={180}/>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 500, color: '#f97316', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>
            La historia detrás de FinanzApp
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 500, color: '#fff', lineHeight: 1.25, margin: '0 0 12px', letterSpacing: '-.02em' }}>
            El dinero no era<br/>el problema.<br/>
            <span style={{ color: '#f97316' }}>La información sí.</span>
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, margin: 0, maxWidth: 340 }}>
            Una historia real, un problema real, y una app que nació para resolverlo.
          </p>
        </div>
      </div>

      {/* Historia */}
      <div className="bg-white dark:bg-[#0f1826] border border-slate-100 dark:border-blue-900/40 rounded-2xl p-6 shadow-sm">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-6">Cómo empezó todo</p>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 13, top: 28, bottom: 28, width: 1, background: 'var(--color-border-tertiary)' }}/>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {STORY.map((s, i) => (
              <div key={s.num} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f97316', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', position: 'relative', zIndex: 1 }}>
                  {i + 1}
                </div>
                <div style={{ paddingTop: 4 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', margin: '0 0 6px' }}>{s.title}</p>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0 }}>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cita */}
      <div style={{ background: '#fff7ed', border: '0.5px solid #fed7aa', borderRadius: 14, padding: '20px 22px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flexShrink: 0, marginTop: -4 }}>
          <Finn mood="thinking" size={60}/>
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#c2410c', margin: '0 0 8px', lineHeight: 1.4 }}>
            "No necesitas ganar más. Necesitas ver más."
          </p>
          <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.7, margin: 0 }}>
            Cuando sabes exactamente dónde va cada peso, tienes el poder de decidir a dónde va el siguiente. Eso es lo que FinanzApp te da.
          </p>
        </div>
      </div>

      {/* Por qué registrar */}
      <div className="bg-white dark:bg-[#0f1826] border border-slate-100 dark:border-blue-900/40 rounded-2xl p-6 shadow-sm">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">¿Por qué registrar tus gastos?</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: '👁️', title: 'Ver para decidir', text: 'Lo que no se mide, no se controla.' },
            { icon: '🎯', title: 'Sin sorpresas', text: 'Nunca más un fin de mes sin plata.' },
            { icon: '📈', title: 'Progreso real', text: 'Cada peso registrado es un paso adelante.' },
            { icon: '🔒', title: 'Solo tuyo', text: 'Tus datos son privados. Siempre.' },
          ].map(v => (
            <div key={v.title} style={{ background: 'var(--color-background-secondary)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{v.icon}</div>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>{v.title}</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>{v.text}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
