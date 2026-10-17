---
step: grill
skill: grilling
inputs:
  - docs/flow/01-ideia.md
---

# Decisões: Gerador de flashcards Markdown → CSV do Anki

## Decisões
| # | Pergunta | Decisão | Por quê |
|---|----------|---------|---------|
| 1 | Qual é a fonte da verdade? | O Markdown. O CSV é sempre gerado a partir dele e pode ser apagado/regerado. | Um único lugar para editar; evita conversão de volta. |
| 2 | Forma da interface? | Ferramenta de linha de comando (ex.: `flashcards notas.md -o cards.csv`). A conversão em si é uma função reaproveitável. | Uso pessoal no terminal; a função pode servir ao site no futuro. |
| 3 | Como definir o baralho? | Um arquivo `.md` = um baralho, com o nome do arquivo sem extensão (`espanhol.md` → `espanhol`). | Simples, sem sintaxe extra no Markdown. |
| 4 | Reimportar duplica cards? | Não: a identidade do card é a pergunta (primeiro campo), e o Anki atualiza cards com a mesma pergunta. Sem ID explícito. Limitação aceita: editar o texto da pergunta cria um card novo. | Mantém o Markdown limpo; resolve o caso comum. |
| 5 | Quais tipos de card? | Só básico (frente → verso). | Escopo mínimo. |
| 6 | Linhas que não são cards? | Linhas sem `::` são ignoradas em silêncio. Linhas com `::` mas um lado vazio geram aviso com o número da linha, ficam fora do CSV, e o resto continua. | Permite anotações livres no mesmo arquivo; erro de digitação não passa despercebido. |
| 7 | Formato do texto? | Um card por linha (sem resposta multilinha). Texto vai como está, sem converter Markdown para HTML. Vírgulas, aspas etc. são escapadas pela ferramenta. | Simplicidade; nada de surpresas de formatação. |
| 8 | Tags? | Não na v1. | Escopo mínimo. |
| 9 | IA geradora e integração com o site? | Fora do escopo. Esta versão só garante um formato simples e documentado. | Visão de futuro, não desta entrega. |
| 10 | Cabeçalho do CSV? | Separador vírgula com escape correto, e as linhas `#separator:Comma`, `#html:false`, `#deck:<nome do arquivo>`. Sem `#notetype` (o nome do tipo muda com o idioma do Anki; escolhe-se na importação). Requer Anki ≥ 2.1.55. | Importação já vem configurada. |
| 11 | Onde gravar sem `-o`? | Ao lado do Markdown, mesmo nome com `.csv`, sobrescrevendo se existir. | O CSV é gerado (decisão 1), então sobrescrever é seguro. |
| 12 | Marcadores de lista e espaços? | Marcadores no início da linha (`- `, `* `, `1. `) são removidos; espaços em volta da pergunta e da resposta também. | Anotações costumam estar em listas. |
| 13 | `::` repetido e blocos de código? | A linha é dividida no **primeiro** `::` (a resposta pode conter `::`). Linhas dentro de blocos de código (```` ``` ````) são ignoradas. | Evita falsos cards em código (`std::cout`). |
| 14 | Pergunta repetida no mesmo arquivo? | Fica a primeira; as repetidas geram aviso com o número da linha e ficam fora do CSV. | A pergunta é a identidade (decisão 4); duplicatas colidiriam no Anki. |
| 15 | Arquivo sem nenhum card válido? | Não cria o CSV, mostra erro e sai com código de erro. | Evita um CSV vazio enganoso. |
| 16 | Plataforma? | Node.js (≥ 22.18), sem dependências externas. | Mesmo runtime do repositório; nada para instalar. |
| 17 | Codificação e quebras de linha? | Lê UTF-8, aceita LF e CRLF; grava o CSV em UTF-8. | Acentos e arquivos do Windows funcionam. |
| 18 | Saída no terminal? | Lista os avisos e termina com um resumo, ex.: `42 cards → espanhol.csv (2 avisos)`. | Feedback rápido do que foi gerado. |

## Fora de escopo (decidido)
- Geração de cards por IA.
- Integração com o site próprio.
- Tags.
- Cards invertidos e cloze.
- Respostas com várias linhas.
- Conversão de Markdown para HTML (negrito, código etc. aparecem literalmente).
- ID explícito por card.
- Editar o CSV e convertê-lo de volta para Markdown.

## Em aberto
- Aceitar vários arquivos `.md` numa só execução não foi discutido; o padrão assumido nas decisões 2 e 3 é um arquivo por execução.
- Os nomes do comando e das opções além de `-o` ficam para a arquitetura.
