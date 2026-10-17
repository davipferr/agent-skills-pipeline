import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { activeRun, unapprovedEdits } from '../scripts/lib/guard.ts';
import { flowOf, memProbe, step } from './helpers.ts';

describe('guard', () => {
  const flow = flowOf(step({ id: 'um', outputs: ['docs/flow/01.md'] }), step({ id: 'dois', inputs: ['docs/flow/01.md'], outputs: ['docs/flow/02.md'] }));

  it('há execução em andamento quando algum artefato existe', () => {
    assert.equal(activeRun(flow, memProbe({})), false);
    assert.equal(activeRun(flow, memProbe({ 'docs/flow/01.md': 'x' })), true);
  });

  it('acusa só mudanças que o dono não aprovou com git add', () => {
    const porcelain = ['M  skills/a/SKILL.md', ' M flow.yaml', 'MM scripts/x.ts', '?? skills/nova/SKILL.md', 'A  adapters/y.md', ''].join('\n');
    assert.deepEqual(unapprovedEdits(porcelain), ['flow.yaml', 'scripts/x.ts', 'skills/nova/SKILL.md']);
  });
});
