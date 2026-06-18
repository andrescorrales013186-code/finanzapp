import { useState } from 'react';
import { Mail, Send, Shield, ChevronRight, Phone } from 'lucide-react';
import Finn from './Finn';
import Finna from './Finna';

function InfoHero({ eyebrow, title, sub }) {
  return (
    <div style={{ background: '#0c111d', borderRadius: 16, padding: '24px 24px 20px', marginBottom: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 500, color: '#f97316', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>
        {eyebrow}
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 500, color: '#fff', lineHeight: 1.25, margin: '0 0 10px', letterSpacing: '-.02em' }}>
        {title}
      </h1>
      <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0 }}>{sub}</p>
    </div>
  );
}

export function AcercaDe() {
  const VALUES = [
    { title: 'Simplicidad ante todo', text: 'Si algo es difícil de entender, lo simplificamos hasta que cualquiera lo use sin manual ni conocimientos previos.' },
    { title: 'Sin juicios', text: 'No importa cuántas deudas tengas o cuánto gastes. Estamos aquí para ayudarte a entender tu dinero, no para juzgarte.' },
    { title: 'Tu privacidad primero', text: 'Tus datos financieros son tuyos. Nadie más los ve. Nunca los compartimos ni los vendemos.' },
    { title: 'Pensada para crecer', text: 'Nacimos en Colombia con la visión de llegar a cada persona de habla hispana que quiera tomar el control de su dinero.' },
  ];

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <InfoHero
        eyebrow="Acerca de nosotros"
        title={<>Nacida en Colombia,<br/>pensada para el mundo.</>}
        sub="Empezamos con una historia real y una misión clara: que cualquier persona pueda entender y controlar su dinero, sin importar dónde esté."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          { num: '2024', lbl: 'Año de fundación' },
          { num: '100%', lbl: 'Siempre accesible' },
          { num: '∞', lbl: 'Visión global' },
        ].map(s => (
          <div key={s.lbl} className="bg-white dark:bg-[#0f1826] border border-slate-100 dark:border-blue-900/40 rounded-xl p-4 text-center shadow-sm">
            <div style={{ fontSize: 20, fontWeight: 500, color: '#f97316', marginBottom: 4 }}>{s.num}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#0f1826] border border-slate-100 dark:border-blue-900/40 rounded-2xl p-6 shadow-sm">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Nuestra misión</p>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0 }}>
          El control financiero no debería ser privilegio de quienes tienen contador o estudios en finanzas. Cualquier persona, con cualquier ingreso, merece entender dónde va su dinero y tener el poder de decidir qué hace con él.
        </p>
      </div>

      <div className="bg-white dark:bg-[#0f1826] border border-slate-100 dark:border-blue-900/40 rounded-2xl p-6 shadow-sm">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">Nuestros valores</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {VALUES.map(v => (
            <div key={v.title} style={{ background: 'var(--color-background-secondary)', borderRadius: 10, padding: '14px 16px' }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>{v.title}</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>{v.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#0f1826] border border-slate-100 dark:border-blue-900/40 rounded-2xl p-6 shadow-sm">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">El equipo</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex' }}>
            <Finn  mood="happy" size={56}/>
            <Finna mood="happy" size={56}/>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', margin: '0 0 3px' }}>Jorge Andrés Corrales</p>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '0 0 2px' }}>Fundador · Medellín, Colombia</p>
            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>Construyendo el futuro financiero de Latinoamérica</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Contactenos() {
  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' });
  const [acepto, setAcepto] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.nombre || !form.email || !form.mensaje || !acepto) return;
    setCargando(true);
    await new Promise(r => setTimeout(r, 1500));
    setEnviado(true);
    setCargando(false);
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    border: '0.5px solid var(--color-border-secondary)',
    borderRadius: 8, fontSize: 13,
    background: 'var(--color-background-secondary)',
    color: 'var(--color-text-primary)',
    outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  const ASUNTOS = ['Tengo una sugerencia', 'Encontré un error', 'Quiero reportar un problema', 'Tengo una pregunta', 'Otro'];

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <InfoHero
        eyebrow="Contáctanos"
        title={<>¿Tienes algo que<br/>contarnos?</>}
        sub="Tu opinión nos ayuda a mejorar FinanzApp para todos. Escríbenos y te respondemos pronto."
      />

      <div className="bg-white dark:bg-[#0f1826] border border-slate-100 dark:border-blue-900/40 rounded-2xl p-6 shadow-sm">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">Escríbenos directamente</p>
        <a href="mailto:finanzapp.supporapp@gmail.com" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 16px', border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 10, cursor: 'pointer',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={18} color="#ea580c"/>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>Correo electrónico</p>
              <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>finanzapp.supporapp@gmail.com</p>
            </div>
            <ChevronRight size={14} color="var(--color-text-tertiary)"/>
          </div>
        </a>
      </div>

      {enviado ? (
        <div className="bg-white dark:bg-[#0f1826] border border-slate-100 dark:border-blue-900/40 rounded-2xl p-8 shadow-sm text-center">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Finn mood="excited" size={80}/>
          </div>
          <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>¡Mensaje enviado!</p>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>Te responderemos pronto al correo que nos dejaste.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0f1826] border border-slate-100 dark:border-blue-900/40 rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">Formulario de contacto</p>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 5 }}>Nombre</label>
            <input style={inputStyle} placeholder="Tu nombre completo" value={form.nombre} onChange={update('nombre')}/>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 5 }}>Correo electrónico</label>
            <input style={inputStyle} type="email" placeholder="tu@correo.com" value={form.email} onChange={update('email')}/>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 5 }}>Asunto</label>
            <select style={inputStyle} value={form.asunto} onChange={update('asunto')}>
              <option value="">Selecciona un asunto...</option>
              {ASUNTOS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 10, fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 5 }}>Mensaje</label>
            <textarea
              style={{ ...inputStyle, height: 100, resize: 'none' }}
              placeholder="Cuéntanos en detalle cómo podemos ayudarte o qué quieres mejorar..."
              value={form.mensaje}
              onChange={update('mensaje')}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={acepto} onChange={e => setAcepto(e.target.checked)} style={{ marginTop: 3, accentColor: '#f97316', flexShrink: 0 }}/>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
              Acepto el tratamiento de mis datos personales según la política de privacidad de FinanzApp.
            </span>
          </label>

          <button
            onClick={handleSubmit}
            disabled={!form.nombre || !form.email || !form.mensaje || !acepto || cargando}
            style={{
              width: '100%', padding: 11,
              background: (!form.nombre || !form.email || !form.mensaje || !acepto) ? '#334155' : '#f97316',
              border: 'none', borderRadius: 8, color: '#fff',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background .15s',
            }}
          >
            {cargando
              ? <span style={{ width: 16, height: 16, border: '2px solid #ffffff50', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block' }}/>
              : <><Send size={14}/> Enviar mensaje</>
            }
          </button>
        </div>
      )}
    </div>
  );
}

export function TratamientoDatos() {
  const SECCIONES = [
    { titulo: 'Qué datos recopilamos', texto: 'Recopilamos únicamente el correo electrónico para identificar tu cuenta, y los datos financieros que tú mismo registras (deudas, ingresos, gastos, apuntes). No recopilamos datos de tu dispositivo, ubicación ni comportamiento de navegación.' },
    { titulo: 'Para qué los usamos', texto: 'Tus datos se usan exclusivamente para sincronizar tu información entre dispositivos y permitirte acceder a tu cuenta. Nunca los usamos para publicidad, perfiles de comportamiento ni los compartimos con terceros bajo ninguna circunstancia.' },
    { titulo: 'Dónde se guardan', texto: 'La información se almacena en Google Firebase, un servicio en la nube con certificación de seguridad internacional SOC 2 Type II. Tus datos están cifrados en tránsito (TLS) y en reposo (AES-256).' },
    { titulo: 'Tus derechos', texto: 'En cualquier momento puedes solicitar la eliminación completa de tu cuenta y todos tus datos, exportar tu información, o corregir cualquier dato incorrecto. Escríbenos a finanzapp.supporapp@gmail.com y respondemos en máximo 5 días hábiles.' },
    { titulo: 'Responsable del tratamiento', texto: 'Jorge Andrés Corrales · FinanzApp · Medellín, Colombia\nCorreo: finanzapp.supporapp@gmail.com' },
  ];

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <InfoHero
        eyebrow="Privacidad y datos"
        title={<>Tus datos son tuyos.<br/>Siempre.</>}
        sub="Política de tratamiento de datos personales — escrita en lenguaje claro, sin términos legales innecesarios."
      />

      <div className="bg-white dark:bg-[#0f1826] border border-slate-100 dark:border-blue-900/40 rounded-2xl p-6 shadow-sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {SECCIONES.map((s, i) => (
            <div key={s.titulo}>
              <p style={{ fontSize: 10, fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>{s.titulo}</p>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>{s.texto}</p>
              {i < SECCIONES.length - 1 && <div style={{ height: '0.5px', background: 'var(--color-border-tertiary)', marginTop: 20 }}/>}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#0f1826] border border-slate-100 dark:border-blue-900/40 rounded-2xl p-5 shadow-sm">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield size={18} color="#16a34a"/>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>Cumplimiento legal</p>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Esta política cumple con la Ley 1581 de 2012 de protección de datos personales de Colombia y el Decreto 1377 de 2013. Última actualización: junio 2026.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
