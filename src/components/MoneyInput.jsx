/**
 * Input monetario con separador de miles automático.
 * Muestra: 1.500.000  —  guarda: "1500000"
 */
export default function MoneyInput({
  value,
  onChange,
  placeholder = '0',
  className = '',
  min = 0,
  step,
  disabled = false,
}) {
  /* ── Formatea el número con puntos de miles (es-CO: 1.500.000) ── */
  const formatear = (raw) => {
    const digits = String(raw ?? '').replace(/[^0-9]/g, '');
    if (!digits) return '';
    return parseInt(digits, 10).toLocaleString('es-CO');
  };

  /* ── Al cambiar, quita los puntos y notifica el número limpio ── */
  const handleChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    onChange(raw);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={formatear(value)}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  );
}
