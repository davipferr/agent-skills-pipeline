---
name: run-pipeline
description: Conduz uma tarefa de desenvolvimento do início ao fim, com o desenvolvedor no controle - entende a tarefa, analisa o código e o impacto, propõe, espera a aprovação, implementa sem criar regressão, revisa o próprio diff e entrega os casos de teste como um QA faria. Nada é gravado além do código da tarefa, e o agente nunca faz commit nem abre PR. Use quando o usuário colar ou descrever uma tarefa, um ticket, um work item ou um bug para resolver, mesmo que a análise ou a proposta já venham prontas e aprovadas, ou pedir para rodar, continuar ou retomar o pipeline.
---

# Rodar o pipeline

O objetivo é um só: pegar uma tarefa e entregá-la **sem quebrar o código e sem criar regressão**, com o desenvolvedor só conversando com você. Ele supervisiona e tem a palavra final.

Tudo acontece **na conversa**. O método de análise é a skill `problem-solver`: use-a em todas as etapas e chame-a ao começar.

## Regras que não mudam

- **Nunca faça commit, push nem PR.** Você só altera a árvore de trabalho. Quem revisa e publica é o desenvolvedor.
- **Não crie arquivos além do código da tarefa.** Nada de plano, relatório, PRD, mapa ou log no repositório: o que precisa ser dito vai na conversa.
- **Não escreva testes automatizados**, a não ser que o usuário peça ou a tarefa exija. A verificação é a etapa 6.
- **O foco é a tarefa, não o projeto.** Resolva a tarefa da melhor maneira, sem reescrever a base nem mudar a estrutura, a não ser que a tarefa seja sobre isso. Um padrão ruim do projeto fica como está: não copie e siga.
- **Duas paradas obrigatórias:** você só implementa depois da aprovação da etapa 3, e a tarefa só termina quando o desenvolvedor diz.
- Quem roda a aplicação é definido pelo modo do `problem-solver` (`problem-solver mode:` no `CLAUDE.md` do projeto). Sem essa linha, o modo é **hands-off**: você não executa nem depura, e transforma cada verificação em instruções precisas para o desenvolvedor.

## Skills de apoio

Use cada uma só quando a condição valer: uma tarefa pequena não passa por todas. Skill que não se aplica não é citada.

| Skill | Use quando a tarefa |
|-------|---------------------|
| `impact-analysis` | muda código usado por mais de um lugar |
| `edge-cases` | muda lógica, regra de negócio, validação ou cálculo |
| `performance` | mexe em query, loop, chamada externa ou grande volume de dados |
| `security` | mexe em entrada externa, autenticação, permissão, dados sensíveis ou upload |
| `data-change` | altera o banco ou o formato de dado salvo |

## Etapas

### 1. Entender a tarefa

Leia a tarefa inteira e diga em poucas linhas o que entendeu: o que muda para quem usa e como saber que ficou pronto. O que a tarefa afirma é hipótese até o código confirmar. Só pergunte o que não dá para descobrir sozinho no código, no histórico do git ou nos logs.

### 2. Analisar o código

Antes de propor qualquer coisa:

- Siga o caminho real da execução, do ponto de entrada até onde a mudança entra. Abra os arquivos; não deduza pelo nome.
- Procure precedente: `git log` do trecho, tarefas parecidas, e se isso já foi resolvido.
- Veja como o código vizinho resolve o mesmo problema, para seguir o padrão que já existe.
- **Liste quem mais usa esse código.** É aqui que as regressões nascem.
- Aplique as skills de apoio cuja condição vale para esta tarefa.

Se for um bug, siga as fases 0 a 6 do `problem-solver` até ter a causa raiz. Para um diagnóstico curto de uma falha pontual, use a skill `investigate`.

### 3. Propor e parar

Apresente, sem implementar nada:

- **O que muda:** arquivos e métodos, com a menor mudança que resolve.
- **Impacto:** quem é afetado e quem explicitamente não é.
- **Riscos:** pré-mortem. Se isso der errado depois de publicado, qual é a causa mais provável? Inclua o que as skills de apoio encontraram.
- **Decisões do desenvolvedor:** regras de negócio e escopo, com as opções e a evidência. Não decida sozinho.

O tamanho acompanha a tarefa: uma correção simples cabe em três linhas. **Pare e espere a aprovação.**

### 4. Implementar

Faça o que foi aprovado, e só isso. Reaproveite o que existe e siga o estilo do arquivo. Se a realidade contrariar a proposta (outro consumidor, outra causa, escopo maior), pare e volte à etapa 3. Um problema fora do escopo só é reportado se afetar a tarefa, e não é corrigido.

### 5. Revisar o próprio diff

Leia o `git diff` inteiro como se outra pessoa tivesse escrito:

- Cada linha se justifica e resolve a causa, não o sintoma?
- Sobrou código de debug, valor fixo ou arquivo solto?
- Cada consumidor da etapa 2 continua funcionando? Cada risco da etapa 3 foi coberto?
- O código que você escreveu passa nas skills de apoio usadas na etapa 2? A mudança trouxe alguma condição nova da tabela?
- O código ao redor da mudança tem algum problema que não é da tarefa? Reporte na entrega, sem corrigir.
- Compila? Se o projeto tem build ou lint, rode-os no modo hands-on ou liste o comando no modo hands-off.

Corrija o que encontrar antes de entregar.

### 6. Entregar e parar

Entregue na conversa:

1. **O que mudou**, em poucas linhas, com os arquivos.
2. **Casos de teste, como um QA escreveria**, para o desenvolvedor conferir a entrega. Cubra o caminho principal, as bordas (vazio, zero, limite, dado antigo), **a regressão de cada consumidor** da etapa 2 e o que as skills de apoio apontaram. Um caso por comportamento diferente:

   | # | Cenário | Passos | Dados | Resultado esperado |
   |---|---------|--------|-------|--------------------|
   | 1 | <o que está sendo testado> | <o que fazer, na ordem> | <registro ou entrada> | <o que deve acontecer> |

3. **O que não foi verificado**, os riscos aceitos, os problemas fora do escopo que afetam a tarefa e os consumidores que não mudaram, mas passam a divergir da regra nova.

**Pare.** Se um caso falhar, use `investigate` com o resultado que o desenvolvedor trouxer e volte à etapa 3 ou 4. A tarefa termina quando ele aprovar; o commit e o PR são dele.

**Comentário final só quando o desenvolvedor pedir.** A primeira versão raramente é a definitiva, então não o escreva antes disso, mesmo que a fase 10 do `problem-solver` diga para escrever. Quando ele pedir, deixe-o pronto para colar na tarefa ou no PR, sobre a versão final da mudança, com as seções da 6.2 do `problem-solver` (Mudanças Feitas, Impacto, Riscos, Notas Adicionais, Evidências) e no idioma do código do projeto (português se o código for em português, inglês se for em inglês), mesmo que a tarefa ou a conversa estejam em outro.

## Para continuar uma tarefa

Não há estado salvo. Veja a conversa e o `git status`/`git diff`, diga em que etapa a tarefa está e siga dali.

Se a proposta já vier aprovada, chame a `problem-solver`, leia o código que ela toca, liste quem mais o usa, aplique as skills de apoio que valem e comece na etapa 4. A aprovação dispensa só a parada da etapa 3: as etapas 5 e 6 continuam valendo.
