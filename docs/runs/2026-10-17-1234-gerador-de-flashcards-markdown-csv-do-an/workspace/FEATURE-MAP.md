# Mapa de funcionalidades: gerador de flashcards (Markdown → CSV do Anki)

## Instalar e rodar
- Requisitos: Node.js ≥ 22.18 (TypeScript roda direto, sem build) e Anki ≥ 2.1.55 para importar
- Instalar: nada para usar (sem dependências); `npm install` só para o typecheck (`typescript` e `@types/node`)
- Rodar: `node bin/flashcards.ts <entrada.md> [-o <saida.csv>]`
- Testes: `npm test`
- Typecheck: `npm run typecheck`
- Fumaça: `npm run smoke`
- Arquivo de exemplo: `espanhol.md`

## Funcionalidades
| Funcionalidade | Como acionar | Código | CA |
|----------------|--------------|--------|----|
| Converter `.md` em CSV ao lado (mesmo nome, sobrescreve) | `node bin/flashcards.ts espanhol.md` | `src/cli.ts` › `run` | CA-1, CA-2 |
| Converter gravando em outro caminho (cria a pasta) | `node bin/flashcards.ts espanhol.md -o saida/cards.csv` | `src/cli.ts` › `run` | CA-3 |
| Ler os cards (`pergunta :: resposta`, um por linha) | qualquer conversão | `src/convert.ts` › `convert` | CA-4 a CA-7, CA-11, CA-12 |
| Avisar linhas inválidas (lado vazio, pergunta repetida) | linha com `pergunta ::`, `:: resposta` ou pergunta duplicada | `src/convert.ts` › `convert` (`warnings`) | CA-8, CA-9, CA-14 |
| Escapar campos com vírgula ou aspas | card com `,` ou `"` | `src/convert.ts` › `csvField` | CA-10 |
| Converter sem disco nem terminal (função reaproveitável) | `import { convert } from "./src/convert.ts"`, depois `convert(markdown, "espanhol")` | `src/convert.ts` › `convert` | CA-16 |
| Recusar sobrescrever o próprio `.md` | `node bin/flashcards.ts espanhol.md -o ./espanhol.md` | `src/cli.ts` › `samePath` | CA-17 |

## Entradas e saídas
- Entrada: um arquivo `.md` em UTF-8 (LF ou CRLF). Cada linha com `::` é um card; o primeiro `::` separa a pergunta da resposta. Marcadores de lista (`- `, `* `, `1. `) são removidos e linhas dentro de blocos ```` ``` ```` são ignoradas.
- Saída: CSV em UTF-8 com LF, começando por `#separator:Comma`, `#html:false` e `#deck:<nome do .md>`, e depois uma linha `pergunta,resposta` por card.
- Terminal: avisos no stderr (`aviso: linha N: ...`) e, por último, o resumo no stdout (`3 cards → espanhol.csv (0 avisos)`).

## Erros conhecidos e códigos de saída
- `uso: flashcards <entrada.md> [-o <saida.csv>]` → código 2 (sem entrada, opção desconhecida, `-o` sem valor ou repetido)
- `erro: não foi possível ler <caminho>: arquivo não encontrado` → código 1 (CA-15)
- `erro: a saída <caminho> é o próprio arquivo de entrada` → código 1 (CA-17)
- `erro: nenhum card válido em <caminho>; nada foi gravado` → código 1; um CSV que já existia fica intocado (CA-13)
- `erro: não foi possível gravar <caminho>: ...` → código 1
- Sucesso → código 0, mesmo com avisos
- Limitações conhecidas (observações 2 e 3 de `../07-revisao.md`, confirmadas em `../06-verificacao.md`): uma pergunta começando com `#` no primeiro card pode ser lida pelo Anki como cabeçalho; um bloco ```` ``` ```` sem fechamento ignora o resto do arquivo sem avisar.
