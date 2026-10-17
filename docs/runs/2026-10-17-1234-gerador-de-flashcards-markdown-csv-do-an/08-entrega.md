---
step: ship
skill: ship-report
inputs:
  - docs/flow/03-prd.md
  - docs/flow/06-verificacao.md
  - docs/flow/07-revisao.md
---

# Entrega: Gerador de flashcards Markdown → CSV do Anki

**Em uma frase:** você escreve cards num `.md` simples (`pergunta :: resposta`), roda um comando e recebe um CSV que o Anki ≥ 2.1.55 importa direto no baralho certo, e que pode ser reimportado sem duplicar.

Status: verificação como usuário **aprovada** ([06-verificacao.md](06-verificacao.md)) e revisão **aprovada**, 17 de 17 critérios de aceite, 27 testes passando ([07-revisao.md](07-revisao.md)).

## Como rodar
```bash
cd workspace
# para usar, nada a instalar: só Node.js ≥ 22.18, sem dependências
node bin/flashcards.ts espanhol.md                    # gera espanhol.csv ao lado
node bin/flashcards.ts espanhol.md -o saida/cards.csv # ou num caminho escolhido
npm test                                              # 27 testes
npm install && npm run typecheck                      # typecheck (instala typescript e @types/node)
```
Exemplo de `espanhol.md`:
```markdown
# Saudações
- hola :: olá
- ¿Cómo estás? :: Como você está?
```
No Anki: *Arquivo → Importar*, escolha o `.csv` e o tipo de nota **Básico**. Detalhes em `workspace/README.md`.

## Decisões que importam
- O Markdown é a fonte da verdade; o CSV é descartável e sempre regerado. Por isso `-o` apontando para o próprio `.md` é recusado. Ver [02-decisoes.md](02-decisoes.md) (decisão 1) e [03-prd.md](03-prd.md) (CA-17).
- A pergunta é a identidade do card: reimportar atualiza em vez de duplicar, mas **editar o texto de uma pergunta cria um card novo** no Anki. Ver [02-decisoes.md](02-decisoes.md) (decisão 4).
- Um arquivo = um baralho, com o nome do arquivo; só cards básicos, uma linha por card, texto literal (sem Markdown → HTML). Ver [02-decisoes.md](02-decisoes.md) (decisões 3, 5, 7).
- Linhas problemáticas (lado vazio, pergunta repetida) viram aviso com o número da linha e o resto segue; sem nenhum card válido, nada é gravado. Ver [03-prd.md](03-prd.md) (CA-8, CA-9, CA-13).
- Fora desta versão, por decisão: geração por IA, integração com o site, tags, cards invertidos/cloze. Ver [03-prd.md](03-prd.md) (Fora de escopo).

## Pendências
- **Importação real no Anki não foi testada**: os testes conferem o texto do CSV contra o formato documentado. Vale importar um arquivo de exemplo uma vez. ([05-implementacao.md](05-implementacao.md))
- **Primeiro card com pergunta começando por `#`** (ex.: `#tag :: ...`) pode ser lido pelo Anki como linha de cabeçalho. Sugestão: pôr entre aspas campos que começam com `#`. ([07-revisao.md](07-revisao.md), observação 2; confirmado em [06-verificacao.md](06-verificacao.md))
- **Bloco de código sem fechamento** (```` ``` ```` sem par) faz o resto do arquivo ser ignorado sem aviso. ([07-revisao.md](07-revisao.md), observação 3; confirmado em [06-verificacao.md](06-verificacao.md))
- Cosmético: o resumo diz `1 cards` no singular.
- Não discutido: aceitar vários `.md` numa só execução (hoje é um por vez). ([03-prd.md](03-prd.md), Em aberto)
- Perguntas repetidas são comparadas de forma exata (maiúsculas/minúsculas diferentes contam como perguntas diferentes).

## Trabalho manual
| O que um humano precisou fazer (ou ficou sem verificar) | Regra dura que evitaria |
|----------------------------------------------------------|-------------------------|
| Corrigir à mão o `workspace/tsconfig.json`, que herdava de `../tsconfig.json` e quebrou depois do `npm run archive` | A etapa `verify` roda o workspace numa cópia fora do repositório; o adapter do `tdd` e a `plan-architecture` exigem que `workspace/` funcione sozinho (com as próprias dependências de typecheck) |
| Criar um `espanhol.md` e rodar o comando para ver se funcionava de verdade | A etapa `verify` usa o comando como usuário e deixa em `06-verificacao.md` os comandos para repetir; o mapa de funcionalidades do `05-implementacao.md` diz como rodar |
| Importar o CSV no Anki (ainda não feito) | Não há como automatizar sem o aplicativo; continua manual |

## Trilha
1. [01-ideia.md](01-ideia.md) — a ideia como chegou
2. [02-decisoes.md](02-decisoes.md) — o interrogatório (18 decisões)
3. [03-prd.md](03-prd.md) — escopo e critérios de aceite (CA-1 a CA-17)
4. [04-arquitetura.md](04-arquitetura.md) — módulos `convert`/`cli` e 8 fatias
5. [05-implementacao.md](05-implementacao.md) — o que foi feito, fatia a fatia
6. [06-verificacao.md](06-verificacao.md) — o programa usado como usuário, com as provas (feita depois do arquivamento)
7. [07-revisao.md](07-revisao.md) — o veredito contra o PRD

Para guardar esta execução em `docs/runs/` e liberar `docs/flow/` para a próxima ideia: `npm run archive`.
