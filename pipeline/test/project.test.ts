// Testa o pipeline DE VERDADE deste repositório: se alguém editar o flow.yaml,
// uma skill ou o skills.json e quebrar o fluxo, `npm test` falha.

import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { describe, it } from 'node:test';
import { PIPELINE_DIR, REPO_ROOT } from '../scripts/lib/files.ts';
import { loadProject } from '../scripts/lib/project.ts';
import { listLocalSkillDirs } from '../scripts/lib/skills.ts';
import { validateProject } from '../scripts/lib/validate.ts';

describe('pipeline deste repositório', () => {
  const project = loadProject(REPO_ROOT);

  it('pipeline/flow.yaml e pipeline/skills.json são lidos sem erro', () => {
    assert.deepEqual(project.issues, []);
  });

  it('o fluxo fecha (ignorando avisos de instalação, que dependem do setup)', () => {
    assert.ok(project.flow && project.manifest);
    const issues = validateProject(project.flow, project.manifest, listLocalSkillDirs(REPO_ROOT), project.probe).filter(
      (i) => !i.message.includes('run setup'),
    );
    assert.deepEqual(issues, []);
  });
});

// Os comandos do pipeline moram em pipeline/package.json e rodam com
// `npm --prefix pipeline run <comando>`. Um `npm run x` solto num guia ou numa
// skill manda o agente rodar algo que não existe na raiz (ou que é do projeto).
describe('instruções do pipeline', () => {
  const pipelineDir = join(REPO_ROOT, PIPELINE_DIR);
  const pkg = JSON.parse(readFileSync(join(pipelineDir, 'package.json'), 'utf8')) as { scripts: Record<string, string> };
  const markdown = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
      if (d.name === 'node_modules') return [];
      const path = join(dir, d.name);
      return d.isDirectory() ? markdown(path) : d.name.endsWith('.md') ? [path] : [];
    });
  const files = [...markdown(pipelineDir), ...['AGENTS.md', 'CLAUDE.md', 'README.md'].map((f) => join(REPO_ROOT, f))];
  const rel = (path: string) => relative(REPO_ROOT, path).replaceAll('\\', '/');

  it('só citam comandos que existem em pipeline/package.json', () => {
    const unknown = files.flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(/npm --prefix pipeline run (?:--silent )?([\w-]+)/g)]
        .map((m) => m[1] ?? '')
        .filter((name) => !(name in pkg.scripts))
        .map((name) => `${rel(file)}: ${name}`),
    );
    assert.deepEqual(unknown, []);
  });

  it('não têm link quebrado para outro arquivo', () => {
    // Os template.md viram artefatos em docs/flow/: os links deles valem a partir de lá.
    const broken = files.filter((file) => !file.endsWith('template.md')).flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(/\]\(([^)\s]+)\)/g)]
        .map((m) => (m[1] ?? '').split('#')[0] ?? '')
        .filter((target) => target !== '' && !/^[a-z]+:/i.test(target))
        .filter((target) => !existsSync(join(dirname(file), target)))
        .map((target) => `${rel(file)} → ${target}`),
    );
    assert.deepEqual(broken, []);
  });

  it('não usam `npm run` sem `--prefix pipeline`', () => {
    const bare = files.flatMap((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .map((line, i) => ({ line, i }))
        .filter(({ line }) => /(^|[^\w-])npm (run|test)\b/.test(line))
        .map(({ i }) => `${rel(file)}:${i + 1}`),
    );
    assert.deepEqual(bare, []);
  });
});
