// npm run new-skill -- <nome> ["descrição"]
//
// Cria skills/<nome>/SKILL.md já no formato que o pipeline espera:
// cabeçalho do padrão Agent Skills + entrada, saída e o contrato dos artefatos.

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { KEBAB } from './lib/flow.ts';
import { LOCAL_SKILLS_DIR } from './lib/skills.ts';
import { bold, dim, green, red } from './lib/project.ts';

const { positionals, values } = parseArgs({ allowPositionals: true, options: { root: { type: 'string' } } });
const [name, description] = positionals;
const root = values.root ?? process.cwd();

if (!name || !KEBAB.test(name) || name.length > 64) {
  console.error(red('Uso: npm run new-skill -- <nome-em-kebab-case> ["Descrição: o que faz e quando usar."]'));
  process.exit(1);
}

const dir = join(root, LOCAL_SKILLS_DIR, name);
if (existsSync(dir)) {
  console.error(red(`${LOCAL_SKILLS_DIR}/${name} já existe.`));
  process.exit(1);
}

const desc = description ?? `TODO: o que esta skill faz e QUANDO o agente deve usá-la (ex.: "Use quando o usuário pedir X ou quando o run-pipeline estiver na etapa ${name}").`;
const output = `docs/flow/NN-${name}.md`;

mkdirSync(dir, { recursive: true });
writeFileSync(
  join(dir, 'SKILL.md'),
  `---
name: ${name}
description: ${JSON.stringify(desc)}
---

# ${name}

**Entradas:** \`docs/flow/<arquivo-de-uma-etapa-anterior>.md\`
**Saída:** \`${output}\`

<Uma ou duas frases: qual é o trabalho desta etapa e o que ela NÃO deve fazer.>

## Passos

1. Leia as entradas. Se alguma não existir, pare e diga qual etapa precisa rodar antes.
2. <...>
3. Grave \`${output}\` começando com o cabeçalho do contrato
   (veja skills/run-pipeline/references/contrato-dos-artefatos.md):

   \`\`\`yaml
   step: <id da etapa no flow.yaml>
   skill: ${name}
   inputs: [docs/flow/<arquivo>.md]
   \`\`\`

4. Diga ao usuário, em poucas linhas, o que foi gravado.
`,
);

console.log(green(`\n✔ criada ${LOCAL_SKILLS_DIR}/${name}/SKILL.md\n`));
console.log(bold('Próximos passos:'));
console.log(`  1. Escreva a ${bold('description')} e os passos no SKILL.md ${dim('(a description decide quando o agente usa a skill)')}`);
console.log(`  2. Troque ${bold(output)} pelo nome real do arquivo de saída`);
console.log(`  3. Adicione a etapa no ${bold('flow.yaml')}:`);
console.log(dim(`       - id: ${name}\n         title: <nome>\n         skill: ${name}\n         source: local\n         inputs: [docs/flow/<entrada>.md]\n         outputs: [${output}]`));
console.log(`  4. ${bold('npm run validate')}  →  ${bold('npm run setup')}  →  ${bold('npm run diagram -- --write')}\n`);
