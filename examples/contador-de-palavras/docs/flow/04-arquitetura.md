---
step: architecture
skill: plan-architecture
inputs:
  - docs/flow/03-prd.md
---

# Arquitetura: Contador de palavras

## Visão geral
Um módulo puro faz as contas sobre uma string. Um módulo de CLI lê o arquivo ou o stdin, chama o módulo puro e imprime. O CLI recebe o I/O por parâmetro, para os testes não tocarem no disco.

## Stack
- Linguagem/runtime: TypeScript executado direto pelo Node (remoção de tipos nativa)
- Dependências: nenhuma; testes com `node:test`

## Módulos
| Módulo | Responsabilidade | Interface pública |
|--------|------------------|-------------------|
| `wordcount` | Contar e ranquear palavras de uma string | `count(text): Counts`, `topWords(text, n): [string, number][]` |
| `cli` | Ler argumentos e entrada, imprimir, decidir o código de saída | `run(argv, io): number` |

## Interfaces a testar
- **`count` / `topWords`**: pega as regras de palavra, acento, hífen e maiúsculas · deixa passar a leitura de arquivo.
- **`run` com um `io` falso**: pega o formato da saída, o `--top` e os erros · deixa passar a leitura real do disco (é só `readFileSync`).

## Estrutura de `workspace/`
```
workspace/
├── package.json
├── src/wordcount.ts
├── src/cli.ts
└── test/wordcount.test.ts
```

## Fatias (ordem de implementação)
1. **Contagem básica**: cobre CA-1, CA-3 e CA-5. Pronto quando `count` passa nos três.
2. **Ranking**: cobre CA-2. Pronto quando `topWords` agrupa sem diferenciar maiúsculas e desempata em ordem alfabética.
3. **CLI**: cobre CA-2 (flag) e CA-4. Pronto quando `run` imprime as contagens e o ranking, e falha com código 1 para arquivo inexistente.

## Cobertura dos critérios de aceite
| CA | Fatia |
|----|-------|
| CA-1 | 1 |
| CA-2 | 2, 3 |
| CA-3 | 1 |
| CA-4 | 3 |
| CA-5 | 1 |

## Em aberto
- nenhum
