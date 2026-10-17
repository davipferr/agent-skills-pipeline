# Instruções para agentes

Este repositório é um **pipeline de skills**: uma ideia passa por etapas definidas em `flow.yaml`, e cada etapa é uma skill.

## Quando o usuário pedir para rodar, continuar ou retomar o pipeline

Use a skill **`run-pipeline`**. Ela lê `npm run --silent status -- --json` para saber a próxima etapa e segue o `flow.yaml`. Não pule etapas e não decida a ordem por conta própria.

Se o usuário descrever uma ideia nova sem mencionar o pipeline, pergunte se ele quer rodá-lo.

## Regras do repositório

- As etapas se comunicam **só por arquivos** em `docs/flow/`. Formato: `skills/run-pipeline/references/contrato-dos-artefatos.md`.
- **Projeto base × projeto gerado.** A estrutura deste repositório (skills, scripts, regras, guias) é o projeto base. O que a etapa de implementação gera vai em `workspace/`, que guarda **só o código do projeto**: mapa de funcionalidades, provas e comandos de verificação ficam nos artefatos de `docs/flow/`, nunca em `workspace/`.
- **`FEATURE-MAP.md`** (na raiz) é o mapa do projeto base: cada comando e skill, o código e o teste. Comece por ele para mexer no projeto e atualize-o sempre que um comando ou uma skill mudar.
- Não edite `scripts/`, `skills/`, `adapters/`, `skills.json` ou `flow.yaml` durante uma execução do pipeline: `npm run guard` falha se isso acontecer.
- **Regras duras valem mais que instruções.** O que precisa ser garantido vira script, teste ou checagem (`guard`, `validate`, testes, pre-commit); skill é para julgamento. Ao propor uma regra nova, prefira a que faz algo falhar. Veja `docs/guias/confiar-nos-agentes.md`.
- **Prova é comando + saída.** Não diga que algo funciona sem ter rodado.
- Quando algo falhar, use a skill `investigate`: reproduzir e ler o código antes de afirmar a causa. As skills de apoio (`helpers` no `flow.yaml`) não são etapas.
- Ao mudar `flow.yaml`, `skills/` ou `skills.json`: rode `npm run validate`, depois `npm run setup` (as skills locais são **copiadas** para `.claude/skills/` e `.agents/skills/`) e `npm run diagram -- --write`.
- Antes de concluir mudanças nos scripts: `npm run check` (typecheck + testes + validate).
- Scripts em TypeScript executado direto pelo Node (≥ 22.18): imports com extensão `.ts`, sem `enum` nem `namespace` (`erasableSyntaxOnly`).
- Não faça commit nem push: o dono do repositório faz isso.
