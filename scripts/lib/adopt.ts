import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Pastas onde cada agente procura as skills, a partir da pasta do usuário ou de um projeto. */
export const INSTALL_DIRS = ['.claude/skills', '.agents/skills'];

/** Só faz sentido neste repositório: avalia as skills com os casos de evals/. */
export const LOCAL_ONLY_SKILLS = ['eval-skill'];

/** As skills a instalar. Fora deste repositório, fica de fora o que só serve aqui. */
export function skillsFor(all: string[], isThisRepo: boolean): string[] {
  return isThisRepo ? all : all.filter((name) => !LOCAL_ONLY_SKILLS.includes(name));
}

/** Os caminhos que o adopt ocupa: um por skill e por agente. */
export function installPaths(skills: string[]): string[] {
  return INSTALL_DIRS.flatMap((dir) => skills.map((name) => `${dir}/${name}/`));
}

/** `true` se o caminho já é uma pasta de skills, e não a pasta que a contém. */
export function isSkillsFolder(path: string): boolean {
  return /[\\/]\.(claude|agents)([\\/]skills)?[\\/]?$/.test(path);
}

/**
 * Os arquivos de instrução que cada agente lê sempre. Na pasta do usuário, o Claude Code
 * lê `.claude/CLAUDE.md` e o Codex lê `.codex/AGENTS.md`. Num projeto, os dois ficam na raiz.
 */
export function instructionPaths(isGlobal: boolean): string[] {
  return isGlobal ? ['.claude/CLAUDE.md', '.codex/AGENTS.md'] : ['CLAUDE.md', 'AGENTS.md'];
}

export const BLOCK_START = '<!-- agent-skills-pipeline: início -->';
export const BLOCK_END = '<!-- agent-skills-pipeline: fim -->';

/**
 * O arquivo com as instruções do pipeline num bloco marcado. O resto do arquivo não muda:
 * rodar de novo troca só o bloco, e um arquivo sem o bloco o recebe no fim.
 */
export function withBlock(existing: string | undefined, content: string): string {
  const block = `${BLOCK_START}\n${content.trim()}\n${BLOCK_END}\n`;
  if (!existing?.trim()) return block;
  const start = existing.indexOf(BLOCK_START);
  const end = existing.indexOf(BLOCK_END);
  if (start !== -1 && end > start) {
    return existing.slice(0, start) + block + existing.slice(end + BLOCK_END.length).replace(/^\r?\n/, '');
  }
  return existing.replace(/\s*$/, '\n\n') + block;
}

/** `true` se o CLAUDE.md já importa o AGENTS.md, que recebe o bloco: não precisa de outro. */
export function importsAgents(claude: string | undefined): boolean {
  return /^@\.?\/?AGENTS\.md\s*$/m.test(claude ?? '');
}

/** O conteúdo de uma pasta num texto só, para comparar duas pastas. */
export function snapshot(dir: string): string {
  const files = readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((file) => statSync(join(dir, file)).isFile())
    .sort();
  return JSON.stringify(files.map((file) => [file, readFileSync(join(dir, file), 'utf8')]));
}
