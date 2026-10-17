---
step: verify
skill: verify
inputs:
  - docs/flow/03-prd.md
  - docs/flow/04-arquitetura.md
  - docs/flow/05-implementacao.md
---

# Verificação: Gerador de flashcards Markdown → CSV do Anki

**Veredito:** aprovado (verificação feita depois do arquivamento, quando a etapa `verify` foi criada; 2 observações que não bloqueiam)

## Ambiente
- Cópia limpa em: pasta temporária fora do repositório (`/tmp/tmp.XXXX`), só com `README.md`, `bin/`, `espanhol.md`, `package.json`, `src/`, `test/`, `tsconfig.json` e `verify/` (sem `node_modules`)
- Sistema e runtime: Windows 11 (Git Bash), Node v25.5.0
- Instalação: `npm install` → `added 3 packages ... found 0 vulnerabilities` (só `typescript` e `@types/node`, de desenvolvimento)
- Typecheck: `npm run typecheck` → código 0
- Testes: `npm test` → `tests 27 · pass 27 · fail 0`

### Problema encontrado e corrigido antes desta verificação
O `workspace/tsconfig.json` original fazia `"extends": "../tsconfig.json"` e usava o TypeScript da raiz do repositório (decisão de [04-arquitetura.md](04-arquitetura.md)). Depois do `npm run archive`, `../` passou a ser `docs/runs/` e o typecheck quebrou. O dono corrigiu à mão, copiando as opções para dentro do arquivo. Mesmo assim, a pasta continuava sem `typescript` e `@types/node`, então `npx tsc -p .` numa cópia isolada falhava. A correção final: `typescript` e `@types/node` como `devDependencies`, com `npm run typecheck` (`tsc -p .`), e `verify/` incluída no `tsconfig.json`.

## Funcionalidades (como usuário)
| Funcionalidade (FEATURE-MAP) | CA | Comando / ação | Saída real (trecho) | ✅/❌ |
|------------------------------|----|----------------|---------------------|-------|
| Converter ao lado | CA-1, CA-2 | `node bin/flashcards.ts espanhol.md` (exemplo do README) | `3 cards → espanhol.csv (0 avisos)`; CSV com `#separator:Comma`, `#html:false`, `#deck:espanhol`, `hola,olá`, `¿Cómo estás?,Como você está?`, `adiós,tchau` | ✅ |
| Converter com `-o` | CA-3 | `node bin/flashcards.ts espanhol.md -o "minha saida/cards.csv"` | pasta criada; `#deck:espanhol` mantido | ✅ |
| Ler os cards | CA-5, CA-6, CA-7, CA-11 | `misto.md` com `1.   casa   ::   casa  `, `separador do C++ :: usa :: entre namespaces`, bloco com `std::cout << x;`, `**ser** :: <b>to be</b>` | `casa,casa` · `separador do C++,usa :: entre namespaces` · `**ser**,<b>to be</b>`; nada do bloco; stderr vazio | ✅ |
| Avisar linhas inválidas | CA-8, CA-9, CA-14 | `avisos.md` com lado vazio nas linhas 3 e 5 e pergunta repetida na 6 | `aviso: linha 3: resposta vazia...`, `aviso: linha 5: pergunta vazia...`, `aviso: linha 6: pergunta repetida (já está na linha 1)...` e depois `3 cards → avisos.csv (3 avisos)`, código 0 | ✅ |
| Escapar campos | CA-10 | `diga "oi", por favor :: say "hi", please` | `"diga ""oi"", por favor","say ""hi"", please"` | ✅ |
| Codificação | CA-12 | `¿Cómo estás? :: Como você está?` com CRLF | `¿Cómo estás?,Como você está?` sem `\r` | ✅ |
| Nenhum card | CA-13 | `vazio.md` só com título e texto | `erro: nenhum card válido em vazio.md; nada foi gravado`, código 1, `vazio.csv` não criado | ✅ |
| Arquivo inexistente | CA-15 | `node bin/flashcards.ts "nao existe.md"` | `erro: não foi possível ler nao existe.md: arquivo não encontrado`, código 1 | ✅ |
| Função reaproveitável | CA-16 | coberta pelos testes de `test/convert.test.ts` (sem disco nem terminal) | 27 testes passando | ✅ |
| Recusar sobrescrever o `.md` | CA-17 | `node bin/flashcards.ts espanhol.md -o ./espanhol.md` | `erro: a saída ./espanhol.md é o próprio arquivo de entrada`, código 1 | ✅ |

## Bordas
| Caso | Comando / ação | Saída real (trecho) | ✅/❌ |
|------|----------------|---------------------|-------|
| sem argumentos | `node bin/flashcards.ts` | `uso: flashcards <entrada.md> [-o <saida.csv>]`, código 2 | ✅ |
| caminho com espaço | `-o "minha saida/cards.csv"` e `"nao existe.md"` | funcionam como os demais | ✅ |
| volume grande | 50 mil cards | `50000 cards → grande.csv (0 avisos)` em 0,15 s | ✅ |
| bloco de código sem fechamento | `a :: b`, depois ```` ``` ```` e `c :: d` | `1 cards → aberto.csv (0 avisos)`: `c :: d` some sem aviso | ⚠️ observação 1 |
| `#` no primeiro card | `#tag :: hashtag` | CSV com a linha `#tag,hashtag` logo depois do cabeçalho | ⚠️ observação 2 |

## Script de fumaça
```bash
cd workspace && npm run smoke
```
10 verificações (CA-1 a CA-15, CA-17 e uso inválido), rodadas na cópia limpa → `fumaça: tudo certo`

## Falhas
- nenhuma

## Observações (não bloqueiam; já registradas como pendências em [08-entrega.md](08-entrega.md))
1. Um bloco de código sem fechamento faz o resto do arquivo ser ignorado sem aviso (confirmado).
2. Uma pergunta começando com `#` no primeiro card gera uma linha `#...` logo depois do cabeçalho, e o Anki pode lê-la como cabeçalho (o texto do CSV foi confirmado; a leitura do Anki não foi).

## Não verificado
- Importação real no Anki: precisa do aplicativo aberto e de um humano; não foi feita. Os testes e a fumaça conferem o texto do CSV contra o formato documentado.
