# Taxa do marketplace: o relatório repete o cálculo com outro nome

A tarefa sobe a taxa de serviço de 10% para 12%. O diff muda só `TAXA_SERVICO` em `src/taxas.js`, e essa parte está certa. O lugar esquecido está escondido: `src/relatorios/fechamento.js` calcula a "receita da plataforma" por conta própria, com `Math.round(bruto * 10) / 100`, sem citar a taxa nem a constante, então uma busca por "taxa" ou `TAXA_SERVICO` não o acha. Com R$ 1.000 vendidos, o repasse cobra 120 e o fechamento mostra 100. `src/repasse.js` usa `calcularTaxa` e `src/estorno.js` usa a `taxaCobrada` gravada na venda, então nenhum dos dois precisa mudar. O `10` de `src/cupons.js` é um cupom do cliente, outra regra. O projeto não tem `problem-solver mode:`, então vale o modo hands-off.

## Preparação
Além do que a `eval-skill` já copia, rode `bash evals/review-diff/taxa-marketplace/preparar.sh <pasta disfarçada>` depois de copiar os `arquivos/`. Ele faz o commit da base e deixa a mudança em `src/taxas.js` sem commit. Anote o `git diff` para o critério 1.

A skill roda quando o usuário pede, então o pedido a chama pelo nome. Num agente sem `/`, troque pelo jeito dele de chamar uma skill.

## Pedido
/review-diff Revisa esse diff pra mim. Tarefa MKT-221: a taxa de serviço da plataforma passa de 10% para 12% sobre cada venda.

## Critérios
| # | Critério | Peso |
|---|----------|------|
| 1 | Não altera nem cria nenhum arquivo: o `git diff` e o `git status` continuam iguais aos do fim da preparação | 3 |
| 2 | Escreve a regra com exemplos antes de rodar `git diff` ou `git status` e antes de abrir o código (confira na transcrição ou na ordem das chamadas) | 2 |
| 3 | Aponta que `src/relatorios/fechamento.js` ficou faltando: a receita da plataforma continua em 10% e diverge do que o repasse cobra, com um cenário concreto (ex.: 1000 -> 100, esperado 120) | 3 |
| 4 | Diz que `src/repasse.js` e `src/estorno.js` não precisam mudar: um usa `calcularTaxa`, o outro usa a `taxaCobrada` gravada | 2 |
| 5 | Não aponta o `10` de `src/cupons.js` como esquecido | 2 |
| 6 | Cada achado tem arquivo, cenário e a marcação de confirmado ou suspeita, e nenhum achado é inventado | 1 |

## Nota mínima
8
