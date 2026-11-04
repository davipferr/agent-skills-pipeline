---
name: investigate
description: Investiga um problema sem adivinhar - reproduz, lê o código real do caminho que falhou, testa a hipótese e só então afirma a causa, citando arquivo e linha. Use quando algo falhar (um teste, um comando, uma tela), quando o usuário relatar um bug (mesmo vago, como um print com "???"), ou quando um caso de teste da entrega do run-pipeline falhar.
---

# Investigar sem adivinhar

O erro mais caro de um agente é **afirmar uma causa que ele não verificou**: "provavelmente é o cache", "deve ser a versão do Node". Isso gera uma correção no lugar errado, que alguém (normalmente o dono do projeto) vai ter que desfazer. Esta skill troca palpite por evidência.

É o diagnóstico curto de uma falha. Para um problema grande, com dados de produção, integração externa ou histórico de tentativas, use a skill `problem-solver`.

Se o modo do projeto for hands-off (veja a skill `problem-solver`), não execute nada: cada "rode" abaixo vira uma instrução precisa para o usuário, dizendo o que observar, e você continua a partir do resultado que ele trouxer.

## Passos

1. **Reproduza antes de tudo.** Use o README do projeto e o ponto de entrada no código para saber como acionar a funcionalidade. Escreva os passos mínimos que fazem o problema acontecer e rode-os. Guarde a saída real.
   - Relato vago? Chegue à tela ou ao comando mais provável e tente reproduzir. Se não conseguir, diga exatamente o que tentou; não invente o bug.
   - Não reproduziu? Pare aqui e reporte "não reproduzido", com o que foi tentado. Não "corrija" algo que você não viu falhar.

2. **Leia o código de verdade.** Siga o caminho da execução a partir do ponto de entrada até onde a saída diverge. Abra os arquivos; não deduza o conteúdo pelo nome. Se houver testes nesse trecho, leia-os também.

3. **Escreva a hipótese com endereço.** "A causa é `src/x.ts:42`: `<o que o código faz>` quando `<condição>`." Sem arquivo e linha, ainda é palpite.

4. **Prove a hipótese.** Faça um experimento que só dá certo se ela for verdadeira: um log temporário, uma entrada que contorna o trecho, um valor trocado em tempo de execução. Se o experimento contradiz a hipótese, volte ao passo 2.

5. **Reporte na conversa**, neste formato:

   ```markdown
   ### <título curto do problema>
   - Reproduzir: `<passos/comandos>`
   - Esperado: <...> · Obtido: `<saída real>`
   - Causa: `<arquivo:linha>` — <explicação>
   - Prova: <experimento feito e resultado>
   - Correção sugerida: <o quê, onde>
   ```

## Regras

- Não corrija durante a investigação, a não ser que o usuário peça.
- "Não sei" com o que foi tentado vale mais que uma causa inventada.
- Remova logs e arquivos temporários usados no experimento. Nada da investigação fica no repositório.
