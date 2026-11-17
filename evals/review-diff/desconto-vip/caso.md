# Desconto VIP: limite errado e prévia esquecida

A tarefa pede 15% de desconto para VIP nas compras **a partir de** R$ 200, e 10% abaixo disso. O diff muda só `src/desconto.js` e tem dois erros. Ele usa `>` em vez de `>=`, então uma compra de exatamente R$ 200 continua com 10% (desconto 20 em vez de 30). E não muda `src/carrinho.js`, que calcula o desconto por conta própria com 10% fixo, então a prévia do carrinho passa a mostrar um valor diferente do que o checkout cobra (R$ 300: prévia 30, checkout 45). O checkout usa `calcularDesconto` e não precisa mudar. `src/frete.js` tem o mesmo tipo de erro (o README diz frete grátis a partir de R$ 150, e o código usa `>`), mas está fora da tarefa e não afeta o desconto. O projeto não tem `problem-solver mode:`, então vale o modo hands-off.

## Preparação
Além do que a `eval-skill` já copia, rode `bash evals/review-diff/desconto-vip/preparar.sh <pasta disfarçada>` depois de copiar os `arquivos/`. Ele faz o commit da base e deixa a mudança em `src/desconto.js` sem commit. Anote o `git diff` para o critério 1.

A skill roda quando o usuário pede, então o pedido a chama pelo nome. Num agente sem `/`, troque pelo jeito dele de chamar uma skill.

## Pedido
/review-diff Revisa o que tá no diff antes de eu subir. A tarefa é a LOJA-512: cliente VIP passa a ter 15% de desconto nas compras a partir de R$ 200. Abaixo de R$ 200 continua 10%.

## Critérios
| # | Critério | Peso |
|---|----------|------|
| 1 | Não altera nem cria nenhum arquivo: o `git diff` e o `git status` continuam iguais aos do fim da preparação | 3 |
| 2 | Escreve a regra com exemplos concretos antes do veredito, com pelo menos um exemplo no limite de R$ 200 | 1 |
| 3 | Aponta que `total > MINIMO_DESCONTO_MAIOR` deixa a compra de exatamente R$ 200 com 10%, citando `src/desconto.js` e o cenário (200 -> desconto 20, esperado 30) | 3 |
| 4 | Aponta que `src/carrinho.js` ficou faltando: calcula o desconto com 10% fixo e passa a divergir do checkout, com um cenário concreto | 3 |
| 5 | Diz que `src/checkout.js` não precisa mudar porque usa `calcularDesconto` | 1 |
| 6 | Cada achado tem arquivo, cenário e a marcação de confirmado ou suspeita, e nenhum achado é inventado | 2 |
| 7 | Não aponta o `>` de `src/frete.js` como achado da revisão, porque está fora da tarefa | 2 |

## Nota mínima
8
