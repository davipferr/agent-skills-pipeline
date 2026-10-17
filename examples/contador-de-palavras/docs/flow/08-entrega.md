---
step: ship
skill: ship-report
inputs:
  - docs/flow/03-prd.md
  - docs/flow/06-verificacao.md
  - docs/flow/07-revisao.md
---

# Entrega: Contador de palavras

**Em uma frase:** um comando que diz quantas palavras um texto tem e quais você está repetindo.

## Como rodar
```bash
cd workspace
node src/cli.ts meu-texto.md --top 5
cat meu-texto.md | node src/cli.ts
npm test
npm run smoke
```

## Decisões que importam
- Sem dependências, TypeScript direto no Node: ver [02-decisoes.md](02-decisoes.md), decisões 1 e 2
- "Casa" = "casa" só no ranking: decisão 4
- Hífen no meio faz parte da palavra ("pé-de-moleque"): decisão 5

## Pendências
- `--top abc` imprime as contagens antes do erro (observação 1 de [06-verificacao.md](06-verificacao.md)); vira CA novo se importar.

## Trabalho manual
| O que um humano precisou fazer (ou ficou sem verificar) | Regra dura que evitaria |
|----------------------------------------------------------|-------------------------|
| nenhum | — |

## Trilha
1. [01-ideia.md](01-ideia.md): a ideia como chegou
2. [02-decisoes.md](02-decisoes.md): o interrogatório
3. [03-prd.md](03-prd.md): escopo e critérios de aceite
4. [04-arquitetura.md](04-arquitetura.md): módulos e fatias
5. [05-implementacao.md](05-implementacao.md): o que foi feito, fatia a fatia
6. [06-verificacao.md](06-verificacao.md): o programa usado como usuário, com as provas
7. [07-revisao.md](07-revisao.md): o veredito contra o PRD
