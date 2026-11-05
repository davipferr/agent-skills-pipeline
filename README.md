# agent-skills-pipeline

O meu jeito de trabalhar com um agente de código, guardado num lugar só. O objetivo é fazer em 4 horas o trabalho de 8: pegar uma tarefa e entregá-la sem quebrar o código e sem criar regressão, só conversando com o agente.

Funciona com Claude Code, Codex e qualquer agente compatível com o padrão [Agent Skills](https://www.skills.sh/docs), em qualquer empresa: a estrutura é sempre a mesma.

## Como funciona

```
tarefa → entender → analisar o código e o impacto → propor
                                                       │
                                        (eu aprovo) ◄──┘
                                             │
              implementar → revisar o diff → casos de teste de QA
                                                       │
                              (eu testo, faço commit e PR) ◄──┘
```

- **Eu supervisiono.** O agente para antes de implementar e para na entrega. A palavra final é minha.
- **O agente nunca faz commit, push nem PR.**
- **Nada vai para o projeto além do código da tarefa.** Sem arquivos de plano, relatório ou mapa: tudo fica na conversa.
- **Sem testes automatizados por padrão.** No fim, o agente entrega os casos de teste como um QA faria, e eu confiro.

## As skills

| Skill | Para quê |
|-------|----------|
| [`run-pipeline`](skills/run-pipeline/SKILL.md) | Conduz a tarefa pelas etapas acima |
| [`problem-solver`](skills/problem-solver/SKILL.md) | O método: evidência antes de opinião, causa raiz, escopo e impacto |
| [`investigate`](skills/investigate/SKILL.md) | Diagnóstico curto de uma falha, sem adivinhar |
| [`eval-skill`](skills/eval-skill/SKILL.md) | Testa uma skill com casos de [`evals/`](evals/README.md). Fica só neste repositório |

## Instalar

Requisitos: Node **22.18+**. Na pasta deste repositório:

```bash
npm run adopt
```

O `adopt` copia as skills para as pastas globais, `.claude/skills/` e `.agents/skills/` da pasta do usuário. Elas passam a valer em todos os projetos, sem nenhum arquivo dentro deles, o que serve bem para tarefas que mexem em mais de um projeto. Rode o mesmo comando para atualizar: se uma skill já existir com outro conteúdo, ele mostra qual é e só a troca com `--force`. As outras skills da pasta não são tocadas.

Para instalar num projeto só, passe a pasta dele. As skills aparecem no git do projeto como qualquer arquivo novo:

```bash
npm run adopt -- C:/caminho/do/projeto
```

Depois é só abrir o agente na pasta do projeto e passar a tarefa:

> Resolve esta tarefa: <cole o ticket>

Por padrão, o agente não roda nem depura a aplicação: ele escreve instruções para eu rodar. Num projeto onde ele pode executar tudo sozinho, a linha `problem-solver mode: hands-on` no `CLAUDE.md` muda isso.

## Mexer no pipeline

```bash
npm install
```

```bash
npm run check
```

Depois de mudar uma skill, rode `npm run adopt -- .` para atualizar a cópia deste repositório. Para avaliar uma skill, abra uma conversa nova com o agente e peça para rodar a `eval-skill`.

## O que saiu, para reavaliar depois

A versão anterior seguia a ideia de automação total da curva de confiança de Lauren Tan. Numa empresa, isso não cabe de uma vez: a automação cresce passo a passo. Tudo isto está no git, no commit `df32200`, e pode voltar se fizer falta:

| O que saiu | O que fazia | Por que saiu |
|------------|-------------|--------------|
| `capture-idea`, `write-prd`, `plan-architecture` | Ideia, PRD e arquitetura em arquivos | A tarefa já vem da empresa; a análise cabe na conversa |
| `tdd`, `grilling`, `codebase-design` | Testes primeiro e interrogatório | Não refletem o trabalho real; os casos de QA substituem os testes |
| `verify`, `review-against-prd`, `ship-report` | Verificação, revisão e relatório em arquivos | Viraram etapas curtas do `run-pipeline`, sem arquivos |
| `harden` | Trabalho manual vira regra dura | Reavaliar quando houver histórico de tarefas reais |
| `onboard`, `find-skills`, `FEATURE-MAP.md` por projeto | Mapa do código e skills da stack | Geram arquivos que não podem ir para o projeto |
| `docs/flow/`, `flow.yaml`, `status`, `guard`, `validate`, `archive`, `diagram`, `new-skill` | Artefatos entre etapas e as checagens deles | Sem artefatos, não há o que checar |
| Skills do skills.sh (`skills.json`, `setup`) | Instalação de skills externas | Nenhuma foi útil no trabalho real; o `adopt` copia as skills locais |
| `githooks/` | Pre-commit com o `check` | Só atrapalhava; o `check` continua disponível |
| `guias/` | Guias da versão anterior | Descreviam o que saiu |

`runs/` guarda a execução antiga como histórico.
