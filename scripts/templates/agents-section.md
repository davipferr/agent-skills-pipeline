## Pipeline de skills

Este projeto usa um **pipeline de skills** (vindo de agent-skills-pipeline): uma ideia passa pelas etapas do `flow.yaml`, e cada etapa é uma skill. Funciona com qualquer agente compatível com o padrão Agent Skills (Claude Code, Codex, Gemini CLI e outros).

### Quando o usuário pedir para rodar, continuar ou retomar o pipeline

Use a skill **`run-pipeline`**. Ela lê `npm run --silent status -- --json` para saber a próxima etapa e segue o `flow.yaml`. Não pule etapas e não decida a ordem por conta própria.

### Regras

- As etapas se comunicam **só por arquivos** em `docs/flow/`. Formato: `skills/run-pipeline/references/contrato-dos-artefatos.md`.
- **Onde vai o código:** neste projeto não existe `workspace/`. Onde as skills dizem `workspace/`, entenda **a raiz deste repositório** (o código do projeto). A etapa `verify` copia o repositório (sem `node_modules`, `.git` e arquivos gerados) para uma pasta temporária e verifica lá.
- Não edite `flow.yaml`, `skills.json`, `skills/`, `adapters/` nem `scripts/pipeline/` durante uma execução: `npm run guard` falha se isso acontecer.
- **Regras duras valem mais que instruções.** O que precisa ser garantido vira teste, lint ou script; prompt é só para julgamento.
- Quando algo falhar, use a skill `investigate`: reproduzir e ler o código antes de afirmar a causa.
- Ao mudar `flow.yaml`, `skills/` ou `skills.json`: `npm run validate` e depois `npm run setup`.
