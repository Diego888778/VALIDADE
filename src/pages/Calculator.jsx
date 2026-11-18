import { useMemo, useState } from 'react';
import { Save, Eraser, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { calcTerco, today, fmtDias, fmtDia } from '../utils/terco';

const vazio = () => ({ fabricacao: '', validade: '', recebimento: today() });
const TXT = {
  aprovado: ['APROVADO', 'Mercadoria dentro da política mínima de validade.', CheckCircle2],
  reprovado: ['REPROVADO', 'Mercadoria fora da política mínima de validade.', XCircle],
  vencido: ['VENCIDO', 'Produto vencido: não pode ser recebido.', AlertTriangle],
};

export default function Calculator({ config, setRegistros, onSaved }) {
  const [f, setF] = useState(vazio());
  const [msg, setMsg] = useState('');
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setMsg(''); };
  const r = useMemo(() => (f.fabricacao && f.validade && f.recebimento ? calcTerco(f, config.minimo) : null), [f, config.minimo]);
  const ok = r && !r.error;
  const terco = Math.abs(config.minimo - 100 / 3) < 1e-3;

  function salvar() {
    if (!r || r.error) return setMsg(r?.error || 'Preencha as três datas.');
    const id = Date.now();
    setRegistros((l) => [{ id, produto: '', sku: '', fornecedor: '', nf: '', ...f, total: r.total, restante: r.restante, percentual: r.percentual, status: r.status, minimo: config.minimo, criadoEm: id }, ...l]);
    setF(vazio()); onSaved(id);
  }
  const [titulo, texto, Icone] = ok ? TXT[r.status] : [];

  return (
    <>
      <h1>Calculadora</h1>
      <p className="sub">Informe as 3 datas do produto</p>
      <section className="card">
        <label>Data de fabricação<input type="date" value={f.fabricacao} onChange={set('fabricacao')} /></label>
        <label>Data de validade<input type="date" value={f.validade} onChange={set('validade')} /></label>
        <label>Data de recebimento<input type="date" value={f.recebimento} onChange={set('recebimento')} /></label>
        <div className="actions">
          <button className="primary" onClick={salvar}><Save size={18} />Salvar no relatório</button>
          <button onClick={() => { setF(vazio()); setMsg(''); }}><Eraser size={18} />Limpar</button>
        </div>
        {msg && <p className="msg err" role="status">{msg}</p>}
      </section>
      {r?.error && <p className="msg err">{r.error}</p>}
      {ok && (
        <section className={`card res ${r.status}`}>
          <div className="verdict"><Icone size={34} /><div><strong>{titulo}</strong><span>{texto}</span></div></div>
          <div className="bar" role="img" aria-label={`Restam ${fmtDias(r.restante)}`}>
            <i style={{ width: `${Math.max(0, Math.min(100, r.percentual))}%` }} />
            <b style={{ left: `${config.minimo}%` }} />
          </div>
          <ul className="dias">
            <li><span>Prazo total</span><b>{fmtDias(r.total)}</b></li>
            <li><span>{terco ? '1/3 do prazo' : `${String(config.minimo).replace('.', ',')}% do prazo`}</span><b>{fmtDias(r.minDias)}</b></li>
            <li><span>Dias restantes no recebimento</span><b>{r.status === 'vencido' ? `vencido há ${fmtDias(-r.restante)}` : fmtDias(r.restante)}</b></li>
            {r.status !== 'vencido' && <li><span>{r.margem >= 0 ? 'Acima do mínimo' : 'Faltam para o mínimo'}</span><b>{fmtDias(Math.abs(r.margem))}</b></li>}
            {r.status !== 'vencido' && <li><span>Receber até</span><b>{fmtDia(r.limite)}</b></li>}
          </ul>
        </section>
      )}
    </>
  );
}
