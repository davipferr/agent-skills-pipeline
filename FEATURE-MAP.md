# Mapa de funcionalidades

Cada comando e cada skill deste repositório, onde estão e qual teste os cobre. Comece por aqui para mexer no pipeline. Este mapa é só deste repositório: o `adopt` não o instala. `test/project.test.ts` falha se faltar algo.

## Instalar e rodar

- Requisitos: Node.js ≥ 22.18 (o `adopt` roda sem `npm install`; TypeScript direto no Node, sem build)
- Instalar as skills na pasta global: `npm run adopt`
- Atualizar as cópias deste repositório: `npm run adopt -- .`
- Conferir tudo: `npm run check` (precisa de `npm install`)

## Funcionalidades

| Funcionalidade | Como acionar | Código | Teste |
|----------------|--------------|--------|-------|
| Instalar ou atualizar as skills na pasta global, ou num projeto se passar a pasta | `npm run adopt [-- <pasta>] [--force] [--dry-run]` | `scripts/adopt.ts`, `scripts/lib/adopt.ts` | `test/adopt.test.ts` |
| Checagem completa | `npm run check` | `package.json` | — |
| Typecheck | `npm run typecheck` | `tsconfig.json` | — |
| Testes | `npm test` | `test/` | `test/project.test.ts` (skills, links, este mapa) |
| Fazer uma tarefa do início ao fim | passar a tarefa ao agente, ou `/run-pipeline` | `skills/run-pipeline/SKILL.md` | `evals/run-pipeline/` |
| Método de análise e correção | usado pelo `run-pipeline`, ou `/problem-solver` | `skills/problem-solver/SKILL.md` | — |
| Diagnóstico curto de uma falha | pedir "investigue ..." | `skills/investigate/SKILL.md` | — |
| Avaliar uma skill (só neste repositório) | pedir "avalie a skill <nome>" | `skills/eval-skill/SKILL.md`, casos em `evals/` | — |

## Erros conhecidos

- `adopt` dizendo que uma skill já existe com outro conteúdo → confira a diferença e rode com `--force`. É o caso normal depois de mudar `skills/`.
- `adopt` dizendo que a pasta já é de skills → para a pasta global, rode `npm run adopt` sem pasta.
- Skill desatualizada → as skills são copiadas: rode o `adopt` de novo depois de mudar `skills/`.
