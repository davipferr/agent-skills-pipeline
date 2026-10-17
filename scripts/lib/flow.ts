import { parse } from 'yaml';
import { error, type Issue } from './files.ts';

export interface Step {
  id: string;
  title: string;
  skill: string;
  /** `"local"` (pasta skills/) ou `"owner/repo"` de uma skill externa. */
  source: string;
  inputs: string[];
  outputs: string[];
  interactive: boolean;
  /** Caminho de um .md com instruções extras para encaixar uma skill externa. */
  adapter?: string;
}

export interface Flow {
  name: string;
  description: string;
  steps: Step[];
  /** Skills locais de apoio: chamadas por etapas ou pelo usuário, sem ordem nem artefato próprio. */
  helpers: string[];
}

export const FLOW_FILE = 'flow.yaml';
export const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');

/**
 * Lê o flow.yaml e confere só o formato (tipos e campos obrigatórios).
 * As regras entre etapas e skills ficam em validate.ts.
 */
export function parseFlow(text: string): { flow: Flow | null; issues: Issue[] } {
  const issues: Issue[] = [];
  let raw: unknown;
  try {
    raw = parse(text);
  } catch (e) {
    return { flow: null, issues: [error(FLOW_FILE, `YAML inválido: ${(e as Error).message}`)] };
  }
  if (raw === null || typeof raw !== 'object') {
    return { flow: null, issues: [error(FLOW_FILE, 'o arquivo precisa ser um objeto com `name` e `steps`')] };
  }
  const doc = raw as Record<string, unknown>;
  if (typeof doc.name !== 'string') issues.push(error(FLOW_FILE, '`name` é obrigatório'));
  if (doc.helpers !== undefined && !isStringArray(doc.helpers)) issues.push(error(FLOW_FILE, '`helpers` precisa ser uma lista de nomes de skills'));
  if (!Array.isArray(doc.steps) || doc.steps.length === 0) {
    issues.push(error(FLOW_FILE, '`steps` precisa ser uma lista com pelo menos uma etapa'));
    return { flow: null, issues };
  }

  const steps: Step[] = [];
  doc.steps.forEach((value: unknown, i: number) => {
    const s = (value ?? {}) as Record<string, unknown>;
    const where = `${FLOW_FILE} › steps[${i}]${typeof s.id === 'string' ? ` (${s.id})` : ''}`;
    const before = issues.length;
    for (const field of ['id', 'skill', 'source'] as const) {
      if (typeof s[field] !== 'string' || s[field] === '') issues.push(error(where, `\`${field}\` é obrigatório`));
    }
    for (const field of ['inputs', 'outputs'] as const) {
      if (!isStringArray(s[field])) issues.push(error(where, `\`${field}\` precisa ser uma lista de caminhos (use [] se vazia)`));
    }
    if (s.adapter !== undefined && typeof s.adapter !== 'string') issues.push(error(where, '`adapter` precisa ser um caminho'));
    if (issues.length > before) return;
    steps.push({
      id: s.id as string,
      title: typeof s.title === 'string' ? s.title : (s.id as string),
      skill: s.skill as string,
      source: s.source as string,
      inputs: s.inputs as string[],
      outputs: s.outputs as string[],
      interactive: s.interactive === true,
      ...(typeof s.adapter === 'string' ? { adapter: s.adapter } : {}),
    });
  });

  if (issues.length > 0) return { flow: null, issues };
  return {
    flow: {
      name: doc.name as string,
      description: typeof doc.description === 'string' ? doc.description : '',
      steps,
      helpers: isStringArray(doc.helpers) ? doc.helpers : [],
    },
    issues,
  };
}

/** Mapa arquivo → id da etapa que o produz. */
export function producers(flow: Flow): Map<string, string> {
  const map = new Map<string, string>();
  for (const step of flow.steps) for (const out of step.outputs) if (!map.has(out)) map.set(out, step.id);
  return map;
}
