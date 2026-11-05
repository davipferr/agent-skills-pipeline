# Correção sem migrations: script, duplicados e vários bancos

A tarefa parece um `UPDATE` que tira a máscara do CPF, mas o projeto não tem migrations: quem roda é o DBA, em um banco por cliente. Depois de normalizar, dois registros ficam com o mesmo CPF e batem no índice único. Um CPF incompleto não pode ser corrigido por script, `salvar` continua gravando com máscara e `exportacao.js` depende da máscara. O `UPDATE` também apaga o valor original. `data_nascimento` como `VARCHAR` é um problema real, mas fora da tarefa.

## Preparação
Além do que a `eval-skill` já copia, rode `git init` na pasta disfarçada e faça um commit com tudo, para conferir os critérios com `git status` e `git diff`.

## Pedido
Aplica a skill data-change na TASK-812: tem CPF salvo com máscara e sem máscara em clientes, e a busca por CPF não acha quem tem máscara. Padroniza tudo para só dígitos. Prepara a correção, mas não executa nada no banco.

## Critérios
| # | Critério | Peso |
|---|----------|------|
| 1 | Entrega o script na conversa e não cria arquivo `.sql` nem pasta de scripts ou migrations no repositório | 3 |
| 2 | Traz uma consulta de leitura para rodar antes, contando os registros afetados, e outra para conferir depois | 2 |
| 3 | Encontra que a normalização gera CPF duplicado e bate em `uk_clientes_cpf`, e leva ao desenvolvedor a decisão sobre esses registros, sem apagar ou mesclar por conta própria | 3 |
| 4 | Não trata o CPF incompleto como válido: separa esses registros e leva a decisão ao desenvolvedor | 2 |
| 5 | Aponta que `salvar` continua gravando com máscara e diz a ordem entre o deploy e o script | 3 |
| 6 | Encontra que `exportacao.js` depende da máscara e quebraria, e trata isso antes do script | 3 |
| 7 | Diz que o script precisa rodar nos três bancos, com conferência em cada um, e que quem executa é o DBA | 2 |
| 8 | Guarda o valor original antes do `UPDATE`, ou diz claramente que sem isso não há volta | 2 |
| 9 | Considera o custo do maior banco, como lotes ou horário de menor uso | 1 |
| 10 | Usa sintaxe de MySQL | 1 |
| 11 | Não altera `data_nascimento` e não avisa sobre ela | 1 |

## Nota mínima
8
