# agent-skills-pipeline

Um projeto feito **só de skills encadeadas**. Uma ideia solta entra, passa por oito etapas e sai como feature implementada com testes, **verificada como um usuário usaria**, revisada e documentada. Cada etapa é uma [Agent Skill](https://www.skills.sh/docs): umas escritas aqui, outras instaladas do [skills.sh](https://www.skills.sh/).

O objetivo é deixar **visível** como várias skills trabalham juntas:

- **qual** skill roda em cada etapa → [`flow.yaml`](flow.yaml)
- **o que** cada uma recebeu e entregou → os arquivos em `docs/flow/`
- **em que ponto** você está → `npm run status`
- **se o fluxo está consistente** → `npm run validate`
- **se ninguém mexeu no pipeline no meio do caminho** → `npm run guard`

E foi feito para você **não virar o gargalo**: o agente verifica o próprio trabalho, o que importa é garantido por script (não por prompt), e cada coisa que você precisou fazer à mão vira uma regra nova. Veja [Confiar nos agentes](docs/guias/confiar-nos-agentes.md).

Funciona com **Claude Code**, **Codex** e qualquer agente compatível com o padrão Agent Skills. No ChatGPT e no Claude.ai web também dá para usar, de forma manual ([veja como](docs/guias/usar-com-claude-e-chatgpt.md)).

## O fluxo

<!-- pipeline:diagram:start -->
```mermaid
flowchart TD
  user(["👤 você"])
  s_idea["1. Capturar a ideia<br/><b>capture-idea</b><br/><small>local · interativa</small>"]
  s_grill["2. Interrogatório<br/><b>grilling</b><br/><small>mattpocock/skills · interativa</small>"]
  s_prd["3. PRD<br/><b>write-prd</b><br/><small>local</small>"]
  s_architecture["4. Arquitetura e fatias<br/><b>plan-architecture</b><br/><small>local</small>"]
  s_implement["5. Implementação com TDD<br/><b>tdd</b><br/><small>mattpocock/skills · interativa</small>"]
  s_verify["6. Verificação como usuário<br/><b>verify</b><br/><small>local</small>"]
  s_review["7. Revisão contra o PRD<br/><b>review-against-prd</b><br/><small>local</small>"]
  s_ship["8. Relatório de entrega<br/><b>ship-report</b><br/><small>local · interativa</small>"]
  user -->|ideia| s_idea
  s_idea -->|01-ideia.md| s_grill
  s_idea -->|01-ideia.md| s_prd
  s_grill -->|02-decisoes.md| s_prd
  s_prd -->|03-prd.md| s_architecture
  s_prd -->|03-prd.md| s_implement
  s_architecture -->|04-arquitetura.md| s_implement
  s_prd -->|03-prd.md| s_verify
  s_architecture -->|04-arquitetura.md| s_verify
  s_implement -->|05-implementacao.md| s_verify
  s_prd -->|03-prd.md| s_review
  s_architecture -->|04-arquitetura.md| s_review
  s_implement -->|05-implementacao.md| s_review
  s_verify -->|06-verificacao.md| s_review
  s_prd -->|03-prd.md| s_ship
  s_verify -->|06-verificacao.md| s_ship
  s_review -->|07-revisao.md| s_ship
  classDef local fill:#e8f1ff,stroke:#3b82f6,color:#0b2545
  classDef external fill:#fff4e5,stroke:#f59e0b,color:#3d2600
  class s_idea,s_prd,s_architecture,s_verify,s_review,s_ship local
  class s_grill,s_implement external
```
<!-- pipeline:diagram:end -->

Azul = skill escrita neste repositório (`skills/`). Laranja = skill externa do skills.sh, encaixada com um *adapter* (`adapters/`). Cada seta é um **arquivo**: as skills nunca conversam entre si, só leem o que a etapa anterior gravou.

| # | Etapa | Skill | Origem | Lê | Grava |
|---|-------|-------|--------|----|-------|
| 1 | Capturar a ideia | `capture-idea` | local | sua mensagem | `01-ideia.md` |
| 2 | Interrogatório | `grilling` | [mattpocock/skills](https://www.skills.sh/mattpocock/skills/grilling) | 01 | `02-decisoes.md` |
| 3 | PRD | `write-prd` | local | 01, 02 | `03-prd.md` |
| 4 | Arquitetura e fatias | `plan-architecture` | local | 03 | `04-arquitetura.md` |
| 5 | Implementação com TDD | `tdd` | [mattpocock/skills](https://www.skills.sh/mattpocock/skills/tdd) | 03, 04 | `05-implementacao.md` + código e `FEATURE-MAP.md` em `workspace/` |
| 6 | Verificação como usuário | `verify` | local | 03, 04, 05 | `06-verificacao.md` + `workspace/verify/` (fumaça) |
| 7 | Revisão contra o PRD | `review-against-prd` | local | 03, 04, 05, 06 | `07-revisao.md` |
| 8 | Relatório de entrega | `ship-report` | local | 03, 06, 07 | `08-entrega.md` |

Acima de todas está o **maestro**, `run-pipeline`: uma skill que não faz o trabalho de nenhuma etapa. Ela pergunta ao `npm run status` qual etapa vem agora, chama a skill certa, confere se o arquivo de saída apareceu e roda o `npm run guard`. Se a verificação ou a revisão reprovar, ela volta para a implementação com as falhas já escritas.

Ao lado do fluxo ficam as **skills de apoio** (`helpers` no `flow.yaml`), que não são etapas:

| Skill | Para quê |
|-------|----------|
| `investigate` | algo falhou: reproduz e lê o código antes de afirmar a causa |
| `harden` | transforma o "Trabalho manual" das entregas em regras duras |
| `eval-skill` | testa uma skill com os casos de [`evals/`](evals/README.md), num agente sem contexto, e dá nota |

Quer ver uma execução completa? [`examples/contador-de-palavras/`](examples/contador-de-palavras/) tem os 8 artefatos, o código, o mapa de funcionalidades e o script de fumaça.

## Começando

Requisitos: Node **22.18+**. Os scripts são TypeScript rodando direto no Node, sem build.

```bash
npm install
```

```bash
npm run setup
```

O `setup` usa o CLI oficial do skills.sh (`npx skills add`) para instalar as skills externas do [`skills.json`](skills.json) e as locais de `skills/` em `.claude/skills/` (Claude Code) e `.agents/skills/` (Codex, Gemini CLI e outros). Também liga o hook de pre-commit de `.githooks/`.

```bash
npm run validate
```

Depois abra o agente nesta pasta e diga:

> Rode o pipeline. Minha ideia: um comando que conta as palavras de um texto e mostra as mais repetidas.

O agente vai rodar **uma etapa por vez** e parar entre elas para você ler o arquivo gerado. As etapas 1, 2, 5 e 8 são interativas: ele vai te fazer perguntas. A qualquer momento:

```bash
npm run status
```

```
ideia-ate-feature

  ✔ idea          capture-idea        pronta        docs/flow/01-ideia.md
  ✔ grill         grilling            pronta        docs/flow/02-decisoes.md
  ▶ prd           write-prd           pode rodar    vai gravar docs/flow/03-prd.md ← próxima
  · architecture  plan-architecture   bloqueada     falta docs/flow/03-prd.md
  ...
```

Quando terminar, `npm run archive` move a execução para `docs/runs/<data>-<ideia>/` e libera `docs/flow/` para a próxima ideia.

## Comandos

| Comando | O que faz |
|---------|-----------|
| `npm run setup` | Instala skills externas + locais para os agentes do `skills.json` (`-- --dry-run` só mostra os comandos) |
| `npm run validate` | Confere se o fluxo fecha: skills existem, entradas vêm de etapas anteriores, cada arquivo tem um dono, instalação em dia |
| `npm run status` | Em que etapa você está (`-- --json` para agentes, `-- --dir <pasta>` para outra execução, inclusive as arquivadas em `docs/runs/`) |
| `npm run new-skill -- <nome> "<descrição>"` | Cria `skills/<nome>/SKILL.md` no formato do pipeline |
| `npm run diagram -- --write` | Regenera o diagrama deste README a partir do `flow.yaml` |
| `npm run archive` | Move a execução atual para `docs/runs/` |
| `npm run guard` | Falha se o pipeline (`flow.yaml`, `skills/`, `scripts/`...) mudou durante uma execução sem você aprovar (`git add`) |
| `npm run adopt -- <pasta>` | Leva o pipeline para um projeto que já existe, ou o atualiza (`-- --dry-run` só mostra) |
| `npm run check` | Typecheck + testes + validate + guard (o pre-commit roda isto) |

## Estrutura

```
agent-skills-pipeline/
├── flow.yaml                  # O FLUXO: ordem, skill, entradas e saídas de cada etapa + skills de apoio
├── skills.json                # skills externas (owner/repo do skills.sh) + agentes alvo
├── skills-lock.json           # gerado pelo CLI skills: versões exatas instaladas
├── skills/                    # skills escritas aqui (padrão Agent Skills)
│   ├── run-pipeline/          #   o maestro
│   │   ├── SKILL.md
│   │   └── references/contrato-dos-artefatos.md
│   ├── capture-idea/          #   cada etapa: SKILL.md + template.md do artefato
│   ├── write-prd/
│   ├── plan-architecture/
│   ├── verify/
│   ├── review-against-prd/
│   ├── ship-report/
│   ├── investigate/           #   skills de apoio (helpers)
│   ├── harden/
│   └── eval-skill/
├── adapters/                  # encaixe das skills externas no fluxo
│   ├── grilling.md
│   └── tdd.md
├── docs/
│   ├── flow/                  # os bastões da execução atual (01-ideia.md … 08-entrega.md)
│   ├── runs/                  # execuções arquivadas
│   └── guias/                 # documentação detalhada
├── evals/                     # casos de teste das skills (eval-skill)
├── workspace/                 # código gerado pela etapa 5 (fora do git), com FEATURE-MAP.md e verify/
├── examples/contador-de-palavras/  # uma execução completa, para consulta
├── .githooks/pre-commit       # roda npm run precommit (ligado pelo npm run setup)
├── scripts/                   # validate, status, setup, new-skill, diagram, archive, guard, adopt
│   └── lib/                   # lógica pura (testada em test/)
├── AGENTS.md / CLAUDE.md      # instruções do repositório para Codex / Claude Code
└── test/
```

## Guias

1. [Como o fluxo funciona](docs/guias/como-funciona.md): skills, artefatos, estados, o maestro e os adapters
2. [Adicionar uma skill](docs/guias/adicionar-skills.md): do skills.sh ou escrita por você
3. [Montar o seu próprio fluxo](docs/guias/montar-seu-fluxo.md): trocar, reordenar e criar etapas, ou levar o pipeline para um projeto que já existe (`npm run adopt`)
4. [Usar com Claude e ChatGPT](docs/guias/usar-com-claude-e-chatgpt.md): Claude Code, Claude.ai, Codex e ChatGPT web
5. [Confiar nos agentes](docs/guias/confiar-nos-agentes.md): verificação, mapa de funcionalidades, regras duras, `harden` e evals, para você não virar o gargalo

## Sobre as skills externas

As skills de terceiros rodam com as mesmas permissões do seu agente. Leia o `SKILL.md` de cada uma antes de adicioná-la ao `skills.json` (o skills.sh tem uma página de [auditorias de segurança](https://www.skills.sh/audits)). O `npm run setup` desliga a telemetria do CLI por padrão; use `DISABLE_TELEMETRY=0 npm run setup` se quiser contar no ranking do skills.sh.
