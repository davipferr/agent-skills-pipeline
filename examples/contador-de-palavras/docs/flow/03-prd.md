---
step: prd
skill: write-prd
inputs:
  - docs/flow/01-ideia.md
  - docs/flow/02-decisoes.md
---

# PRD: Contador de palavras

## Objetivo
Saber em um comando quantas palavras um texto tem e quais estão se repetindo.

## Escopo
1. Contar palavras, linhas e caracteres de um arquivo ou do stdin.
2. Opcional `--top N`: as N palavras mais frequentes, sem diferenciar maiúsculas.
3. Erro claro para arquivo inexistente.

## Fora de escopo
- Lista de palavras ignoradas, formatos além de texto puro, interface gráfica (ver [02-decisoes.md](02-decisoes.md)).

## Critérios de aceite
- **CA-1**: Dado o texto `olá mundo olá`, quando conto, então recebo 3 palavras, 1 linha e 13 caracteres.
- **CA-2**: Dado o texto `Casa casa CASA rua`, quando peço `--top 1`, então recebo `casa: 3`. Empates saem em ordem alfabética.
- **CA-3**: Dado o texto `pé-de-moleque é ótimo`, quando conto, então recebo 3 palavras.
- **CA-4**: Dado um caminho que não existe, quando rodo o comando, então ele imprime `arquivo não encontrado: <caminho>` e sai com código 1.
- **CA-5**: Dado um texto vazio, quando conto, então recebo 0 em tudo.

## Restrições técnicas
- TypeScript no Node 22.18+, sem dependências (decisões 1 e 2).

## Em aberto
- nenhum
