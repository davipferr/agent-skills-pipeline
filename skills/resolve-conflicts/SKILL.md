---
name: resolve-conflicts
description: Resolve conflitos de merge, rebase ou cherry-pick sem apagar o trabalho dos colegas, seguindo as regras de conflito do time, e confere antes do PR se a branch não sobrescreve nem leva código de outra pessoa para o destino. Rode só quando o usuário pedir pelo nome ou pedir para resolver conflitos ou conferir um merge. Não faz parte do run-pipeline.
disable-model-invocation: true
---

# Resolver conflitos sem sobrescrever ninguém

O risco de um conflito não é o marcador `<<<<<<<` que sobra: esse o build acusa. O risco é o código de um colega que **some em silêncio**. Alguém aceita "a minha versão" no arquivo inteiro, o merge passa, o build passa, e o item que estava só em homologação desaparece. Ninguém percebe até o colega procurar.

Esta skill troca "escolher um lado" por uma regra: **as duas mudanças sobrevivem, a não ser que alguém decida o contrário.** E prova isso comparando o resultado com cada lado.

Ela roda só quando o usuário pede. O agente continua sem fazer commit, push nem PR: ele deixa o merge resolvido na árvore de trabalho, e quem conclui é o desenvolvedor.

## Antes de começar

1. **Leia as regras do time.** Muitos times têm um documento de procedência para conflitos ("em arquivo de ambiente, vale a versão do destino", "migrations nunca se mesclam, se renumeram"). Procure no projeto (`CONTRIBUTING.md`, `docs/`, wiki citada no README) e pergunte ao usuário se existe outro. **As regras do time valem mais que as desta skill.** Não copie esse documento para lugar nenhum.
2. **Entenda o estado.** Rode `git status`. Ele diz se há merge, rebase ou cherry-pick em andamento e quais arquivos estão em conflito. Anote também:
   - as duas pontas: `HEAD` (o seu lado) e `MERGE_HEAD`, `REBASE_HEAD` ou `CHERRY_PICK_HEAD` (o lado que entra). No rebase, os lados se invertem: `HEAD` é a branch de destino e o commit sendo aplicado é o seu;
   - a base comum: `git merge-base HEAD <outra ponta>`.
3. **Nada em andamento?** Pergunte o que o usuário quer: trazer uma branch para a dele (você propõe `git merge --no-commit --no-ff <branch>` e só roda com o OK dele) ou só conferir a branch antes do PR (vá para "Conferir antes do PR").

Comandos do git que leem o estado e a edição dos arquivos em conflito valem em qualquer modo. Build e testes seguem o modo do projeto (`problem-solver mode:` no `CLAUDE.md`). Sem essa linha, o modo é hands-off: não rode build nem testes, liste os comandos para o desenvolvedor.

## Resolver cada arquivo

Para cada arquivo em conflito:

1. **Veja o que cada lado quis fazer, não só o trecho marcado.**
   - `git diff <base> HEAD -- <arquivo>`: o que mudou do seu lado.
   - `git diff <base> <outra ponta> -- <arquivo>`: o que mudou do outro.
   - `git log --oneline <base>..<outra ponta> -- <arquivo>`: quem mudou e por quê. A mensagem do commit ou a tarefa citada dizem a intenção.
2. **Classifique o conflito:**
   - **Os dois somam** (cada um adicionou um item, uma rota, um campo): fique com os dois, na ordem que o código vizinho sugere.
   - **Um mudou, o outro mexeu ao redor** (renomeou, formatou, moveu): aplique a mudança de um sobre a forma nova do outro.
   - **Os dois mudaram a mesma regra de jeitos diferentes** (um valor, uma condição): isso é decisão de negócio. **Pare e pergunte**, mostrando as duas versões, quem fez cada uma e o commit.
   - **Um apagou o que o outro mudou:** também é decisão. Pergunte antes de apagar ou de trazer de volta.
   - **Arquivo gerado** (lock de dependências, build, snapshot): não mescle à mão. Fique com uma das versões e diga o comando que regera o arquivo (ex.: `npm install`).
   - **A regra do time cobre o caso:** siga a regra e cite-a.
3. **Edite o arquivo** com o resultado. Nunca use `git checkout --ours/--theirs` ou `-X ours/theirs` no arquivo inteiro, a não ser que a regra do time mande ou o arquivo seja gerado: isso joga fora tudo do outro lado, inclusive o que não estava em conflito.
4. **Não melhore o código durante o conflito.** Nada de refatorar, renomear ou corrigir algo do colega: o resultado tem só as duas mudanças juntas.

## Provar que ninguém foi sobrescrito

Com todos os arquivos editados, e antes de entregar:

1. **Nenhum marcador sobrou:** `git diff --check` e uma busca por `<<<<<<<`, `=======` e `>>>>>>>` nos arquivos que estavam em conflito.
2. **O que o outro lado trouxe continua lá:** `git diff <outra ponta> -- <arquivo>` mostra o resultado contra o lado que entrou. Só pode aparecer o que veio do seu lado. Se uma linha do colega aparece como removida, ela foi perdida: volte e corrija, ou justifique com a decisão do usuário.
3. **O que o seu lado trouxe continua lá:** `git diff HEAD -- <arquivo>`, pelo mesmo raciocínio ao contrário.
4. **Os arquivos sem conflito também:** o git mescla sozinho o que não se sobrepõe, mas um conflito resolvido pode depender de um arquivo que não conflitou (um item novo que precisa de um import, uma função renomeada do outro lado que você ainda chama pelo nome antigo). Procure, nos arquivos que mudaram do outro lado, nomes que o seu lado usa.
5. **Compila:** rode o build, o lint e os testes do projeto no modo hands-on, ou liste os comandos no hands-off. Um merge que não compila não está resolvido.

## Conferir antes do PR

Mesmo sem conflito, um PR pode sobrescrever ou carregar trabalho dos outros. Com a branch de destino atualizada (`git fetch`), confira:

1. **Só os seus commits vão junto:** `git log --oneline origin/<destino>..HEAD`. Um commit de outra pessoa ou um merge de outra branch (ex.: homologação dentro de uma branch que vai para produção) leva para o destino um item que pode não estar aprovado. Aponte cada um e pergunte.
2. **Só as suas mudanças vão junto:** `git diff origin/<destino>...HEAD --stat` (três pontos) lista o que o PR muda. Um arquivo que você não lembra de ter mexido é suspeito.
3. **Nada do destino é desfeito:** se a branch foi criada de uma base antiga ou alguém resolveu um conflito com uma versão inteira, o PR pode desfazer código que já está no destino. Simule o merge sem gravar nada: `git merge-tree --write-tree origin/<destino> HEAD` (git 2.38+) mostra se há conflito, e `git diff origin/<destino> <árvore que ele devolve>` mostra o que mudaria no destino. Cada remoção precisa ser sua e de propósito.
4. **O PR compila depois do merge**, pelo passo 5 de "Provar que ninguém foi sobrescrito".

## Entregar na conversa

```markdown
### Conflitos: <branch que entrou> em <sua branch>
Regras do time usadas: <documento e regra> | nenhuma encontrada

| Arquivo | Tipo | Resolução | Prova |
|---------|------|-----------|-------|
| <arquivo> | os dois somam | manteve <item do colega> e <seu item> | `git diff <outra ponta>` só mostra <seu item> |

Decisões suas: <conflitos de regra, com as duas versões e quem fez cada uma> | nenhuma
Build/testes: <comando + saída> | <comandos para você rodar (hands-off)>
Para concluir: `git add <arquivos>` e `git commit` (ou `git rebase --continue` / `git cherry-pick --continue`)
```

Na conferência antes do PR, entregue os commits e as remoções suspeitas, cada um com o comando que mostrou.

## Regras

- **Nunca conclua a operação.** Sem `git commit`, `git merge --continue`, `git rebase --continue`, `git cherry-pick --continue` nem `git push`. Também não aborte (`--abort`) nem rode `git reset` ou `git checkout` que descarte trabalho sem o usuário pedir.
- **Na dúvida, os dois lados ficam.** Perder código de alguém custa mais que uma pergunta.
- **Sem arquivos novos.** O relatório fica na conversa; nada de `.orig`, backup ou anotação no projeto. Se o git deixou arquivos `.orig`, avise em vez de apagá-los.
- **Prova é comando + saída.** "Mantive as duas mudanças" só vale com o diff que mostra isso.
