import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseFlow } from '../scripts/lib/flow.ts';
import type { Manifest } from '../scripts/lib/skills.ts';
import { validateProject } from '../scripts/lib/validate.ts';
import { flowOf, memProbe, skillMd, step } from './helpers.ts';

const manifest: Manifest = { agents: ['claude-code'], external: [{ source: 'dono/repo', skills: ['externa'] }] };

/** Projeto mínimo válido: duas skills locais instaladas + o orquestrador. */
function project(extra: Record<string, string> = {}) {
  const files: Record<string, string> = {
    'skills/run-pipeline/SKILL.md': skillMd('run-pipeline'),
    'skills/primeira/SKILL.md': skillMd('primeira', 'Grava `a.md`.'),
    'skills/segunda/SKILL.md': skillMd('segunda', 'Lê a.md e grava `b.md`.'),
    ...extra,
  };
  for (const name of ['run-pipeline', 'primeira', 'segunda', 'externa']) {
    files[`.agents/skills/${name}/SKILL.md`] ??= files[`skills/${name}/SKILL.md`] ?? skillMd(name);
  }
  return files;
}
const dirs = ['primeira', 'run-pipeline', 'segunda'];

const messages = (flow: ReturnType<typeof flowOf>, files = project(), localDirs = dirs) =>
  validateProject(flow, manifest, localDirs, memProbe(files)).map((i) => `${i.level}: ${i.message}`);

const valid = flowOf(
  step({ id: 'um', skill: 'primeira', outputs: ['a.md'] }),
  step({ id: 'dois', skill: 'segunda', inputs: ['a.md'], outputs: ['b.md'] }),
);

describe('validateProject', () => {
  it('um fluxo bem formado não tem problemas', () => {
    assert.deepEqual(messages(valid), []);
  });

  it('acusa entrada produzida por uma etapa que vem depois', () => {
    const flow = flowOf(valid.steps[1]!, valid.steps[0]!);
    assert.match(messages(flow).join('\n'), /error: lê `a.md`, mas quem o produz \(um\) vem depois/);
  });

  it('acusa entrada que ninguém produz', () => {
    const flow = flowOf(step({ id: 'um', skill: 'primeira', inputs: ['fantasma.md'], outputs: ['a.md'] }), valid.steps[1]!);
    assert.match(messages(flow).join('\n'), /error: lê `fantasma.md`, que nenhuma etapa produz/);
  });

  it('acusa arquivo com dois donos', () => {
    const flow = flowOf(valid.steps[0]!, step({ id: 'dois', skill: 'segunda', outputs: ['a.md', 'b.md'] }));
    assert.match(messages(flow).join('\n'), /`a.md` já é saída de um/);
  });

  it('acusa skill local inexistente e sugere o comando para criá-la', () => {
    const flow = flowOf(step({ id: 'um', skill: 'nao-existe', outputs: ['a.md'] }));
    assert.match(messages(flow).join('\n'), /npm run new-skill -- nao-existe/);
  });

  it('acusa SKILL.md cujo name não bate com a pasta', () => {
    const files = project({ 'skills/segunda/SKILL.md': skillMd('outro-nome', 'grava `b.md`') });
    assert.match(messages(valid, files).join('\n'), /precisa ser igual ao nome da pasta \(segunda\)/);
  });

  it('skill externa precisa estar no skills.json', () => {
    const flow = flowOf(...valid.steps, step({ id: 'tres', skill: 'externa', source: 'outro/repo', inputs: ['b.md'], outputs: ['c.md'] }));
    assert.match(messages(flow).join('\n'), /a fonte `outro\/repo` não está no skills.json/);
  });

  it('skill externa sem adapter gera aviso', () => {
    const flow = flowOf(...valid.steps, step({ id: 'tres', skill: 'externa', source: 'dono/repo', inputs: ['b.md'], outputs: ['c.md'] }));
    assert.deepEqual(messages(flow), ['warning: skill externa sem `adapter`: ela não sabe de quais arquivos ler nem onde gravar']);
  });

  it('avisa quando a skill local foi editada depois do setup', () => {
    const files = project({ '.agents/skills/segunda/SKILL.md': skillMd('segunda', 'versão antiga') });
    assert.match(messages(valid, files).join('\n'), /skills\/segunda mudou desde o último setup/);
  });

  it('helpers: skill de apoio inexistente é erro, e existente não conta como "não usada"', () => {
    const files = project({ 'skills/apoio/SKILL.md': skillMd('apoio'), '.agents/skills/apoio/SKILL.md': skillMd('apoio') });
    const withHelper = { ...valid, helpers: ['apoio'] };
    assert.deepEqual(messages(withHelper, files, [...dirs, 'apoio']), []);
    assert.match(messages({ ...valid, helpers: ['fantasma'] }).join('\n'), /a skill de apoio `fantasma` não existe/);
  });

  it('avisa quando o SKILL.md não cita a saída que o flow.yaml promete', () => {
    const flow = flowOf(valid.steps[0]!, step({ id: 'dois', skill: 'segunda', inputs: ['a.md'], outputs: ['outro.md'] }));
    assert.match(messages(flow).join('\n'), /não menciona a saída `outro.md`/);
  });
});

describe('parseFlow', () => {
  it('lê um flow.yaml válido', () => {
    const { flow, issues } = parseFlow('name: x\nsteps:\n  - id: a\n    skill: a\n    source: local\n    inputs: []\n    outputs: [a.md]\n');
    assert.deepEqual(issues, []);
    assert.equal(flow?.steps[0]?.title, 'a');
  });

  it('aponta campos obrigatórios que faltam', () => {
    const { flow, issues } = parseFlow('name: x\nsteps:\n  - id: a\n    inputs: []\n');
    assert.equal(flow, null);
    assert.deepEqual(issues.map((i) => i.message), ['`skill` é obrigatório', '`source` é obrigatório', '`outputs` precisa ser uma lista de caminhos (use [] se vazia)']);
  });
});
