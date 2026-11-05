---
name: security
description: Confere se o código que a tarefa toca não fica frágil nem pode ser explorado por um usuário mal-intencionado - entrada externa, injeção, permissão por registro, dados sensíveis e upload. Use quando a tarefa mexer em entrada do usuário, autenticação, permissão, dados sensíveis, upload ou integração externa, quando o usuário pedir uma revisão de segurança, ou quando o run-pipeline pedir.
---

# Segurança

A pergunta desta skill é uma só: **o que um usuário mal-intencionado consegue fazer com este código?** Cada achado precisa de um caminho concreto de ataque, não de uma regra genérica.

## Escopo

- Olhe só o código que a tarefa toca, a não ser que a própria tarefa seja sobre segurança.
- Uma falha fora da tarefa não é corrigida aqui. Se for grave, destaque-a na entrega, com o risco e onde está, para o desenvolvedor decidir. Se for menor, avise em uma linha.
- Não invente achados: se não há caminho de ataque, não diga nada.

## Passos

1. **Marque o que vem de fora.** Tudo o que o usuário ou outro sistema controla: parâmetros, corpo, cabeçalhos, cookies, arquivos, webhooks, e dados salvos que vieram de um usuário. Siga cada valor até onde ele é usado.

2. **Confira, no código que muda:**
   - **Injeção:** valor externo concatenado em SQL, comando do sistema, caminho de arquivo ou HTML.
   - **Autorização:** estar logado não basta. Este usuário pode ler ou alterar *este* registro? Trocar o ID na requisição mostra dados de outra pessoa ou de outro cliente?
   - **Validação no servidor:** a regra existe no backend, e não só na tela. Campos que o usuário não deveria definir (`role`, `preco`, `dono`) são ignorados.
   - **Dados sensíveis:** senha, token, documento ou dado pessoal em log, mensagem de erro, URL ou resposta de API.
   - **Segredos:** chave ou senha escrita no código.
   - **Upload:** tipo, tamanho, nome e pasta de destino.
   - **URL externa:** o usuário consegue fazer o servidor chamar um endereço escolhido por ele?
   - **Abuso:** uma ação cara ou sensível pode ser repetida sem limite?

3. **Corrija com o que o projeto já usa:** parâmetros de query, o filtro de permissão existente, o validador do projeto. Não crie um mecanismo novo de segurança dentro de uma tarefa.

4. **Reporte na conversa:**

   ```markdown
   ### <título curto>
   - Onde: `<arquivo:linha>`
   - Ataque: <quem faz o quê, e o que consegue>
   - Gravidade: alta | média | baixa
   - Correção: <o quê, usando o que o projeto já tem>
   ```

   Cada achado do código alterado vira um caso de teste na entrega, como "usuário A tenta abrir o pedido do usuário B".

## Regras

- Não tente explorar a falha em ambiente real. Descreva o ataque; quem testa é o desenvolvedor, em ambiente de teste.
- Nunca copie segredo ou dado pessoal real para a conversa ou para o código.
- Escolher aceitar um risco é decisão do desenvolvedor: mostre o risco e deixe a decisão com ele.
