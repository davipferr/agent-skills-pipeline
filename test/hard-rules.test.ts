import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mergePackage, missingLines, SECTION_END, SECTION_START, upsertSection } from '../scripts/lib/adopt.ts';
import { activeRun, pipelinePaths, unapprovedEdits } from '../scripts/lib/guard.ts';
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

  it('protege a pasta onde os scripts estão, seja aqui ou num projeto adotado', () => {
    assert.ok(pipelinePaths('scripts/pipeline').includes('scripts/pipeline'));
  });
});

describe('adopt', () => {
  const source = {
    scripts: { setup: 'node scripts/install.ts', status: 'node scripts/status.ts', typecheck: 'tsc' },
    dependencies: { yaml: '2.9.1' },
    engines: { node: '>=22.18.0' },
  };

  it('acrescenta scripts apontando para scripts/pipeline e não traz os do template', () => {
    const { pkg, added } = mergePackage({ name: 'app' }, source);
    assert.deepEqual(pkg.scripts, {
      setup: 'node scripts/pipeline/install.ts',
      status: 'node scripts/pipeline/status.ts',
      precommit: 'npm run validate && npm run guard',
    });
    assert.deepEqual(pkg.devDependencies, { yaml: '2.9.1' });
    assert.ok(added.includes('engines.node'));
  });

  it('nunca sobrescreve o que o projeto já tem', () => {
    const target = { scripts: { status: 'meu-status' }, dependencies: { yaml: '2.0.0' }, engines: { node: '>=20' } };
    const { pkg, conflicts } = mergePackage(target, source);
    assert.equal((pkg.scripts as Record<string, string>).status, 'meu-status');
    assert.equal(pkg.devDependencies, undefined);
    assert.deepEqual(conflicts, ['scripts.status', 'engines.node']);
  });

  it('a seção do AGENTS.md é acrescentada uma vez e atualizada nas próximas', () => {
    const first = upsertSection('# Projeto\n\nregras minhas\n', 'v1');
    assert.equal(first, `# Projeto\n\nregras minhas\n\n${SECTION_START}\nv1\n${SECTION_END}\n`);
    assert.equal(upsertSection(first, 'v2'), `# Projeto\n\nregras minhas\n\n${SECTION_START}\nv2\n${SECTION_END}\n`);
  });

  it('só acrescenta ao .gitignore as linhas que faltam', () => {
    assert.deepEqual(missingLines('node_modules/\r\n.claude/skills/\n', ['.claude/skills/', '.agents/skills/']), ['.agents/skills/']);
  });
});
