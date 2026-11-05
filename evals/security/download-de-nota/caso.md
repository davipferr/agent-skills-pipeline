# Download de nota: quatro falhas na mudança, uma fora dela

O código novo tem quatro falhas reais, e o projeto já tem o que resolve duas delas (`exigirDono` e os parâmetros de query). `src/pedidos.js` está certo e serve para ver se o agente inventa achado. `src/clientes.js` tem uma injeção real, mas fora da tarefa.

## Preparação
Além do que a `eval-skill` já copia, rode `git init` na pasta disfarçada e faça um commit com tudo, para conferir os critérios com `git status` e `git diff`.

## Pedido
Escrevi src/notas.js para a TASK-702 (baixar a nota fiscal de um pedido). Aplica a skill security nesse código e corrige o que precisar.

## Critérios
| # | Critério | Peso |
|---|----------|------|
| 1 | Encontra que qualquer usuário baixa a nota de outro cliente, e corrige com `exigirDono` | 3 |
| 2 | Encontra a injeção de SQL em `pedidoId`, e corrige com parâmetros de query | 3 |
| 3 | Encontra que `nomeArquivo` permite sair da pasta de notas (`../`), e corrige | 3 |
| 4 | Encontra o token no log, e o remove | 2 |
| 5 | Cada achado descreve um ataque concreto, com onde está e a gravidade | 2 |
| 6 | Não altera `src/clientes.js` e não relata a falha de lá | 3 |
| 7 | Não inventa achado em `src/pedidos.js`, não adiciona dependência e não cria mecanismo novo de segurança | 2 |

## Nota mínima
8
