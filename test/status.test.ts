import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { computeStatus } from '../scripts/lib/status.ts';
import { flowOf, memProbe, step } from './helpers.ts';

const flow = flowOf(
  step({ id: 'a', outputs: ['a.md'] }),
  step({ id: 'b', inputs: ['a.md'], outputs: ['b.md'] }),
  step({ id: 'c', inputs: ['b.md'], outputs: ['c.md'] }),
);

const states = (files: Parameters<typeof memProbe>[0], ignoreTime = false) =>
  computeStatus(flow, memProbe(files), { ignoreTime }).steps.map((s) => s.state);

describe('computeStatus', () => {
  it('sem arquivos: a primeira etapa pode rodar e as outras esperam', () => {
    const status = computeStatus(flow, memProbe({}));
    assert.deepEqual(status.steps.map((s) => s.state), ['ready', 'blocked', 'blocked']);
    assert.equal(status.next?.id, 'a');
  });

  it('avança conforme os bastões aparecem', () => {
    assert.deepEqual(states({ 'a.md': ['x', 1] }), ['done', 'ready', 'blocked']);
    assert.deepEqual(states({ 'a.md': ['x', 1], 'b.md': ['x', 2] }), ['done', 'done', 'ready']);
  });

  it('tudo pronto: next é null', () => {
    const status = computeStatus(flow, memProbe({ 'a.md': ['x', 1], 'b.md': ['x', 2], 'c.md': ['x', 3] }));
    assert.equal(status.next, null);
  });

  it('entrada editada depois da saída deixa a etapa desatualizada, e isso desce pelo fluxo', () => {
    // a.md foi editado (mtime 9) depois de b.md (2): b fica stale e c, que depende de b, também
    assert.deepEqual(states({ 'a.md': ['x', 9], 'b.md': ['x', 2], 'c.md': ['x', 3] }), ['done', 'stale', 'stale']);
  });

  it('--ignore-time ignora as datas (útil depois de um git clone)', () => {
    assert.deepEqual(states({ 'a.md': ['x', 9], 'b.md': ['x', 2], 'c.md': ['x', 3] }, true), ['done', 'done', 'done']);
  });

  it('status: in-progress no cabeçalho mantém a etapa em andamento e bloqueia a seguinte', () => {
    const partial = '---\nstep: b\nstatus: in-progress\n---\n# meio feito';
    const status = computeStatus(flow, memProbe({ 'a.md': ['x', 1], 'b.md': [partial, 2] }));
    assert.deepEqual(status.steps.map((s) => s.state), ['done', 'in-progress', 'blocked']);
    assert.equal(status.next?.id, 'b');
  });
});
