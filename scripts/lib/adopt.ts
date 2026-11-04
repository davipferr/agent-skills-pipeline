/** Pastas onde cada agente procura as skills de um projeto. */
export const INSTALL_DIRS = ['.claude/skills', '.agents/skills'];

/** Só faz sentido neste repositório: avalia as skills com os casos de evals/. */
export const LOCAL_ONLY_SKILLS = ['eval-skill'];

/** As skills que um repositório recebe. Num projeto de outra pessoa, fica de fora o que só serve aqui. */
export function skillsFor(all: string[], isThisRepo: boolean): string[] {
  return isThisRepo ? all : all.filter((name) => !LOCAL_ONLY_SKILLS.includes(name));
}

/** Os caminhos que o adopt ocupa no repositório: um por skill e por agente. */
export function installPaths(skills: string[]): string[] {
  return INSTALL_DIRS.flatMap((dir) => skills.map((name) => `${dir}/${name}/`));
}

/** Linhas de `wanted` que ainda não estão no .git/info/exclude. */
export function missingLines(exclude: string, wanted: string[]): string[] {
  const have = new Set(exclude.split(/\r?\n/).map((line) => line.trim()));
  return wanted.filter((line) => !have.has(line));
}

/** O .git/info/exclude com as linhas novas no fim. */
export function withExcludeLines(exclude: string, lines: string[]): string {
  if (lines.length === 0) return exclude;
  const head = exclude.trimEnd();
  return `${head}${head === '' ? '' : '\n\n'}# agent-skills-pipeline: uso pessoal, fora do git do projeto\n${lines.join('\n')}\n`;
}
