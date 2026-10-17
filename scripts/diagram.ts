// npm run diagram [-- --write]
//
// Imprime o diagrama Mermaid do flow.yaml. Com --write, atualiza o bloco
// entre os marcadores no README.md, para o diagrama nunca ficar desatualizado.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { replaceDiagram, toMermaid, DIAGRAM_START } from './lib/diagram.ts';
import { loadProject, printIssues, green, red } from './lib/project.ts';

const { values } = parseArgs({ options: { write: { type: 'boolean' }, root: { type: 'string' } } });
const project = loadProject(values.root);
if (!project.flow) {
  printIssues(project.issues);
  process.exit(1);
}

const mermaid = toMermaid(project.flow);
if (!values.write) {
  console.log(mermaid);
  process.exit(0);
}

const readmePath = join(project.root, 'README.md');
const updated = replaceDiagram(readFileSync(readmePath, 'utf8'), mermaid);
if (updated === null) {
  console.error(red(`README.md não tem os marcadores ${DIAGRAM_START} ... end.`));
  process.exit(1);
}
writeFileSync(readmePath, updated);
console.log(green('✔ diagrama do README.md atualizado a partir do flow.yaml'));
