# Montar o seu próprio fluxo

O fluxo "ideia → feature" é só um exemplo. O mecanismo (skills + `pipeline/flow.yaml` + artefatos + maestro) serve para qualquer processo com etapas. Tudo o que você muda aqui é base: fica dentro de `pipeline/`.

## Mudanças pequenas

**Tirar uma etapa.** Ex.: pular o interrogatório. Remova o item do `flow.yaml` e tire `docs/flow/02-decisoes.md` dos `inputs` de quem o lia (`prd`). O `validate` aponta exatamente quem ficou lendo um arquivo que ninguém mais produz. Lembre de ajustar o `SKILL.md` de `write-prd`, que também cita esse arquivo.

**Trocar a skill de uma etapa.** Mude `skill` e `source`. Se a nova skill for externa, registre no `skills.json` e escreva o adapter.

**Reordenar.** Mova o bloco no `flow.yaml`. Se alguma etapa passar a ler algo produzido depois dela, o `validate` acusa.

## Um fluxo novo do zero

Exemplo: **post de blog** (pesquisa → roteiro → rascunho → revisão).

### 1. Desenhe no papel primeiro

Para cada etapa, responda:

| Etapa | Que pergunta ela responde? | Precisa de humano? | Lê | Grava |
|-------|----------------------------|--------------------|----|-------|
| pesquisa | o que já existe sobre o tema? | não | (pedido do usuário) | `01-pesquisa.md` |
| roteiro | qual é o argumento, em que ordem? | sim | 01 | `02-roteiro.md` |
| rascunho | como fica escrito? | não | 02 | `03-rascunho.md` |
| revisão | está claro, correto, no tom certo? | não | 02, 03 | `04-revisao.md` |

Se uma etapa grava dois arquivos que nunca são lidos separadamente, junte num só. Se uma etapa precisa de "tudo", provavelmente é grande demais: quebre-a.

### 2. Procure skills prontas antes de escrever

```bash
npx skills find writing
```

No skills.sh, olhe também os *packs* e as *official skills*. Para cada etapa, decida: skill pronta + adapter, ou skill sua.

### 3. Escreva o `flow.yaml`

```yaml
name: post-de-blog
description: Do tema ao post revisado.
steps:
  - id: research
    title: Pesquisa
    skill: research-topic
    source: local
    inputs: []
    outputs: [docs/flow/01-pesquisa.md]
  # ...
```

### 4. Crie as skills que faltam

```bash
npm --prefix pipeline run new-skill -- research-topic "..."
```

### 5. Adapte o maestro e o final

- O maestro e o `npm --prefix pipeline run status` tratam o artefato da **última etapa** do `flow.yaml` como o final; não há nome fixo para trocar.
- `pipeline/scripts/archive.ts` usa o título do `01-ideia.md` para nomear a pasta. Se o seu primeiro artefato tiver outro nome, ajuste a leitura do título nesse script.

### 6. Feche o ciclo

```bash
npm --prefix pipeline run validate
```

```bash
npm --prefix pipeline run setup
```

```bash
npm --prefix pipeline run diagram -- --write
```

## Levar o pipeline para outro repositório

A regra é uma só: **a base vai inteira, o produto não vai.**

| Vai (base) | Não vai (produto) |
|---|---|
| a pasta `pipeline/` (menos `node_modules/`) | `docs/flow/`, `docs/runs/` |
| o bloco entre `<!-- pipeline:start -->` e `<!-- pipeline:end -->` do `AGENTS.md` e do `CLAUDE.md` | `workspace/` (o código gerado aqui) |

Nada do pipeline entra no código do projeto nem no `package.json` dele: os comandos rodam com `npm --prefix pipeline run <comando>`, com as dependências do próprio `pipeline/`.

### Projeto novo

Comece por uma cópia deste repositório e apague os produtos que vieram junto (o conteúdo de `docs/runs/` e de `docs/flow/`, e `workspace/` se existir). O código vai para `workspace/` (`code: workspace` no `pipeline/flow.yaml`).

### Projeto que já existe

Faça conversando com o agente, aberto no projeto de destino. Um pedido que funciona:

> Quero usar o pipeline de skills de `<caminho deste repositório>` neste projeto. Siga a seção "Levar o pipeline para outro repositório" do guia `pipeline/guias/montar-seu-fluxo.md` de lá. Antes de gravar, me mostre o que vai copiar e o que vai mudar no que já existe.

O agente deve seguir esta lista, nessa ordem:

1. **Copiar a pasta `pipeline/`** para a raiz do projeto, sem `node_modules/`. Se o projeto já tiver uma pasta `pipeline/`, parar e perguntar ao dono (o nome da pasta está em `PIPELINE_DIR`, em `pipeline/scripts/lib/files.ts`).
2. **Apontar `code` para o código do projeto** no `pipeline/flow.yaml`: `code: .` (o repositório inteiro) ou a pasta onde o código mora (ex.: `code: apps/web`). O `validate` recusa `code` dentro de `pipeline/` ou de `docs/`, e o `archive` não move o código quando `code` é `.`.
3. **Juntar o bloco do pipeline ao `AGENTS.md`** do projeto: o trecho entre `<!-- pipeline:start -->` e `<!-- pipeline:end -->` do `AGENTS.md` daqui, sem apagar o que já existe. Se o projeto usa Claude Code, o mesmo com o `CLAUDE.md`, que precisa começar com `@AGENTS.md`.
4. **Acrescentar ao `.gitignore`**: `.claude/skills/`, `.agents/skills/` e `pipeline/node_modules/`.
5. **Hook de pre-commit**: o `setup` liga `pipeline/githooks/` se o projeto não usa outro lugar para hooks. Se usa (ex.: husky), acrescentar `npm --prefix pipeline run precommit` no pre-commit dele.
6. Rodar `npm --prefix pipeline install`, `npm --prefix pipeline run setup` e `npm --prefix pipeline run check`, e mostrar a saída.

### Atualizar um projeto quando este template evoluir

Peça o mesmo, dizendo que é uma atualização. O agente troca `pipeline/` pela versão nova e preserva o que é do projeto dentro dela: o `flow.yaml` (o `code` e as etapas que você mudou), o `skills.json`, as skills e os casos de `evals/` que só existem lá e o `endurecimento.md`. No `AGENTS.md` e no `CLAUDE.md`, troca só o que está entre os marcadores. No fim, roda `npm --prefix pipeline run check`.

## Princípios que valem para qualquer fluxo

1. **Uma etapa, um artefato, um dono.** Facilita tudo: estado, revisão e refazer.
2. **Etapas que precisam de humano são explícitas** (`interactive: true`). O maestro para nelas.
3. **A última etapa é para quem não acompanhou.** Ninguém vai ler os seis artefatos do meio.
4. **Determinístico em script, julgamento em skill.** Contar arquivos, comparar datas e validar YAML é com código; decidir escopo e escrever é com o agente.
5. **Alguma etapa prova que funciona antes de alguém aprovar.** No fluxo de exemplo é a `verify`; num fluxo de blog seria abrir o post renderizado e checar os links. Veja [Confiar nos agentes](confiar-nos-agentes.md).
