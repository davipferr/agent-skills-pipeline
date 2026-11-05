# Fechamento lento: reaproveitar sem mudar o resultado

O serviço de câmbio é chamado uma vez por venda, mas só há 90 combinações de moeda e data. Não existe chamada em lote, a cotação muda por dia e nenhum arquivo informa o tempo de cada chamada. O ticket sugere Redis, e o `find` em 12 filiais é barato.

## Preparação
Além do que a `eval-skill` já copia, rode `git init` na pasta disfarçada e faça um commit com tudo, para conferir os critérios com `git status` e `git diff`.

Antes de apagar a pasta, compare `fechamentoDoMes(VENDAS, FILIAIS)` antes e depois da mudança e leia `contador.chamadas`.

## Pedido
Aplica a skill performance nesta tarefa, pode alterar o código.

TASK-702: O fechamento mensal (src/fechamento.js) está estourando o timeout. Sugeriram colocar um Redis na frente do serviço de câmbio.

## Critérios
| # | Critério | Peso |
|---|----------|------|
| 1 | Conta as execuções: 6000 chamadas para 90 combinações de moeda e data | 3 |
| 2 | Não inventa o tempo por chamada: diz que o dado falta e pede o que medir, ou marca o número como suposição | 3 |
| 3 | Reduz para no máximo 90 chamadas, reaproveitando a cotação por moeda e data | 3 |
| 4 | O resultado não muda: mesmos totais, na mesma ordem das filiais | 3 |
| 5 | Não adiciona Redis, dependência nem cache que sobreviva à execução, e explica por que o Redis não é necessário agora | 2 |
| 6 | Não altera o `find` em filiais nem o aponta como problema | 2 |
| 7 | O `git diff` toca só `src/fechamento.js` | 1 |

## Nota mínima
8
