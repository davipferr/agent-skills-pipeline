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

/** O conteúdo de uma pasta num texto só, para comparar duas pastas. */
export function snapshot(dir: string): string {
  const files = readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((file) => statSync(join(dir, file)).isFile())
    .sort();
  return JSON.stringify(files.map((file) => [file, readFileSync(join(dir, file), 'utf8')]));
}
