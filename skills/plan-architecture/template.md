---
step: architecture
skill: plan-architecture
inputs:
  - docs/flow/03-prd.md
---

# Arquitetura: <nome da feature>

## Visão geral
<Duas ou três frases: como a solução funciona de ponta a ponta.>

## Stack
- Linguagem/runtime: <...>
- Dependências: <só as necessárias, com o motivo>

## Módulos
| Módulo | Responsabilidade | Interface pública |
|--------|------------------|-------------------|
| `<nome>` | <uma frase> | `<assinatura>` |

## Interfaces a testar
- **`<interface>`** — pega: <...> · deixa passar: <...>

## Estrutura de `workspace/`
```
workspace/
├── src/
└── test/
```

## Fatias (ordem de implementação)
1. **<nome da fatia>** — cobre CA-1. Pronto quando: <...>
2. **<...>** — cobre CA-2, CA-3. Pronto quando: <...>

## Cobertura dos critérios de aceite
| CA | Fatia |
|----|-------|
| CA-1 | 1 |

## Em aberto
- <...>
