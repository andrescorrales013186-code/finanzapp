// ─────────────────────────────────────────────────────────────────────────────
// Finn.jsx — Mascota masculina de FinanzApp
//
// CÓMO FUNCIONA:
//   • Recibe dos props: mood (estado de ánimo) y size (tamaño en px)
//   • Dependiendo del mood, dibuja cejas, ojos y boca diferentes
//   • El cuerpo (moneda dorada 3D) es siempre el mismo
//   • Se puede usar en cualquier pantalla: <Finn mood="happy" size={80} />
//
// MOODS disponibles:
//   "happy"    → feliz, todo bajo control
//   "worried"  → preocupado, gastos altos
//   "excited"  → enamorado/emocionado, meta cumplida
//   "thinking" → pensando, analizando datos
// ─────────────────────────────────────────────────────────────────────────────

export default function Finn({ mood = 'happy', size = 100 }) {

  // Cada mood devuelve JSX con las partes del rostro diferentes
  const face = {

    happy: (
      <>
        {/* Cejas arqueadas hacia arriba — señal de alegría */}
        <path d="M28 40 Q38 33 46 38" fill="none" stroke="#3D1500" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M64 38 Q72 33 82 40" fill="none" stroke="#3D1500" strokeWidth="3.5" strokeLinecap="round"/>
        {/* Ojos grandes con doble brillo (técnica Pixar) */}
        <ellipse cx="37" cy="51" rx="9" ry="10" fill="#fff"/>
        <ellipse cx="73" cy="51" rx="9" ry="10" fill="#fff"/>
        <ellipse cx="37" cy="52" rx="6" ry="6.5" fill="#3D1500"/>
        <ellipse cx="73" cy="52" rx="6" ry="6.5" fill="#3D1500"/>
        <ellipse cx="37" cy="53" rx="3" ry="3.5" fill="#050200"/>
        <ellipse cx="73" cy="53" rx="3" ry="3.5" fill="#050200"/>
        <circle cx="39" cy="49" r="2.5" fill="#fff"/>
        <circle cx="75" cy="49" r="2.5" fill="#fff"/>
        <circle cx="35" cy="55" r="1" fill="#fff" opacity="0.5"/>
        <circle cx="71" cy="55" r="1" fill="#fff" opacity="0.5"/>
        {/* Nariz pequeña */}
        <ellipse cx="55" cy="62" rx="3.5" ry="2.5" fill="#C07010"/>
        <ellipse cx="55" cy="61.5" rx="2" ry="1" fill="#E09030" opacity="0.5"/>
        {/* Boca con dientes — sonrisa amplia */}
        <path d="M36 72 Q55 88 74 72" fill="#3D1500"/>
        <path d="M36 72 Q55 85 74 72 Q55 80 36 72Z" fill="#B03010"/>
        <rect x="43" y="72" width="9" height="6" rx="3" fill="#F5F0E8"/>
        <rect x="53.5" y="72" width="9" height="6" rx="3" fill="#F5F0E8"/>
      </>
    ),

    worried: (
      <>
        {/* Cejas hacia el centro — señal de preocupación */}
        <path d="M27 38 Q37 44 45 39" fill="none" stroke="#3D1500" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M65 39 Q73 44 83 38" fill="none" stroke="#3D1500" strokeWidth="3.5" strokeLinecap="round"/>
        {/* Ojos más abiertos — expresión de susto */}
        <ellipse cx="37" cy="51" rx="10" ry="11" fill="#fff"/>
        <ellipse cx="73" cy="51" rx="10" ry="11" fill="#fff"/>
        <ellipse cx="37" cy="52" rx="6.5" ry="7" fill="#3D1500"/>
        <ellipse cx="73" cy="52" rx="6.5" ry="7" fill="#3D1500"/>
        <ellipse cx="37" cy="53" rx="3.5" ry="4" fill="#050200"/>
        <ellipse cx="73" cy="53" rx="3.5" ry="4" fill="#050200"/>
        <circle cx="39.5" cy="48.5" r="2.8" fill="#fff"/>
        <circle cx="75.5" cy="48.5" r="2.8" fill="#fff"/>
        {/* Gota de sudor 3D */}
        <path d="M86 20 Q82 26 86 32 Q90 26 86 20Z" fill="#7AC5F5"/>
        <path d="M86 20 Q83 25 86 30 Q87 25 86 20Z" fill="#D0F0FF" opacity="0.5"/>
        <ellipse cx="55" cy="62" rx="3.5" ry="2.5" fill="#C07010"/>
        {/* Boca hacia abajo — tristeza */}
        <path d="M37 76 Q55 66 73 76" fill="none" stroke="#3D1500" strokeWidth="3" strokeLinecap="round"/>
      </>
    ),

    excited: (
      <>
        {/* Estrellas flotando — emoción máxima */}
        <path d="M18 22 L19.5 27 L24 27 L20.5 30 L22 35 L18 32 L14 35 L15.5 30 L12 27 L16.5 27Z" fill="#FBBF24" opacity="0.85"/>
        <path d="M88 18 L89 21 L92 21 L89.5 23 L90.5 26 L88 24.5 L85.5 26 L86.5 23 L84 21 L87 21Z" fill="#FBBF24" opacity="0.7"/>
        {/* Cejas relajadas */}
        <path d="M28 39 Q38 34 46 38" fill="none" stroke="#3D1500" strokeWidth="3" strokeLinecap="round"/>
        <path d="M64 38 Q72 34 82 39" fill="none" stroke="#3D1500" strokeWidth="3" strokeLinecap="round"/>
        {/* Ojos de corazón — técnica clásica de anime y Disney */}
        <path d="M28 44 Q28 40 33 40 Q37 40 37 44 Q37 40 41 40 Q46 40 46 44 Q46 50 37 56 Q28 50 28 44Z" fill="#E03060"/>
        <path d="M64 44 Q64 40 69 40 Q73 40 73 44 Q73 40 77 40 Q82 40 82 44 Q82 50 73 56 Q64 50 64 44Z" fill="#E03060"/>
        <ellipse cx="33" cy="43" rx="3" ry="2" fill="#fff" opacity="0.5" transform="rotate(-20 33 43)"/>
        <ellipse cx="69" cy="43" rx="3" ry="2" fill="#fff" opacity="0.5" transform="rotate(-20 69 43)"/>
        <ellipse cx="55" cy="62" rx="3.5" ry="2.5" fill="#C07010"/>
        {/* Sonrisa con dientes */}
        <path d="M36 71 Q55 86 74 71" fill="#3D1500"/>
        <path d="M36 71 Q55 83 74 71 Q55 79 36 71Z" fill="#B03010"/>
        <rect x="43" y="71" width="9" height="5.5" rx="2.5" fill="#F5F0E8"/>
        <rect x="53.5" y="71" width="9" height="5.5" rx="2.5" fill="#F5F0E8"/>
      </>
    ),

    thinking: (
      <>
        {/* Burbujas de pensamiento — efecto cristal con gradiente */}
        <circle cx="72" cy="24" r="4" fill="white" fillOpacity="0.9" stroke="#B8D4EE" strokeWidth="0.5"/>
        <circle cx="80" cy="16" r="6" fill="white" fillOpacity="0.92" stroke="#B8D4EE" strokeWidth="0.5"/>
        <circle cx="91" cy="8" r="9" fill="white" fillOpacity="0.93" stroke="#B8D4EE" strokeWidth="0.5"/>
        <circle cx="87" cy="5" r="2" fill="#fff" opacity="0.65"/>
        <text x="91" y="12" textAnchor="middle" fontSize="10" fill="#F97316" fontWeight="700">$</text>
        {/* Ceja derecha levantada — señal de análisis */}
        <path d="M28 39 Q37 35 45 38" fill="none" stroke="#3D1500" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M64 36 Q73 30 82 36" fill="none" stroke="#3D1500" strokeWidth="3.5" strokeLinecap="round"/>
        {/* Ojo izq normal, ojo der entrecerrado — asimetría que transmite pensamiento */}
        <ellipse cx="37" cy="50" rx="8" ry="9" fill="#fff"/>
        <ellipse cx="73" cy="51" rx="8" ry="6" fill="#fff"/>
        <ellipse cx="37" cy="51" rx="5" ry="5.5" fill="#3D1500"/>
        <ellipse cx="73" cy="51" rx="5" ry="4" fill="#3D1500"/>
        <ellipse cx="37" cy="52" rx="2.5" ry="3" fill="#050200"/>
        <ellipse cx="73" cy="51" rx="2.5" ry="2.2" fill="#050200"/>
        <circle cx="39" cy="48" r="2.2" fill="#fff"/>
        <circle cx="75" cy="48.5" r="2.2" fill="#fff"/>
        <ellipse cx="55" cy="61" rx="3.5" ry="2.5" fill="#C07010"/>
        {/* Boca torcida — gesto de duda */}
        <path d="M38 70 Q48 66 62 70" fill="none" stroke="#3D1500" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Mano en mentón */}
        <ellipse cx="22" cy="67" rx="8" ry="5" fill="#C87820"/>
        <ellipse cx="22" cy="66" rx="6" ry="3" fill="#FFD060" opacity="0.35"/>
      </>
    ),
  };

  // Los brazos cambian según el mood
  // "excited" = brazos arriba, "worried" = caídos, resto = normal
  const arms = {
    happy: (
      <>
        <path d="M10 58 Q14 48 22 54" fill="none" stroke="#C87820" strokeWidth="8" strokeLinecap="round"/>
        <path d="M10 58 Q14 48 22 54" fill="none" stroke="#FFD060" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
        <path d="M88 54 Q96 48 100 58" fill="none" stroke="#C87820" strokeWidth="8" strokeLinecap="round"/>
        <path d="M88 54 Q96 48 100 58" fill="none" stroke="#FFD060" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
      </>
    ),
    worried: (
      <>
        <path d="M10 65 Q14 75 22 70" fill="none" stroke="#C87820" strokeWidth="8" strokeLinecap="round"/>
        <path d="M10 65 Q14 75 22 70" fill="none" stroke="#FFD060" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
        <path d="M88 70 Q96 75 100 65" fill="none" stroke="#C87820" strokeWidth="8" strokeLinecap="round"/>
        <path d="M88 70 Q96 75 100 65" fill="none" stroke="#FFD060" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
      </>
    ),
    excited: (
      <>
        <path d="M12 48 Q8 34 16 28" fill="none" stroke="#C87820" strokeWidth="8" strokeLinecap="round"/>
        <path d="M12 48 Q8 34 16 28" fill="none" stroke="#FFD060" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
        <path d="M98 48 Q102 34 94 28" fill="none" stroke="#C87820" strokeWidth="8" strokeLinecap="round"/>
        <path d="M98 48 Q102 34 94 28" fill="none" stroke="#FFD060" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
      </>
    ),
    thinking: (
      <>
        {/* Brazo izquierdo apoyado en el mentón */}
        <path d="M10 66 Q16 58 23 63" fill="none" stroke="#C87820" strokeWidth="8" strokeLinecap="round"/>
        <path d="M10 66 Q16 58 23 63" fill="none" stroke="#FFD060" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
        <path d="M88 65 Q96 70 100 62" fill="none" stroke="#C87820" strokeWidth="8" strokeLinecap="round"/>
        <path d="M88 65 Q96 70 100 62" fill="none" stroke="#FFD060" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
      </>
    ),
  };

  // viewBox siempre 110x120 — el tamaño real lo controla el prop "size"
  // Así el SVG escala perfecto en cualquier contexto
  return (
    <svg
      width={size}
      height={size * 1.09}
      viewBox="0 0 110 120"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Finn ${mood}`}
    >
      <defs>
        {/* Gradiente radial — da el efecto de esfera dorada 3D */}
        <radialGradient id={`coin-finn-${mood}`} cx="38%" cy="32%" r="62%">
          <stop offset="0%"   stopColor="#FFE07A"/>
          <stop offset="40%"  stopColor="#F5A623"/>
          <stop offset="100%" stopColor="#B8650A"/>
        </radialGradient>
        {/* Sombra en el borde — profundidad lateral */}
        <radialGradient id={`rim-finn-${mood}`} cx="50%" cy="50%" r="50%">
          <stop offset="70%"  stopColor="transparent"/>
          <stop offset="100%" stopColor="#7A4200" stopOpacity="0.5"/>
        </radialGradient>
        {/* Brillo superior — efecto esfera iluminada */}
        <radialGradient id={`shine-finn-${mood}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#fff" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#fff" stopOpacity="0"/>
        </radialGradient>
        {/* Mejilla */}
        <radialGradient id={`cheek-finn-${mood}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#E07020" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#E07020" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Sombra en el suelo — ancla el personaje */}
      <ellipse cx="55" cy="114" rx="30" ry="6" fill="#00000022"/>

      {/* ── CUERPO: moneda dorada ── */}
      {/* Sombra detrás del cuerpo para dar profundidad */}
      <circle cx="55" cy="55" r="46" fill="#8B4F00" opacity="0.3" transform="translate(3,4)"/>
      {/* Cuerpo principal con gradiente */}
      <circle cx="55" cy="55" r="46" fill={`url(#coin-finn-${mood})`}/>
      {/* Oscurecimiento lateral */}
      <circle cx="55" cy="55" r="46" fill={`url(#rim-finn-${mood})`}/>
      {/* Borde exterior */}
      <circle cx="55" cy="55" r="46" fill="none" stroke="#7A4200" strokeWidth="3"/>
      {/* Borde interior dorado */}
      <circle cx="55" cy="55" r="44" fill="none" stroke="#FFD060" strokeWidth="1.2" opacity="0.6"/>
      {/* Aro interior grabado — sello de identidad */}
      <circle cx="55" cy="55" r="38" fill="none" stroke="#C87820" strokeWidth="1" opacity="0.7"/>

      {/* Brillo principal — hace que parezca una esfera */}
      <ellipse cx="38" cy="30" rx="14" ry="10"
        fill={`url(#shine-finn-${mood})`}
        transform="rotate(-25 38 30)" opacity="0.7"/>

      {/* Mejillas cálidas */}
      <circle cx="24" cy="65" r="11" fill={`url(#cheek-finn-${mood})`}/>
      <circle cx="86" cy="65" r="11" fill={`url(#cheek-finn-${mood})`}/>

      {/* ── ROSTRO: cambia según mood ── */}
      {face[mood] || face.happy}

      {/* ── BRAZOS: cambian según mood ── */}
      {arms[mood] || arms.happy}

      {/* ── PIERNAS: siempre iguales ── */}
      <ellipse cx="40" cy="102" rx="9" ry="5" fill="#C87820"/>
      <ellipse cx="40" cy="101" rx="7" ry="3" fill="#FFD060" opacity="0.4"/>
      <ellipse cx="70" cy="102" rx="9" ry="5" fill="#C87820"/>
      <ellipse cx="70" cy="101" rx="7" ry="3" fill="#FFD060" opacity="0.4"/>
    </svg>
  );
}
