import * as XLSX from 'xlsx';
import { calcularInteresMensual } from './calculations';

function formatNum(v) { return parseFloat(v || 0); }

export function exportarExcel(deudas, ingresos, gastos) {
  const wb = XLSX.utils.book_new();

  const ws1 = XLSX.utils.json_to_sheet(deudas.map(d => ({
    'Nombre/Entidad': d.nombre,
    'Tipo Obligación': d.tipoObligacion,
    'Saldo Capital': formatNum(d.saldoCapital),
    'Tasa Interés Mensual %': formatNum(d.tasaInteres),
    'Interés Mensual': calcularInteresMensual(formatNum(d.saldoCapital), formatNum(d.tasaInteres)),
    'Cuota Mensual': formatNum(d.cuotaMensual),
    'Frecuencia Pago': d.frecuenciaPago,
    'Fecha Pago': d.fechaPago || '',
    'Fecha Inicio': d.fechaInicio || '',
    'Portal Banco': d.urlPortal || '',
    'Link PSE': d.urlPSE || '',
    'Recordatorio Días': d.recordatorio || 0,
    'Notas': d.notas || '',
  })));
  XLSX.utils.book_append_sheet(wb, ws1, 'Deudas');

  const ws2 = XLSX.utils.json_to_sheet(ingresos.map(i => ({
    'Descripción': i.nombre,
    'Tipo': i.tipo,
    'Monto': formatNum(i.monto),
    'Frecuencia': i.frecuencia,
    'Fecha': i.fecha || '',
    'Notas': i.notas || '',
  })));
  XLSX.utils.book_append_sheet(wb, ws2, 'Ingresos');

  const ws3 = XLSX.utils.json_to_sheet(gastos.map(g => ({
    'Descripción': g.descripcion,
    'Categoría': g.categoria,
    'Monto': formatNum(g.monto),
    'Frecuencia': g.frecuencia,
    'Es Hormiga': g.esHormiga ? 'Sí' : 'No',
    'Fecha': g.fecha || '',
    'Notas': g.notas || '',
  })));
  XLSX.utils.book_append_sheet(wb, ws3, 'Gastos');

  XLSX.writeFile(wb, 'FinanzApp_datos.xlsx');
}

export function exportarTablaExcel(deudas) {
  const totalCapital = deudas.reduce((s, d) => s + formatNum(d.saldoCapital), 0);
  const rows = deudas.map(d => {
    const capital = formatNum(d.saldoCapital);
    const tasa = formatNum(d.tasaInteres);
    const interesMensual = calcularInteresMensual(capital, tasa);
    return {
      'Nombre/Entidad': d.nombre,
      'Tipo': d.tipoObligacion,
      'Saldo Capital': capital,
      '% del Total': totalCapital > 0 ? +((capital / totalCapital) * 100).toFixed(2) : 0,
      'Tasa Mensual %': tasa,
      'Tasa Anual %': +((Math.pow(1 + tasa / 100, 12) - 1) * 100).toFixed(2),
      'Interés Mensual': +interesMensual.toFixed(0),
      'Interés Anual': +(interesMensual * 12).toFixed(0),
      'Cuota Mensual': formatNum(d.cuotaMensual),
      'Frecuencia Pago': d.frecuenciaPago,
      'Próximo Pago': d.fechaPago || d.fechaInicio || '',
    };
  });
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tabla Resumen');
  XLSX.writeFile(wb, 'FinanzApp_tabla_resumen.xlsx');
}

export function exportarCSV(deudas, ingresos, gastos) {
  const rows = [
    ['Tipo', 'Nombre', 'Categoría', 'Monto', 'Frecuencia', 'Fecha', 'Notas'],
    ...deudas.map(d => ['Deuda', d.nombre, d.tipoObligacion, formatNum(d.saldoCapital), d.frecuenciaPago, d.fechaPago || '', d.notas || '']),
    ...ingresos.map(i => ['Ingreso', i.nombre, i.tipo, formatNum(i.monto), i.frecuencia, i.fecha || '', i.notas || '']),
    ...gastos.map(g => ['Gasto', g.descripcion, g.categoria, formatNum(g.monto), g.frecuencia, g.fecha || '', g.notas || '']),
  ];
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  descargar(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }), 'FinanzApp_datos.csv');
}

export function exportarJSON(deudas, ingresos, gastos) {
  const data = { version: 1, exportado: new Date().toISOString(), deudas, ingresos, gastos };
  descargar(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'FinanzApp_backup.json');
}

function descargar(blob, nombre) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = nombre;
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function importarExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const result = { deudas: [], ingresos: [], gastos: [] };

        if (wb.SheetNames.includes('Deudas')) {
          const rows = XLSX.utils.sheet_to_json(wb.Sheets['Deudas']);
          result.deudas = rows.map(r => ({
            id: Date.now().toString() + Math.random().toString(36).slice(2),
            nombre: r['Nombre/Entidad'] || '',
            tipoObligacion: r['Tipo Obligación'] || 'Otro',
            saldoCapital: r['Saldo Capital'] || 0,
            tasaInteres: r['Tasa Interés Mensual %'] || 0,
            cuotaMensual: r['Cuota Mensual'] || '',
            frecuenciaPago: r['Frecuencia Pago'] || 'mensual',
            fechaPago: r['Fecha Pago'] || '',
            fechaInicio: r['Fecha Inicio'] || '',
            urlPortal: r['Portal Banco'] || '',
            urlPSE: r['Link PSE'] || '',
            recordatorio: r['Recordatorio Días'] || 0,
            notas: r['Notas'] || '',
            historialPagos: [],
          }));
        }

        if (wb.SheetNames.includes('Ingresos')) {
          const rows = XLSX.utils.sheet_to_json(wb.Sheets['Ingresos']);
          result.ingresos = rows.map(r => ({
            id: Date.now().toString() + Math.random().toString(36).slice(2),
            nombre: r['Descripción'] || '',
            tipo: r['Tipo'] || 'Otro',
            monto: r['Monto'] || 0,
            frecuencia: r['Frecuencia'] || 'mensual',
            fecha: r['Fecha'] || '',
            notas: r['Notas'] || '',
          }));
        }

        if (wb.SheetNames.includes('Gastos')) {
          const rows = XLSX.utils.sheet_to_json(wb.Sheets['Gastos']);
          result.gastos = rows.map(r => ({
            id: Date.now().toString() + Math.random().toString(36).slice(2),
            descripcion: r['Descripción'] || '',
            categoria: r['Categoría'] || 'Otro',
            monto: r['Monto'] || 0,
            frecuencia: r['Frecuencia'] || 'mensual',
            esHormiga: r['Es Hormiga'] === 'Sí',
            fecha: r['Fecha'] || '',
            notas: r['Notas'] || '',
            historialPagos: [],
          }));
        }

        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

export async function importarJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try { resolve(JSON.parse(e.target.result)); }
      catch (err) { reject(err); }
    };
    reader.readAsText(file);
  });
}
