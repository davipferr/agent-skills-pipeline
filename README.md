# agent-skills-pipeline

Um template para projetos que usam **skills encadeadas**: uma ideia passa por oito etapas (cada uma uma [Agent Skill](https://www.skills.sh/docs)) e sai como feature implementada com testes, verificada como um usuário usaria, revisada e documentada. Funciona com Claude Code, Codex e qualquer agente compatível com o padrão Agent Skills.

## Base e produto

Tudo o que é o pipeline mora em **uma pasta**. Tudo o que uma execução gera fica **fora** dela.

```
<repositório>/
├── pipeline/          ← BASE: o pipeline inteiro (skills, scripts, testes, regras, guias)
├── AGENTS.md          ← BASE: instruções para os agentes (bloco entre <!-- pipeline:start/end -->)
├── CLAUDE.md          ← BASE: o mesmo, para o Claude Code
├── docs/flow/         ← PRODUTO: os artefatos da execução atual
├── docs/runs/         ← PRODUTO: execuções arquivadas
└── workspace/         ← PRODUTO: o código do projeto (`code` no pipeline/flow.yaml)
```

| | Base | Produto |
|---|---|---|
| O que é | o pipeline: como transformar uma ideia em feature | o resultado de uma execução |
| Onde fica | `pipeline/` + o bloco do pipeline no `AGENTS.md`/`CLAUDE.md` | `docs/flow/`, `docs/runs/` e a pasta do código |
| Vai para outro repositório? | **sim**, inteira | **não** |
| Quem protege | `guard` (nada da base muda durante uma execução) | `validate` (artefato só em `docs/flow/`, código nunca dentro de `pipeline/`) |

Para levar o pipeline a outro repositório, você copia a base e mais nada.

- **Projeto novo:** use este repositório como ponto de partida. O código gerado vai para `workspace/`.
- **Projeto que já existe:** copie `pipeline/`, junte os blocos do `AGENTS.md` e do `CLAUDE.md` e mude `code` para `.` no `pipeline/flow.yaml`. O passo a passo, para fazer com o agente, está em [Montar o seu fluxo](pipeline/guias/montar-seu-fluxo.md#levar-o-pipeline-para-outro-repositório).

## Começando

Requisitos: Node **22.18+**.

```bash
npm --prefix pipeline install
```

```bash
npm --prefix pipeline run setup
```

Depois abra o agente nesta pasta e diga:

> Rode o pipeline. Minha ideia: um comando que conta as palavras de um texto e mostra as mais repetidas.

Os comandos do pipeline rodam de qualquer pasta do repositório com `npm --prefix pipeline run <comando>`. A documentação completa (o fluxo, os comandos, os guias) está em [`pipeline/README.md`](pipeline/README.md).
