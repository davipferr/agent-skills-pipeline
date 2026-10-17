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

- Em `skills/run-pipeline/SKILL.md`, troque as menções a `07-entrega.md` pelo seu artefato final.
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

Copie para o outro projeto:

```
flow.yaml  skills.json  skills/  adapters/  scripts/  tsconfig.json
```

Junte ao `package.json` dele os `scripts` e as dependências (`yaml`, e `typescript` + `@types/node` como dev). Depois acrescente ao `AGENTS.md`/`CLAUDE.md` do projeto a seção "Quando o usuário pedir para rodar o pipeline" deste repositório.

## Princípios que valem para qualquer fluxo

1. **Uma etapa, um artefato, um dono.** Facilita tudo: estado, revisão e refazer.
2. **Etapas que precisam de humano são explícitas** (`interactive: true`). O maestro para nelas.
3. **A última etapa é para quem não acompanhou.** Ninguém vai ler os seis artefatos do meio.
4. **Determinístico em script, julgamento em skill.** Contar arquivos, comparar datas e validar YAML é com código; decidir escopo e escrever é com o agente.
