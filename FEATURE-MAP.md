# Mapa de funcionalidades: agent-skills-pipeline

O mapa do projeto base: cada comando e cada skill, onde estão no código e qual teste os cobre. Um agente que for mexer neste projeto começa por aqui, em vez de adivinhar. Atualize este arquivo sempre que um comando ou uma skill mudar.

## Instalar e rodar
- Requisitos: Node.js ≥ 22.18 (os scripts são TypeScript rodando direto no Node, sem build)
- Instalar: `npm install` e `npm run setup`
- Conferir tudo: `npm run check` (typecheck + testes + validate + guard); o pre-commit roda o mesmo
- Rodar o pipeline: abrir o agente na pasta e pedir "rode o pipeline" (skill `run-pipeline`)

## Funcionalidades
| Funcionalidade | Como acionar | Código | Teste |
|----------------|--------------|--------|-------|
| Estado do pipeline | `npm run status [-- --json] [-- --dir <pasta>] [-- --ignore-time]` | `scripts/status.ts` › `lib/status.ts` › `computeStatus`; `lib/files.ts` › `flattenProbe` (execuções arquivadas) | `test/status.test.ts`, `test/tooling.test.ts` › "flattenProbe" |
| Validar o fluxo | `npm run validate [-- --strict]` | `scripts/validate.ts` › `lib/validate.ts` › `validateProject`; `lib/flow.ts` › `parseFlow` | `test/validate.test.ts`, `test/project.test.ts` |
| Barrar mudança no pipeline durante uma execução | `npm run guard` | `scripts/guard.ts` › `lib/guard.ts` › `activeRun`, `unapprovedEdits`, `PIPELINE_PATHS` | `test/guard.test.ts` |
| Instalar as skills e ligar o pre-commit | `npm run setup [-- --dry-run] [-- --local-only]` | `scripts/install.ts` › `lib/skills.ts` › `installCommands` | `test/tooling.test.ts` › "installCommands" |
| Criar uma skill | `npm run new-skill -- <nome> "<descrição>"` | `scripts/new-skill.ts` | — |
| Diagrama do fluxo no README | `npm run diagram [-- --write]` | `scripts/diagram.ts` › `lib/diagram.ts` › `toMermaid`, `replaceDiagram` | `test/tooling.test.ts` › "diagrama" |
| Arquivar uma execução | `npm run archive [-- --dry-run]` | `scripts/archive.ts` | — |
| Checagem completa | `npm run check` (o hook `.githooks/pre-commit` roda `npm run precommit`, que chama este) | `package.json`, `.githooks/pre-commit` | — |
| Orquestrar as etapas | pedir "rode o pipeline" | `skills/run-pipeline/SKILL.md` | — |
| Etapas do fluxo | o maestro chama uma por vez | `flow.yaml` › `steps`; skills em `skills/`, externas encaixadas por `adapters/` | `test/project.test.ts` |
| Investigar uma falha | pedir "investigue ..." | `skills/investigate/SKILL.md` | — |
| Transformar trabalho manual em regra | pedir "endureça" | `skills/harden/SKILL.md` | — |
| Avaliar uma skill | pedir "avalie a skill <nome>" | `skills/eval-skill/SKILL.md`, casos em `evals/` | — |

## Entradas e saídas
- Entrada do pipeline: a ideia, numa conversa com o agente.
- Artefatos de cada execução: `docs/flow/01-ideia.md` … `08-entrega.md` (formato em `skills/run-pipeline/references/contrato-dos-artefatos.md`); arquivados em `docs/runs/`.
- Código gerado por uma execução: `workspace/` (fora do git), só código.
- Skills instaladas: `.claude/skills/` e `.agents/skills/` (fora do git, recriadas pelo `npm run setup`).

## Erros conhecidos
- `validate` com aviso "mudou desde o último setup" → rode `npm run setup` (as skills locais são **copiadas** para `.agents/skills/`).
- `guard` falhando → o pipeline foi alterado durante uma execução: `git add` para manter, `git restore` para descartar, ou `npm run archive` antes de mexer.
- `status` com etapas `stale` logo depois de um `git clone` → as datas foram reescritas; use `-- --ignore-time`.
