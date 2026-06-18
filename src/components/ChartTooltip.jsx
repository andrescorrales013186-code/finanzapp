import { formatCurrency } from '../utils/calculations';

export default function ChartTooltip({ active, payload, label, labelFormat }) {
  if (!active || !payload?.length) return null;
  const displayLabel = labelFormat ? labelFormat(label) : label;
  return (
    <div style={{
      background: 'var(--tooltip-bg, #0f1826)',
      border: '1px solid rgba(37,99,235,0.25)',
      borderRadius: 10,
      padding: '8px 14px',
      minWidth: 130,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    }}>
      {displayLabel != null && displayLabel !== '' && (
        <p style={{ color: 'var(--tooltip-text, #f1f5f9)', fontSize: 11, fontWeight: 600, marginBottom: 5, opacity: 0.75 }}>
          {displayLabel}
        </p>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: i < payload.length - 1 ? 3 : 0 }}>
          {payload.length > 1 && (
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0, display: 'inline-block' }} />
          )}
          <p style={{ color: 'var(--tooltip-text, #f1f5f9)', fontSize: 13, fontWeight: 700, margin: 0 }}>
            {p.name && payload.length > 1
              ? <span style={{ fontWeight: 500, fontSize: 11, marginRight: 4 }}>{p.name}:</span>
              : null}
            {formatCurrency(p.value)}
          </p>
        </div>
      ))}
    </div>
  );
}
