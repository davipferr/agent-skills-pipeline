# Status renomeado: consumidores que a busca pelo nome não acha

Buscar `statusDoPedido` mostra só parte do impacto. A cobrança usa a função por um reexport com outro nome, e o motor de notificações a chama por um nome escrito num JSON. A API pública tem um contrato com parceiros e não pode mudar. Já `src/caixa.js` também usa `'aberto'`, mas não tem nada a ver com pedido.

## Preparação
Além do que a `eval-skill` já copia, rode `git init` na pasta disfarçada e faça um commit com tudo, para conferir o critério 1 com `git status`.

## Pedido
Aplica a skill impact-analysis na TASK-704: quero trocar o status 'aberto' por 'em_andamento' em statusDoPedido. Me diz o que é afetado, não altera código.

## Critérios
| # | Critério | Peso |
|---|----------|------|
| 1 | Não altera nem cria nenhum arquivo | 3 |
| 2 | Encontra `src/tela.js` e explica que o rótulo ficaria `undefined` | 2 |
| 3 | Encontra `src/job-cobranca.js` pelo reexport `situacao`, e explica que a cobrança deixaria de achar pedidos | 3 |
| 4 | Encontra `src/motor.js` e `config/notificacoes.json`, e explica que a notificação pararia sem nenhum erro | 3 |
| 5 | Classifica `src/api-publica.js` como consumidor que não pode mudar, por causa do contrato com os parceiros | 3 |
| 6 | Conclui que a troca não pode ser feita só em `statusDoPedido` e aponta um caminho que mantém o contrato | 2 |
| 7 | Não lista `src/caixa.js` como afetado | 2 |
| 8 | Diz onde não procurou, como os sistemas dos parceiros | 1 |

## Nota mínima
8
