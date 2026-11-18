import { useEffect, useMemo, useState } from 'react';
import { Save, Eraser, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { calcTerco, today, fmtPct } from '../utils/terco';

const empty = () => ({ produto: '', sku: '', fornecedor: '', nf: '', fabricacao: '', validade: '', recebimento: today() });
const TXT = {
  aprovado: ['APROVADO', 'Mercadoria dentro da política mínima de validade.', CheckCircle2],
  reprovado: ['REPROVADO', 'Mercadoria fora da política mínima de validade.', XCircle],
  vencido: ['VENCIDO', 'Produto vencido: não pode ser recebido.', AlertTriangle],
};

export default function Calculator({ config, setRegistros, edit, setEdit }) {
  const [f, setF] = useState(empty());
  const [msg, setMsg] = useState('');
  useEffect(() => { if (edit) setF({ ...empty(), ...edit }); }, [edit]);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setMsg(''); };
  const pronto = f.fabricacao && f.validade && f.recebimento;
  const r = useMemo(() => (pronto ? calcTerco(f, config.minimo) : null), [f, config.minimo, pronto]);

  function salvar() {
    if (!f.produto.trim()) return setMsg('Informe o nome do produto.');
    if (!r || r.error) return setMsg(r?.error || 'Preencha as três datas.');
    const rec = { ...f, produto: f.produto.trim(), total: r.total, restante: r.restante, percentual: r.percentual, status: r.status, minimo: config.minimo, id: edit?.id || Date.now(), criadoEm: edit?.criadoEm || Date.now() };
    setRegistros((l) => (edit ? l.map((x) => (x.id === edit.id ? rec : x)) : [rec, ...l]));
    setF(empty()); setEdit(null); setMsg('Análise salva no histórico.');
  }
  const limpar = () => { setF(empty()); setEdit(null); setMsg(''); };
  const [titulo, texto, Icone] = r && !r.error ? TXT[r.status] : [];

  return (
    <>
      <h1>{edit ? 'Editar análise' : 'Calculadora de validade'}</h1>
      <section className="card">
        <div className="grid">
          <label className="full">Produto *<input value={f.produto} onChange={set('produto')} /></label>
          <label>SKU<input value={f.sku} onChange={set('sku')} /></label>
          <label>Fornecedor<input value={f.fornecedor} onChange={set('fornecedor')} /></label>
          <label>Nota fiscal<input value={f.nf} onChange={set('nf')} /></label>
          <label>Fabricação *<input type="date" value={f.fabricacao} onChange={set('fabricacao')} /></label>
          <label>Validade *<input type="date" value={f.validade} onChange={set('validade')} /></label>
          <label>Recebimento *<input type="date" value={f.recebimento} onChange={set('recebimento')} /></label>
        </div>
        <div className="actions">
          <button className="primary" onClick={salvar}><Save size={18} />Salvar análise</button>
          <button onClick={limpar}><Eraser size={18} />Limpar</button>
        </div>
        {msg && <p className="msg" role="status">{msg}</p>}
      </section>
      {r?.error && <p className="msg err">{r.error}</p>}
      {r && !r.error && (
        <section className={`card res ${r.status}`}>
          <div className="verdict"><Icone size={28} /><div><strong>{titulo}</strong><span>{texto}</span></div></div>
          <div className="bar" role="img" aria-label={`Restam ${fmtPct(r.percentual)}`}>
            <i style={{ width: `${Math.max(0, Math.min(100, r.percentual))}%` }} />
            <b style={{ left: `${config.minimo}%` }} title="Mínimo exigido" />
          </div>
          <dl>
            <dt>Prazo total</dt><dd>{r.total} dias</dd>
            <dt>Dias restantes</dt><dd>{r.restante} dias</dd>
            <dt>Percentual restante</dt><dd>{fmtPct(r.percentual)}</dd>
            <dt>Percentual mínimo exigido</dt><dd>{fmtPct(config.minimo)}</dd>
          </dl>
        </section>
      )}
    </>
  );
}
