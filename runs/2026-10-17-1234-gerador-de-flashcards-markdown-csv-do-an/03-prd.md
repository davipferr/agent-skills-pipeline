---
step: prd
skill: write-prd
inputs:
  - docs/flow/01-ideia.md
  - docs/flow/02-decisoes.md
---

# PRD: Gerador de flashcards Markdown → CSV do Anki

## Objetivo
O usuário escreve seus cards num arquivo Markdown simples (`pergunta :: resposta`) e, com um comando, obtém um CSV que o Anki importa direto no baralho certo, e que pode ser reimportado sem duplicar cards.

## Escopo
1. Comando de terminal que recebe um arquivo `.md` e grava um `.csv` (caminho via `-o`, ou por padrão ao lado do `.md`, mesmo nome).
2. Leitura das linhas `pergunta :: resposta`: divide no primeiro `::`, remove marcadores de lista e espaços, ignora linhas sem `::` e linhas dentro de blocos de código.
3. Validação com avisos: lado vazio e pergunta repetida geram aviso com número da linha e ficam fora do CSV, sem interromper.
4. Geração do CSV no formato do Anki: cabeçalho `#separator:Comma`, `#html:false`, `#deck:<nome do arquivo>`, depois uma linha `pergunta,resposta` por card, com escape correto.
5. Resumo no terminal e código de saída: erro quando não há nenhum card válido.
6. A conversão (texto Markdown → cards/CSV + avisos) é uma função reaproveitável, separada da parte de linha de comando (decisão 2).

## Fora de escopo
- Geração de cards por IA e integração com o site próprio: visão de futuro, não desta entrega.
- Tags, cards invertidos e cloze: escopo mínimo.
- Respostas multilinha e conversão Markdown → HTML: texto vai como está, uma linha por card.
- ID explícito por card: a pergunta é a identidade (limitação aceita: editar a pergunta cria card novo no Anki).
- Converter o CSV de volta para Markdown: o Markdown é a fonte da verdade.
- Linha `#notetype` no CSV: o nome do tipo depende do idioma do Anki.

## Critérios de aceite
Os exemplos usam um arquivo chamado `espanhol.md`. "Avisos" e "erros" saem no terminal (stderr); "o CSV" é o arquivo gerado.

- **CA-1 (formato básico)**: Dado `espanhol.md` contendo `hola :: olá` e `gato :: gato`, quando o comando roda, então `espanhol.csv` contém exatamente, nesta ordem: `#separator:Comma`, `#html:false`, `#deck:espanhol`, `hola,olá`, `gato,gato`.
- **CA-2 (saída padrão)**: Dado `pasta/espanhol.md` e nenhum `-o`, quando o comando roda, então o CSV é gravado em `pasta/espanhol.csv`; se esse arquivo já existia, seu conteúdo é substituído.
- **CA-3 (saída com `-o`)**: Dado `-o saida/cards.csv`, quando o comando roda, então o CSV é gravado em `saida/cards.csv` e o `#deck` continua sendo o nome do `.md` (`espanhol`).
- **CA-4 (linhas ignoradas)**: Dado um arquivo com títulos (`# Verbos`), parágrafos sem `::` e linhas em branco além de um card válido, quando o comando roda, então o CSV tem só aquele card e nenhum aviso é emitido.
- **CA-5 (marcadores e espaços)**: Dadas as linhas `- hola :: olá`, `* perro::cachorro` e `1.   casa   ::   casa  `, quando o comando roda, então os cards gerados são `hola,olá`, `perro,cachorro` e `casa,casa`.
- **CA-6 (primeiro `::`)**: Dada a linha `separador do C++ :: usa :: entre namespaces`, quando o comando roda, então a pergunta é `separador do C++` e a resposta é `usa :: entre namespaces`.
- **CA-7 (blocos de código)**: Dado um bloco cercado por ```` ``` ```` contendo `std::cout << x;`, quando o comando roda, então nenhum card sai das linhas do bloco e nenhum aviso é emitido para elas; cards depois do fim do bloco voltam a ser lidos.
- **CA-8 (lado vazio)**: Dadas as linhas 3 `pergunta ::` e 5 `:: resposta`, quando o comando roda, então essas linhas ficam fora do CSV, há um aviso citando a linha 3 e outro citando a linha 5, e os demais cards válidos são gravados normalmente.
- **CA-9 (pergunta repetida)**: Dadas a linha 2 `hola :: olá` e a linha 7 `hola :: oi`, quando o comando roda, então o CSV contém só `hola,olá` e há um aviso citando a linha 7.
- **CA-10 (escape)**: Dado o card `diga "oi", por favor :: say "hi", please`, quando o comando roda, então a linha do CSV é `"diga ""oi"", por favor","say ""hi"", please"` (campos com vírgula ou aspas vão entre aspas, aspas internas duplicadas); campos sem esses caracteres não levam aspas.
- **CA-11 (texto literal)**: Dado o card `**ser** :: <b>to be</b>`, quando o comando roda, então o CSV contém `**ser**,<b>to be</b>` sem nenhuma conversão.
- **CA-12 (codificação)**: Dado um arquivo UTF-8 com quebras CRLF e o card `¿Cómo estás? :: Como você está?`, quando o comando roda, então o CSV está em UTF-8, a resposta não tem `\r` sobrando e os acentos são preservados byte a byte.
- **CA-13 (nenhum card)**: Dado um arquivo sem nenhum card válido (vazio, só texto, ou só linhas inválidas), quando o comando roda, então nenhum CSV é criado (um CSV pré-existente fica intocado), uma mensagem de erro é exibida e o código de saída é diferente de 0.
- **CA-14 (resumo e sucesso)**: Dado um arquivo com 3 cards válidos e 1 linha com lado vazio, quando o comando roda, então os avisos aparecem antes de uma linha final no formato `3 cards → <caminho do csv> (1 aviso)` e o código de saída é 0. Sem avisos, a linha é `3 cards → <caminho do csv> (0 avisos)`.
- **CA-15 (arquivo inexistente)**: Dado um caminho de entrada que não existe, quando o comando roda, então é exibida uma mensagem de erro citando o caminho e o código de saída é diferente de 0.
- **CA-16 (função reaproveitável)**: Dado o texto Markdown e o nome do baralho, quando a função de conversão é chamada diretamente (sem linha de comando nem disco), então ela devolve o conteúdo do CSV e a lista de avisos (com número da linha), produzindo o mesmo CSV que o comando gravaria.

- **CA-17 (não sobrescrever a fonte)**: Dado `-o` apontando para o próprio arquivo de entrada (mesmo caminho depois de resolvido, ex.: `espanhol.md -o ./espanhol.md`), quando o comando roda, então o `.md` fica intocado, é exibida uma mensagem de erro citando o caminho e o código de saída é diferente de 0. *(Acrescentado após a revisão, a pedido do usuário: o Markdown é a fonte da verdade, decisão 1 em `02-decisoes.md`.)*

## Restrições técnicas
- Node.js ≥ 22.18, sem dependências externas de runtime (decisão 16).
- Código em `workspace/` (regra do repositório).
- CSV compatível com Anki ≥ 2.1.55 (linhas de cabeçalho `#...`).
- Entrada UTF-8 com LF ou CRLF; saída UTF-8.
- Um arquivo de entrada por execução (padrão assumido; ver Em aberto).

## Em aberto
- Aceitar vários `.md` numa execução não foi discutido; o PRD assume um por execução. Bloqueia a implementação? Não.
- Nome do comando e opções além de `-o`: decisão da etapa de arquitetura. Bloqueia a implementação? Não.
- Quebras de linha no CSV gerado (LF ou CRLF): o Anki aceita as duas; fica a critério da arquitetura. Bloqueia a implementação? Não.
