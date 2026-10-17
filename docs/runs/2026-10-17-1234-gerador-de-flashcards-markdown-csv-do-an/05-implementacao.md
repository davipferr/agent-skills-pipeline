---
step: implement
skill: tdd
inputs:
  - docs/flow/03-prd.md
  - docs/flow/04-arquitetura.md
---

# Implementação: Gerador de flashcards Markdown → CSV do Anki

## Como rodar os testes
```bash
cd workspace && npm test
```

## Fatias
### 1. Caminho feliz ponta a ponta — CA-1, CA-2, CA-16
- Testes: `workspace/test/convert.test.ts` › "gera cabeçalho do Anki e um card por linha (CA-1)"; `workspace/test/cli.test.ts` › "sem -o grava ao lado do .md com o mesmo nome, sobrescrevendo (CA-2, CA-16)", "bin/flashcards.ts roda pelo node e devolve o código de saída do run"
- Resultado: 3 passando
- Notas: nenhum desvio.

### 2. Leitura tolerante — CA-4, CA-5, CA-6, CA-12
- Testes: `workspace/test/convert.test.ts` › "ignora títulos, parágrafos e linhas em branco sem avisar (CA-4)", "remove marcadores de lista e espaços em volta (CA-5)", "divide no primeiro :: e a resposta pode conter :: (CA-6)", "aceita CRLF sem deixar \r e preserva acentos (CA-12)"; `workspace/test/cli.test.ts` › "lê .md UTF-8 com CRLF e grava CSV UTF-8 com os mesmos bytes nos acentos (CA-12)"
- Resultado: 8 passando no total
- Notas: só CA-5 começou vermelho. CA-4 e CA-6 já passavam com o código da fatia 1 (ignorar linhas sem `::`, `indexOf` do primeiro `::`). CA-12 também já passava, porque o `trim()` remove o `\r` do CRLF; por isso não foi criada uma etapa separada de normalização de CRLF, como a arquitetura sugeria.

### 3. Blocos de código — CA-7
- Testes: `workspace/test/convert.test.ts` › "ignora linhas dentro de blocos de código e volta a ler depois (CA-7)"
- Resultado: 9 passando no total
- Notas: uma linha cujo início (após espaços) é ```` ``` ```` abre/fecha o bloco; a linha-cerca nunca vira card.

### 4. Avisos — CA-8, CA-9, CA-14
- Testes: `workspace/test/convert.test.ts` › "lado vazio vira aviso com a linha e fica fora do CSV (CA-8)", "pergunta repetida: fica a primeira e a repetida vira aviso (CA-9)"; `workspace/test/cli.test.ts` › "avisos saem antes do resumo, que conta 1 aviso no singular, e o código é 0 (CA-14)", "sem avisos o resumo diz 0 avisos (CA-14)"
- Resultado: 13 passando no total
- Notas: mensagens: `pergunta vazia, linha ignorada`, `resposta vazia, linha ignorada`, `pergunta repetida (já está na linha N), linha ignorada`. A comparação de perguntas repetidas é exata (após `trim`), sensível a maiúsculas.

### 5. Escape e texto literal — CA-10, CA-11
- Testes: `workspace/test/convert.test.ts` › "campos com vírgula ou aspas vão entre aspas, com aspas duplicadas (CA-10)", "Markdown e HTML passam literalmente, sem conversão (CA-11)"
- Resultado: 15 passando no total
- Notas: CA-11 já passava (nenhuma conversão existe); o teste fica como guarda, inclusive de que `**ser**` não é confundido com marcador de lista `* `.

### 6. Opção `-o` e erros — CA-3, CA-13, CA-15
- Testes: `workspace/test/cli.test.ts` › "-o grava no caminho dado, criando a pasta, e o deck continua vindo do .md (CA-3)", "sem cards válidos (vazio | só texto | só linhas inválidas): não grava, avisa erro e sai com código ≠ 0 (CA-13)", "arquivo de entrada inexistente: erro citando o caminho e código ≠ 0 (CA-15)", "uso inválido (sem entrada | -o sem valor | argumento desconhecido | duas entradas): mensagem de uso e código 2", "falha ao gravar o CSV: erro citando o caminho e código 1"
- Resultado: 25 passando no total
- Notas: com zero cards, os avisos ainda são impressos antes do erro (ajuda a achar o problema). Os testes de uso inválido e de falha ao gravar cobrem comportamentos fixados na arquitetura, sem CA próprio.

### 7. README — sem CA (decisão 9: formato documentado)
- Arquivo: `workspace/README.md` (formato do `.md`, regras, uso, códigos de saída, importação no Anki ≥ 2.1.55, uso da função `convert`).
- Resultado: 25 passando; `npx tsc -p workspace` sem erros; execução manual de `node bin/flashcards.ts` num exemplo gerou o CSV esperado com 1 aviso.
- Notas: nenhum desvio.

### 8. Não sobrescrever a fonte — CA-17
- Testes: `workspace/test/cli.test.ts` › "-o igual à entrada (mesmo caminho | caminho relativo equivalente): não toca no .md, erro citando o caminho e código ≠ 0 (CA-17)"
- Resultado: 27 passando no total; `npx tsc -p workspace` sem erros
- Notas: acrescentada depois da revisão (observação 1 de `07-revisao.md`). A checagem roda logo depois de interpretar os argumentos, antes de ler o `.md` (a arquitetura dizia "antes de gravar"; antes de ler também é antes de gravar e evita imprimir avisos à toa). No Windows a comparação ignora maiúsculas. README ganhou uma linha sobre isso.

## Mapa de funcionalidades
*(acrescentado depois do arquivamento, quando o pipeline passou a guardar o mapa aqui)*

### Instalar e rodar
- Requisitos: Node.js ≥ 22.18 (TypeScript roda direto, sem build) e Anki ≥ 2.1.55 para importar
- Instalar: nada para usar (sem dependências); `npm install` só para o typecheck (`typescript` e `@types/node`)
- Rodar: `node bin/flashcards.ts <entrada.md> [-o <saida.csv>]`
- Testes: `npm test`
- Typecheck: `npm run typecheck`
- Arquivo de exemplo: `espanhol.md`

### Funcionalidades
| Funcionalidade | Como acionar | Código | CA |
|----------------|--------------|--------|----|
| Converter `.md` em CSV ao lado (mesmo nome, sobrescreve) | `node bin/flashcards.ts espanhol.md` | `src/cli.ts` › `run` | CA-1, CA-2 |
| Converter gravando em outro caminho (cria a pasta) | `node bin/flashcards.ts espanhol.md -o saida/cards.csv` | `src/cli.ts` › `run` | CA-3 |
| Ler os cards (`pergunta :: resposta`, um por linha) | qualquer conversão | `src/convert.ts` › `convert` | CA-4 a CA-7, CA-11, CA-12 |
| Avisar linhas inválidas (lado vazio, pergunta repetida) | linha com `pergunta ::`, `:: resposta` ou pergunta duplicada | `src/convert.ts` › `convert` (`warnings`) | CA-8, CA-9, CA-14 |
| Escapar campos com vírgula ou aspas | card com `,` ou `"` | `src/convert.ts` › `csvField` | CA-10 |
| Converter sem disco nem terminal (função reaproveitável) | `import { convert } from "./src/convert.ts"`, depois `convert(markdown, "espanhol")` | `src/convert.ts` › `convert` | CA-16 |
| Recusar sobrescrever o próprio `.md` | `node bin/flashcards.ts espanhol.md -o ./espanhol.md` | `src/cli.ts` › `samePath` | CA-17 |

### Entradas e saídas
- Entrada: um arquivo `.md` em UTF-8 (LF ou CRLF). Cada linha com `::` é um card; o primeiro `::` separa a pergunta da resposta. Marcadores de lista (`- `, `* `, `1. `) são removidos e linhas dentro de blocos ```` ``` ```` são ignoradas.
- Saída: CSV em UTF-8 com LF, começando por `#separator:Comma`, `#html:false` e `#deck:<nome do .md>`, e depois uma linha `pergunta,resposta` por card.
- Terminal: avisos no stderr (`aviso: linha N: ...`) e, por último, o resumo no stdout (`3 cards → espanhol.csv (0 avisos)`).

### Erros conhecidos e códigos de saída
- `uso: flashcards <entrada.md> [-o <saida.csv>]` → código 2 (sem entrada, opção desconhecida, `-o` sem valor ou repetido)
- `erro: não foi possível ler <caminho>: arquivo não encontrado` → código 1 (CA-15)
- `erro: a saída <caminho> é o próprio arquivo de entrada` → código 1 (CA-17)
- `erro: nenhum card válido em <caminho>; nada foi gravado` → código 1; um CSV que já existia fica intocado (CA-13)
- `erro: não foi possível gravar <caminho>: ...` → código 1
- Sucesso → código 0, mesmo com avisos
- Limitações conhecidas (observações 2 e 3 de `07-revisao.md`, confirmadas em `06-verificacao.md`): uma pergunta começando com `#` no primeiro card pode ser lida pelo Anki como cabeçalho; um bloco ```` ``` ```` sem fechamento ignora o resto do arquivo sem avisar.

## Em aberto
- A importação real no Anki não foi testada (os testes conferem o texto do CSV contra o formato documentado do Anki ≥ 2.1.55). Vale importar um arquivo de exemplo uma vez.
- O resumo diz `1 cards` no singular de cards; o PRD só fixou o singular de "aviso". Ajuste cosmético, não bloqueia.
- Perguntas repetidas são comparadas de forma exata (diferença de maiúsculas/minúsculas conta como perguntas diferentes).
