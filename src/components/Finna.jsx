// ─────────────────────────────────────────────────────────────────────────────
// Finna.jsx — Mascota femenina de FinanzApp
//
// Misma estructura que Finn.jsx pero con:
//   • Cabello ondulado violeta
//   • Lazo rosa 3D en la cabeza
//   • Pestañas largas
//   • Iris violeta
//   • Labios rosados con gradiente
//
// MOODS:
//   "happy"     → feliz con sonrisa
//   "surprised" → sorprendida ante gasto inesperado
//   "flirty"    → coqueta / guiño — meta cumplida
//   "thinking"  → pensativa con burbuja de pensamiento
// ─────────────────────────────────────────────────────────────────────────────

// Pestañas — reutilizadas en todos los moods
// Son 5 líneas por ojo, cada una con un ángulo diferente para efecto abanico
function Lashes({ side = 'left' }) {
  const L = [
    { x1: 28, y1: 46, x2: 26, y2: 43 },
    { x1: 32, y1: 44, x2: 31, y2: 41 },
    { x1: 37, y1: 43, x2: 37, y2: 40 },
    { x1: 42, y1: 44, x2: 43, y2: 41 },
    { x1: 46, y1: 46, x2: 48, y2: 43 },
  ];
  const R = [
    { x1: 64, y1: 46, x2: 62, y2: 43 },
    { x1: 68, y1: 44, x2: 67, y2: 41 },
    { x1: 73, y1: 43, x2: 73, y2: 40 },
    { x1: 78, y1: 44, x2: 79, y2: 41 },
    { x1: 82, y1: 46, x2: 84, y2: 43 },
  ];
  return (side === 'left' ? L : R).map((l, i) => (
    <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
      stroke="#1a0a00" strokeWidth="1.5" strokeLinecap="round"/>
  ));
}

export default function Finna({ mood = 'happy', size = 100 }) {

  const uid = `finna-${mood}`; // ID único para los gradientes — evita conflictos si hay varios SVG en pantalla

  const face = {

    happy: (
      <>
        <path d="M29 41 Q38 35 46 40" fill="none" stroke="#3D1500" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M64 40 Q72 35 81 41" fill="none" stroke="#3D1500" strokeWidth="2.5" strokeLinecap="round"/>
        <Lashes side="left"/>
        <Lashes side="right"/>
        {/* Iris violeta — diferencia visual con Finn */}
        <ellipse cx="37" cy="52" rx="9" ry="10" fill="#fff"/>
        <ellipse cx="73" cy="52" rx="9" ry="10" fill="#fff"/>
        <ellipse cx="37" cy="53" rx="6" ry="6.5" fill="#5B21B6"/>
        <ellipse cx="73" cy="53" rx="6" ry="6.5" fill="#5B21B6"/>
        <ellipse cx="37" cy="54" rx="3.5" ry="4" fill="#1a0500"/>
        <ellipse cx="73" cy="54" rx="3.5" ry="4" fill="#1a0500"/>
        <circle cx="39.5" cy="49.5" r="2.8" fill="#fff"/>
        <circle cx="75.5" cy="49.5" r="2.8" fill="#fff"/>
        <circle cx="36" cy="56" r="1.2" fill="#fff" opacity="0.5"/>
        <circle cx="72" cy="56" r="1.2" fill="#fff" opacity="0.5"/>
        {/* Nariz femenina — solo una curva sutil */}
        <path d="M52 64 Q55 67 58 64" fill="none" stroke="#C07010" strokeWidth="1.8" strokeLinecap="round"/>
        {/* Labios rosados */}
        <path d="M38 74 Q55 87 72 74" fill={`url(#lip-${uid})`}/>
        <path d="M38 74 Q55 72 72 74 Q55 70 38 74Z" fill="#F9A8D4" opacity="0.5"/>
        <path d="M38 74 Q55 84 72 74 Q55 81 38 74Z" fill="#BE185D"/>
        <path d="M43 74 Q55 79 67 74" fill="#F472B6" opacity="0.4"/>
      </>
    ),

    surprised: (
      <>
        {/* Cejas muy arriba — sorpresa */}
        <path d="M27 37 Q37 29 46 35" fill="none" stroke="#3D1500" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M64 35 Q73 29 83 37" fill="none" stroke="#3D1500" strokeWidth="2.5" strokeLinecap="round"/>
        <Lashes side="left"/>
        <Lashes side="right"/>
        {/* Ojos muy abiertos */}
        <ellipse cx="37" cy="52" rx="10" ry="12" fill="#fff"/>
        <ellipse cx="73" cy="52" rx="10" ry="12" fill="#fff"/>
        <ellipse cx="37" cy="54" rx="7" ry="8" fill="#5B21B6"/>
        <ellipse cx="73" cy="54" rx="7" ry="8" fill="#5B21B6"/>
        <ellipse cx="37" cy="55" rx="4" ry="5" fill="#1a0500"/>
        <ellipse cx="73" cy="55" rx="4" ry="5" fill="#1a0500"/>
        <circle cx="40" cy="49" r="3" fill="#fff"/>
        <circle cx="76" cy="49" r="3" fill="#fff"/>
        <path d="M52 66 Q55 69 58 66" fill="none" stroke="#C07010" strokeWidth="1.8" strokeLinecap="round"/>
        {/* Boca en O — sorpresa clásica */}
        <ellipse cx="55" cy="77" rx="8" ry="9" fill="#BE185D"/>
        <ellipse cx="55" cy="77" rx="6" ry="7" fill="#7C0A3E"/>
        <ellipse cx="55" cy="74" rx="4" ry="2" fill="#F9A8D4" opacity="0.4"/>
      </>
    ),

    flirty: (
      <>
        {/* Ceja izq normal, ceja der alzada — coquetería */}
        <path d="M27 41 Q37 35 46 40" fill="none" stroke="#3D1500" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M64 38 Q72 34 81 41" fill="none" stroke="#3D1500" strokeWidth="2.5" strokeLinecap="round"/>

        {/* OJO IZQUIERDO: guiño cerrado — solo una línea curva + pestañas */}
        <path d="M28 50 Q37 44 46 50" fill="none" stroke="#3D1500" strokeWidth="3" strokeLinecap="round"/>
        <Lashes side="left"/>

        {/* OJO DERECHO: abierto normal */}
        <Lashes side="right"/>
        <ellipse cx="73" cy="52" rx="9" ry="10" fill="#fff"/>
        <ellipse cx="73" cy="53" rx="6" ry="6.5" fill="#5B21B6"/>
        <ellipse cx="73" cy="54" rx="3.5" ry="4" fill="#1a0500"/>
        <circle cx="75.5" cy="49.5" r="2.8" fill="#fff"/>
        <circle cx="71" cy="56" r="1.2" fill="#fff" opacity="0.5"/>

        {/* Pequeñas estrellas — logro cumplido */}
        <path d="M88 28 L89.2 32 L93 32 L90 34.5 L91.2 38 L88 35.5 L84.8 38 L86 34.5 L83 32 L86.8 32Z" fill="#FBBF24" opacity="0.8"/>
        <path d="M16 32 L17 35 L20 35 L17.5 37 L18.5 40 L16 38.5 L13.5 40 L14.5 37 L12 35 L15 35Z" fill="#FBBF24" opacity="0.7"/>

        <path d="M52 64 Q55 67 58 64" fill="none" stroke="#C07010" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M39 73 Q55 85 71 73" fill={`url(#lip-${uid})`}/>
        <path d="M39 73 Q55 71 71 73 Q55 69 39 73Z" fill="#F9A8D4" opacity="0.5"/>
        <path d="M39 73 Q55 82 71 73 Q55 79 39 73Z" fill="#BE185D"/>
      </>
    ),

    thinking: (
      <>
        {/* Burbujas de pensamiento en rosa — diferencia con Finn que las tiene azules */}
        <circle cx="72" cy="26" r="4" fill="white" fillOpacity="0.9" stroke="#F4C0D1" strokeWidth="0.5"/>
        <circle cx="80" cy="18" r="6" fill="white" fillOpacity="0.92" stroke="#F4C0D1" strokeWidth="0.5"/>
        <circle cx="91" cy="9" r="9" fill="white" fillOpacity="0.93" stroke="#F4C0D1" strokeWidth="0.5"/>
        <circle cx="87" cy="6" r="2" fill="#fff" opacity="0.65"/>
        <text x="91" y="13" textAnchor="middle" fontSize="9" fill="#EC4899" fontWeight="700">$</text>

        {/* Cejas semi-bajas — concentración */}
        <path d="M28 40 Q37 36 46 39" fill="none" stroke="#3D1500" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M64 37 Q73 32 82 38" fill="none" stroke="#3D1500" strokeWidth="2.5" strokeLinecap="round"/>
        <Lashes side="left"/>
        <Lashes side="right"/>

        {/* Ojos medio cerrados — mirada pensativa */}
        <ellipse cx="37" cy="51" rx="9" ry="7" fill="#fff"/>
        <ellipse cx="73" cy="51" rx="9" ry="7" fill="#fff"/>
        <ellipse cx="37" cy="52" rx="6" ry="5" fill="#5B21B6"/>
        <ellipse cx="73" cy="52" rx="6" ry="5" fill="#5B21B6"/>
        <ellipse cx="37" cy="52" rx="3.2" ry="3" fill="#1a0500"/>
        <ellipse cx="73" cy="52" rx="3.2" ry="3" fill="#1a0500"/>
        <circle cx="39" cy="49.5" r="2.2" fill="#fff"/>
        <circle cx="75" cy="49.5" r="2.2" fill="#fff"/>
        {/* Párpado caído — cansancio / concentración */}
        <path d="M28 49 Q37 46 46 49" fill="#F5A623" opacity="0.5"/>
        <path d="M64 49 Q73 46 82 49" fill="#F5A623" opacity="0.5"/>

        <path d="M52 63 Q55 66 58 63" fill="none" stroke="#C07010" strokeWidth="1.8" strokeLinecap="round"/>
        {/* Boca torcida rosa */}
        <path d="M40 72 Q50 69 64 72" fill="none" stroke="#BE185D" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Mano en mejilla */}
        <ellipse cx="22" cy="65" rx="8" ry="5" fill="#C87820"/>
        <ellipse cx="22" cy="64" rx="5.5" ry="3" fill="#FFD060" opacity="0.35"/>
      </>
    ),
  };

  const arms = {
    happy: (
      <>
        <path d="M11 60 Q14 50 22 56" fill="none" stroke="#C87820" strokeWidth="7" strokeLinecap="round"/>
        <path d="M11 60 Q14 50 22 56" fill="none" stroke="#FFD060" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
        <path d="M88 56 Q96 50 99 60" fill="none" stroke="#C87820" strokeWidth="7" strokeLinecap="round"/>
        <path d="M88 56 Q96 50 99 60" fill="none" stroke="#FFD060" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
      </>
    ),
    surprised: (
      <>
        <path d="M11 60 Q14 50 22 56" fill="none" stroke="#C87820" strokeWidth="7" strokeLinecap="round"/>
        <path d="M11 60 Q14 50 22 56" fill="none" stroke="#FFD060" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
        <path d="M88 56 Q96 50 99 60" fill="none" stroke="#C87820" strokeWidth="7" strokeLinecap="round"/>
        <path d="M88 56 Q96 50 99 60" fill="none" stroke="#FFD060" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
      </>
    ),
    flirty: (
      <>
        {/* Brazos abiertos — celebración */}
        <path d="M11 55 Q8 43 16 38" fill="none" stroke="#C87820" strokeWidth="7" strokeLinecap="round"/>
        <path d="M11 55 Q8 43 16 38" fill="none" stroke="#FFD060" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
        <path d="M99 55 Q102 43 94 38" fill="none" stroke="#C87820" strokeWidth="7" strokeLinecap="round"/>
        <path d="M99 55 Q102 43 94 38" fill="none" stroke="#FFD060" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
      </>
    ),
    thinking: (
      <>
        {/* Brazo izq apoyado en mejilla */}
        <path d="M11 62 Q16 54 23 60" fill="none" stroke="#C87820" strokeWidth="7" strokeLinecap="round"/>
        <path d="M11 62 Q16 54 23 60" fill="none" stroke="#FFD060" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
        <path d="M88 58 Q96 53 99 62" fill="none" stroke="#C87820" strokeWidth="7" strokeLinecap="round"/>
        <path d="M88 58 Q96 53 99 62" fill="none" stroke="#FFD060" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size * 1.16}
      viewBox="0 0 110 128"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Finna ${mood}`}
    >
      <defs>
        <radialGradient id={`coin-${uid}`} cx="38%" cy="32%" r="62%">
          <stop offset="0%"   stopColor="#FFE07A"/>
          <stop offset="40%"  stopColor="#F5A623"/>
          <stop offset="100%" stopColor="#B8650A"/>
        </radialGradient>
        <radialGradient id={`rim-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="70%"  stopColor="transparent"/>
          <stop offset="100%" stopColor="#7A4200" stopOpacity="0.5"/>
        </radialGradient>
        <radialGradient id={`shine-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#fff" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#fff" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id={`cheek-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#F472B6" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#F472B6" stopOpacity="0"/>
        </radialGradient>
        {/* Gradiente labios rosa */}
        <radialGradient id={`lip-${uid}`} cx="50%" cy="30%" r="70%">
          <stop offset="0%"   stopColor="#F472B6"/>
          <stop offset="100%" stopColor="#BE185D"/>
        </radialGradient>
      </defs>

      <ellipse cx="55" cy="122" rx="30" ry="6" fill="#00000020"/>

      {/* ── CABELLO — siempre presente, detrás del cuerpo ── */}
      {/* Mechones traseros laterales */}
      <path d="M20 45 Q10 30 18 15 Q28 5 38 12 Q30 8 26 20 Q22 35 28 55Z" fill="#7C3AED" opacity="0.9"/>
      <path d="M90 45 Q100 30 92 15 Q82 5 72 12 Q80 8 84 20 Q88 35 82 55Z" fill="#7C3AED" opacity="0.9"/>
      {/* Cabello superior */}
      <path d="M18 38 Q20 8 55 6 Q90 8 92 38 Q85 15 55 14 Q25 15 18 38Z" fill="#7C3AED"/>
      {/* Mechones laterales largos */}
      <path d="M16 50 Q8 65 14 80 Q18 70 22 60Z" fill="#6D28D9" opacity="0.85"/>
      <path d="M94 50 Q102 65 96 80 Q92 70 88 60Z" fill="#6D28D9" opacity="0.85"/>
      {/* Brillo del cabello */}
      <path d="M30 12 Q45 8 60 10" fill="none" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>

      {/* ── CUERPO: moneda dorada ── */}
      <circle cx="55" cy="58" r="44" fill="#8B4F00" opacity="0.28" transform="translate(3,4)"/>
      <circle cx="55" cy="58" r="44" fill={`url(#coin-${uid})`}/>
      <circle cx="55" cy="58" r="44" fill={`url(#rim-${uid})`}/>
      <circle cx="55" cy="58" r="44" fill="none" stroke="#7A4200" strokeWidth="2.5"/>
      <circle cx="55" cy="58" r="42" fill="none" stroke="#FFD060" strokeWidth="1" opacity="0.6"/>
      <circle cx="55" cy="58" r="37" fill="none" stroke="#C87820" strokeWidth="0.8" opacity="0.6"/>
      <ellipse cx="38" cy="33" rx="13" ry="9"
        fill={`url(#shine-${uid})`} transform="rotate(-25 38 33)" opacity="0.7"/>

      {/* ── LAZO — encima del cuerpo, marca registrada de Finna ── */}
      {/* Centro del lazo */}
      <path d="M42 18 Q55 12 68 18 Q60 22 55 20 Q50 22 42 18Z" fill="#EC4899"/>
      {/* Ala izquierda */}
      <path d="M42 18 Q36 12 40 8 Q46 6 50 12 Q46 16 42 18Z" fill="#F472B6"/>
      {/* Ala derecha */}
      <path d="M68 18 Q74 12 70 8 Q64 6 60 12 Q64 16 68 18Z" fill="#F472B6"/>
      {/* Nudo central 3D */}
      <circle cx="55" cy="18" r="5" fill="#BE185D"/>
      {/* Brillo del nudo */}
      <circle cx="55" cy="17" r="2.5" fill="#F9A8D4" opacity="0.6"/>

      {/* Mejillas rosas más intensas que Finn */}
      <circle cx="23" cy="65" r="10" fill={`url(#cheek-${uid})`}/>
      <circle cx="87" cy="65" r="10" fill={`url(#cheek-${uid})`}/>

      {/* ── ROSTRO ── */}
      {face[mood] || face.happy}

      {/* ── BRAZOS ── */}
      {arms[mood] || arms.happy}

      {/* ── PIERNAS ── */}
      <ellipse cx="40" cy="104" rx="9" ry="5" fill="#C87820"/>
      <ellipse cx="40" cy="103" rx="7" ry="3" fill="#FFD060" opacity="0.4"/>
      <ellipse cx="70" cy="104" rx="9" ry="5" fill="#C87820"/>
      <ellipse cx="70" cy="103" rx="7" ry="3" fill="#FFD060" opacity="0.4"/>
    </svg>
  );
}
