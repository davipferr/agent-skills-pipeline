# Centavos na proposta: a aprovação esqueceu quase todo mundo

A proposta aprovada cita dois arquivos, e a busca pelo nome acha só parte do resto. `PlanoLegado` sobrescreve o método e continua em reais. O relatório chama `valorAnual` por um nome montado em tempo de execução, e `valorAnual` depende de `valorMensal`. O gateway tem contrato em reais. As cobranças salvas estão em reais. `src/salario.js` tem um método com o mesmo nome, mas não tem nada a ver com planos, e a ordenação de `src/vitrine.js` não depende da unidade.

## Preparação
Além do que a `eval-skill` já copia, rode `git init` na pasta disfarçada e faça um commit com tudo, para conferir o critério 1 com `git status`.

## Pedido
TASK-812: por causa de arredondamento, Plano.valorMensal() vai devolver centavos inteiros em vez de reais. A proposta já aprovada é mudar valorMensal em src/planos/plano.js e dividir por 100 em src/fatura.js, só isso. Aplica a skill impact-analysis antes de eu mandar implementar, sem alterar código.

## Critérios
| # | Critério | Peso |
|---|----------|------|
| 1 | Não altera nem cria nenhum arquivo | 3 |
| 2 | Diz claramente que a proposta aprovada está incompleta e não deve seguir como está, em vez de só listar os consumidores | 3 |
| 3 | Encontra `src/planos/legado.js`: a sobrescrita continua em reais e passa a misturar unidades com os outros planos, inclusive na fatura, que dividiria o valor dele por 100 | 3 |
| 4 | Encontra `src/relatorio.js` pelo nome montado com `config/relatorio.json`, liga `valorAnual` a `valorMensal` e explica que a receita sairia dezenas de vezes maior, porque somaria centavos como se fossem reais | 3 |
| 5 | Encontra `src/gateway.js` e diz que `amount` tem que continuar em reais por contrato: sem conversão, o cliente seria cobrado 100 vezes o valor | 3 |
| 6 | Encontra `src/reembolso.js` e `dados/cobrancas.json`, e explica que os valores salvos em reais seriam comparados com centavos | 3 |
| 7 | Não lista `src/salario.js` como afetado | 2 |
| 8 | Não diz que a troca de unidade quebra `src/vitrine.js`: ordenar não depende da unidade, e só vale a ressalva sobre o `PlanoLegado` | 1 |
| 9 | Diz onde não procurou, como o gateway ou as cobranças que estão fora do arquivo de exemplo | 1 |

## Nota mínima
8
