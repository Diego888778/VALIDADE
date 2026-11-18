import { fmtDate, fmtPct } from './terco';
const LABEL = { aprovado: 'Aprovado', reprovado: 'Reprovado', vencido: 'Vencido' };
const HEAD = ['Produto', 'SKU', 'Fornecedor', 'Nota fiscal', 'Fabricação', 'Validade', 'Recebimento', 'Prazo total (dias)', 'Dias restantes', '% restante', 'Resultado'];
const rows = (l) => l.map((r) => [r.produto, r.sku || '', r.fornecedor || '', r.nf || '', fmtDate(r.fabricacao), fmtDate(r.validade), fmtDate(r.recebimento), r.total, r.restante, fmtPct(r.percentual), LABEL[r.status]]);
function salvar(blob, nome) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nome; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
export function exportCSV(l) {
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const t = '\uFEFF' + [HEAD, ...rows(l)].map((r) => r.map(esc).join(';')).join('\r\n');
  salvar(new Blob([t], { type: 'text/csv;charset=utf-8' }), 'terco-validade.csv');
}
export async function exportXLSX(l) {
  const X = await import('xlsx');
  const wb = X.utils.book_new();
  X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet([HEAD, ...rows(l)]), 'Validade');
  X.writeFile(wb, 'terco-validade.xlsx');
}
export async function exportPDF(l, empresa) {
  const { default: J } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const d = new J({ orientation: 'landscape' });
  d.setFontSize(14); d.text('Controle de Terço de Validade' + (empresa ? ' – ' + empresa : ''), 14, 14);
  d.setFontSize(9); d.text(`Emitido em ${new Date().toLocaleString('pt-BR')} · ${l.length} registro(s)`, 14, 20);
  autoTable(d, { head: [HEAD], body: rows(l), startY: 25, styles: { fontSize: 8 }, headStyles: { fillColor: [79, 70, 229] } });
  d.save('terco-validade.pdf');
}
