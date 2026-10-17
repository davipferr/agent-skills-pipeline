// npm run guard [-- --root <pasta>]
//
// Regra dura: durante uma execução do pipeline (há artefatos em docs/flow/), os
// arquivos que definem o pipeline não mudam. Vale para qualquer agente, porque é
// um script, não uma instrução. Mudança feita de propósito pelo dono passa
// depois de `git add` (ou de um commit).

import { spawnSync } from 'node:child_process';
import { relative } from 'node:path';
import { parseArgs } from 'node:util';
import { activeRun, pipelinePaths, unapprovedEdits } from './lib/guard.ts';
import { loadProject, printIssues, bold, dim, green, red, yellow } from './lib/project.ts';

const { values } = parseArgs({ options: { root: { type: 'string' } } });
const project = loadProject(values.root);
if (!project.flow) {
  printIssues(project.issues);
  process.exit(1);
}

if (!activeRun(project.flow, project.probe)) {
  console.log(green('✔ guard: nenhuma execução em andamento'));
  process.exit(0);
}

const paths = pipelinePaths(relative(project.root, import.meta.dirname).replaceAll('\\', '/'));
const git = spawnSync('git', ['status', '--porcelain=v1', '--untracked-files=all', '--', ...paths], {
  cwd: project.root,
  encoding: 'utf8',
});
if (git.status !== 0) {
  console.log(yellow('aviso: guard precisa do git para saber o que mudou; pulando a checagem.'));
  process.exit(0);
}

const edits = unapprovedEdits(git.stdout);
if (edits.length === 0) {
  console.log(green('✔ guard: execução em andamento e o pipeline está intacto'));
  process.exit(0);
}

console.log(red(bold('\n✘ guard: o pipeline foi alterado durante uma execução\n')));
for (const file of edits) console.log(`  ${file}`);
console.log(`
  Durante uma execução, ${paths.join(', ')} não mudam: as etapas
  dependem deles estarem iguais do começo ao fim.

  ${bold('Agente:')} pare e mostre esta mensagem ao usuário. Não desfaça nem aprove por conta própria.
  ${bold('Dono:')}   para manter a mudança, ${bold('git add')} nos arquivos (depois npm run validate e npm run setup);
          para descartar, ${bold('git restore')} neles.
  ${dim('Ou termine a execução antes: npm run archive.')}
`);
process.exit(1);
