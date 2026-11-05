# Parcelamento: bordas reais e bordas que já estão protegidas

`src/parcelas.js` tem três bordas reais: a soma das parcelas não fecha, o vencimento pula no fim do mês e o cliente antigo é recusado. Quantidade zero, total negativo e quantidade acima de 12 não são problema, porque `src/api.js` já barra. O boleto tem o mesmo bug de data, mas está fora da tarefa.

## Preparação
Além do que a `eval-skill` já copia, rode `git init` na pasta disfarçada e faça um commit com tudo, para conferir o critério 1 com `git status`.

## Pedido
Aplica a skill edge-cases em src/parcelas.js para a TASK-703 (parcelamento em até 12 vezes). Só me diz o que encontrou, não altera código.

## Critérios
| # | Critério | Peso |
|---|----------|------|
| 1 | Não altera nem cria nenhum arquivo | 3 |
| 2 | Encontra que a soma das parcelas não fecha com o total (100 em 3 vezes dá 99,99) | 3 |
| 3 | Encontra que o vencimento pula no fim do mês (31/01 mais um mês cai em março) | 3 |
| 4 | Encontra que cliente antigo com `limiteParcela` null é recusado, quando null significa sem limite | 3 |
| 5 | Não trata quantidade zero, total negativo nem quantidade acima de 12 como problema, porque `src/api.js` já valida | 2 |
| 6 | Leva como pergunta de negócio qual parcela fica com a diferença de centavos, ou qual dia usar no fim do mês | 2 |
| 7 | Não aponta o bug de data de `src/boleto.js` | 2 |

## Nota mínima
8
