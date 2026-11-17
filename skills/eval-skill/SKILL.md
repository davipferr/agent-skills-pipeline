---
name: eval-skill
description: Testa uma skill como se fosse código. Roda os casos de evals/<skill>/ num agente sem contexto, dá nota pelos critérios de cada caso e, se a nota ficar abaixo do mínimo, propõe e testa melhorias no SKILL.md até passar. Funciona com qualquer agente. Use quando o usuário pedir para avaliar, testar ou melhorar uma skill, depois de mudar um SKILL.md para saber se ele ficou melhor ou pior, ou quando ele contar que corrigiu o agente numa tarefa real e quiser que o erro não se repita.
---

# Avaliar uma skill

Uma skill é código: muda, e pode piorar sem ninguém perceber. Esta skill faz o papel de teste unitário. Um agente sem contexto executa a skill num caso conhecido, e um juiz dá nota pelos critérios do caso.

O formato dos casos está em `evals/README.md`.

## Passos

1. **Escolha a skill e os casos.** Liste `evals/<skill>/`. Se não houver caso, ajude o usuário a escrever um (veja o README) antes de seguir: sem caso, não há o que medir.

2. **Prepare uma pasta disfarçada para cada caso.** Crie uma pasta temporária **fora deste repositório**, com nome neutro (ex.: `projeto-7f3a`, nunca "eval" ou "teste"). Agentes mudam de comportamento quando sabem que estão sendo avaliados. Copie para ela:
   - o conteúdo de `evals/<skill>/<caso>/arquivos/`;
   - a skill avaliada, de `skills/<skill>/`, para `.agents/skills/<skill>/` e `.claude/skills/<skill>/` dentro da pasta.

   **Não copie o `caso.md`**: o executor não pode ver os critérios.

3. **Execute com um agente sem contexto.** Quem executa não pode ser você: você já leu os critérios. Use, nesta ordem de preferência:
   - o modo não interativo de um agente pela linha de comando, rodado na pasta (ex.: `claude -p "<pedido>"`, `codex exec "<pedido>"`, `gemini -p "<pedido>"`), se o usuário tiver algum instalado;
   - o usuário: peça que abra uma sessão nova do agente que preferir na pasta e cole o pedido;
   - só em último caso, um subagente da sua ferramenta, trabalhando na pasta disfarçada, com só o "Pedido" do caso como prompt. Ele pode herdar as instruções e o `git status` deste repositório, que citam os casos e as regras: se usar, diga no resumo que as notas não são de um agente limpo.

   **O executor não usa as instruções globais do usuário** (`~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md` e as equivalentes de outros agentes), nem as deste repositório. Elas falam de outros projetos e regras, e mudam o resultado. O executor só pode ter o pedido, a skill avaliada e os arquivos da pasta disfarçada:
   - na linha de comando, use a opção do agente que deixa de carregar as instruções do usuário. Se ele não tiver uma, aponte a pasta de configuração dele para uma pasta temporária vazia, só com o login (ex.: `CLAUDE_CONFIG_DIR`, `CODEX_HOME`);
   - numa sessão aberta pelo usuário ou num subagente, comece o pedido dizendo que todo `CLAUDE.md`, `AGENTS.md` e memória de fora da pasta deve ser ignorado.

   Anote qual agente e qual modelo executaram e como as instruções globais foram deixadas de fora. Se não deu para tirá-las, diga isso no resumo: as notas valem menos.

4. **Julgue.** Antes, confira na transcrição se o executor chamou a skill avaliada ou leu o `SKILL.md` dela. Se não, o caso é inválido: não dê nota e diga isso no resumo. Se nenhum caso carregou a skill, a mudança a propor no passo 5 é na `description`, porque ninguém leu o corpo. Sem transcrição, peça uma ao usuário. Para cada critério do caso, dê uma nota de 0 a 10 e justifique citando um trecho do que o executor produziu. Sem trecho, nota 0. A nota do caso é a média ponderada pelos pesos. Se der, julgue com um agente ou modelo **diferente** do executor e diga qual foi.

5. **Suba a nota, se precisar** (no máximo 3 rodadas):
   - Para cada critério abaixo do mínimo, proponha a **menor** mudança no `SKILL.md` que o resolveria. A mudança tem que ser geral: nunca cite o caso nem os dados dele, senão você ensina a skill a passar no teste, e não a fazer o trabalho.
   - Mostre a mudança e espere a aprovação do usuário (ela mexe em `skills/`).
   - Aplique, rode `npm run adopt -- .` e volte ao passo 2 com **todos** os casos da skill, não só o que falhou: melhorar um caso pode piorar outro.

6. **Resuma na conversa**, sem gravar arquivo de resultado: para cada caso, o executor e o juiz (agente e modelo), a nota por critério com o trecho que a justifica, a nota final e o mínimo; depois, as notas antes e depois de cada rodada, o que mudou no `SKILL.md` e o que continua abaixo do mínimo. O histórico fica no git: os casos em `evals/` e as mudanças em `skills/`.

## Quando o agente errou numa tarefa real

Toda correção que o desenvolvedor faz mais de uma vez deveria virar regra. O caminho é um caso que reproduz o erro, e só depois uma mudança na skill.

1. **Entenda o erro.** Peça ao usuário o que o agente fez, o que ele corrigiu e por quê. Descubra qual skill deveria ter evitado o erro, e se ela foi carregada: se não foi, o problema está na `description`, e não no corpo.
2. **Escreva um caso que reproduza o mesmo tipo de erro**, com o formato do `evals/README.md`. Os `arquivos/` são inventados: **nada do código, dos nomes, dos dados ou das regras da empresa**, porque este repositório é público. Copie o padrão do erro, e não a situação. Um critério cobra o comportamento certo, e outro cobra que a skill não exagere na correção. Mostre o caso e espere a aprovação antes de gravar.
3. **Rode o caso na skill atual, antes de mudar qualquer coisa.** Ele precisa falhar. Se passar, o caso não reproduz o erro: ajuste o caso, não a skill.
4. **Suba a nota pelo passo 5**, com todos os casos da skill. A mudança no `SKILL.md` é geral: ela ensina o que o desenvolvedor corrigiu, sem citar o caso.

## Regras

- Apague as pastas temporárias no fim.
- Um caso que sempre tira 10 não mede mais nada: sugira um caso mais difícil.
- Nota dada pelo próprio executor vale menos. Diga isso no resumo quando acontecer.
- Não grave nada em `evals/` além de casos novos que o usuário aprovar.
