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

## Mapa de funcionalidades

### Instalar e rodar
- Requisitos: Node.js ≥ 22.18 (TypeScript roda direto, sem build)
- Instalar: nada (sem dependências)
- Rodar: `node src/cli.ts <arquivo> [--top N]` ou `cat <arquivo> | node src/cli.ts`
- Testes: `npm test` · Typecheck/build: não há na pasta (o `npm run typecheck` da raiz do repositório cobre `examples/`)

### Funcionalidades
| Funcionalidade | Como acionar | Código | CA |
|----------------|--------------|--------|----|
| Contar palavras, linhas e caracteres de um arquivo | `node src/cli.ts texto.txt` | `src/wordcount.ts` › `count` | CA-1, CA-3, CA-5 |
| Contar a partir do stdin | `cat texto.txt \| node src/cli.ts` | `src/cli.ts` › `run` (sem argumento lê o stdin) | CA-1 |
| Palavras mais frequentes | `node src/cli.ts texto.txt --top 5` | `src/wordcount.ts` › `topWords` | CA-2 |

### Entradas e saídas
- Entrada: texto puro UTF-8 (LF ou CRLF), por arquivo ou stdin.
- Saída (stdout): `palavras: N`, `linhas: N`, `caracteres: N` e, com `--top`, uma linha `palavra: frequência` por palavra.
- Não grava nada em disco.

### Erros conhecidos e códigos de saída
- `arquivo não encontrado: <caminho>` (stderr) → código 1
- `--top precisa ser um inteiro maior que zero` (stderr) → código 1
- Sucesso → código 0

## Em aberto
- nenhum
