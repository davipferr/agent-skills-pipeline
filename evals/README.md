# Evals: testes para skills

Uma skill muda, e pode piorar sem ninguém perceber. Cada pasta aqui guarda **casos** de uma skill, que a skill `eval-skill` roda num agente sem contexto e julga pelos critérios.

```
evals/
└── <nome-da-skill>/
    ├── <caso>/
    │   ├── caso.md        # pedido, critérios e nota mínima (o executor NÃO vê)
    │   └── arquivos/      # o que o executor encontra na pasta (a situação inicial)
    └── resultados.md      # histórico das notas (criado pela eval-skill)
```

## O `caso.md`

```markdown
# <nome do caso>

## Pedido
<exatamente o que o executor recebe como prompt, como um usuário diria>

## Critérios
| # | Critério | Peso |
|---|----------|------|
| 1 | <algo verificável no que o executor produziu> | 2 |
| 2 | <...> | 1 |

## Nota mínima
8
```

## Bons critérios

- **Verificáveis no resultado.** "Todo CA tem entrada e saída concretas" dá para conferir; "o PRD é bom" não dá.
- **Ligados a falhas reais.** O melhor caso nasce de algo que deu errado numa execução (veja a skill `harden`).
- **Incluem o que a skill NÃO deve fazer.** Ex.: "não inventa requisito que não está na ideia nem nas decisões".

## Como rodar

Peça ao agente: *"avalie a skill write-prd"* (skill `eval-skill`). Funciona em qualquer agente com suporte a skills. Quem executou e quem julgou ficam registrados em `resultados.md`.
