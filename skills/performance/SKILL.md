---
name: performance
description: Confere o custo real do código que a tarefa toca - o tempo de cada operação vezes quantas vezes ela roda - e resolve com a mudança mais simples, sem overengineering. Use quando a tarefa mexer em query, loop, chamada a serviço externo ou grande volume de dados, quando o usuário relatar lentidão ou timeout, ou quando o run-pipeline pedir.
---

# Performance

Uma query de 50 ms parece barata. Executada 20 mil vezes, ela custa mais de 16 minutos. O problema quase nunca está numa operação isolada, e sim em quantas vezes ela roda. A solução costuma ser lógica simples, não um algoritmo novo.

## Escopo

- Olhe só o código que a tarefa toca, a não ser que a própria tarefa seja sobre performance.
- Se o mesmo problema existir em outros lugares ou fizer parte do padrão do projeto, avise em uma linha na entrega e não corrija. Um padrão ruim do projeto não é motivo para reestruturar outras queries ou endpoints.
- Não invente achados: se não há custo relevante, não diga nada.

## Passos

1. **Faça a conta antes de opinar.** Para cada operação cara (query, chamada externa, leitura de arquivo): tempo × execuções = custo total. Use o volume real de produção. Sem medição, estime e diga que é estimativa, ou peça ao desenvolvedor o dado que falta: qual log, query ou medição.

2. **Procure onde o custo se multiplica:**
   - query ou chamada externa dentro de um loop;
   - a mesma consulta repetida com os mesmos parâmetros;
   - mais linhas ou colunas carregadas do que o código usa;
   - filtro, ordenação ou soma em memória que o banco faria melhor;
   - filtro em coluna sem índice (confira o plano de execução);
   - busca repetida numa lista grande, ou loop dentro de loop sobre listas grandes;
   - chamadas independentes feitas uma depois da outra.

3. **Escolha a mudança mais simples que resolve**, nesta ordem:
   1. não fazer o trabalho;
   2. buscar tudo de uma vez (`IN`, `JOIN`, chamada em lote);
   3. reaproveitar o que já foi carregado;
   4. ajustar a query ou o índice (índice é mudança de banco: veja a skill `data-change`);
   5. trocar a estrutura de dados, como uma lista por um mapa.

   Cache, fila e paralelismo vêm por último e precisam de justificativa: trazem invalidação, concorrência e novos pontos de falha.

4. **Use Big O como raciocínio, não como meta.** O que importa é o tamanho real da entrada e como ele cresce. Um loop duplo sobre 20 itens não é problema; o mesmo loop sobre 100 mil itens é. Não complique o código por um ganho que ninguém vai perceber.

5. **Reporte na conversa:**

   ```markdown
   - Antes: <operação>: <tempo> × <execuções> = <total> (medido | estimado)
   - Depois: <operação>: <tempo> × <execuções> = <total> (medido | estimado)
   - Mudança: <o que muda e onde>
   ```

## Regras

- Não diga que ficou mais rápido sem medir. Sem medição, é estimativa, e o desenvolvedor recebe o que rodar para confirmar.
- A otimização não pode mudar o resultado: mesma ordem, mesmos registros, mesmos valores.
