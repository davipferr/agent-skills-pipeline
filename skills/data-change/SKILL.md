---
name: data-change
description: Prepara mudanças que afetam dados reais - migration, script, índice ou mudança no formato de dado salvo - conferindo os dados que já existem, a compatibilidade com a versão anterior, a ordem do deploy e como desfazer. Use quando a tarefa alterar o banco ou o formato de dado salvo, quando o usuário pedir um script de correção de dados, ou quando o run-pipeline pedir.
---

# Mudança de dados

Um erro no código se corrige com outro deploy. Um erro nos dados pode não ter volta. Esta skill complementa a seção 3 do `problem-solver`, que cobre como escrever um script seguro (SELECT antes, `WHERE` estreito): aqui o foco é o que acontece com os dados e com o deploy.

## Escopo

- Mude só os dados e as estruturas que a tarefa exige, a não ser que a própria tarefa seja sobre o banco.
- Se encontrar outro problema de modelagem ou de dados, avise em uma linha na entrega e não corrija.
- Não invente achados: uma mudança que não toca dado salvo não precisa desta skill.

## Passos

1. **Olhe os dados que já existem.** Quantos registros são afetados? Há nulos, duplicados ou formato antigo? A regra nova invalida algo que já está salvo? Prepare uma consulta somente de leitura e use o resultado real, ou peça ao desenvolvedor para rodá-la.

2. **Confira a compatibilidade durante o deploy.** Por um tempo, o código antigo pode rodar com o banco novo, ou o contrário. Renomear ou remover coluna quebra quem ainda usa o nome antigo. Quando houver esse risco, divida em passos: adicionar o novo, migrar os dados, trocar o código e só depois remover o antigo.

3. **Defina a ordem e o alcance.** O script roda antes ou depois do deploy? Quem executa? Em quais ambientes e clientes? Se forem vários, cada um precisa ser conferido.

4. **Estime o custo em produção.** Tabela grande, trava de escrita ao alterar coluna ou criar índice, atualização que precisa rodar em lotes, horário de menor uso.

5. **Planeje como desfazer.** Diga como reverter cada passo e se algum dado se perde. Se a mudança não tiver volta, destaque isso e deixe a decisão com o desenvolvedor.

6. **Entregue na conversa:**

   ```markdown
   - Afeta: <tabela/campo>, <quantos registros> (medido | estimado)
   - Ordem: <o que roda antes e depois do deploy>
   - Script: <o script, com a consulta de conferência antes e depois>
   - Como desfazer: <passos, ou "sem volta" e por quê>
   - Riscos: <trava, tempo, ambientes>
   ```

## Regras

- **Nunca execute escrita em banco de produção.** Você prepara; quem decide e roda é o desenvolvedor.
- Se o projeto usa migrations, siga a ferramenta e o padrão dele: esse arquivo é código da tarefa. Fora disso, o script fica na conversa, sem criar arquivo no repositório.
