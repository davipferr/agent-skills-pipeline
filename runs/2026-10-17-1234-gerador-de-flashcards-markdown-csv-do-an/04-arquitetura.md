---
step: architecture
skill: plan-architecture
inputs:
  - docs/flow/03-prd.md
---

# Arquitetura: Gerador de flashcards Markdown → CSV do Anki

## Visão geral
Dois módulos. `convert` é uma função pura: recebe o texto Markdown e o nome do baralho e devolve o CSV pronto, os cards e os avisos. Lê linha a linha, sem tocar em disco nem em terminal. `cli` é a casca fina: interpreta os argumentos, lê o `.md`, chama `convert`, decide onde gravar, imprime avisos e resumo e devolve o código de saída. Toda regra de formato (parsing, validação, escape, cabeçalho do Anki) mora em `convert`; toda regra de I/O (caminhos, sobrescrita, erros de arquivo, código de saída) mora em `cli`.

## Stack
- Linguagem/runtime: TypeScript executado direto pelo Node ≥ 22.18 (type stripping, como o resto do repositório): imports com extensão `.ts`, sem `enum`/`namespace`.
- Testes: `node:test` + `node:assert/strict` (embutidos no Node).
- Dependências: nenhuma (restrição do PRD).

## Módulos
| Módulo | Responsabilidade | Interface pública |
|--------|------------------|-------------------|
| `convert` (`src/convert.ts`) | Transformar texto Markdown em CSV do Anki + avisos, aplicando todas as regras de linha (bullets, `::`, blocos de código, lados vazios, duplicatas, CRLF) e de formato (cabeçalho, escape). | `convert(markdown: string, deck: string): ConvertResult` com `ConvertResult = { csv: string; cards: Card[]; warnings: Warning[] }`, `Card = { question: string; answer: string; line: number }`, `Warning = { line: number; message: string }` |
| `cli` (`src/cli.ts`) | Interpretar `<entrada.md> [-o <saida.csv>]`, ler/gravar arquivos, imprimir avisos e resumo, devolver o código de saída. | `run(args: string[], io?: { stdout(text: string): void; stderr(text: string): void }): Promise<number>`; o padrão de `io` escreve em `process.stdout`/`process.stderr` |
| `bin/flashcards.ts` | Ponto de entrada: `process.exitCode = await run(process.argv.slice(2))`. Sem lógica. | `node bin/flashcards.ts <entrada.md> [-o <saida.csv>]` |

Detalhes de comportamento fixados aqui (o PRD deixou para a arquitetura):
- **Nome do comando**: `flashcards`. Opções: só `-o <caminho>`. Uso inválido (sem entrada, `-o` sem valor, argumento desconhecido): mensagem de uso no stderr, código 2.
- **Quebras de linha do CSV**: LF, com `\n` final após a última linha.
- **`csv` quando não há cards**: `convert` ainda devolve `cards: []`; quem decide o erro (CA-13) é `cli`, que não grava nada e devolve 1.
- **Avisos**: mensagens em português, no stderr, formato `aviso: linha <n>: <mensagem>`. Resumo no stdout: `<n> cards → <caminho> (<k> aviso|avisos)` (singular só para 1).
- **Pasta de saída**: se o diretório de `-o` não existir, é criado.
- **Erros de arquivo** (entrada inexistente, falha ao gravar): `erro: <mensagem com o caminho>` no stderr, código 1.
- **Ordem do pipeline de linha** em `convert`: normalizar CRLF → alternar estado de bloco de código em linhas que começam com ```` ``` ```` → ignorar linhas sem `::` → remover bullet (`- `, `* `, `<n>. `) → dividir no primeiro `::` → `trim` dos dois lados → lado vazio = aviso → pergunta já vista = aviso → card.
- **Escape**: campo entre aspas se contém `,`, `"`, `\n` ou `\r`; aspas internas duplicadas (RFC 4180).

## Interfaces a testar
- **`convert(markdown, deck)`** — pega: todo o formato do CSV (cabeçalho, ordem, escape, texto literal), regras de parsing, avisos com número de linha e mensagem, consistência com o que o CLI grava. Deixa passar: tudo de disco/caminhos/terminal/código de saída.
- **`run(args, io)`** (com arquivos reais num diretório temporário de `os.tmpdir()` e `io` capturando o texto) — pega: caminho de saída padrão e com `-o`, sobrescrita, não criar CSV sem cards, CSV pré-existente intocado, arquivo de entrada inexistente, avisos antes do resumo, texto do resumo, códigos de saída, nome do baralho vindo do arquivo de entrada. Deixa passar: a ligação de `bin/flashcards.ts` com `process` (coberta por um único teste de fumaça que roda `node bin/flashcards.ts` via `child_process`).

## Estrutura de `workspace/`
```
workspace/
├── package.json          # "type": "module", "bin": {"flashcards": "bin/flashcards.ts"}, script "test"
├── tsconfig.json         # estende ../tsconfig.json; checagem: npx tsc -p workspace
├── README.md             # formato do .md, uso do comando, como importar no Anki
├── bin/
│   └── flashcards.ts     # entrada do comando
├── src/
│   ├── convert.ts        # módulo convert
│   └── cli.ts            # módulo cli
└── test/
    ├── convert.test.ts   # testes da interface convert
    └── cli.test.ts       # testes da interface run + fumaça do bin
```
Testes: `cd workspace && node --test "test/**/*.test.ts"` (script `npm test`).

## Fatias (ordem de implementação)
1. **Caminho feliz ponta a ponta** — cobre CA-1, CA-2, CA-16. `convert` gera cabeçalho + cards simples; `run` lê o `.md`, grava ao lado com mesmo nome (sobrescrevendo), imprime `n cards → caminho (0 avisos)`, devolve 0; `bin` funciona. Pronto quando: `node bin/flashcards.ts espanhol.md` gera o CSV de CA-1.
2. **Leitura tolerante** — cobre CA-4, CA-5, CA-6, CA-12. Ignora linhas sem `::`, remove bullets e espaços, divide no primeiro `::`, normaliza CRLF e preserva UTF-8. Pronto quando: os exemplos desses CAs passam em `convert` e um arquivo CRLF passa por `run`.
3. **Blocos de código** — cobre CA-7. Pronto quando: `::` dentro de ```` ``` ```` não vira card nem aviso e cards após o bloco voltam a ser lidos.
4. **Avisos** — cobre CA-8, CA-9, CA-14. Lado vazio e pergunta repetida viram `Warning` com linha; `run` imprime os avisos antes do resumo e conta-os (`1 aviso`/`n avisos`), código 0. Pronto quando: os três CAs passam.
5. **Escape e texto literal** — cobre CA-10, CA-11. Pronto quando: aspas/vírgulas saem no formato RFC 4180 e Markdown/HTML passam sem conversão.
6. **Opção `-o` e erros** — cobre CA-3, CA-13, CA-15. `-o` (criando a pasta), nenhum card → não grava e devolve 1, entrada inexistente → erro com o caminho e 1, uso inválido → 2. Pronto quando: os três CAs passam e um CSV pré-existente fica intocado em CA-13.
7. **README** — sem CA próprio; documenta o formato (decisão 9 do grill: "formato simples e documentado") e o passo a passo de importação no Anki. Pronto quando: `workspace/README.md` existe com exemplo de `.md`, comando e requisito Anki ≥ 2.1.55.
8. **Não sobrescrever a fonte** — cobre CA-17. Em `cli`, antes de gravar: se `path.resolve(saida)` for igual a `path.resolve(entrada)` (comparação sem diferenciar maiúsculas no Windows, onde o sistema de arquivos também não diferencia), escreve `erro: a saída <caminho> é o próprio arquivo de entrada` e devolve 1, sem gravar. A checagem fica em `cli` porque é regra de I/O; `convert` não muda. Pronto quando: `espanhol.md -o ./espanhol.md` deixa o `.md` intocado e sai com 1. (Acrescentada depois da revisão.)

## Cobertura dos critérios de aceite
| CA | Fatia |
|----|-------|
| CA-1 | 1 |
| CA-2 | 1 |
| CA-3 | 6 |
| CA-4 | 2 |
| CA-5 | 2 |
| CA-6 | 2 |
| CA-7 | 3 |
| CA-8 | 4 |
| CA-9 | 4 |
| CA-10 | 5 |
| CA-11 | 5 |
| CA-12 | 2 |
| CA-13 | 6 |
| CA-14 | 4 |
| CA-15 | 6 |
| CA-16 | 1 |
| CA-17 | 8 |

## Em aberto
- Nada bloqueante. Vários `.md` por execução continua fora (PRD, Em aberto); a interface `run(args)` permite acrescentar depois sem mudar `convert`.
- `workspace/` não entra no `tsc` do repositório. Para checar tipos sem dependência nova, `workspace/tsconfig.json` estende `../tsconfig.json` (incluindo `bin`, `src`, `test`) e roda com o TypeScript já instalado na raiz: `npx tsc -p workspace`.
