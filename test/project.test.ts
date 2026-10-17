// Testa o pipeline DE VERDADE deste repositório: se alguém editar o flow.yaml,
// uma skill ou o skills.json e quebrar o fluxo, `npm test` falha.

import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { diskProbe } from '../scripts/lib/files.ts';
import { loadProject } from '../scripts/lib/project.ts';
import { listLocalSkillDirs } from '../scripts/lib/skills.ts';
import { computeStatus } from '../scripts/lib/status.ts';
import { validateProject } from '../scripts/lib/validate.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const example = fileURLToPath(new URL('../examples/contador-de-palavras', import.meta.url));

describe('pipeline deste repositório', () => {
  const project = loadProject(root);

  it('flow.yaml e skills.json são lidos sem erro', () => {
    assert.deepEqual(project.issues, []);
  });

  it('o fluxo fecha (ignorando avisos de instalação, que dependem do npm run setup)', () => {
    assert.ok(project.flow && project.manifest);
    const issues = validateProject(project.flow, project.manifest, listLocalSkillDirs(root), project.probe).filter(
      (i) => !i.message.includes('npm run setup'),
    );
    assert.deepEqual(issues, []);
  });
});

describe('exemplo examples/contador-de-palavras', () => {
  it('é uma execução completa do flow.yaml: todas as etapas prontas', () => {
    const { flow } = loadProject(root);
    assert.ok(flow);
    // As datas dos arquivos dependem de como o repositório foi clonado, então ignoramos.
    const status = computeStatus(flow, diskProbe(example), { ignoreTime: true });
    assert.deepEqual(
      status.steps.filter((s) => s.state !== 'done').map((s) => `${s.id}: ${s.reason}`),
      [],
    );
  });
});
