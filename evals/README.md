# Evals: testes para skills

Uma skill muda, e pode piorar sem ninguém perceber. Cada pasta aqui guarda **casos** de uma skill, que a skill `eval-skill` roda num agente sem contexto e julga pelos critérios.

```
evals/
└── <nome-da-skill>/
    └── <caso>/
        ├── caso.md        # pedido, critérios e nota mínima (o executor NÃO vê)
        └── arquivos/      # o que o executor encontra na pasta (a situação inicial)
```

Aqui ficam só os **casos**, porque eles são o teste: rodar o mesmo caso antes e depois de mudar uma skill é o que mostra se ela melhorou ou piorou. As notas não são gravadas: a `eval-skill` as mostra na conversa, e o histórico das mudanças fica no git.

## O `caso.md`

```markdown
# <nome do caso>

## Preparação
<opcional: o que montar na pasta disfarçada além do padrão, como outra skill ou um `git init`>

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

- **Verificáveis no resultado.** "Parou antes de implementar e listou quem mais usa o código" dá para conferir; "a análise é boa" não dá.
- **Ligados a falhas reais.** O melhor caso nasce de algo que deu errado numa tarefa de verdade.
- **Incluem o que a skill NÃO deve fazer.** Ex.: "não faz commit" ou "não cria arquivo além do código".

## Como rodar

Abra uma conversa nova com o agente e peça: *"avalie a skill run-pipeline"* (skill `eval-skill`). Um agente diferente do que escreveu a skill julga melhor. O resultado (notas, quem executou e quem julgou) aparece na conversa.

1. O agente procura casos em `evals/<skill>/`.
2. **Se não houver nenhum**, ele primeiro te ajuda a escrever um caso, mostra o `caso.md` e os `arquivos/` propostos e só grava depois da sua aprovação.
3. Com os casos prontos, ele executa cada um num agente sem contexto, dá a nota e, se ficar abaixo do mínimo, propõe melhorias no `SKILL.md`.

## Skills que fazem perguntas

O `run-pipeline` para e espera a aprovação. O executor da avaliação não tem ninguém para responder, então o caso mede a parada: se ele propôs, se parou e se **não** implementou nem inventou uma aprovação.
