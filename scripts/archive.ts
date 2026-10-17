// npm run archive [-- --dry-run]
//
// Guarda a execução atual (docs/flow/*.md e workspace/) em docs/runs/<data>-<ideia>/
// e deixa docs/flow/ vazio para a próxima ideia. Só MOVE arquivos: nada é apagado.

import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parseArgs } from 'node:util';
import { bold, dim, green } from './lib/project.ts';

const { values } = parseArgs({ options: { 'dry-run': { type: 'boolean' }, root: { type: 'string' } } });
const root = values.root ?? process.cwd();
const flowDir = join(root, 'docs', 'flow');

const artifacts = existsSync(flowDir) ? readdirSync(flowDir).filter((f) => f.endsWith('.md')) : [];
if (artifacts.length === 0) {
  console.log('docs/flow/ está vazio: não há execução para arquivar.');
  process.exit(0);
}

// Nome da pasta: data + título da ideia (linha "# Ideia: ..." do 01-ideia.md).
const idea = artifacts.includes('01-ideia.md') ? readFileSync(join(flowDir, '01-ideia.md'), 'utf8') : '';
const title = /^#\s+(?:Ideia:\s*)?(.+)$/m.exec(idea)?.[1] ?? 'execucao';
const slug = title
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .slice(0, 40);
const now = new Date();
const pad = (n: number) => String(n).padStart(2, '0');
const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
const target = join(root, 'docs', 'runs', `${stamp}-${slug}`);

const moves: [string, string][] = artifacts.map((f) => [join(flowDir, f), join(target, f)]);
const workspace = join(root, 'workspace');
if (existsSync(workspace)) moves.push([workspace, join(target, 'workspace')]);

const rel = (path: string) => relative(root, path).replaceAll('\\', '/');
console.log(bold(`\nArquivando em ${rel(target)}\n`));
for (const [from, to] of moves) console.log(`  ${dim(rel(from))} → ${rel(to)}`);
if (values['dry-run']) {
  console.log('\n(dry-run: nada foi movido)\n');
  process.exit(0);
}

mkdirSync(target, { recursive: true });
for (const [from, to] of moves) renameSync(from, to);
console.log(green('\n✔ execução arquivada. docs/flow/ está livre para a próxima ideia.\n'));
