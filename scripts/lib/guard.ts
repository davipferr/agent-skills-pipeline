import type { FileProbe } from './files.ts';
import type { Flow } from './flow.ts';

/** Arquivos que definem o pipeline: não podem mudar no meio de uma execução. */
export const PIPELINE_PATHS = ['flow.yaml', 'skills.json', 'skills', 'adapters', 'scripts'];

/** Há uma execução em andamento quando algum artefato do flow.yaml já existe. */
export function activeRun(flow: Flow, probe: FileProbe): boolean {
  return flow.steps.some((step) => step.outputs.some((out) => probe.mtimeMs(out) !== null));
}

/**
 * Lê a saída de `git status --porcelain` e devolve os arquivos com mudanças que
 * o dono ainda não aprovou: alterados e não adicionados ao índice (`git add`), ou novos.
 */
export function unapprovedEdits(porcelain: string): string[] {
  return porcelain
    .split(/\r?\n/)
    .filter((line) => line.length > 3)
    .filter((line) => line[1] !== ' ')
    .map((line) => line.slice(3).replace(/^"|"$/g, ''));
}
