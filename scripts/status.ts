// npm run status [-- --json] [-- --dir <pasta>] [-- --ignore-time]
//
// Mostra em que etapa o pipeline está. A skill run-pipeline chama este script
// com --json para decidir o que fazer, em vez de adivinhar olhando os arquivos.
// --dir procura os artefatos em outra pasta (ex.: examples/contador-de-palavras),
// usando o flow.yaml da raiz.

import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { diskProbe } from './lib/files.ts';
import { computeStatus, type StepState } from './lib/status.ts';
import { loadProject, printIssues, bold, cyan, dim, green, red, yellow } from './lib/project.ts';

const { values } = parseArgs({
  options: { json: { type: 'boolean' }, dir: { type: 'string' }, 'ignore-time': { type: 'boolean' } },
});
const project = loadProject();

if (!project.flow) {
  if (values.json) console.log(JSON.stringify({ error: project.issues.map((i) => `${i.where}: ${i.message}`) }));
  else printIssues(project.issues);
  process.exit(1);
}

const probe = values.dir ? diskProbe(resolve(values.dir)) : project.probe;
const status = computeStatus(project.flow, probe, { ignoreTime: values['ignore-time'] });

if (values.json) {
  console.log(JSON.stringify(status, null, 2));
  process.exit(0);
}

const icons: Record<StepState, string> = {
  done: green('✔'),
  stale: yellow('↻'),
  'in-progress': cyan('◐'),
  ready: cyan('▶'),
  blocked: dim('·'),
};
const labels: Record<StepState, string> = {
  done: 'pronta',
  stale: 'desatualizada',
  'in-progress': 'em andamento',
  ready: 'pode rodar',
  blocked: 'bloqueada',
};

console.log(bold(`\n${status.flow}\n`));
const idWidth = Math.max(...status.steps.map((s) => s.id.length));
const skillWidth = Math.max(...status.steps.map((s) => s.skill.length));
for (const step of status.steps) {
  const current = step === status.next ? bold(' ← próxima') : '';
  console.log(
    `  ${icons[step.state]} ${step.id.padEnd(idWidth)}  ${dim(step.skill.padEnd(skillWidth))}  ${labels[step.state].padEnd(13)} ${dim(step.reason)}${current}`,
  );
}

if (status.next === null) {
  console.log(green('\n  Pipeline concluído. Leia docs/flow/07-entrega.md e rode `npm run archive` para começar outro.\n'));
} else if (status.next.state === 'blocked') {
  console.log(red(`\n  A próxima etapa (${status.next.id}) está bloqueada: ${status.next.reason}. Rode \`npm run validate\`.\n`));
} else {
  console.log(`\n  Próximo passo: peça ao agente ${bold('"rode o pipeline"')} (skill run-pipeline)`);
  console.log(`  ou chame direto a skill ${bold(status.next.skill)}.\n`);
}
