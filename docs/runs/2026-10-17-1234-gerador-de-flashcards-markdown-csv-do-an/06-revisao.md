---
step: review
skill: review-against-prd
inputs:
  - docs/flow/03-prd.md
  - docs/flow/04-arquitetura.md
  - docs/flow/05-implementacao.md
---

# Revisão: Gerador de flashcards Markdown → CSV do Anki

**Veredito:** aprovado (17/17 CAs; 2 observações fora dos critérios de aceite, ver "Observações")

## Testes
```
cd workspace && npm test
ℹ tests 27 · pass 27 · fail 0 · cancelled 0 · skipped 0
```
Também conferido: `npx tsc -p workspace` sem erros (rodado ao fim da fatia 8), e o código de `src/convert.ts`, `src/cli.ts` e `bin/flashcards.ts` lido por inteiro.

## Critérios de aceite
| CA | Veredito | Evidência |
|----|----------|-----------|
| CA-1 | ✅ | `workspace/test/convert.test.ts` › "gera cabeçalho do Anki e um card por linha (CA-1)": compara o CSV inteiro, byte a byte. |
| CA-2 | ✅ | `workspace/test/cli.test.ts` › "sem -o grava ao lado do .md com o mesmo nome, sobrescrevendo (CA-2, CA-16)": cria um `espanhol.csv` antigo e confere que foi substituído. |
| CA-3 | ✅ | `workspace/test/cli.test.ts` › "-o grava no caminho dado, criando a pasta, e o deck continua vindo do .md (CA-3)": confere `#deck:espanhol` em `saida/cards.csv` e que nada foi gravado ao lado do `.md`. |
| CA-4 | ✅ | `workspace/test/convert.test.ts` › "ignora títulos, parágrafos e linhas em branco sem avisar (CA-4)" |
| CA-5 | ✅ | `workspace/test/convert.test.ts` › "remove marcadores de lista e espaços em volta (CA-5)": usa exatamente as 3 linhas do PRD. |
| CA-6 | ✅ | `workspace/test/convert.test.ts` › "divide no primeiro :: e a resposta pode conter :: (CA-6)" |
| CA-7 | ✅ | `workspace/test/convert.test.ts` › "ignora linhas dentro de blocos de código e volta a ler depois (CA-7)": cobre `std::cout`, card dentro do bloco, ausência de avisos e card depois do bloco. |
| CA-8 | ✅ | `workspace/test/convert.test.ts` › "lado vazio vira aviso com a linha e fica fora do CSV (CA-8)": linhas 3 e 5, como no PRD. A forma impressa do aviso (`aviso: linha N: ...`) é provada em CA-14. |
| CA-9 | ✅ | `workspace/test/convert.test.ts` › "pergunta repetida: fica a primeira e a repetida vira aviso (CA-9)": linhas 2 e 7, como no PRD. |
| CA-10 | ✅ | `workspace/test/convert.test.ts` › "campos com vírgula ou aspas vão entre aspas, com aspas duplicadas (CA-10)": exemplo do PRD + campo sem aspas ao lado de um com aspas. |
| CA-11 | ✅ | `workspace/test/convert.test.ts` › "Markdown e HTML passam literalmente, sem conversão (CA-11)" |
| CA-12 | ✅ | `workspace/test/cli.test.ts` › "lê .md UTF-8 com CRLF e grava CSV UTF-8 com os mesmos bytes nos acentos (CA-12)" (compara `Buffer`s) e `workspace/test/convert.test.ts` › teste de CRLF (CA-12). Conferido à mão: um BOM UTF-8 no início do arquivo também é descartado pelo `trim()`. |
| CA-13 | ✅ | `workspace/test/cli.test.ts` › "sem cards válidos (vazio \| só texto \| só linhas inválidas) … (CA-13)": os 3 casos do PRD, com CSV pré-existente intocado e código ≠ 0. |
| CA-14 | ✅ | `workspace/test/cli.test.ts` › "avisos saem antes do resumo, que conta 1 aviso no singular, e o código é 0 (CA-14)" (confere a ordem stderr → stdout) e "sem avisos o resumo diz 0 avisos (CA-14)". |
| CA-15 | ✅ | `workspace/test/cli.test.ts` › "arquivo de entrada inexistente: erro citando o caminho e código ≠ 0 (CA-15)" |
| CA-16 | ✅ | `workspace/test/cli.test.ts` › "sem -o grava … (CA-2, CA-16)" compara o arquivo gravado com `convert(markdown, "espanhol").csv`; os testes de `convert.test.ts` chamam a função sem disco nem terminal e conferem `warnings` com número da linha. |
| CA-17 | ✅ | `workspace/test/cli.test.ts` › "-o igual à entrada (mesmo caminho | caminho relativo equivalente): não toca no .md, erro citando o caminho e código ≠ 0 (CA-17)". Reprodução manual da observação original refeita: `n.md -o N.MD` agora sai com 1 e o `.md` fica intocado. |

## Arquitetura
- Bate com `04-arquitetura.md`: módulos `convert` (função pura, assinatura e tipos `Card`/`Warning`/`ConvertResult` idênticos), `cli` (`run(args, io)` com `io` padrão em `process`) e `bin/flashcards.ts` sem lógica. A estrutura de `workspace/` é a planejada.
- Comportamentos fixados na arquitetura conferidos: CSV com LF e `\n` final, código 2 para uso inválido, código 1 para erros de arquivo, criação da pasta de `-o`, mensagens `aviso:`/`erro:`.
- Desvio: não há etapa explícita de normalização de CRLF; o `trim()` remove o `\r`. Está justificado em `05-implementacao.md` (fatia 2) e coberto pelo teste de bytes de CA-12. Aceito.
- Fatia 8 (CA-17) segue a arquitetura: checagem em `cli`, `convert` intocado. A checagem roda antes de ler o arquivo, não só antes de gravar; justificado em `05-implementacao.md`. Aceito.

## Escopo extra
- Nada do "Fora de escopo" do PRD foi implementado (sem tags, cloze, invertidos, multilinha, HTML, IA, ID explícito, `#notetype`, vários arquivos).
- Além dos CAs, e vindo da arquitetura: mensagem de uso com código 2 e erro ao gravar com código 1, ambos com teste. Também o README (decisão 9 do grill). Tudo dentro do combinado.

## Observações (não bloqueiam; nenhum CA é violado)
1. ~~`-o` igual ao arquivo de entrada apaga o Markdown.~~ **Resolvida**: virou CA-17 no PRD e fatia 8 na implementação.
2. **Pergunta começando com `#` no primeiro card.** `#tag :: hashtag` gera a linha `#tag,hashtag` logo após as linhas de cabeçalho. O Anki trata linhas iniciadas por `#` no topo do arquivo como cabeçalho, então esse card pode ser descartado ou confundido na importação. Não verificado no Anki real. Sugestão: pôr entre aspas campos que começam com `#`.
3. **Bloco de código sem fechamento engole o resto do arquivo em silêncio.** Um ```` ``` ```` sem par faz todas as linhas seguintes serem ignoradas, sem aviso. Sugestão: avisar quando o arquivo termina dentro de um bloco.

Também registrado em `05-implementacao.md` e confirmado aqui: a importação real no Anki não foi testada, e o resumo diz `1 cards` no singular.

## O que corrigir (se reprovado)
- Não se aplica (aprovado). Se o dono quiser tratar as observações 1–3, o caminho é uma nova rodada da etapa **implement** (com um CA novo no PRD para cada uma), não um ajuste nesta revisão.
