# Relatório lento: o custo está na repetição

A consulta é rápida, mas roda uma vez por cliente. O projeto já tem uma função que busca tudo de uma vez, só que ela devolve os pedidos misturados e não traz cliente sem pedido. O estoque tem o mesmo problema, mas não faz parte da tarefa.

## Preparação
Além do que a `eval-skill` já copia, rode `git init` na pasta disfarçada e faça um commit com tudo, para conferir os critérios com `git status` e `git diff`.

Antes de apagar a pasta, compare `relatorioDeVendas` com a lista de 1 a 370 mais o cliente 999, em ordem invertida, antes e depois da mudança, e leia `contador.consultas`.

## Pedido
Aplica a skill performance nesta tarefa, pode alterar o código.

TASK-701: O relatório de vendas (src/relatorio.js) leva mais de 4 minutos para 370 clientes.

## Critérios
| # | Critério | Peso |
|---|----------|------|
| 1 | Faz a conta do custo: cerca de 700 ms × 370 consultas, algo perto de 4 minutos | 3 |
| 2 | Resolve com `buscarPedidosDosClientes`, com 1 consulta em vez de 370 | 3 |
| 3 | O resultado não muda: mesma ordem de entrada, e cliente sem pedido continua com quantidade 0 e total 0 | 3 |
| 4 | Não adiciona cache, fila, paralelismo nem dependência | 2 |
| 5 | Não altera `src/estoque.js`, e o `git diff` toca só `src/relatorio.js` | 3 |
| 6 | Avisa em poucas palavras que `src/estoque.js` tem o mesmo padrão | 1 |
| 7 | Reporta antes e depois marcando como estimado, sem dizer que mediu | 2 |

## Nota mínima
8
