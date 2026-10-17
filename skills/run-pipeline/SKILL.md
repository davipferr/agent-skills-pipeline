---
name: run-pipeline
description: Orquestra o pipeline de skills deste repositório (ideia → decisões → PRD → arquitetura → implementação → revisão → entrega). Use quando o usuário pedir para rodar, continuar ou retomar o pipeline/fluxo, perguntar "qual é a próxima etapa", ou quiser transformar uma ideia em feature usando o flow.yaml.
---

# Rodar o pipeline

Você é o maestro. Você **não** faz o trabalho de cada etapa: você descobre qual etapa vem agora, prepara a entrada, chama a skill responsável e confere se ela deixou a saída prometida. Quem define a ordem é o arquivo `flow.yaml`, não você.

As etapas só conversam por **arquivos** (os "bastões" em `docs/flow/`). Nunca passe informação de uma etapa para outra só pela conversa: se não está num arquivo de saída, a próxima etapa não sabe.

## Passo a passo

1. **Descubra a etapa atual.** Rode:

   ```bash
   npm run --silent status -- --json
   ```

   O JSON tem `next` (a próxima etapa, ou `null` se tudo estiver pronto) e `steps` (cada etapa com `state`: `done`, `stale`, `ready` ou `blocked`). Não deduza o estado lendo arquivos por conta própria: o script é a fonte da verdade.

2. **Se `next` for `null`**, o pipeline terminou. Mostre o resumo de `docs/flow/07-entrega.md` e sugira `npm run archive` para guardar esta execução e começar outra. Pare.

3. **Se alguma etapa estiver `stale`** (a entrada mudou depois que a saída foi escrita), avise o usuário e pergunte se quer refazê-la antes de seguir. O `next` já aponta para a primeira etapa `stale` ou `ready`.

4. **Leia a definição da etapa** no `flow.yaml`: `skill`, `inputs`, `outputs`, `interactive` e, se houver, `adapter`.

5. **Leia todos os arquivos de `inputs`.**

6. **Chame a skill da etapa.**
   - Se você tem uma ferramenta de skills (ex.: Skill tool no Claude Code), chame-a pelo nome em `skill`.
   - Se não tem, leia o `SKILL.md` em `.claude/skills/<skill>/` ou `.agents/skills/<skill>/` e siga-o.
   - Se a etapa tem `adapter`, siga essas instruções **junto** com a skill. O adapter existe porque skills externas (do skills.sh) não conhecem os arquivos deste projeto: ele diz de onde ler e onde gravar.
   - Se `interactive: true`, a etapa precisa de respostas do usuário. Faça as perguntas e espere; não invente as respostas.

7. **Confira a saída.** Todo arquivo em `outputs` deve existir e começar com o cabeçalho descrito em [references/contrato-dos-artefatos.md](references/contrato-dos-artefatos.md). Rode o `status` de novo: a etapa precisa aparecer como `done`.

8. **Pare e reporte.** Diga em 2–3 linhas o que a etapa produziu, qual arquivo ler e qual é a próxima etapa. Pergunte se pode seguir. Só rode várias etapas seguidas se o usuário pedir explicitamente ("rode tudo", "continue até o fim"), e mesmo assim pare nas etapas `interactive`.

## Regras

- Uma etapa por vez, na ordem do `flow.yaml`.
- Não edite saídas de etapas anteriores para "consertar" a etapa atual. Se uma entrada estiver ruim, diga qual etapa precisa ser refeita.
- Se o `status` acusar erro no `flow.yaml`, rode `npm run validate` e mostre o erro ao usuário em vez de tentar adivinhar o fluxo.
- Se uma skill da etapa não estiver instalada, peça para o usuário rodar `npm run setup`.
