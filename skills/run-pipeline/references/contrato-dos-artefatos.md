# Contrato dos artefatos

Todo arquivo que uma etapa grava em `docs/flow/` é um **artefato**: o bastão que ela entrega para a próxima. Para que qualquer agente (Claude, Codex, ChatGPT) consiga continuar o trabalho, todo artefato segue o mesmo formato.

## Cabeçalho obrigatório

```markdown
---
step: prd                      # id da etapa no flow.yaml
skill: write-prd               # skill que produziu o arquivo
inputs:                        # arquivos lidos para produzi-lo
  - docs/flow/01-ideia.md
  - docs/flow/02-decisoes.md
---

# Título do artefato
...
```

## Regras

1. **Um artefato, um dono.** Só a etapa listada em `step` escreve neste arquivo. Outras etapas leem.
2. **Autossuficiente.** Quem lê o artefato não teve acesso à sua conversa. Se uma decisão importa, ela está escrita aqui.
3. **Referencie, não copie.** Se a informação já está num artefato anterior, cite o arquivo em vez de repetir o conteúdo.
4. **Pendências explícitas.** O que ficou em aberto vai numa seção `## Em aberto`, nunca fica implícito.
5. **Prova, não afirmação.** Quando o artefato diz que algo funciona, ele mostra o que prova isso: o comando rodado e um trecho da saída real, ou o teste (arquivo e nome).
6. **Trabalho pela metade.** Uma etapa longa (como a implementação) pode gravar o artefato aos poucos. Enquanto não terminar, o cabeçalho leva `status: in-progress`; quando terminar, a linha é removida.

## Como o estado é calculado

O `npm run status` não guarda estado em lugar nenhum: ele olha os arquivos.

| Estado    | Significado                                                        |
|-----------|--------------------------------------------------------------------|
| `done`    | todas as saídas existem e são mais novas que as entradas            |
| `stale`   | as saídas existem, mas alguma entrada foi alterada depois delas (ou a etapa que produz a entrada está desatualizada) |
| `in-progress` | as saídas existem, mas alguma ainda tem `status: in-progress` no cabeçalho |
| `ready`   | as saídas não existem e todas as entradas existem                   |
| `blocked` | falta alguma entrada (uma etapa anterior ainda não rodou)           |

É a mesma ideia do `make`: se você editar o PRD à mão, a arquitetura e tudo que vem depois ficam `stale`.
