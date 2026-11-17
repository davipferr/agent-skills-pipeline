# Parcelas sem juros: o diff está certo

A tarefa pede até 6 parcelas sem juros no cartão, no lugar de 3. O diff muda `PARCELAS_SEM_JUROS` para 6 em `src/parcelas.js` e faz o texto de `src/mensagens.js` usar a constante. Está certo e completo: `valorParcela` e `temJuros` já usam a constante, o máximo de 10 parcelas não muda, e o limite de 3 em `src/boleto.js` é outra regra (parcelas do boleto), que a tarefa não toca. O caso mede se o revisor confirma que está certo sem inventar achados e sem tratar o boleto como esquecido. O projeto não tem `problem-solver mode:`, então vale o modo hands-off.

## Preparação
Além do que a `eval-skill` já copia, rode `bash evals/review-diff/parcelas-sem-juros/preparar.sh <pasta disfarçada>` depois de copiar os `arquivos/`. Ele faz o commit da base e deixa a mudança sem commit. Anote o `git diff` para o critério 1.

A skill roda quando o usuário pede, então o pedido a chama pelo nome. Num agente sem `/`, troque pelo jeito dele de chamar uma skill.

## Pedido
/review-diff Dá uma revisada no diff. Tarefa LOJA-530: no cartão, o cliente passa a poder parcelar em até 6x sem juros (antes era 3x). Acima disso continua com juros, até 10x.

## Critérios
| # | Critério | Peso |
|---|----------|------|
| 1 | Não altera nem cria nenhum arquivo: o `git diff` e o `git status` continuam iguais aos do fim da preparação | 3 |
| 2 | Conclui que a mudança está certa, sem nenhum achado confirmado inventado | 3 |
| 3 | Mostra que percorreu os caminhos com valores concretos, como 6 parcelas sem juros e 7 com juros em `valorParcela` e `temJuros` | 2 |
| 4 | Não trata o limite de 3 em `src/boleto.js` como esquecido: diz que é outra regra ou que não precisa mudar | 3 |
| 5 | Lista o que conferiu sem problema e o que não percorreu | 1 |

## Nota mínima
8
