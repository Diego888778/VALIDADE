import { createContext, useContext, useRef, useState } from 'react';
import { Lock } from 'lucide-react';

const Ctx = createContext(null);
export const usePin = () => useContext(Ctx);
const KEY = 'terco.pin';
const ler = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };

async function hash(pin, salt) {
  const txt = `${salt}:${pin}`;
  if (globalThis.crypto?.subtle) {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
    return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
  }
  let h = 0; for (const c of txt) h = (h * 31 + c.charCodeAt(0)) | 0;
  return String(h);
}

export function PinProvider({ children }) {
  const [dados, setDados] = useState(ler);
  const [modal, setModal] = useState(null);
  const [valor, setValor] = useState('');
  const [erro, setErro] = useState('');
  const falhas = useRef(0), bloqueio = useRef(0);

  const fechar = (ok) => { modal?.resolve(ok); setModal(null); setValor(''); setErro(''); };
  const pedir = () => (!dados ? Promise.resolve(true) : new Promise((resolve) => setModal({ resolve })));
  const definir = async (pin) => {
    const salt = Math.random().toString(36).slice(2);
    const d = { salt, hash: await hash(pin, salt) };
    localStorage.setItem(KEY, JSON.stringify(d)); setDados(d);
  };
  const remover = () => { localStorage.removeItem(KEY); setDados(null); };

  async function confirmar(e) {
    e.preventDefault();
    if (Date.now() < bloqueio.current) return setErro('Muitas tentativas. Aguarde 30 segundos.');
    if ((await hash(valor, dados.salt)) === dados.hash) { falhas.current = 0; return fechar(true); }
    falhas.current += 1; setValor('');
    if (falhas.current >= 5) { falhas.current = 0; bloqueio.current = Date.now() + 30000; setErro('Muitas tentativas. Aguarde 30 segundos.'); }
    else setErro('PIN incorreto.');
  }

  return (
    <Ctx.Provider value={{ temPin: !!dados, pedir, definir, remover }}>
      {children}
      {modal && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="PIN de administrador">
          <form className="card" onSubmit={confirmar}>
            <h2><Lock size={18} /> PIN de administrador</h2>
            <input type="password" inputMode="numeric" autoComplete="off" maxLength={6} autoFocus value={valor}
              onChange={(e) => { setValor(e.target.value.replace(/\D/g, '')); setErro(''); }} placeholder="Digite o PIN" />
            {erro && <p className="msg err">{erro}</p>}
            <div className="actions">
              <button type="button" onClick={() => fechar(false)}>Cancelar</button>
              <button type="submit" className="primary" disabled={valor.length < 4}>Confirmar</button>
            </div>
          </form>
        </div>)}
    </Ctx.Provider>
  );
}
