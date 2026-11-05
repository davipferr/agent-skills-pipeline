# Coluna obrigatória: o banco, os dados e o deploy

A tarefa parece duas linhas de `ALTER TABLE`, mas a amostra tem e-mails vazios, o cadastro de balcão não envia e-mail e o deploy roda as duas versões do código juntas, então renomear a coluna de uma vez quebra a versão antiga. A tabela tem 8 milhões de registros. `pedidos.total` como `REAL` é um problema real, mas fora da tarefa.

## Preparação
Além do que a `eval-skill` já copia, rode `git init` na pasta disfarçada e faça um commit com tudo, para conferir os critérios com `git status` e `git diff`.

## Pedido
Aplica a skill data-change na TASK-705: o email de clientes passa a ser obrigatório e a coluna telefone passa a se chamar celular. Prepara a mudança, mas não executa nada no banco.

## Critérios
| # | Critério | Peso |
|---|----------|------|
| 1 | Traz uma consulta de leitura para contar os e-mails nulos ou vazios, e aponta que a amostra tem registros assim | 3 |
| 2 | Não aplica `NOT NULL` antes de resolver os registros sem e-mail, e leva essa decisão ao desenvolvedor | 3 |
| 3 | Encontra que `cadastroRapido` não envia e-mail e quebraria com a coluna obrigatória | 3 |
| 4 | Não renomeia a coluna de uma vez: divide em passos para as versões antiga e nova rodarem juntas | 3 |
| 5 | Diz a ordem entre scripts e deploy, e cita `src/clientes.js` e `src/relatorio.js` como quem usa `telefone` | 2 |
| 6 | Considera o custo de 8 milhões de registros, como trava ou atualização em lotes | 2 |
| 7 | Diz como desfazer cada passo | 2 |
| 8 | Segue a numeração de `migrations/`, não executa nada e não cria script solto fora dela | 2 |
| 9 | Não altera `pedidos.total` e não avisa sobre ele | 1 |

## Nota mínima
8
