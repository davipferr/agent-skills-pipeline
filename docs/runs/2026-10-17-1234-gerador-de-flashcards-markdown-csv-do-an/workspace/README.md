# flashcards

Transforma anotações em Markdown (`pergunta :: resposta`) num CSV que o Anki importa.

Requisitos: Node.js ≥ 22.18 e Anki ≥ 2.1.55. Sem dependências.

## Formato do arquivo `.md`

Cada linha com `::` é um card: o que vem antes do **primeiro** `::` é a pergunta (frente), o resto é a resposta (verso).

```markdown
# Saudações

- hola :: olá
- ¿Cómo estás? :: Como você está?

1. adiós :: tchau

Linhas sem o separador (títulos, comentários, linhas em branco) são ignoradas.
```

Regras:

- Um arquivo = um baralho, com o nome do arquivo (`espanhol.md` → baralho `espanhol`).
- Marcadores de lista (`- `, `* `, `1. `) e espaços em volta são removidos.
- Um card por linha; o texto vai como está (sem converter Markdown/HTML).
- Linhas dentro de blocos de código (entre linhas que começam com ` ``` `) são ignoradas.
- A pergunta é a identidade do card: reimportar o mesmo arquivo atualiza os cards em vez de duplicar. Editar o texto de uma pergunta cria um card novo no Anki.
- Avisos (a linha fica fora do CSV, o resto continua): pergunta ou resposta vazia, pergunta repetida no mesmo arquivo (fica a primeira).

## Uso

```bash
node bin/flashcards.ts espanhol.md              # grava espanhol.csv ao lado (sobrescreve)
node bin/flashcards.ts espanhol.md -o saida/cards.csv
```

Saída: avisos no stderr (`aviso: linha 7: ...`) e um resumo no stdout (`42 cards → espanhol.csv (2 avisos)`).

Se `-o` apontar para o próprio `.md`, o comando recusa (erro, código 1) para não apagar suas anotações.

Códigos de saída: `0` sucesso · `1` erro de arquivo ou nenhum card válido (nada é gravado) · `2` uso inválido.

## Importar no Anki

1. _Arquivo → Importar_ e escolha o `.csv`.
2. O CSV já informa separador (vírgula), HTML desligado e baralho. Escolha o tipo de nota **Básico** (Basic).
3. Para reimportar sem duplicar, deixe a opção de duplicatas em **Atualizar** (é a padrão).

## Como a função pode ser usada em outro lugar

```ts
import { convert } from "./src/convert.ts";

const { csv, cards, warnings } = convert(textoMarkdown, "espanhol");
```

## Testes

```bash
npm test             # testes unitários e da linha de comando
npm install          # só para o typecheck (typescript e @types/node)
npm run typecheck
```
