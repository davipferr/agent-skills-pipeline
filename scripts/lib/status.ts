import { parseFrontmatter, type FileProbe } from './files.ts';
import { producers, type Flow, type Step } from './flow.ts';

export type StepState = 'done' | 'stale' | 'in-progress' | 'ready' | 'blocked';

export interface StepStatus {
  id: string;
  title: string;
  skill: string;
  state: StepState;
  /** Por que a etapa está nesse estado, em uma frase. */
  reason: string;
}

export interface PipelineStatus {
  flow: string;
  steps: StepStatus[];
  /** A primeira etapa que não está `done`, ou `null` se o pipeline terminou. */
  next: StepStatus | null;
}

export interface StatusOptions {
  /** Ignora datas de modificação (útil logo após um `git clone`, que reescreve todas). */
  ignoreTime?: boolean;
}

/**
 * Calcula o estado de cada etapa olhando só os arquivos, como o `make`:
 * não existe arquivo de estado escondido.
 */
export function computeStatus(flow: Flow, probe: FileProbe, options: StatusOptions = {}): PipelineStatus {
  const ownerOf = producers(flow);
  const states = new Map<string, StepState>();
  const steps = flow.steps.map((step) => {
    const status = stepStatus(step, probe, options, (file) => {
      const owner = ownerOf.get(file);
      return owner ? states.get(owner) : undefined;
    });
    states.set(step.id, status.state);
    return status;
  });
  return { flow: flow.name, steps, next: steps.find((s) => s.state !== 'done') ?? null };
}

function stepStatus(
  step: Step,
  probe: FileProbe,
  options: StatusOptions,
  producerState: (file: string) => StepState | undefined,
): StepStatus {
  const base = { id: step.id, title: step.title, skill: step.skill };
  const missingOutputs = step.outputs.filter((f) => probe.mtimeMs(f) === null);

  if (missingOutputs.length > 0) {
    const missingInputs = step.inputs.filter((f) => probe.mtimeMs(f) === null);
    if (missingInputs.length > 0) return { ...base, state: 'blocked', reason: `falta ${missingInputs.join(', ')}` };
    const unfinished = step.inputs.filter((f) => producerState(f) === 'in-progress');
    if (unfinished.length > 0) return { ...base, state: 'blocked', reason: `${unfinished.join(', ')} ainda está em andamento` };
    return { ...base, state: 'ready', reason: `vai gravar ${missingOutputs.join(', ')}` };
  }

  const inProgress = step.outputs.filter((f) => {
    const fm = parseFrontmatter(probe.read(f) ?? '');
    return fm?.data.status === 'in-progress';
  });
  if (inProgress.length > 0) return { ...base, state: 'in-progress', reason: `${inProgress.join(', ')} marcado como status: in-progress` };

  const outdatedUpstream = step.inputs.filter((f) => {
    const state = producerState(f);
    return state === 'stale' || state === 'in-progress';
  });
  if (outdatedUpstream.length > 0) {
    return { ...base, state: 'stale', reason: `depende de ${outdatedUpstream.join(', ')}, que precisa ser refeito antes` };
  }

  if (!options.ignoreTime) {
    const oldestOutput = Math.min(...step.outputs.map((f) => probe.mtimeMs(f) ?? 0));
    const newer = step.inputs.filter((f) => (probe.mtimeMs(f) ?? 0) > oldestOutput);
    if (newer.length > 0) return { ...base, state: 'stale', reason: `${newer.join(', ')} mudou depois da saída` };
  }

  return { ...base, state: 'done', reason: step.outputs.join(', ') };
}
