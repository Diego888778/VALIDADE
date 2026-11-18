const COR = { aprovado: 'var(--ok)', reprovado: 'var(--bad)', vencido: 'var(--warn)' };
const LABEL = { aprovado: 'Aprovados', reprovado: 'Reprovados', vencido: 'Vencidos' };

export default function Dashboard({ registros }) {
  const total = registros.length;
  const n = (s) => registros.filter((r) => r.status === s).length;
  const pc = (x) => (total ? ((x / total) * 100).toFixed(1).replace('.', ',') : '0,0') + '%';
  const st = ['aprovado', 'reprovado', 'vencido'];
  return (
    <>
      <h1>Dashboard</h1>
      <div className="kpis">
        <div className="card kpi"><span>Analisados</span><strong>{total}</strong></div>
        {st.map((s) => <div key={s} className="card kpi"><span>{LABEL[s]}</span><strong style={{ color: COR[s] }}>{n(s)}</strong></div>)}
        <div className="card kpi"><span>% aprovação</span><strong>{pc(n('aprovado'))}</strong></div>
        <div className="card kpi"><span>% reprovação</span><strong>{pc(n('reprovado') + n('vencido'))}</strong></div>
      </div>
      <section className="card">
        <h2>Distribuição dos resultados</h2>
        {!total ? <p className="msg">Salve análises para ver os gráficos.</p> : (
          <>
            <div className="stack">{st.map((s) => n(s) > 0 && <i key={s} style={{ flex: n(s), background: COR[s] }} title={LABEL[s]} />)}</div>
            {st.map((s) => (
              <div key={s} className="hbar"><span>{LABEL[s]}</span><div><i style={{ width: pc(n(s)).replace(',', '.'), background: COR[s] }} /></div><b>{n(s)}</b></div>
            ))}
          </>)}
      </section>
    </>
  );
}
