# Adapter: `tdd` na etapa "implement"

A skill `tdd` (de mattpocock/skills) guia o ciclo vermelho → verde em fatias verticais. Ela pede que as interfaces a testar sejam combinadas com o usuário antes do primeiro teste. Neste pipeline isso já foi feito na arquitetura.

## Antes de chamar a skill

- Leia `docs/flow/04-arquitetura.md`. As **interfaces a testar** de lá são as que o `tdd` pede para combinar: mostre-as ao usuário e peça só a confirmação, sem rediscutir do zero.
- Siga as **fatias** na ordem do documento. Uma fatia = um ou mais ciclos vermelho → verde.
- Todo o código vai em `workspace/` (crie a pasta se não existir). Não mexa em `scripts/`, `skills/` nem em outros arquivos do pipeline.
- Se o `tdd` mencionar `GLOSSARY.md` ou ADRs, use `docs/flow/03-prd.md` e `docs/flow/04-arquitetura.md` no lugar deles.

## Depois de cada fatia

Rode os testes e acrescente a fatia em `docs/flow/05-implementacao.md`. Crie o arquivo na primeira fatia, com `status: in-progress` no cabeçalho:

~~~markdown
---
step: implement
skill: tdd
status: in-progress
inputs:
  - docs/flow/03-prd.md
  - docs/flow/04-arquitetura.md
---

# Implementação: <nome da feature>

## Como rodar os testes
```bash
cd workspace && <comando>
```

## Fatias
### 1. <nome da fatia> — CA-1
- Testes: `workspace/test/<arquivo>` › "<nome do teste>"
- Resultado: <n> passando
- Notas: <desvios da arquitetura e por quê, ou "nenhum">

## Em aberto
- <...>
~~~

Enquanto o cabeçalho tiver `status: in-progress`, o `npm run status` mostra a etapa como **em andamento** (e não como pronta), mesmo com o arquivo já existindo. Assim dá para parar no meio e retomar depois.

A etapa só está pronta quando **todas** as fatias da arquitetura estão no arquivo e os testes passam. Aí, e só aí, **remova a linha `status: in-progress`**.
