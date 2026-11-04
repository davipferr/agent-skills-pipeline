// Testa o que este repositório promete: se uma skill ou um guia sair do padrão,
// ou o FEATURE-MAP.md ficar para trás, `npm test` falha.

import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (path: string) => readFileSync(join(root, path), 'utf8');
const skills = readdirSync(join(root, 'skills'));
const pkg = JSON.parse(read('package.json')) as { scripts: Record<string, string> };

const markdown = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const path = join(dir, d.name);
    return d.isDirectory() ? markdown(path) : d.name.endsWith('.md') ? [path] : [];
  });
const instructions = [
  ...markdown(join(root, 'skills')),
  ...markdown(join(root, 'evals')),
  ...['AGENTS.md', 'CLAUDE.md', 'README.md', 'FEATURE-MAP.md'].map((name) => join(root, name)),
].map((path) => ({ path, name: relative(root, path).replaceAll('\\', '/'), text: readFileSync(path, 'utf8') }));

describe('skills', () => {
  it('cada SKILL.md segue o padrão Agent Skills', () => {
    for (const skill of skills) {
      const text = read(`skills/${skill}/SKILL.md`);
      const field = (key: string) => new RegExp(`^${key}: (.+)$`, 'm').exec(text.split(/^---$/m)[1] ?? '')?.[1];
      assert.equal(field('name'), skill, `${skill}: name diferente da pasta`);
      assert.ok(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(skill) && skill.length <= 64, `${skill}: nome fora do padrão`);
      const description = field('description') ?? '';
      assert.ok(description.length > 0 && description.length <= 1024, `${skill}: description vazia ou com mais de 1024 caracteres`);
    }
  });

  it('o run-pipeline mantém as regras de supervisão', () => {
    const text = read('skills/run-pipeline/SKILL.md');
    assert.match(text, /Nunca faça commit, push nem PR/);
    assert.match(text, /Não crie arquivos além do código da tarefa/);
    assert.match(text, /Casos de teste, como um QA/);
  });
});

describe('instruções', () => {
  it('só citam comandos que existem no package.json', () => {
    const unknown = instructions.flatMap(({ name, text }) =>
      [...text.matchAll(/npm run ([\w-]+)/g)].map((m) => m[1] ?? '').filter((command) => !(command in pkg.scripts)).map((command) => `${name}: ${command}`),
    );
    assert.deepEqual(unknown, []);
  });

  it('não têm link quebrado para outro arquivo', () => {
    const broken = instructions.flatMap(({ path, name, text }) =>
      [...text.matchAll(/\]\(([^)\s]+)\)/g)]
        .map((m) => (m[1] ?? '').split('#')[0] ?? '')
        .filter((target) => target !== '' && !/^[a-z]+:/i.test(target) && !existsSync(join(dirname(path), target)))
        .map((target) => `${name} → ${target}`),
    );
    assert.deepEqual(broken, []);
  });

  it('as skills não mandam gravar nada nas pastas antigas', () => {
    const stale = instructions.filter(({ name }) => name.startsWith('skills/') || name.startsWith('evals/')).filter(({ text }) => /docs\/flow|docs\/runs|(?<![\w-])pipeline\/|--prefix pipeline/.test(text));
    assert.deepEqual(stale.map(({ name }) => name), []);
  });
});

describe('FEATURE-MAP.md', () => {
  const map = read('FEATURE-MAP.md');

  it('cita cada comando, script e skill', () => {
    const scripts = readdirSync(join(root, 'scripts')).filter((file) => file.endsWith('.ts'));
    const missing = [
      ...Object.keys(pkg.scripts).filter((name) => !map.includes(`npm run ${name}`) && !map.includes(`npm ${name}`)),
      ...scripts.filter((file) => !map.includes(`scripts/${file}`)),
      ...skills.filter((skill) => !map.includes(`skills/${skill}/`)),
    ];
    assert.deepEqual(missing, []);
  });
});
