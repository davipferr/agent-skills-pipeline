---
step: idea
skill: capture-idea
inputs: []
---

# Ideia: Gerador de flashcards Markdown → CSV do Anki

## Problema
Os cards de estudo ficam presos dentro do Anki: não há um arquivo-fonte simples, em texto, que o usuário guarde e reaproveite. Ele quer um formato único que possa importar de novo no mesmo Anki, num outro Anki ou, no futuro, no próprio site, sem refazer os cards.

## Ideia
Um gerador de flashcards que lê anotações em Markdown no formato `pergunta :: resposta` e gera um CSV que o Anki importa.

Visão de futuro (contexto, fora do escopo desta ideia): pedir a uma IA "quero estudar a língua X" e receber cards já nesse padrão, salvar o arquivo no próprio site e reaproveitá-lo tanto no Anki quanto num site próprio que use o mesmo padrão do Anki.

## Para quem
O próprio usuário (ferramenta pessoal).

## Restrições já conhecidas
- Entrada: Markdown com linhas `pergunta :: resposta`.
- Saída: CSV que o Anki consiga importar.
- O arquivo gerado precisa ser reaproveitável: reimportar no mesmo Anki, importar em outro Anki e, no futuro, num site próprio.
- Prazo, linguagem e plataforma: nenhum informado.

## Em aberto
- O que conta como "fonte da verdade": o Markdown, o CSV ou os dois?
- Como o Markdown é organizado: um arquivo por baralho? Tags? Baralho definido no arquivo?
- Reimportar o mesmo arquivo deve atualizar cards existentes em vez de duplicar? (exige um identificador estável por card)
- Respostas com várias linhas, formatação (negrito, código) ou caracteres como vírgula, aspas e `::` dentro do texto.
- Linhas que não seguem o padrão: ignorar, avisar ou dar erro?
- Formato da interface: linha de comando, função de biblioteca, ou as duas?
- Só cards básicos (frente/verso) ou também cards invertidos ou cloze?
- Separador do CSV e cabeçalhos especiais do Anki (`#separator`, `#deck`, `#tags`).
