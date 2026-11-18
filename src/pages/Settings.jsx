import { useState } from 'react';
import { Trash2, RotateCcw } from 'lucide-react';
import { UM_TERCO } from '../utils/terco';

export default function Settings({ config, setConfig, onClear }) {
  const [txt, setTxt] = useState((Math.round(config.minimo * 1e4) / 1e4).toString());
  const set = (k, v) => setConfig({ ...config, [k]: v });
  const mudaMin = (e) => { setTxt(e.target.value); const v = parseFloat(e.target.value); if (v > 0 && v <= 100) set('minimo', v); };
  const restaurar = () => { setTxt('33.3333'); set('minimo', UM_TERCO); };
  const limpar = () => { if (confirm('Apagar TODO o histórico? Esta ação não pode ser desfeita.')) onClear(); };
  return (
    <>
      <h1>Configurações</h1>
      <section className="card">
        <div className="grid">
          <label className="full">Empresa ou filial<input value={config.empresa} onChange={(e) => set('empresa', e.target.value)} /></label>
          <label>Percentual mínimo exigido (%)<input type="number" step="0.0001" min="0.01" max="100" value={txt} onChange={mudaMin} /></label>
          <label>Tema<select value={config.tema} onChange={(e) => set('tema', e.target.value)}><option value="claro">Claro</option><option value="escuro">Escuro</option></select></label>
        </div>
        <p className="msg">Padrão: 1/3 do prazo total (33,3333…%). Exatamente no limite é aprovado.</p>
        <div className="actions">
          <button onClick={restaurar}><RotateCcw size={18} />Restaurar 1/3</button>
          <button className="danger" onClick={limpar}><Trash2 size={18} />Limpar histórico</button>
        </div>
      </section>
    </>
  );
}
