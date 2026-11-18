import { Trash2 } from 'lucide-react';

export default function Settings({ config, setConfig, onClear }) {
  const limpar = () => { if (confirm('Apagar TODO o relatório? Esta ação não pode ser desfeita.')) onClear(); };
  return (
    <>
      <h1>Ajustes</h1>
      <p className="sub">Aparência e dados do aparelho</p>
      <section className="card">
        <label>Tema<select value={config.tema} onChange={(e) => setConfig({ ...config, tema: e.target.value })}><option value="claro">Claro</option><option value="escuro">Escuro</option></select></label>
        <div className="actions"><button className="danger" onClick={limpar}><Trash2 size={18} />Limpar relatório</button></div>
      </section>
    </>
  );
}
