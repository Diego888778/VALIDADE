import { Trash2, Lock } from 'lucide-react';
import { usePin } from '../components/PinGate';

export default function Settings({ config, setConfig, onClear }) {
  const { temPin, pedir } = usePin();
  const limpar = async () => { if ((await pedir()) && confirm('Apagar TODO o relatório? Esta ação não pode ser desfeita.')) onClear(); };
  return (
    <>
      <h1>Ajustes</h1>
      <p className="sub">Aparência e dados do aparelho</p>
      <section className="card">
        <label>Tema<select value={config.tema} onChange={(e) => setConfig({ ...config, tema: e.target.value })}><option value="claro">Claro</option><option value="escuro">Escuro</option></select></label>
      </section>
      <section className="card">
        <h2>Dados</h2>
        {temPin && <p className="msg" style={{ marginTop: 0 }}><Lock size={14} /> Excluir, exportar e limpar pedem o PIN de administrador.</p>}
        <div className="actions" style={{ marginTop: 0 }}><button className="danger" onClick={limpar}><Trash2 size={18} />Limpar relatório</button></div>
      </section>
    </>
  );
}
