---
step: verify
skill: verify
inputs:
  - docs/flow/03-prd.md
  - docs/flow/04-arquitetura.md
  - docs/flow/05-implementacao.md
---

# Verificação: <nome da feature>

**Veredito:** aprovado | reprovado

## Ambiente
- Cópia limpa em: <pasta temporária usada>
- Sistema e runtime: <ex.: Windows 11, Node 22.18>
- Instalação: `<comando>` → <ok | erro, com a saída>
- Build/typecheck/testes: `<comando>` → <resumo da saída>

## Funcionalidades (como usuário)
| Funcionalidade (FEATURE-MAP) | CA | Comando / ação | Saída real (trecho) | ✅/❌ |
|------------------------------|----|----------------|---------------------|-------|
| <nome> | CA-1 | `<comando exato>` | `<saída>` | ✅ |

## Bordas
| Caso | Comando / ação | Saída real (trecho) | ✅/❌ |
|------|----------------|---------------------|-------|
| entrada vazia | `<...>` | `<...>` | ✅ |

## Script de fumaça
```bash
cd workspace && <comando, ex.: npm run smoke>
```
<saída resumida da última execução>

## Falhas
1. **<título>** — reproduzir: `<passos>` · esperado: <...> · obtido: <...> · causa: `<arquivo:linha>` <explicação> · etapa a refazer: implement

## Não verificado
- <o que não deu para verificar e por quê, ou "nada">
