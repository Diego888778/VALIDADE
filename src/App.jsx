import { useEffect, useState } from 'react';
import { Calculator as CalcIcon, History as HistIcon, BarChart3, Settings as Cog } from 'lucide-react';
import { useStorage } from './hooks/useStorage';
import { UM_TERCO } from './utils/terco';
import Calculator from './pages/Calculator';
import History from './pages/History';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

const TABS = [['calc', 'Calculadora', CalcIcon], ['hist', 'Histórico', HistIcon], ['dash', 'Dashboard', BarChart3], ['cfg', 'Ajustes', Cog]];

export default function App() {
  const [tab, setTab] = useState('calc');
  const [registros, setRegistros] = useStorage('terco.registros', []);
  const [config, setConfig] = useStorage('terco.config', { minimo: UM_TERCO, empresa: '', tema: 'claro' });
  const [edit, setEdit] = useState(null);
  useEffect(() => { document.documentElement.dataset.tema = config.tema; }, [config.tema]);
  return (
    <div className="app">
      <aside>
        <div className="brand">Terço de Validade<small>{config.empresa}</small></div>
        <nav>{TABS.map(([k, l, I]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}><I size={20} /><span>{l}</span></button>
        ))}</nav>
      </aside>
      <main>
        {tab === 'calc' && <Calculator config={config} setRegistros={setRegistros} edit={edit} setEdit={setEdit} />}
        {tab === 'hist' && <History registros={registros} setRegistros={setRegistros} empresa={config.empresa} onEdit={(r) => { setEdit(r); setTab('calc'); }} />}
        {tab === 'dash' && <Dashboard registros={registros} />}
        {tab === 'cfg' && <Settings config={config} setConfig={setConfig} onClear={() => setRegistros([])} />}
      </main>
    </div>
  );
}
