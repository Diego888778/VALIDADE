// Lógica de cálculo isolada da interface. Datas civis (AAAA-MM-DD), sem fuso horário.
const RE = /^(\d{4})-(\d{2})-(\d{2})$/;
export const UM_TERCO = 100 / 3;

/** Converte 'AAAA-MM-DD' em número de dias (UTC). Retorna null se inválida. */
export function parseDate(s) {
  const m = RE.exec(s || '');
  if (!m) return null;
  const [y, mo, d] = [+m[1], +m[2], +m[3]];
  const t = Date.UTC(y, mo - 1, d);
  const o = new Date(t);
  if (o.getUTCFullYear() !== y || o.getUTCMonth() !== mo - 1 || o.getUTCDate() !== d) return null;
  return Math.round(t / 864e5);
}
export function today() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}
export const fmtDate = (s) => { const m = RE.exec(s || ''); return m ? `${m[3]}/${m[2]}/${m[1]}` : ''; };
export const fmtDia = (n) => { const d = new Date(n * 864e5); return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`; };
export const fmtDias = (n) => { const r = Math.round(n * 10) / 10; return (Number.isInteger(r) ? String(r) : r.toFixed(1).replace('.', ',')) + (Math.abs(r) === 1 ? ' dia' : ' dias'); };
export const fmtPct = (n) => n.toFixed(2).replace('.', ',') + '%';

/**
 * Terço de validade. minimo = percentual mínimo exigido do prazo TOTAL restante (padrão 1/3).
 * A decisão usa inteiros (dias), sem arredondar o percentual; exatamente no limite = aprovado.
 */
export function calcTerco({ fabricacao, validade, recebimento }, minimo = UM_TERCO) {
  const f = parseDate(fabricacao), v = parseDate(validade), r = parseDate(recebimento);
  if (f === null || v === null || r === null) return { error: 'Datas inválidas.' };
  if (v <= f) return { error: 'A validade deve ser posterior à fabricação.' };
  if (r < f) return { error: 'O recebimento não pode ser anterior à fabricação.' };
  const total = v - f, restante = v - r, percentual = (restante / total) * 100;
  // Dias mínimos que devem restar (1/3 do prazo total, ou o percentual configurado).
  const minDias = Math.abs(minimo - UM_TERCO) < 1e-3 ? total / 3 : (total * minimo) / 100;
  const necessarios = Math.ceil(minDias - 1e-9); // restante é inteiro: compara dias com dias
  const status = restante < 0 ? 'vencido' : restante >= necessarios ? 'aprovado' : 'reprovado';
  return { total, restante, percentual, status, minDias, margem: restante - minDias, limite: v - necessarios };
}
