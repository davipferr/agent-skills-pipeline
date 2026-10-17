---
name: ship-report
description: Fecha uma execução do pipeline escrevendo docs/flow/07-entrega.md, um resumo para quem não acompanhou, com o que foi entregue, como rodar, decisões e pendências. Use quando o usuário pedir o resumo final ou o relatório de entrega, ou quando o run-pipeline estiver na etapa "ship".
---

# Relatório de entrega

**Entradas:** `docs/flow/03-prd.md`, `docs/flow/06-revisao.md`
**Saída:** `docs/flow/07-entrega.md`

Este é o único artefato que alguém de fora vai ler. Escreva para uma pessoa que não viu nenhuma das etapas anteriores e tem dois minutos.

## Passos

1. Leia a revisão. Se o veredito for **reprovado**, pare: diga ao usuário que a entrega só sai depois que a revisão aprovar, e qual etapa refazer.
2. Leia o PRD para o objetivo e os critérios de aceite.
3. Escreva `docs/flow/07-entrega.md` a partir de [template.md](template.md):
   - **Em uma frase**: o que a pessoa ganha.
   - **Como rodar**: comandos copiáveis, testados por você agora.
   - **Decisões que importam**: no máximo 5, com um link para o artefato onde foram tomadas.
   - **Pendências**: tudo o que ficou "Em aberto" em qualquer artefato e ainda vale.
   - **Trilha**: a lista dos artefatos de `docs/flow/`, um por linha, para quem quiser se aprofundar.
4. Cabeçalho:

   ```yaml
   step: ship
   skill: ship-report
   inputs: [docs/flow/03-prd.md, docs/flow/06-revisao.md]
   ```

5. Termine sugerindo `npm run archive` para guardar a execução em `docs/runs/` e liberar `docs/flow/` para a próxima ideia.
