import { useMemo, useState } from 'react';
import { Pencil, Trash2, FileSpreadsheet, FileText, FileDown } from 'lucide-react';
import { fmtDate, fmtPct } from '../utils/terco';
import { exportCSV, exportXLSX, exportPDF } from '../utils/exportar';

const LABEL = { aprovado: 'Aprovado', reprovado: 'Reprovado', vencido: 'Vencido' };
const has = (a, b) => (a || '').toLowerCase().includes(b.trim().toLowerCase());

export default function History({ registros, setRegistros, empresa, onEdit }) {
  const [q, setQ] = useState({ produto: '', fornecedor: '', sku: '', nf: '', de: '', ate: '', status: '', ordem: 'desc' });
  const set = (k) => (e) => setQ({ ...q, [k]: e.target.value });
  const lista = useMemo(() => registros
    .filter((r) => has(r.produto, q.produto) && has(r.fornecedor, q.fornecedor) && has(r.sku, q.sku) && has(r.nf, q.nf)
      && (!q.de || r.recebimento >= q.de) && (!q.ate || r.recebimento <= q.ate) && (!q.status || r.status === q.status))
    .sort((a, b) => (q.ordem === 'asc' ? 1 : -1) * (a.recebimento.localeCompare(b.recebimento) || a.criadoEm - b.criadoEm)), [registros, q]);
  const excluir = (r) => { if (confirm(`Excluir "${r.produto}"?`)) setRegistros((l) => l.filter((x) => x.id !== r.id)); };

  return (
    <>
      <h1>Histórico</h1>
      <section className="card">
        <div className="grid">
          <label className="full">Pesquisar produto<input value={q.produto} onChange={set('produto')} /></label>
          <label>Fornecedor<input value={q.fornecedor} onChange={set('fornecedor')} /></label>
          <label>SKU<input value={q.sku} onChange={set('sku')} /></label>
          <label>Nota fiscal<input value={q.nf} onChange={set('nf')} /></label>
          <label>Recebido de<input type="date" value={q.de} onChange={set('de')} /></label>
          <label>Recebido até<input type="date" value={q.ate} onChange={set('ate')} /></label>
          <label>Resultado<select value={q.status} onChange={set('status')}><option value="">Todos</option><option value="aprovado">Aprovados</option><option value="reprovado">Reprovados</option><option value="vencido">Vencidos</option></select></label>
          <label>Ordenar por data<select value={q.ordem} onChange={set('ordem')}><option value="desc">Mais recentes</option><option value="asc">Mais antigos</option></select></label>
        </div>
        <div className="actions">
          <button disabled={!lista.length} onClick={() => exportXLSX(lista)}><FileSpreadsheet size={18} />Excel</button>
          <button disabled={!lista.length} onClick={() => exportCSV(lista)}><FileText size={18} />CSV</button>
          <button disabled={!lista.length} onClick={() => exportPDF(lista, empresa)}><FileDown size={18} />PDF</button>
        </div>
      </section>
      <section className="card tablewrap">
        {!lista.length ? <p className="msg">Nenhum registro encontrado.</p> : (
          <table>
            <thead><tr><th>Produto</th><th>Fornecedor</th><th>SKU</th><th>NF</th><th>Fab.</th><th>Val.</th><th>Receb.</th><th>Total</th><th>Restam</th><th>%</th><th>Resultado</th><th /></tr></thead>
            <tbody>{lista.map((r) => (
              <tr key={r.id}>
                <td>{r.produto}</td><td>{r.fornecedor}</td><td>{r.sku}</td><td>{r.nf}</td>
                <td>{fmtDate(r.fabricacao)}</td><td>{fmtDate(r.validade)}</td><td>{fmtDate(r.recebimento)}</td>
                <td>{r.total}d</td><td>{r.restante}d</td><td>{fmtPct(r.percentual)}</td>
                <td><span className={`tag ${r.status}`}>{LABEL[r.status]}</span></td>
                <td className="rowact">
                  <button aria-label="Editar" onClick={() => onEdit(r)}><Pencil size={16} /></button>
                  <button aria-label="Excluir" onClick={() => excluir(r)}><Trash2 size={16} /></button>
                </td>
              </tr>))}
            </tbody>
          </table>)}
      </section>
    </>
  );
}
