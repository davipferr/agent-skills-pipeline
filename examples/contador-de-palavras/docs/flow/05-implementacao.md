---
step: implement
skill: tdd
inputs:
  - docs/flow/03-prd.md
  - docs/flow/04-arquitetura.md
---

# Implementação: Contador de palavras

## Como rodar os testes
```bash
cd workspace && npm test
```

## Fatias
### 1. Contagem básica: CA-1, CA-3, CA-5
- Testes: `workspace/test/wordcount.test.ts` › "count"
- Resultado: 4 passando
- Notas: a regra de palavra virou uma regex Unicode (`\p{L}\p{N}`), com hífen/apóstrofo permitidos só no meio. Também foi coberto o caso "quebra de linha no fim não conta como linha extra", que apareceu no ciclo vermelho.

### 2. Ranking: CA-2
- Testes: `workspace/test/wordcount.test.ts` › "topWords"
- Resultado: 2 passando
- Notas: nenhum desvio

### 3. CLI: CA-2, CA-4
- Testes: `workspace/test/wordcount.test.ts` › "cli"
- Resultado: 2 passando (8 no total)
- Notas: `--top` com valor inválido também sai com código 1 (não está no PRD, mas é a mesma regra do CA-4).

## Em aberto
- nenhum
