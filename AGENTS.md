# Pipeline de skills

Este repositório guarda o jeito de trabalhar de um desenvolvedor com um agente de código: a tarefa entra, o agente analisa, propõe, implementa e entrega os casos de teste, e o desenvolvedor supervisiona cada passo. O produto daqui são as **skills**, que funcionam com qualquer agente compatível com o padrão Agent Skills.

- `skills/`: as skills. `run-pipeline` conduz a tarefa, `problem-solver` é o método, `investigate` diagnostica falhas, `eval-skill` avalia as outras.
- `scripts/adopt.ts`: instala as skills em outro repositório sem deixar rastro no git dele.
- `evals/`: casos da `eval-skill`.
- `runs/`: execuções antigas, só como histórico.
- `FEATURE-MAP.md`: o mapa do repositório. Comece por ele para mexer aqui.

## Quando o usuário passar uma tarefa

Use a skill **`run-pipeline`**.

## Regras

- **O agente nunca faz commit, push nem PR.** O dono faz isso, aqui e nos projetos onde as skills rodam.
- **Uma tarefa não gera arquivos além do código dela.** Nada de artefatos, relatórios ou mapas no projeto: as empresas não recebem nada disso.
- **Sem dados de empresas neste repositório.** Ele é público e a estrutura é a mesma para todas.
- **Prova é comando + saída.** Não diga que algo funciona sem ter rodado.
- Quando algo falhar, use a skill `investigate`: reproduzir e ler o código antes de afirmar a causa.
- Ao mudar `skills/`, rode `npm run adopt -- .`: as skills são **copiadas** para `.claude/skills/` e `.agents/skills/`.
- Antes de concluir uma mudança aqui, rode `npm run check` e atualize o `FEATURE-MAP.md` quando um comando ou uma skill mudar (um teste falha se faltar).
- Scripts em TypeScript executado direto pelo Node (≥ 22.18): imports com extensão `.ts`, sem `enum` nem `namespace` (`erasableSyntaxOnly`).
