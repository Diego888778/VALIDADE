import { useMemo, useState } from 'react';
import { Pencil, Trash2, FileSpreadsheet, FileText, FileDown, Check } from 'lucide-react';
import { calcTerco, fmtDate, fmtDias } from '../utils/terco';
import { usePin } from '../components/PinGate';
import { exportCSV, exportXLSX, exportPDF } from '../utils/exportar';

const LABEL = { aprovado: 'Aprovado', reprovado: 'Reprovado', vencido: 'Vencido' };
const has = (a, b) => (a || '').toLowerCase().includes(b.trim().toLowerCase());
const CAMPOS = [['produto', 'Produto'], ['sku', 'SKU'], ['fornecedor', 'Fornecedor'], ['nf', 'Nota fiscal']];
const DATAS = [['fabricacao', 'Fabricação'], ['validade', 'Validade'], ['recebimento', 'Recebimento']];

export default function History({ registros, setRegistros, empresa, focusId }) {
  const [q, setQ] = useState({ produto: '', fornecedor: '', sku: '', nf: '', de: '', ate: '', status: '', ordem: 'desc' });
  const [aberto, setAberto] = useState(focusId || null);
  const { pedir } = usePin();
  const protegido = async (fn) => { if (await pedir()) fn(); };
  const set = (k) => (e) => setQ({ ...q, [k]: e.target.value });
  const lista = useMemo(() => registros
    .filter((r) => has(r.produto, q.produto) && has(r.fornecedor, q.fornecedor) && has(r.sku, q.sku) && has(r.nf, q.nf)
      && (!q.de || r.recebimento >= q.de) && (!q.ate || r.recebimento <= q.ate) && (!q.status || r.status === q.status))
    .sort((a, b) => (q.ordem === 'asc' ? 1 : -1) * (a.recebimento.localeCompare(b.recebimento) || a.criadoEm - b.criadoEm)), [registros, q]);

  const atualizar = (id, patch) => setRegistros((l) => l.map((x) => {
    if (x.id !== id) return x;
    const n = { ...x, ...patch }, c = calcTerco(n, n.minimo);
    return c.error ? n : { ...n, total: c.total, restante: c.restante, percentual: c.percentual, status: c.status };
  }));
  const excluir = async (r) => { if (!(await pedir())) return; if (confirm(`Excluir "${r.produto || 'registro sem nome'}"?`)) setRegistros((l) => l.filter((x) => x.id !== r.id)); };

  return (
    <>
      <h1>Relatório</h1>
      <p className="sub">{registros.length} registro(s) salvo(s)</p>
      <details className="card">
        <summary>Filtros e ordenação</summary>
        <label>Pesquisar produto<input value={q.produto} onChange={set('produto')} /></label>
        <label>Fornecedor<input value={q.fornecedor} onChange={set('fornecedor')} /></label>
        <label>SKU<input value={q.sku} onChange={set('sku')} /></label>
        <label>Nota fiscal<input value={q.nf} onChange={set('nf')} /></label>
        <label>Recebido de<input type="date" value={q.de} onChange={set('de')} /></label>
        <label>Recebido até<input type="date" value={q.ate} onChange={set('ate')} /></label>
        <label>Resultado<select value={q.status} onChange={set('status')}><option value="">Todos</option><option value="aprovado">Aprovados</option><option value="reprovado">Reprovados</option><option value="vencido">Vencidos</option></select></label>
        <label>Ordenar por data<select value={q.ordem} onChange={set('ordem')}><option value="desc">Mais recentes</option><option value="asc">Mais antigos</option></select></label>
      </details>
      <div className="actions exp">
        <button disabled={!lista.length} onClick={() => protegido(() => exportXLSX(lista))}><FileSpreadsheet size={18} />Excel</button>
        <button disabled={!lista.length} onClick={() => protegido(() => exportCSV(lista))}><FileText size={18} />CSV</button>
        <button disabled={!lista.length} onClick={() => protegido(() => exportPDF(lista, empresa))}><FileDown size={18} />PDF</button>
      </div>
      {!lista.length && <p className="msg">Nenhum registro encontrado.</p>}
      {lista.map((r) => (
        <article key={r.id} className="card item">
          <div className="top"><strong>{r.produto || 'Sem nome'}</strong><span className={`tag ${r.status}`}>{LABEL[r.status]}</span></div>
          <p className="meta">{[r.fornecedor, r.sku && `SKU ${r.sku}`, r.nf && `NF ${r.nf}`].filter(Boolean).join(' · ') || 'Toque em Editar para informar produto, SKU, fornecedor e NF'}</p>
          <p className="meta">Fab. {fmtDate(r.fabricacao)} · Val. {fmtDate(r.validade)} · Receb. {fmtDate(r.recebimento)}</p>
          <p className="meta"><b>Prazo {fmtDias(r.total)}</b> · <b>{r.restante < 0 ? `vencido há ${fmtDias(-r.restante)}` : `restam ${fmtDias(r.restante)}`}</b></p>
          {aberto === r.id && (
            <div className="edit">
              {CAMPOS.map(([k, l]) => <label key={k}>{l}<input value={r[k] || ''} onChange={(e) => atualizar(r.id, { [k]: e.target.value })} /></label>)}
              {DATAS.map(([k, l]) => <label key={k}>{l}<input type="date" value={r[k]} onChange={(e) => atualizar(r.id, { [k]: e.target.value })} /></label>)}
            </div>)}
          <div className="actions">
            <button onClick={() => setAberto(aberto === r.id ? null : r.id)}>{aberto === r.id ? <><Check size={16} />Concluir</> : <><Pencil size={16} />Editar</>}</button>
            <button className="danger" onClick={() => excluir(r)}><Trash2 size={16} />Excluir</button>
          </div>
        </article>))}
    </>
  );
}
