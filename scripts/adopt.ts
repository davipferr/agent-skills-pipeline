// npm run adopt -- <pasta-do-projeto> [--dry-run]
//
// Leva o pipeline para um projeto que já existe (ou atualiza um que já adotou).
// Copia skills/, adapters/ e os scripts (em scripts/pipeline/), junta ao
// package.json só o que falta, e coloca as regras numa seção marcada do AGENTS.md.
// Nunca sobrescreve o flow.yaml nem o skills.json do projeto: esses são dele.

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { ADOPTED_SCRIPTS_DIR, mergePackage, missingLines, upsertSection } from './lib/adopt.ts';
import { bold, dim, green, red, yellow } from './lib/project.ts';

const { positionals, values } = parseArgs({ allowPositionals: true, options: { 'dry-run': { type: 'boolean' } } });
const source = resolve(import.meta.dirname, '..');
const [targetArg] = positionals;
if (!targetArg) {
  console.error(red('Uso: npm run adopt -- <pasta-do-projeto> [--dry-run]'));
  process.exit(1);
}
const target = resolve(targetArg);
if (!existsSync(target) || !statSync(target).isDirectory()) {
  console.error(red(`${target} não existe ou não é uma pasta.`));
  process.exit(1);
}
if (target === source) {
  console.error(red('O alvo é este próprio repositório.'));
  process.exit(1);
}

const dry = values['dry-run'] === true;
const log: string[] = [];
const rel = (path: string) => relative(target, path).replaceAll('\\', '/');

function write(path: string, content: string, label: string) {
  log.push(`  ${label.padEnd(11)} ${rel(path)}`);
  if (dry) return;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

/** Copia um arquivo; `onlyIfMissing` preserva o que o projeto já tem. */
function copyFile(from: string, to: string, onlyIfMissing = false) {
  const content = readFileSync(from, 'utf8');
  const existing = existsSync(to) ? readFileSync(to, 'utf8') : null;
  if (existing === content) return;
  if (existing !== null && onlyIfMissing) {
    log.push(`  ${dim('mantido'.padEnd(11))} ${rel(to)} ${dim('(é do projeto)')}`);
    return;
  }
  write(to, content, existing === null ? green('novo') : yellow('atualizado'));
}

function copyTree(from: string, to: string, skip: string[] = []) {
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    if (skip.includes(entry.name)) continue;
    const a = join(from, entry.name);
    const b = join(to, entry.name);
    if (entry.isDirectory()) copyTree(a, b);
    else copyFile(a, b);
  }
}

// 1. Definição do fluxo: só se o projeto ainda não tiver a dele.
copyFile(join(source, 'flow.yaml'), join(target, 'flow.yaml'), true);
copyFile(join(source, 'skills.json'), join(target, 'skills.json'), true);

// 2. Skills, adapters e scripts do pipeline (atualizados a cada adopt).
for (const dir of readdirSync(join(source, 'skills'))) copyTree(join(source, 'skills', dir), join(target, 'skills', dir));
copyTree(join(source, 'adapters'), join(target, 'adapters'));
// adopt.ts fica de fora: ele só faz sentido rodando a partir do template.
copyTree(join(source, 'scripts'), join(target, ADOPTED_SCRIPTS_DIR), ['adopt.ts']);
copyFile(join(source, 'scripts', 'templates', 'pipeline-package.json'), join(target, ADOPTED_SCRIPTS_DIR, 'package.json'));
copyFile(join(source, '.githooks', 'pre-commit'), join(target, '.githooks', 'pre-commit'), true);
if (!existsSync(join(target, 'evals'))) copyTree(join(source, 'evals'), join(target, 'evals'));

// 3. package.json: acrescenta, nunca sobrescreve.
const pkgPath = join(target, 'package.json');
const sourcePkg = JSON.parse(readFileSync(join(source, 'package.json'), 'utf8'));
const targetPkg = existsSync(pkgPath) ? JSON.parse(readFileSync(pkgPath, 'utf8')) : { name: 'projeto', private: true };
const merged = mergePackage(targetPkg, sourcePkg);
if (merged.added.length > 0) write(pkgPath, `${JSON.stringify(merged.pkg, null, 2)}\n`, yellow('atualizado'));

// 4. Regras para os agentes.
const agentsPath = join(target, 'AGENTS.md');
const agents = existsSync(agentsPath) ? readFileSync(agentsPath, 'utf8') : '# Instruções para agentes\n';
const section = readFileSync(join(source, 'scripts', 'templates', 'agents-section.md'), 'utf8');
const newAgents = upsertSection(agents, section);
if (newAgents !== agents) write(agentsPath, newAgents, existsSync(agentsPath) ? yellow('atualizado') : green('novo'));

const claudePath = join(target, 'CLAUDE.md');
const claude = existsSync(claudePath) ? readFileSync(claudePath, 'utf8') : null;
if (claude === null) write(claudePath, '@AGENTS.md\n', green('novo'));
else if (!claude.includes('@AGENTS.md')) write(claudePath, `${claude.trimEnd()}\n\n@AGENTS.md\n`, yellow('atualizado'));

const ignorePath = join(target, '.gitignore');
const ignore = existsSync(ignorePath) ? readFileSync(ignorePath, 'utf8') : '';
const missing = missingLines(ignore, ['.claude/skills/', '.agents/skills/']);
if (missing.length > 0) {
  write(ignorePath, `${ignore.trimEnd()}${ignore.trim() ? '\n\n' : ''}# Skills instaladas pelo npm run setup\n${missing.join('\n')}\n`, yellow('atualizado'));
}

console.log(bold(`\nAdotando o pipeline em ${target}\n`));
console.log(log.length ? log.join('\n') : dim('  nada a mudar: o projeto já está em dia'));
if (merged.conflicts.length > 0) {
  console.log(yellow(`\n  Já existiam no package.json com outro valor (mantidos): ${merged.conflicts.join(', ')}`));
  console.log(dim('  Confira se eles fazem o que as skills esperam (ex.: `npm run status -- --json`).'));
}
if (dry) {
  console.log('\n(dry-run: nada foi gravado)\n');
  process.exit(0);
}
console.log(green('\n✔ pipeline adotado. No projeto, rode:'));
console.log(`  ${bold('npm install')}  →  ${bold('npm run setup')}  →  ${bold('npm run validate')}\n`);
