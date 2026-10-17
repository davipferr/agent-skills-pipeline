---
name: plan-architecture
description: A partir do PRD, define a arquitetura mínima e quebra o trabalho em fatias verticais com as interfaces públicas a testar (docs/flow/04-arquitetura.md). Use quando o usuário pedir arquitetura, plano técnico ou divisão em tarefas de um PRD, ou quando o run-pipeline estiver na etapa "architecture".
---

# Planejar a arquitetura

**Entrada:** `docs/flow/03-prd.md`
**Saída:** `docs/flow/04-arquitetura.md`

A próxima etapa usa a skill `tdd`, que trabalha em **fatias verticais** (um teste → uma implementação) e só testa em **interfaces públicas combinadas antes**. Este documento entrega exatamente isso: as interfaces e a ordem das fatias.

## Passos

1. Leia o PRD inteiro. Se houver item em "Em aberto" marcado como bloqueante, pare e peça a decisão ao usuário.
2. Escolha a **menor** arquitetura que atende os critérios de aceite. Respeite as "Restrições técnicas" do PRD. Não adicione camada, banco ou framework que nenhum CA exige.
3. Defina os **módulos** (nome, responsabilidade em uma frase, interface pública). Poucos módulos, com bastante coisa escondida atrás de uma interface pequena.
4. Defina as **interfaces a testar**: onde os testes observam o comportamento. Para cada uma: o que o teste pega e o que deixa passar.
5. Quebre em **fatias**. Cada fatia:
   - cobre um ou mais CAs do PRD (cite os ids),
   - atravessa todas as camadas necessárias (não "fazer todo o banco primeiro"),
   - termina com algo que roda.
6. Escreva `docs/flow/04-arquitetura.md` a partir de [template.md](template.md), com o cabeçalho:

   ```yaml
   step: architecture
   skill: plan-architecture
   inputs: [docs/flow/03-prd.md]
   ```

7. Confira a cobertura: todo `CA-n` do PRD aparece em pelo menos uma fatia. Se algum ficou de fora, explique em "Em aberto".

## Onde fica o código

O código da feature vai em `workspace/` (ignorado pelo git deste repositório: é o produto da execução, não parte do pipeline). Diga na seção "Estrutura" como `workspace/` vai ficar organizado.
