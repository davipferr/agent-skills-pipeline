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
- Cópia limpa em: pasta temporária fora do repositório (`/tmp/tmp.XXXX`), só com `README.md`, `bin/`, `espanhol.md`, `package.json`, `src/`, `test/` e `tsconfig.json` (sem `node_modules`)
- Sistema e runtime: Windows 11 (Git Bash), Node v25.5.0
- Instalação: `npm install` → `added 3 packages ... found 0 vulnerabilities` (só `typescript` e `@types/node`, de desenvolvimento)
- Typecheck: `npm run typecheck` → código 0
- Testes: `npm test` → `tests 27 · pass 27 · fail 0`

### Problema encontrado e corrigido antes desta verificação
O `workspace/tsconfig.json` original fazia `"extends": "../tsconfig.json"` e usava o TypeScript da raiz do repositório (decisão de [04-arquitetura.md](04-arquitetura.md)). Depois do `npm run archive`, `../` passou a ser `docs/runs/` e o typecheck quebrou. O dono corrigiu à mão, copiando as opções para dentro do arquivo. Mesmo assim, a pasta continuava sem `typescript` e `@types/node`, então `npx tsc -p .` numa cópia isolada falhava. A correção final: `typescript` e `@types/node` como `devDependencies`, com `npm run typecheck` (`tsc -p .`).

## Funcionalidades (como usuário)
| Funcionalidade (mapa do 05) | CA | Comando / ação | Saída real (trecho) | ✅/❌ |
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

## Como repetir
Comandos para colar num terminal, a partir da raiz do repositório. Criam as entradas numa pasta temporária e não gravam nada em `workspace/`. Rodados ao gravar esta verificação: todas as saídas bateram com o esperado.
```bash
root=$PWD
bin="$root/docs/runs/2026-10-17-1234-gerador-de-flashcards-markdown-csv-do-an/workspace/bin/flashcards.ts"
t=$(mktemp -d); cd "$t"
printf '# Saudações\n\n- hola :: olá\n- gato :: gato\n' > espanhol.md
node "$bin" espanhol.md              # esperado: 2 cards → espanhol.csv (0 avisos) (CA-1, CA-2, CA-14)
cat espanhol.csv                     # esperado: #separator:Comma · #html:false · #deck:espanhol · hola,olá · gato,gato
node "$bin" espanhol.md -o "minha saida/cards.csv"; head -3 "minha saida/cards.csv" | tail -1   # esperado: #deck:espanhol (CA-3)
printf '1.   casa   ::   casa  \nseparador do C++ :: usa :: entre namespaces\n```\nstd::cout << x;\n```\n**ser** :: <b>to be</b>\n' > misto.md
node "$bin" misto.md; tail -3 misto.csv   # esperado: casa,casa · separador do C++,usa :: entre namespaces · **ser**,<b>to be</b> (CA-5, CA-6, CA-7, CA-11)
printf 'hola :: olá\nperro :: cachorro\npergunta ::\ngato :: gato\n:: resposta\nhola :: oi\n' > avisos.md
node "$bin" avisos.md                # esperado: avisos das linhas 3, 5 e 6, depois 3 cards → avisos.csv (3 avisos) (CA-8, CA-9, CA-14)
printf 'diga "oi", por favor :: say "hi", please\n' > aspas.md
node "$bin" aspas.md; tail -1 aspas.csv   # esperado: "diga ""oi"", por favor","say ""hi"", please" (CA-10)
printf '¿Cómo estás? :: Como você está?\r\n' > crlf.md
node "$bin" crlf.md; tail -1 crlf.csv; grep -c $'\r' crlf.csv   # esperado: ¿Cómo estás?,Como você está? e 0, nenhum \r (CA-12)
printf '# só um título\n\ntexto sem cards\n' > vazio.md
node "$bin" vazio.md; echo "código $?"; ls vazio.csv 2>&1   # esperado: erro: nenhum card válido..., código 1, vazio.csv não existe (CA-13)
node "$bin" "nao existe.md"; echo "código $?"              # esperado: erro: não foi possível ler nao existe.md: arquivo não encontrado, código 1 (CA-15)
node "$bin" espanhol.md -o ./espanhol.md; echo "código $?" # esperado: erro: a saída ./espanhol.md é o próprio arquivo de entrada, código 1 (CA-17)
node "$bin"; echo "código $?"                              # esperado: uso: flashcards <entrada.md> [-o <saida.csv>], código 2
cd "$root"; rm -rf "$t"
```

## Falhas
- nenhuma

## Observações (não bloqueiam; já registradas como pendências em [08-entrega.md](08-entrega.md))
1. Um bloco de código sem fechamento faz o resto do arquivo ser ignorado sem aviso (confirmado).
2. Uma pergunta começando com `#` no primeiro card gera uma linha `#...` logo depois do cabeçalho, e o Anki pode lê-la como cabeçalho (o texto do CSV foi confirmado; a leitura do Anki não foi).

## Não verificado
- Importação real no Anki: precisa do aplicativo aberto e de um humano; não foi feita. Os testes e os comandos de "Como repetir" conferem o texto do CSV contra o formato documentado.
