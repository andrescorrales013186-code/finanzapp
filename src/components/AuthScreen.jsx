import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, LogIn, UserPlus, ArrowLeft, Mail } from 'lucide-react';

const IconGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.6 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.3C9.7 35.5 16.3 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.2 5.2C41 35.8 44 30.3 44 24c0-1.3-.1-2.6-.4-3.9z"/>
  </svg>
);

const IconMicrosoft = () => (
  <svg width="18" height="18" viewBox="0 0 21 21">
    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
  </svg>
);

const ERRORES = {
  'auth/user-not-found':         'No existe una cuenta con ese correo.',
  'auth/wrong-password':         'Contraseña incorrecta.',
  'auth/invalid-credential':     'Correo o contraseña incorrectos.',
  'auth/email-already-in-use':   'Ya existe una cuenta con ese correo.',
  'auth/weak-password':          'La contraseña debe tener al menos 6 caracteres.',
  'auth/invalid-email':          'El formato del correo no es válido.',
  'auth/too-many-requests':      'Demasiados intentos. Intenta más tarde.',
  'auth/network-request-failed': 'Sin conexión. Revisa tu internet.',
  'auth/popup-closed-by-user':   'Cerraste la ventana antes de completar el inicio de sesión.',
  'auth/popup-blocked':          'Tu navegador bloqueó la ventana emergente. Permite ventanas emergentes para este sitio.',
  'auth/cancelled-popup-request':'Inicio de sesión cancelado.',
  'auth/unauthorized-domain':    'Este dominio no está autorizado. Contacta al administrador.',
};

function traducirError(code) {
  return ERRORES[code] || 'Ocurrió un error. Intenta de nuevo.';
}

const features = [
  { emoji: '☁️', title: 'Datos en la nube', desc: 'Tu información sincronizada en todos tus dispositivos.' },
  { emoji: '🔒', title: 'Privado y seguro', desc: 'Solo tú puedes ver tus datos. Nadie más tiene acceso.' },
  { emoji: '📊', title: 'Control total', desc: 'Deudas, ingresos, gastos y recordatorios en un solo lugar.' },
];

export default function AuthScreen() {
  const { login, register, resetPassword, loginWithGoogle, loginWithMicrosoft } = useAuth();
  const [modo, setModo]         = useState('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [verPass, setVerPass]   = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError]       = useState('');
  const [exito, setExito]       = useState('');

  const limpiar = () => { setError(''); setExito(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    limpiar();
    setCargando(true);
    try {
      if (modo === 'login') {
        await login(email.trim(), password);
      } else if (modo === 'register') {
        await register(email.trim(), password);
      } else {
        await resetPassword(email.trim());
        setExito('Revisa tu correo — te enviamos el enlace para restablecer tu contraseña.');
        setCargando(false);
        return;
      }
    } catch (err) {
      setError(traducirError(err.code));
    }
    setCargando(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#080d16]">

      {/* ── Panel izquierdo (desktop) ── */}
      <div className="hidden lg:flex flex-col justify-between flex-1 px-16 py-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)' }}>

        {/* Orbes decorativos */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-4">
          <svg width="48" height="48" viewBox="0 0 120 120" style={{borderRadius:12}} xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="120" rx="28" fill="#080f1e"/>
            <defs>
              <radialGradient id="authC" cx="35%" cy="28%" r="68%"><stop offset="0%" stopColor="#FFF5B0"/><stop offset="25%" stopColor="#F5C040"/><stop offset="60%" stopColor="#D4880A"/><stop offset="100%" stopColor="#7A4200"/></radialGradient>
              <radialGradient id="authR" cx="50%" cy="50%" r="50%"><stop offset="68%" stopColor="transparent"/><stop offset="100%" stopColor="#4A2800" stopOpacity="0.6"/></radialGradient>
              <radialGradient id="authS" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.75"/><stop offset="100%" stopColor="#fff" stopOpacity="0"/></radialGradient>
            </defs>
            <circle cx="60" cy="60" r="52" fill="none" stroke="#C87818" strokeWidth="4.5" strokeDasharray="6 3.2"/>
            <circle cx="60" cy="63" r="45" fill="#4A2800" opacity="0.4"/>
            <circle cx="60" cy="60" r="45" fill="url(#authC)"/>
            <circle cx="60" cy="60" r="45" fill="url(#authR)"/>
            <circle cx="60" cy="60" r="45" fill="none" stroke="#8B5200" strokeWidth="1.5"/>
            <circle cx="60" cy="60" r="37" fill="none" stroke="#7A4200" strokeWidth="1.2" opacity="0.6"/>
            <ellipse cx="43" cy="34" rx="14" ry="9" fill="url(#authS)" transform="rotate(-28 43 34)" opacity="0.8"/>
            <text x="61" y="79" textAnchor="middle" fontSize="52" fontWeight="700" fill="#3A1800" fontFamily="Georgia,serif" opacity="0.8">F$</text>
            <text x="59" y="77" textAnchor="middle" fontSize="52" fontWeight="700" fill="#FFF8D0" fontFamily="Georgia,serif" opacity="0.6">F$</text>
          </svg>
          <div>
            <p className="text-white font-bold text-xl leading-none">FinanzApp</p>
            <p className="text-slate-500 text-xs mt-0.5">Toma el control</p>
          </div>
        </div>

        {/* Headline + features */}
        <div className="relative z-10">
          <div className="mb-14">
            <h2 className="text-white font-extrabold text-5xl leading-tight tracking-tight">
              Tu dinero,<br />
              <span className="text-orange-400">bajo control.</span>
            </h2>
            <p className="text-slate-400 text-lg mt-5 leading-relaxed max-w-md">
              Gestiona deudas, ingresos y gastos desde cualquier dispositivo, con tus datos siempre sincronizados.
            </p>
          </div>

          <div className="space-y-6">
            {features.map(({ emoji, title, desc }) => (
              <div key={title} className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {emoji}
                </div>
                <div className="pt-1">
                  <p className="text-white font-semibold text-base">{title}</p>
                  <p className="text-slate-500 text-sm mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-slate-700 text-xs">© 2026 FinanzApp · El Poder del Dinero</p>
      </div>

      {/* ── Panel derecho (formulario) ── */}
      <div className="flex-shrink-0 lg:w-[480px] flex flex-col items-center justify-center px-6 py-12 lg:px-14"
        style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}>

        {/* Logo móvil */}
        <div className="flex flex-col items-center mb-10 lg:hidden">
          <svg width="64" height="64" viewBox="0 0 120 120" style={{borderRadius:16}} className="mb-3" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="120" rx="28" fill="#080f1e"/>
            <defs>
              <radialGradient id="authMC" cx="35%" cy="28%" r="68%"><stop offset="0%" stopColor="#FFF5B0"/><stop offset="25%" stopColor="#F5C040"/><stop offset="60%" stopColor="#D4880A"/><stop offset="100%" stopColor="#7A4200"/></radialGradient>
              <radialGradient id="authMR" cx="50%" cy="50%" r="50%"><stop offset="68%" stopColor="transparent"/><stop offset="100%" stopColor="#4A2800" stopOpacity="0.6"/></radialGradient>
              <radialGradient id="authMS" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.75"/><stop offset="100%" stopColor="#fff" stopOpacity="0"/></radialGradient>
            </defs>
            <circle cx="60" cy="60" r="52" fill="none" stroke="#C87818" strokeWidth="4.5" strokeDasharray="6 3.2"/>
            <circle cx="60" cy="63" r="45" fill="#4A2800" opacity="0.4"/>
            <circle cx="60" cy="60" r="45" fill="url(#authMC)"/>
            <circle cx="60" cy="60" r="45" fill="url(#authMR)"/>
            <circle cx="60" cy="60" r="45" fill="none" stroke="#8B5200" strokeWidth="1.5"/>
            <circle cx="60" cy="60" r="37" fill="none" stroke="#7A4200" strokeWidth="1.2" opacity="0.6"/>
            <ellipse cx="43" cy="34" rx="14" ry="9" fill="url(#authMS)" transform="rotate(-28 43 34)" opacity="0.8"/>
            <text x="61" y="79" textAnchor="middle" fontSize="52" fontWeight="700" fill="#3A1800" fontFamily="Georgia,serif" opacity="0.8">F$</text>
            <text x="59" y="77" textAnchor="middle" fontSize="52" fontWeight="700" fill="#FFF8D0" fontFamily="Georgia,serif" opacity="0.6">F$</text>
          </svg>
          <h1 className="text-white font-bold text-2xl">FinanzApp</h1>
          <p className="text-slate-400 text-sm mt-1">Toma el control</p>
        </div>

        <div className="w-full max-w-sm">

          {/* Encabezado */}
          {modo === 'reset' ? (
            <div className="mb-8">
              <button onClick={() => { setModo('login'); limpiar(); }}
                className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
                <ArrowLeft size={15} /> Volver
              </button>
              <h2 className="text-white font-bold text-2xl">Restablecer contraseña</h2>
              <p className="text-slate-500 text-sm mt-2">Te enviaremos un enlace a tu correo.</p>
            </div>
          ) : (
            <div className="mb-8">
              <h2 className="text-white font-bold text-2xl mb-1">
                {modo === 'login' ? 'Bienvenido de nuevo' : 'Crear cuenta'}
              </h2>
              <p className="text-slate-500 text-sm">
                {modo === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
                <button onClick={() => { setModo(modo === 'login' ? 'register' : 'login'); limpiar(); }}
                  className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
                  {modo === 'login' ? 'Regístrate' : 'Inicia sesión'}
                </button>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Correo electrónico</label>
              <input
                type="email" value={email}
                onChange={e => { setEmail(e.target.value); limpiar(); }}
                placeholder="tu@correo.com" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/60 focus:bg-white/8 transition-all"
              />
            </div>

            {/* Contraseña */}
            {modo !== 'reset' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contraseña</label>
                <div className="relative">
                  <input
                    type={verPass ? 'text' : 'password'} value={password}
                    onChange={e => { setPassword(e.target.value); limpiar(); }}
                    placeholder={modo === 'register' ? 'Mínimo 6 caracteres' : '••••••••'} required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 pr-12 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/60 focus:bg-white/8 transition-all"
                  />
                  <button type="button" onClick={() => setVerPass(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {verPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            )}

            {/* Error / Éxito */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-xs leading-relaxed">
                {error}
              </div>
            )}
            {exito && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-emerald-400 text-xs leading-relaxed">
                {exito}
              </div>
            )}

            {/* Botón principal */}
            <button type="submit" disabled={cargando}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-500/20 mt-2">
              {cargando ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : modo === 'login' ? (
                <><LogIn size={16} /> Entrar</>
              ) : modo === 'register' ? (
                <><UserPlus size={16} /> Crear cuenta</>
              ) : (
                <><Mail size={16} /> Enviar enlace</>
              )}
            </button>

            {/* Olvidé contraseña */}
            {modo === 'login' && (
              <button type="button" onClick={() => { setModo('reset'); limpiar(); }}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors py-1">
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </form>

          {/* Separador y botones sociales */}
          {modo !== 'reset' && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-xs text-slate-600">o continúa con</span>
                <div className="flex-1 h-px bg-white/8" />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={async () => { limpiar(); setCargando(true); try { await loginWithGoogle(); } catch(e) { console.error('Google error:', e.code, e.message); setError(traducirError(e.code)); setCargando(false); } }}
                  disabled={cargando}
                  className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm text-slate-200 font-medium transition-all disabled:opacity-50 hover:bg-white/8"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <IconGoogle /> Google
                </button>
                <button
                  onClick={() => { limpiar(); setCargando(true); loginWithMicrosoft().catch(e => { console.error('Microsoft error:', e.code, e.message); setError(traducirError(e.code)); setCargando(false); }); }}
                  disabled={cargando}
                  className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm text-slate-200 font-medium transition-all disabled:opacity-50 hover:bg-white/8"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <IconMicrosoft /> Microsoft
                </button>
              </div>
            </>
          )}

          <p className="text-center text-xs text-slate-700 mt-8">
            Tus datos se guardan de forma segura en la nube.
          </p>
        </div>
      </div>
    </div>
  );
}
