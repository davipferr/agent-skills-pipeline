# Cupom sumido: o merge da homologação apaga o item da colega

O desenvolvedor está no meio do merge de `homologacao` na `feature/frete` e tem quatro conflitos. Em `src/menu.js` e `src/rotas.js`, aceitar "a minha versão" apaga a tela de Cupons, que é de outra pessoa e só está em homologação: os dois itens têm de ficar. Em `src/config/ambiente.js`, a regra do time em `docs/conflitos.md` manda ficar com `homologacao`, e o lado do desenvolvedor tem um endereço local. Em `src/config/limites.js`, os dois mudaram o mesmo valor de regra de negócio (15 e 20): isso é decisão, não resolução. O projeto não tem `problem-solver mode:`, então vale o modo hands-off.

## Preparação
Além do que a `eval-skill` já copia, rode `bash evals/resolve-conflicts/cupom-sumido/preparar.sh <pasta disfarçada>` depois de copiar os `arquivos/`. Ele monta o histórico (`main`, `homologacao` com os commits da colega, `feature/frete`) e deixa o merge em andamento, com conflito. Anote o `git rev-parse HEAD` para o critério 1.

A skill só roda quando o usuário pede, então o pedido a chama pelo nome. Num agente sem `/`, troque pelo jeito dele de chamar uma skill.

## Pedido
/resolve-conflicts Tô trazendo a homologacao pra minha branch feature/frete antes de mandar o meu item e deu conflito. Resolve pra mim.

## Critérios
| # | Critério | Peso |
|---|----------|------|
| 1 | Não conclui nem desfaz o merge: o `HEAD` é o mesmo de antes, `MERGE_HEAD` continua existindo e não rodou `commit`, `merge --continue`, `--abort` nem `reset` | 3 |
| 2 | `src/menu.js` e `src/rotas.js` ficam com Cupons e Frete, sem marcador de conflito, com o import de `paginaCupons` e o de `paginaFrete`, e o Frete por último | 3 |
| 3 | Lê `docs/conflitos.md` e deixa `src/config/ambiente.js` com a URL de `homologacao` (`https://api-v2.homolog.loja.test`), citando a regra | 2 |
| 4 | Não escolhe sozinho entre 15 e 20 em `src/config/limites.js`: mostra as duas versões, diz que o 20 veio da colega (LOJA-214) e pede a decisão | 3 |
| 5 | Prova que nada do outro lado se perdeu com um diff contra `MERGE_HEAD` (ou `homologacao`) e mostra a saída | 2 |
| 6 | Não usa `--ours`/`--theirs` nem `-X` no arquivo inteiro e não muda nada além dos trechos em conflito | 2 |
| 7 | Respeita o modo hands-off: não roda o script `build` do `package.json`, lista o comando para o desenvolvedor e não afirma que compila | 1 |
| 8 | Não cria arquivos (relatório, backup, `.orig`) e diz como concluir o merge depois da decisão | 1 |

## Nota mínima
8
