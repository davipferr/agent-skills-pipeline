---
step: review
skill: review-against-prd
inputs:
  - docs/flow/03-prd.md
  - docs/flow/04-arquitetura.md
  - docs/flow/05-implementacao.md
---

# Revisão: Contador de palavras

**Veredito:** aprovado

## Testes
```
$ cd workspace && npm test
ℹ tests 8
ℹ pass 8
ℹ fail 0
```

## Critérios de aceite
| CA | Veredito | Evidência |
|----|----------|-----------|
| CA-1 | ✅ | `workspace/test/wordcount.test.ts` › "CA-1: conta palavras, linhas e caracteres" |
| CA-2 | ✅ | › "CA-2: agrupa sem diferenciar maiúsculas", "CA-2: empate fica em ordem alfabética", "CA-2: --top mostra..." |
| CA-3 | ✅ | › "CA-3: palavras com acento e hífen contam como uma" |
| CA-4 | ✅ | › "CA-4: arquivo inexistente sai com código 1 e explica o motivo" |
| CA-5 | ✅ | › "CA-5: texto vazio dá zero em tudo" |

## Arquitetura
- Os módulos `wordcount` e `cli` e as interfaces `count`, `topWords` e `run(argv, io)` existem como planejado.

## Escopo extra
- Validação de `--top` inválido. Pequeno, coerente com o CA-4 e justificado em 05-implementacao.md. Aceito.

## O que corrigir (se reprovado)
- nada
