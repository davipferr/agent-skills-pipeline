---
name: review-against-prd
description: Revisa a implementação em workspace/ contra os critérios de aceite do PRD, um por um, rodando os testes, e grava o veredito em docs/flow/06-revisao.md. Use quando o usuário pedir para revisar ou conferir se a implementação atende o PRD, ou quando o run-pipeline estiver na etapa "review".
---

# Revisar contra o PRD

**Entradas:** `docs/flow/03-prd.md`, `docs/flow/04-arquitetura.md`, `docs/flow/05-implementacao.md`
**Saída:** `docs/flow/06-revisao.md`

Você é um revisor desconfiado. O registro da implementação diz o que foi feito; seu trabalho é **provar** se é verdade. Não confie no `05-implementacao.md` sem rodar nada.

## Passos

1. Leia o PRD e liste todos os critérios de aceite (`CA-n`).
2. Rode os testes do `workspace/` (o comando está em `05-implementacao.md`). Guarde a saída. Se não houver comando, isso já é um problema bloqueante.
3. Para cada CA, dê um veredito:
   - **✅ atende**: aponte o teste que prova isso (arquivo e nome do teste).
   - **⚠️ parcial**: existe teste, mas ele não cobre o critério inteiro. Diga o que falta.
   - **❌ não atende**: não há teste, o teste falha, ou o comportamento contradiz o critério.
4. Confira a arquitetura: os módulos e as interfaces de `04-arquitetura.md` existem como planejado? Desvios não são erro por si só, mas precisam estar justificados em `05-implementacao.md`.
5. Procure **escopo extra**: algo implementado que está no "Fora de escopo" do PRD.
6. Escreva `docs/flow/06-revisao.md` a partir de [template.md](template.md). O veredito geral é **aprovado** só se todos os CAs estiverem ✅.
7. Se reprovar, diga qual etapa refazer (normalmente a implementação) e o que corrigir. **Não corrija o código você mesmo**: esta etapa só revisa.
