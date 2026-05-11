export function calcularInteresMensual(saldoCapital, tasaMensual) {
  return saldoCapital * (tasaMensual / 100);
}

export function calcularCuotaFija(saldoCapital, tasaMensual, plazoMeses) {
  if (plazoMeses === 0) return 0;
  const tasa = tasaMensual / 100;
  if (tasa === 0) return saldoCapital / plazoMeses;
  return (saldoCapital * tasa * Math.pow(1 + tasa, plazoMeses)) / (Math.pow(1 + tasa, plazoMeses) - 1);
}

export function calcularSaldoConInteres(saldoCapital, tasaMensual, meses) {
  return saldoCapital * Math.pow(1 + tasaMensual / 100, meses);
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value) {
  return `${parseFloat(value).toFixed(2)}%`;
}

export function calcularProximoPago(frecuencia, fechaInicio) {
  const hoy = new Date();
  const inicio = fechaInicio ? new Date(fechaInicio) : hoy;
  let proximo = new Date(inicio);

  while (proximo <= hoy) {
    if (frecuencia === 'semanal') proximo.setDate(proximo.getDate() + 7);
    else if (frecuencia === 'quincenal') proximo.setDate(proximo.getDate() + 15);
    else if (frecuencia === 'mensual') proximo.setMonth(proximo.getMonth() + 1);
    else break;
  }
  return proximo;
}

export function diasParaProximoPago(fecha) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const pago = new Date(fecha);
  pago.setHours(0, 0, 0, 0);
  const diff = Math.ceil((pago - hoy) / (1000 * 60 * 60 * 24));
  return diff;
}
