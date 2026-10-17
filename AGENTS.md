# Instruções para agentes

Este repositório é um **pipeline de skills**: uma ideia passa por etapas definidas em `flow.yaml`, e cada etapa é uma skill.

## Quando o usuário pedir para rodar, continuar ou retomar o pipeline

Use a skill **`run-pipeline`**. Ela lê `npm run --silent status -- --json` para saber a próxima etapa e segue o `flow.yaml`. Não pule etapas e não decida a ordem por conta própria.

Se o usuário descrever uma ideia nova sem mencionar o pipeline, pergunte se ele quer rodá-lo.

## Regras do repositório

- As etapas se comunicam **só por arquivos** em `docs/flow/`. Formato: `skills/run-pipeline/references/contrato-dos-artefatos.md`.
- Código gerado pela etapa de implementação vai em `workspace/`. Não edite `scripts/`, `skills/` ou `flow.yaml` durante uma execução do pipeline.
- Ao mudar `flow.yaml`, `skills/` ou `skills.json`: rode `npm run validate`, depois `npm run setup` (as skills locais são **copiadas** para `.claude/skills/` e `.agents/skills/`) e `npm run diagram -- --write`.
- Antes de concluir mudanças nos scripts: `npm run check` (typecheck + testes + validate).
- Scripts em TypeScript executado direto pelo Node (≥ 22.18): imports com extensão `.ts`, sem `enum` nem `namespace` (`erasableSyntaxOnly`).
- Não faça commit nem push: o dono do repositório faz isso.
