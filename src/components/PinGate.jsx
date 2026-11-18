import { createContext, useContext, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import { ADMIN } from '../config/admin';

const Ctx = createContext(null);
export const usePin = () => useContext(Ctx);
try { localStorage.removeItem('terco.pin'); } catch { /* PIN local antigo não é mais usado */ }

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
  const [modal, setModal] = useState(null);
  const [valor, setValor] = useState('');
  const [erro, setErro] = useState('');
  const falhas = useRef(0), bloqueio = useRef(0);

  const fechar = (ok) => { modal?.resolve(ok); setModal(null); setValor(''); setErro(''); };
  const pedir = () => (!ADMIN ? Promise.resolve(true) : new Promise((resolve) => setModal({ resolve })));

  async function confirmar(e) {
    e.preventDefault();
    if (Date.now() < bloqueio.current) return setErro('Muitas tentativas. Aguarde 30 segundos.');
    if ((await hash(valor, ADMIN.salt)) === ADMIN.hash) { falhas.current = 0; return fechar(true); }
    falhas.current += 1; setValor('');
    if (falhas.current >= 5) { falhas.current = 0; bloqueio.current = Date.now() + 30000; setErro('Muitas tentativas. Aguarde 30 segundos.'); }
    else setErro('PIN incorreto.');
  }

  return (
    <Ctx.Provider value={{ temPin: !!ADMIN, pedir }}>
      {children}
      {modal && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="PIN de administrador">
          <form className="card" onSubmit={confirmar}>
            <h2><Lock size={18} /> PIN de administrador</h2>
            <input type="password" autoComplete="off" maxLength={30} autoFocus value={valor}
              onChange={(e) => { setValor(e.target.value); setErro(''); }} placeholder="Digite o PIN" />
            {erro && <p className="msg err">{erro}</p>}
            <div className="actions">
              <button type="button" onClick={() => fechar(false)}>Cancelar</button>
              <button type="submit" className="primary" disabled={!valor}>Confirmar</button>
            </div>
          </form>
        </div>)}
    </Ctx.Provider>
  );
}
