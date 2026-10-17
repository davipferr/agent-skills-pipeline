/** Scripts do package.json que vão junto para um projeto que adota o pipeline. */
export const ADOPTED_SCRIPTS = ['setup', 'validate', 'status', 'new-skill', 'diagram', 'archive', 'guard'];

/** Onde os scripts do pipeline ficam no projeto adotado, para não misturar com os scripts dele. */
export const ADOPTED_SCRIPTS_DIR = 'scripts/pipeline';

export const SECTION_START = '<!-- agent-skills-pipeline:start -->';
export const SECTION_END = '<!-- agent-skills-pipeline:end -->';

type Json = Record<string, unknown>;

export interface PackageMerge {
  pkg: Json;
  /** O que foi acrescentado (ex.: `scripts.status`). */
  added: string[];
  /** O que já existia com outro valor e foi mantido como estava. */
  conflicts: string[];
}

/**
 * Junta ao package.json do projeto alvo o que o pipeline precisa, sem sobrescrever
 * nada que já exista: scripts (apontando para scripts/pipeline/), a dependência
 * `yaml` (como devDependency: só os scripts usam) e o `engines.node`.
 */
export function mergePackage(target: Json, source: Json): PackageMerge {
  const pkg: Json = structuredClone(target);
  const added: string[] = [];
  const conflicts: string[] = [];

  const put = (section: string, key: string, value: string) => {
    const current = (pkg[section] ?? {}) as Record<string, string>;
    if (current[key] === undefined) {
      pkg[section] = { ...current, [key]: value };
      added.push(`${section}.${key}`);
    } else if (current[key] !== value) {
      conflicts.push(`${section}.${key}`);
    }
  };

  const scripts = (source.scripts ?? {}) as Record<string, string>;
  for (const name of ADOPTED_SCRIPTS) {
    const command = scripts[name];
    if (command) put('scripts', name, command.replace(/node scripts\//, `node ${ADOPTED_SCRIPTS_DIR}/`));
  }
  put('scripts', 'precommit', 'npm run validate && npm run guard');

  const yaml = ((source.dependencies ?? {}) as Record<string, string>).yaml;
  const deps = { ...((pkg.dependencies ?? {}) as Record<string, string>), ...((pkg.devDependencies ?? {}) as Record<string, string>) };
  if (yaml && deps.yaml === undefined) put('devDependencies', 'yaml', yaml);

  const node = ((source.engines ?? {}) as Record<string, string>).node;
  if (node) put('engines', 'node', node);

  return { pkg, added, conflicts };
}

/** Coloca (ou atualiza) a seção do pipeline entre marcadores, sem tocar no resto do arquivo. */
export function upsertSection(text: string, section: string): string {
  const block = `${SECTION_START}\n${section.trim()}\n${SECTION_END}`;
  const start = text.indexOf(SECTION_START);
  const end = text.indexOf(SECTION_END);
  if (start !== -1 && end > start) return text.slice(0, start) + block + text.slice(end + SECTION_END.length);
  return `${text.trimEnd()}${text.trim() ? '\n\n' : ''}${block}\n`;
}

/** Linhas que faltam no .gitignore. */
export function missingLines(text: string, lines: string[]): string[] {
  const present = new Set(text.split(/\r?\n/).map((l) => l.trim()));
  return lines.filter((l) => !present.has(l));
}
