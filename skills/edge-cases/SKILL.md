---
name: edge-cases
description: Encontra os casos extremos que o código que a tarefa toca precisa tratar - vazio, nulo, zero, limite, dado antigo, duplicidade e falha no meio do processo - e separa os que podem acontecer de verdade dos que são só teóricos. Use em mudanças de lógica, regra de negócio, validação ou cálculo, quando o usuário pedir para pensar nos casos de borda, ou quando o run-pipeline pedir.
---

# Casos extremos

O caminho principal quase sempre funciona. O bug que volta costuma estar no registro antigo, no valor zero, na lista vazia ou na segunda vez que a mesma ação roda. Pior que uma exceção é um **resultado errado em silêncio**.

## Escopo

- Confira só as entradas e os estados do código que a tarefa toca, a não ser que a própria tarefa seja sobre isso.
- Consulte o projeto sempre que precisar de contexto, mas o que está errado fora da tarefa fica como está: não corrija, não avise e não copie o exemplo ruim. Só fale de um problema fora da tarefa se ele afetar a tarefa.
- Não invente achados: só entra o caso que pode acontecer neste código.

## Passos

1. **Liste as entradas e os estados** do que muda: parâmetros, campos lidos do banco, respostas de outros sistemas, situação do registro. Leia também onde esses dados são definidos: o significado de um nulo ou de um valor especial costuma estar lá, não no código que os usa.

2. **Passe por cada grupo que se aplica:**
   - **Ausência:** nulo, vazio, campo que não veio, lista sem itens.
   - **Números:** zero, negativo, limite exato (o valor do limite e o logo abaixo), arredondamento, divisão por zero.
   - **Texto:** espaços, acentos, tamanho máximo, maiúsculas e minúsculas.
   - **Datas:** fuso, fim de mês, virada de ano, início igual ao fim.
   - **Listas:** um item, muitos itens, duplicados, ordem diferente.
   - **Dado antigo:** registro criado antes desta regra, com campo nulo ou formato anterior.
   - **Repetição:** clique duplo, reprocessamento, a mesma mensagem chegando duas vezes.
   - **Concorrência:** duas pessoas ou dois processos alterando o mesmo registro.
   - **Falha:** timeout, serviço fora do ar, erro no meio de um processo com vários passos. O que já foi gravado fica como?

3. **Filtre.** Leia quem chama o código que a tarefa toca antes de reportar. Confira se uma camada acima já garante o caso: uma validação existente, uma constraint do banco, um campo obrigatório. Não adicione validação repetida nem trate o que não pode acontecer. Sem ter lido quem chama, não afirme que nada protege o caso.

4. **Decida cada caso que sobrou:**
   - O código já trata: segue.
   - É um erro claro: trate seguindo o padrão do projeto.
   - O comportamento certo é regra de negócio: leve a pergunta ao desenvolvedor com as opções. Não decida sozinho.

5. **Reporte na conversa**, em uma lista curta: `<caso> -> <o que acontece hoje> -> <o que fazer>`. Cada caso relevante vira um caso de teste na entrega.
