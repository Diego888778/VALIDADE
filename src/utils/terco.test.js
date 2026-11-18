import { describe, it, expect } from 'vitest';
import { calcTerco, parseDate } from './terco';
const c = (fabricacao, validade, recebimento, min) => calcTerco({ fabricacao, validade, recebimento }, min);

describe('terço de validade', () => {
  it('exemplo oficial', () => {
    const r = c('2026-07-09', '2027-04-05', '2026-11-11');
    expect(r.total).toBe(270); expect(r.restante).toBe(145);
    expect(r.percentual.toFixed(2)).toBe('53.70'); expect(r.status).toBe('aprovado');
  });
  it('exatamente 1/3 é aprovado', () => {
    const r = c('2026-01-01', '2026-04-01', '2026-03-02');
    expect(r.total).toBe(90); expect(r.restante).toBe(30); expect(r.status).toBe('aprovado');
  });
  it('abaixo de 1/3 é reprovado', () => expect(c('2026-01-01', '2026-04-01', '2026-03-03').status).toBe('reprovado'));
  it('acima de 1/3 é aprovado', () => expect(c('2026-01-01', '2026-04-01', '2026-02-01').status).toBe('aprovado'));
  it('vencido', () => expect(c('2026-01-01', '2026-04-01', '2026-04-02').status).toBe('vencido'));
  it('recebimento antes da fabricação', () => expect(c('2026-01-01', '2026-04-01', '2025-12-31').error).toBeTruthy());
  it('validade antes da fabricação', () => expect(c('2026-04-01', '2026-01-01', '2026-02-01').error).toBeTruthy());
  it('datas inválidas', () => {
    expect(c('2026-02-30', '2026-04-01', '2026-03-01').error).toBeTruthy();
    expect(c('', '2026-04-01', '2026-03-01').error).toBeTruthy();
    expect(parseDate('2024-02-29')).not.toBeNull();
  });
  it('percentual mínimo configurável (2/3)', () => {
    expect(c('2026-01-01', '2026-04-01', '2026-02-01', 200 / 3).status).toBe('reprovado');
    expect(c('2026-01-01', '2026-04-01', '2026-01-31', 200 / 3).status).toBe('aprovado');
  });
  it('dias mínimos e data limite', () => {
    const r = c('2026-01-01', '2026-04-01', '2026-02-01');
    expect(r.minDias).toBe(30); expect(r.margem).toBe(29); expect(r.limite).toBe(parseDate('2026-03-02'));
    expect(c('2026-09-17', '2026-12-17', '2026-11-17').status).toBe('reprovado'); // 30 de 91 dias
  });
});
