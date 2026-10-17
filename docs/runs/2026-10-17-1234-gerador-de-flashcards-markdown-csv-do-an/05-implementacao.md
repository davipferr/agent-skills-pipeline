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

## Em aberto
- A importação real no Anki não foi testada (os testes conferem o texto do CSV contra o formato documentado do Anki ≥ 2.1.55). Vale importar um arquivo de exemplo uma vez.
- O resumo diz `1 cards` no singular de cards; o PRD só fixou o singular de "aviso". Ajuste cosmético, não bloqueia.
- Perguntas repetidas são comparadas de forma exata (diferença de maiúsculas/minúsculas conta como perguntas diferentes).
