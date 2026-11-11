// npm run adopt [-- <pasta-do-projeto>] [--force] [--dry-run]
//
// Copia as skills para .claude/skills/ e .agents/skills/. Sem pasta, instala na pasta
// do usuário, e as skills valem para todos os projetos. Com uma pasta, instala só nela,
// e as skills aparecem no git do projeto como qualquer arquivo novo.
//
// Rodar de novo atualiza as skills. Uma skill com o mesmo nome e outro conteúdo só é
// trocada com --force. `npm run adopt -- .` atualiza as cópias deste repositório.
//
// As instruções de instrucoes.md vão para o CLAUDE.md e o AGENTS.md (na pasta do usuário,
// .claude/CLAUDE.md e .codex/AGENTS.md), num bloco marcado. O resto desses arquivos não muda.
// Este repositório já tem as próprias instruções e não recebe o bloco.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { importsAgents, installPaths, instructionPaths, isSkillsFolder, skillsFor, snapshot, withBlock } from './lib/adopt.ts';

const REPO_ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { force: { type: 'boolean' }, 'dry-run': { type: 'boolean' } },
});

const fail = (message: string): never => {
  console.error(`\n${message}\n`);
  process.exit(1);
};

const [folder] = positionals;
// `npm run` roda na pasta do package.json e guarda a pasta de quem chamou em INIT_CWD.
const target = folder === undefined ? homedir() : resolve(process.env.INIT_CWD || process.cwd(), folder);
if (isSkillsFolder(target)) fail(`${target} já é uma pasta de skills. Para a pasta global, rode sem pasta: npm run adopt`);
if (!existsSync(target) || !statSync(target).isDirectory()) fail(`${target} não existe ou não é uma pasta.`);

const source = join(REPO_ROOT, 'skills');
const isThisRepo = target === REPO_ROOT;
const all = readdirSync(source, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
const skills = skillsFor(all, isThisRepo);
const paths = installPaths(skills);
const nameOf = (path: string) => path.split('/').at(-2) as string;

// Neste repositório as cópias são geradas e ficam fora do git: sempre podem ser trocadas.
const different = paths.filter((path) => existsSync(join(target, path)) && snapshot(join(target, path)) !== snapshot(join(source, nameOf(path))));
if (different.length > 0 && !values.force && !isThisRepo) {
  fail(`Estas skills já existem com outro conteúdo:\n${different.join('\n')}\n\nConfira e rode de novo com --force para trocá-las.`);
}

const readIfExists = (path: string) => (existsSync(path) ? readFileSync(path, 'utf8') : undefined);
const instructions = readFileSync(join(REPO_ROOT, 'instrucoes.md'), 'utf8');
const instructionFiles = isThisRepo
  ? []
  : instructionPaths(folder === undefined).filter((path) => !(path === 'CLAUDE.md' && importsAgents(readIfExists(join(target, path)))));

console.log(`\nInstalando em ${target}\n`);
for (const path of paths) console.log(`  ${path}`);
for (const path of instructionFiles) console.log(`  ${path} (bloco do pipeline)`);

if (values['dry-run']) {
  console.log('\n(dry-run: nada foi gravado)\n');
  process.exit(0);
}

for (const path of paths) {
  rmSync(join(target, path), { recursive: true, force: true });
  cpSync(join(source, nameOf(path)), join(target, path), { recursive: true });
}
for (const path of instructionFiles) {
  const file = join(target, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, withBlock(readIfExists(file), instructions));
}

console.log(`\n${skills.length} skills instaladas. Abra o agente num projeto e passe uma tarefa.\n`);
