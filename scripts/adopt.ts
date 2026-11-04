// npm run adopt -- <pasta-do-repositório> [--dry-run]
//
// Instala as skills do pipeline num repositório sem deixar rastro no git dele: copia
// as skills para .claude/skills/ e .agents/skills/ e as esconde pelo .git/info/exclude,
// que é local e nunca é versionado. Nenhum arquivo versionado do projeto muda.
//
// Rodar de novo atualiza as skills. `npm run adopt -- .` instala neste repositório.

import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { installPaths, missingLines, skillsFor, withExcludeLines } from './lib/adopt.ts';

const REPO_ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));

const { positionals, values } = parseArgs({ allowPositionals: true, options: { 'dry-run': { type: 'boolean' } } });

const fail = (message: string): never => {
  console.error(`\n${message}\n`);
  process.exit(1);
};

const [folder] = positionals;
if (folder === undefined) fail('Uso: npm run adopt -- <pasta-do-repositório> [--dry-run]');

// `npm run` roda na pasta do package.json e guarda a pasta de quem chamou em INIT_CWD.
const typed = resolve(process.env.INIT_CWD ?? process.cwd(), folder as string);
if (!existsSync(typed) || !statSync(typed).isDirectory()) fail(`${typed} não existe ou não é uma pasta.`);

const top = spawnSync('git', ['rev-parse', '--show-toplevel'], { cwd: typed, encoding: 'utf8' });
if (top.status !== 0) fail(`${typed} não é um repositório git: sem o .git/info/exclude, as skills apareceriam no projeto.`);
const target = resolve(top.stdout.trim());
const git = (...args: string[]) => spawnSync('git', args, { cwd: target, encoding: 'utf8' });

// `--git-path` acerta o arquivo também em worktrees, onde .git é um arquivo.
const excludePath = resolve(target, git('rev-parse', '--git-path', 'info/exclude').stdout.trim());
const exclude = existsSync(excludePath) ? readFileSync(excludePath, 'utf8') : '';

const source = join(REPO_ROOT, 'skills');
const all = readdirSync(source, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
const skills = skillsFor(all, target === REPO_ROOT);
const paths = installPaths(skills);
const missing = missingLines(exclude, paths);

// O que já existe e não foi o adopt que instalou é do projeto: nunca sobrescreve.
const tracked = git('ls-files', '--', ...paths).stdout.trim();
if (tracked !== '') fail(`Estes arquivos são versionados pelo projeto, e o adopt não mexe neles:\n${tracked}`);
const foreign = missing.filter((path) => existsSync(join(target, path)));
if (foreign.length > 0) fail(`Já existem no projeto e não vieram do adopt. Renomeie ou apague antes de seguir:\n${foreign.join('\n')}`);

console.log(`\nInstalando em ${target}\n`);
for (const path of paths) console.log(`  ${path}`);

if (values['dry-run']) {
  console.log('\n(dry-run: nada foi gravado)\n');
  process.exit(0);
}

for (const path of paths) {
  const name = path.split('/').at(-2) as string;
  rmSync(join(target, path), { recursive: true, force: true });
  cpSync(join(source, name), join(target, path), { recursive: true });
}
mkdirSync(dirname(excludePath), { recursive: true });
writeFileSync(excludePath, withExcludeLines(exclude, missing));

// A garantia do adopt, conferida no próprio repositório: um `!.claude/` no .gitignore
// do projeto, por exemplo, vence o exclude.
const visible = git('status', '--porcelain', '--untracked-files=all', '--', ...paths).stdout.trim();
if (visible !== '') fail(`O git do projeto está enxergando as skills. Apague-as antes de fazer commit:\n${visible}`);

console.log(`\n${skills.length} skills instaladas; o git do projeto não enxerga nenhuma delas.`);
console.log('Abra o agente nessa pasta e passe uma tarefa.\n');
