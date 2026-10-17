# Mapa de funcionalidades: contador de palavras

## Instalar e rodar
- Requisitos: Node.js ≥ 22.18 (TypeScript roda direto, sem build)
- Instalar: nada (sem dependências)
- Rodar: `node src/cli.ts <arquivo> [--top N]` ou `cat <arquivo> | node src/cli.ts`
- Testes: `npm test` · Typecheck/build: não há na pasta (o `npm run typecheck` da raiz do repositório cobre `examples/`)
- Fumaça: `npm run smoke`

## Funcionalidades
| Funcionalidade | Como acionar | Código | CA |
|----------------|--------------|--------|----|
| Contar palavras, linhas e caracteres de um arquivo | `node src/cli.ts texto.txt` | `src/wordcount.ts` › `count` | CA-1, CA-3, CA-5 |
| Contar a partir do stdin | `cat texto.txt \| node src/cli.ts` | `src/cli.ts` › `run` (sem argumento lê o stdin) | CA-1 |
| Palavras mais frequentes | `node src/cli.ts texto.txt --top 5` | `src/wordcount.ts` › `topWords` | CA-2 |

## Entradas e saídas
- Entrada: texto puro UTF-8 (LF ou CRLF), por arquivo ou stdin.
- Saída (stdout): `palavras: N`, `linhas: N`, `caracteres: N` e, com `--top`, uma linha `palavra: frequência` por palavra.
- Não grava nada em disco.

## Erros conhecidos e códigos de saída
- `arquivo não encontrado: <caminho>` (stderr) → código 1
- `--top precisa ser um inteiro maior que zero` (stderr) → código 1
- Sucesso → código 0
