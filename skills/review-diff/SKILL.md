---
name: review-diff
description: Revisa o diff de uma tarefa como um revisor de fora, sem o raciocínio de quem implementou - escreve a regra a partir da tarefa antes de abrir o diff, percorre no papel cada caminho alterado com dados concretos, segue o fluxo inteiro, procura os lugares que deveriam ter mudado e não mudaram, e aponta cada erro de lógica ou de regra de negócio com arquivo, linha e o cenário que falha. Use na etapa 5 do run-pipeline, quando o usuário pedir uma revisão ou um code review de uma mudança, ou quando quiser saber se passou algum erro.
---

# Revisar o diff como alguém de fora

Quem escreveu o código lê o diff confirmando a própria intenção: lembra por que fez cada linha e vê o que queria ter escrito. Por isso o erro passa, e quando alguém aponta, a tendência é justificar. Esta revisão parte do que a tarefa pede, e não do que o código faz, e cobra um cenário concreto para cada crítica.

## Quem revisa

- **Se o agente consegue abrir um subagente com contexto novo, ele revisa.** Passe só o pedido da tarefa, nas palavras do usuário, as decisões de negócio que o desenvolvedor tomou na conversa e a instrução de seguir esta skill. Não passe a proposta, a análise, a lista de consumidores nem as justificativas: o revisor herdaria os mesmos pontos cegos.
- **Sem subagente, o próprio agente revisa**, seguindo os passos na ordem: a regra do passo 1 fica escrita antes de abrir o diff. Diga na entrega que a revisão foi feita no mesmo contexto, porque ela vale menos.

O revisor só lê: código, `git diff`, `git status` e `git log`. Ele não executa nada, em nenhum modo.

## Escopo

- A revisão cobre o que a tarefa mudou e o que ela deveria ter mudado.
- Consulte o projeto sempre que precisar de contexto, mas o que está errado fora da tarefa fica como está. Só fale de um problema fora da tarefa se ele afetar a tarefa.
- Não invente achados: se a mudança está certa, diga isso e diga o que percorreu.

## Passos

1. **Escreva a regra antes de ler o diff.** Até a regra estar escrita na resposta, não rode `git diff` nem `git status` e não abra o código. Ela sai do pedido, das decisões do desenvolvedor e, se faltar contexto, da documentação do projeto, e não do que o código faz. A partir da tarefa e das decisões, diga o que deve acontecer para quem usa e escreva de 2 a 4 exemplos concretos, `entrada -> resultado esperado`, com pelo menos uma borda. Se for um bug, um dos exemplos é o cenário que falhava. Se a tarefa admite mais de uma leitura, anote as leituras: isso vira pergunta, não erro.

2. **Leia o diff inteiro.** Inclua os arquivos novos, que o `git diff` não mostra (`git status`). Para cada trecho, abra o arquivo: o erro costuma estar no que fica em volta do trecho alterado.

3. **Percorra no papel.** Para cada exemplo do passo 1 e cada caminho alterado (cada `if`, cada retorno, cada laço), siga linha por linha com os valores concretos até o resultado, e compare com o esperado. Confira também o que o diff tirou: quem usava o comportamento removido?

4. **Siga o fluxo inteiro.** Vá de onde o dado nasce (ponto de entrada, validação) até onde ele termina (gravado, exibido, enviado, lido de novo). Uma mudança certa sozinha pode quebrar dois passos depois, por formato, unidade, nulo ou ordem.

5. **Procure o que ficou faltando.** Faça a sua própria busca, sem a lista de quem implementou, por tudo que trata do mesmo assunto: os termos da regra, o campo, a constante, a mensagem, o mesmo cálculo copiado em outro arquivo, a mesma validação em outra camada (tela e servidor), outros pontos de entrada (API, job, importação, relatório, exportação). Para cada lugar, diga se ele **foi alterado**, se **não precisa mudar**, e por quê, ou se **está faltando**.

6. **Confira a limpeza:** código de debug, valor fixo, arquivo solto e comentário que conta a história da mudança ou cita a tarefa (`// TASK-123: corrigido`, `// antes era X`). Isso fica no commit, que é do desenvolvedor. Comentário explica por que o código é assim, e só quando o código não diz sozinho.

## Cada achado precisa de prova

- Tem `arquivo:linha`, o cenário (`entrada -> obtido`, contra o esperado) e qual exemplo ou regra do passo 1 ele quebra. Sem cenário, não é achado.
- É **confirmado** quando você percorreu o caminho e viu o resultado errado. É **suspeita** quando depende do que não deu para ler (banco, outro serviço, configuração do ambiente), e então diz o que a confirmaria.
- Gosto pessoal não é achado. Fugir do padrão do arquivo só é achado quando confunde ou quebra algo.
- "Está certo" só vale depois de percorrer todos os caminhos alterados. Diga quais foram.

## Entregar na conversa

```markdown
### Revisão do diff
Revisor: subagente com contexto novo | mesmo contexto de quem implementou
Regra usada: <exemplos do passo 1>

| # | Tipo | Onde | Cenário | Esperado | Situação |
|---|------|------|---------|----------|----------|
| 1 | lógica / negócio / faltando / fluxo / limpeza | `<arquivo:linha>` | <entrada -> obtido> | <resultado certo> | confirmado / suspeita |

Conferidos sem problema: <lugares do passo 5 e caminhos do passo 3>
Não percorrido: <o que não deu para ler, e por quê> | nada
Perguntas de negócio: <leituras diferentes da tarefa> | nenhuma
```

## Depois da revisão

Isto vale para quem implementou:

- Corrija cada achado confirmado antes de entregar.
- Só descarte um achado com evidência no código (`arquivo:linha`) ou com uma decisão do desenvolvedor. "Foi de propósito" não basta. Uma divergência sem evidência vai para o desenvolvedor, na entrega.
- Se a correção mudou a lógica, revise de novo os trechos corrigidos pelos passos 3 a 5.
