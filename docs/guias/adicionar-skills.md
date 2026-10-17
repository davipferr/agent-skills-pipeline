# Adicionar uma skill

São dois caminhos: **pegar uma pronta** do skills.sh ou **escrever a sua**. Nos dois, o último passo é o mesmo: colocá-la numa etapa do `flow.yaml`.

---

## A. Skill pronta do skills.sh

Exemplo: adicionar uma etapa de **revisão de código** com a skill `code-review` de `mattpocock/skills` depois da implementação.

### 1. Encontre e leia a skill

Procure em [skills.sh](https://www.skills.sh/) ou pelo terminal:

```bash
npx skills find code review
```

Liste o que um repositório oferece, sem instalar:

```bash
npx skills add mattpocock/skills --list
```

**Leia o `SKILL.md` no GitHub antes de instalar.** Ela vai rodar com as permissões do seu agente. Repare também se ela depende de outras skills (a `tdd`, por exemplo, consulta a `codebase-design`) ou se tem `disable-model-invocation: true`. Nesse caso o agente não consegue chamá-la sozinho, só o usuário com `/nome`; foi por isso que este projeto usa `grilling` e não `grill-me`.

### 2. Registre no `skills.json`

```json
{
  "source": "mattpocock/skills",
  "skills": ["grilling", "tdd", "codebase-design", "code-review"]
}
```

Se for de outro repositório, adicione outro item em `external`.

### 3. Escreva o adapter

`adapters/code-review.md`: o que ler antes e o que gravar depois. Copie a estrutura de [`adapters/tdd.md`](../../adapters/tdd.md):

```markdown
# Adapter: `code-review` na etapa "code-review"

## Antes de chamar a skill
- O "spec" que a skill pede é `docs/flow/03-prd.md`.
- O código está em `workspace/`.

## Depois que a skill terminar
Grave `docs/flow/05b-code-review.md` com o cabeçalho do contrato: ...
```

### 4. Coloque no fluxo

```yaml
  - id: code-review
    title: Revisão de código
    skill: code-review
    source: mattpocock/skills
    inputs: [docs/flow/03-prd.md, docs/flow/05-implementacao.md]
    outputs: [docs/flow/05b-code-review.md]
    adapter: adapters/code-review.md
```

Se uma etapa seguinte deve considerar a revisão de código, adicione `docs/flow/05b-code-review.md` aos `inputs` dela.

### 5. Valide, instale e atualize o diagrama

```bash
npm run validate
```

```bash
npm run setup
```

```bash
npm run diagram -- --write
```

---

## B. Skill escrita por você

Exemplo: uma etapa que gera um **README para o código** do `workspace/`.

### 1. Gere o esqueleto

```bash
npm run new-skill -- write-readme "Escreve o README do código em workspace/ a partir do PRD e da entrega. Use quando o usuário pedir um README ou quando o run-pipeline estiver na etapa readme."
```

Isso cria `skills/write-readme/SKILL.md` com cabeçalho, entrada/saída e o contrato.

### 2. Escreva as instruções

Dicas que valem para qualquer skill:

- **A `description` decide tudo.** Diga o que faz **e quando usar**, com palavras que o usuário diria. "Gera documentação" é vago; "Escreve o README do código em workspace/... Use quando o usuário pedir um README" funciona.
- **Passos numerados e verificáveis.** "1. Leia X. Se não existir, pare." é melhor que "considere o contexto".
- **Diga o que a skill NÃO faz.** Isso evita que ela invada a etapa vizinha (ex.: "não corrija o código, só revise").
- **Templates em arquivo separado** (`template.md`), referenciados pelo `SKILL.md`. O agente só lê quando precisa.
- **Cite os arquivos de saída pelo caminho exato.** O `validate` confere isso.

### 3. Coloque no fluxo, valide e instale

Os mesmos passos 4 e 5 do caminho A, com `source: local` e sem `adapter`.

---

## Checklist

- [ ] `npm run validate` sem erros
- [ ] `npm run setup` rodado (sempre que mudar algo em `skills/`)
- [ ] `npm run diagram -- --write`
- [ ] Testou a etapa sozinha: peça ao agente para usar a skill com os arquivos de entrada já prontos (dá para copiar os de `examples/contador-de-palavras/docs/flow/` para `docs/flow/`)
