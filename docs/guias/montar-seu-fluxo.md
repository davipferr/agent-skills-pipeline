# Montar o seu próprio fluxo

O fluxo "ideia → feature" é só um exemplo. O mecanismo (skills + `flow.yaml` + artefatos + maestro) serve para qualquer processo com etapas.

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
npm run new-skill -- research-topic "..."
```

### 5. Adapte o maestro e o final

- O maestro e o `npm run status` tratam o artefato da **última etapa** do `flow.yaml` como o final; não há nome fixo para trocar.
- `scripts/archive.ts` usa o título do `01-ideia.md` para nomear a pasta. Se o seu primeiro artefato tiver outro nome, ajuste a leitura do título nesse script.

### 6. Feche o ciclo

```bash
npm run validate
```

```bash
npm run setup
```

```bash
npm run diagram -- --write
```

## Levar o mecanismo para outro repositório

**Projeto novo:** comece por uma cópia deste repositório.

**Projeto que já existe:** faça conversando com o agente, aberto no projeto de destino. Cada projeto tem suas particularidades (scripts com o mesmo nome, um `AGENTS.md` próprio, outro gerenciador de hooks), e o agente decide caso a caso com você. Um pedido que funciona:

> Quero usar o pipeline de skills de `<caminho deste repositório>` neste projeto. Siga a seção "Levar o mecanismo para outro repositório" do guia `docs/guias/montar-seu-fluxo.md` de lá. Antes de gravar, me mostre o que vai copiar e o que vai mudar no que já existe.

O agente deve seguir esta lista, nessa ordem:

1. **Copiar a estrutura do projeto base** (veja [o projeto base e o projeto gerado](../../README.md#o-projeto-base-e-o-projeto-gerado)): `skills/`, `adapters/`, `scripts/`, `flow.yaml`, `skills.json`, `.githooks/pre-commit`, `evals/README.md`, `docs/guias/` e o `FEATURE-MAP.md` (o mapa do projeto base). Nada de `docs/flow/`, `docs/runs/`, `examples/` nem `workspace/`: isso é o que o projeto base gerou, não a estrutura. Se o projeto já tiver uma `scripts/` própria, coloque os do pipeline numa subpasta (ex.: `scripts/pipeline/`), ajuste os caminhos e acrescente essa pasta em `PIPELINE_PATHS`, no `scripts/lib/guard.ts`.
2. **Juntar ao `package.json`** os scripts `setup`, `validate`, `status`, `new-skill`, `diagram`, `archive`, `guard` e `precommit`, a dependência `yaml` (como devDependency) e `engines.node >= 22.18`. **Nunca sobrescrever** um script que já existe: se o nome colidir, perguntar ao dono. O maestro depende de `npm run status` e de `npm run guard`.
3. **Acrescentar ao `AGENTS.md`** do projeto, sem apagar o que já existe, as regras deste repositório (a seção "Regras do repositório" do `AGENTS.md` daqui), trocando a regra do `workspace/` por: *"neste projeto não existe `workspace/`; onde as skills dizem `workspace/`, entenda a raiz do repositório"*. Se o projeto usa Claude Code, o `CLAUDE.md` precisa de `@AGENTS.md`.
4. **Acrescentar ao `.gitignore`** `.claude/skills/` e `.agents/skills/`.
5. **Não criar nada dentro do código do projeto** além do que o pipeline precisa para rodar (os scripts e o `package.json`). O mapa de funcionalidades e as provas nascem em `docs/flow/` na primeira execução do pipeline.
6. Rodar `npm install`, `npm run setup` e `npm run validate`, e mostrar a saída.

Para **atualizar** um projeto quando este template evoluir, peça o mesmo, dizendo que é uma atualização: o agente compara a camada do pipeline dos dois lados, mostra as diferenças e preserva o que é do projeto (o `flow.yaml` e o `skills.json` dele, as regras próprias do `AGENTS.md` e os scripts dele).

## Princípios que valem para qualquer fluxo

1. **Uma etapa, um artefato, um dono.** Facilita tudo: estado, revisão e refazer.
2. **Etapas que precisam de humano são explícitas** (`interactive: true`). O maestro para nelas.
3. **A última etapa é para quem não acompanhou.** Ninguém vai ler os seis artefatos do meio.
4. **Determinístico em script, julgamento em skill.** Contar arquivos, comparar datas e validar YAML é com código; decidir escopo e escrever é com o agente.
5. **Alguma etapa prova que funciona antes de alguém aprovar.** No fluxo de exemplo é a `verify`; num fluxo de blog seria abrir o post renderizado e checar os links. Veja [Confiar nos agentes](confiar-nos-agentes.md).
