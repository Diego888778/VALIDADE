import { useEffect, useState } from 'react';
import { Calculator as CalcIcon, History as HistIcon, BarChart3, Settings as Cog } from 'lucide-react';
import { useStorage } from './hooks/useStorage';
import { UM_TERCO } from './utils/terco';
import Calculator from './pages/Calculator';
import History from './pages/History';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

const TABS = [['calc', 'Calculadora', CalcIcon], ['hist', 'Relatório', HistIcon], ['dash', 'Dashboard', BarChart3], ['cfg', 'Ajustes', Cog]];

export default function App() {
  const [tab, setTab] = useState('calc');
  const [registros, setRegistros] = useStorage('terco.registros', []);
  const [cfg, setConfig] = useStorage('terco.config', { tema: 'claro' });
  const config = { ...cfg, minimo: UM_TERCO }; // regra fixa: 1/3 do prazo total
  const [focusId, setFocusId] = useState(null);
  useEffect(() => { document.documentElement.dataset.tema = config.tema; }, [config.tema]);
  return (
    <div className="app">
      <aside>
        <div className="brand">Terço de Validade</div>
        <nav>{TABS.map(([k, l, I]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => { setFocusId(null); setTab(k); }}><I size={20} /><span>{l}</span></button>
        ))}</nav>
      </aside>
      <main>
        {tab === 'calc' && <Calculator config={config} setRegistros={setRegistros} onSaved={(id) => { setFocusId(id); setTab('hist'); }} />}
        {tab === 'hist' && <History registros={registros} setRegistros={setRegistros} empresa="" focusId={focusId} />}
        {tab === 'dash' && <Dashboard registros={registros} />}
        {tab === 'cfg' && <Settings config={cfg} setConfig={setConfig} onClear={() => setRegistros([])} />}
      </main>
    </div>
  );
}
