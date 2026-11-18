import { useState } from 'react';
import { Trash2, Lock, KeyRound, ShieldOff } from 'lucide-react';
import { usePin } from '../components/PinGate';

export default function Settings({ config, setConfig, onClear }) {
  const { temPin, pedir, definir, remover } = usePin();
  const [form, setForm] = useState(false);
  const [a, setA] = useState(''), [b, setB] = useState(''), [msg, setMsg] = useState('');
  const num = (set) => (e) => { set(e.target.value.replace(/\D/g, '')); setMsg(''); };

  const limpar = async () => { if ((await pedir()) && confirm('Apagar TODO o relatório? Esta ação não pode ser desfeita.')) onClear(); };
  const alterar = async () => { if (await pedir()) setForm(true); };
  const tirar = async () => { if (await pedir()) { remover(); setMsg('PIN removido.'); } };
  async function salvarPin() {
    if (!/^\d{4,6}$/.test(a)) return setMsg('Use de 4 a 6 números.');
    if (a !== b) return setMsg('Os PINs não conferem.');
    await definir(a); setForm(false); setA(''); setB(''); setMsg('PIN de administrador salvo.');
  }

  return (
    <>
      <h1>Ajustes</h1>
      <p className="sub">Aparência e dados do aparelho</p>
      <section className="card">
        <label>Tema<select value={config.tema} onChange={(e) => setConfig({ ...config, tema: e.target.value })}><option value="claro">Claro</option><option value="escuro">Escuro</option></select></label>
      </section>
      <section className="card">
        <h2><Lock size={16} /> Administrador</h2>
        <p className="msg" style={{ marginTop: 0 }}>{temPin ? 'PIN ativo: excluir registros, exportar e limpar o relatório pedem o PIN.' : 'Sem PIN: qualquer pessoa pode excluir, exportar e limpar. Crie um PIN para bloquear.'}</p>
        {(!temPin || form) && (
          <>
            <label>{temPin ? 'Novo PIN (4 a 6 números)' : 'Criar PIN (4 a 6 números)'}<input type="password" inputMode="numeric" maxLength={6} value={a} onChange={num(setA)} /></label>
            <label>Repita o PIN<input type="password" inputMode="numeric" maxLength={6} value={b} onChange={num(setB)} /></label>
            <div className="actions"><button className="primary" onClick={salvarPin}><KeyRound size={18} />Salvar PIN</button></div>
          </>)}
        {temPin && !form && (
          <div className="actions">
            <button onClick={alterar}><KeyRound size={18} />Alterar PIN</button>
            <button className="danger" onClick={tirar}><ShieldOff size={18} />Remover PIN</button>
          </div>)}
        {msg && <p className="msg" role="status">{msg}</p>}
      </section>
      <section className="card">
        <h2>Dados</h2>
        <div className="actions" style={{ marginTop: 0 }}><button className="danger" onClick={limpar}><Trash2 size={18} />Limpar relatório</button></div>
      </section>
    </>
  );
}
