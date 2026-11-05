---
name: impact-analysis
description: Descobre quem realmente depende do código que vai mudar - inclusive consumidores escondidos em reexports, herança, jobs, configuração e contratos de API - e diz para cada um se pode mudar ou não, para evitar regressão. Use antes de mudar código compartilhado, quando o usuário perguntar o que uma mudança afeta, ou quando o run-pipeline pedir.
---

# Análise de impacto

Regressão nasce de um consumidor que ninguém lembrou. Uma busca pelo nome da função não basta: ela pode estar reexportada com outro nome, ser chamada por configuração ou rodar num job que ninguém olha.

## Escopo

- A análise cobre os consumidores do código que a tarefa muda, e não o projeto inteiro.
- Se encontrar um problema num consumidor que não tem relação com a mudança, avise em uma linha na entrega e não corrija.
- Não invente achados: se o código só é usado num lugar, diga isso e siga.

## Passos

1. **Diga o que muda para quem usa:** assinatura, retorno, valor padrão, exceção lançada, efeito colateral, formato de dado. Se nada que quem chama consegue observar muda, a análise termina aqui.

2. **Procure em camadas, sem parar na primeira busca:**
   - **Uso direto:** o nome da função, da classe, da constante, da coluna ou da rota.
   - **Outros nomes:** reexport, alias, wrapper, função passada como parâmetro.
   - **Herança:** classes que herdam, implementam ou sobrescrevem o código.
   - **Registro:** injeção de dependência, configuração, tabelas que apontam para o código.
   - **Nome montado em tempo de execução:** reflection, string, rota dinâmica. Busque também partes do nome.
   - **Fora do fluxo principal:** jobs, filas, webhooks, relatórios, scripts, triggers e views do banco.
   - **Fora do repositório:** API pública, frontend, outros serviços. Se não tiver acesso, pergunte ao desenvolvedor.
   - **Dados salvos:** registros que dependem do formato ou do valor atual.

3. **Classifique cada consumidor:**

   | Consumidor | Onde | Efeito da mudança | Situação |
   |------------|------|-------------------|----------|
   | <quem> | `<arquivo:linha>` | <o que muda para ele> | deve mudar / não pode mudar / sem efeito / passa a divergir |

   "Passa a divergir" é quem não muda, mas deixa de bater com a regra nova: a tela de cotação que mostra um valor e o checkout que cobra outro.

4. **Tire a conclusão.** Se algum consumidor não pode mudar, a mudança não fica no código compartilhado: ela vai para o chamador certo, ou o código ganha uma variante. Se uma proposta já aprovada esqueceu um consumidor, pare e mostre isso ao desenvolvedor.

5. **Diga onde você não procurou:** "busquei só neste repositório" ou "não vi os jobs do outro serviço". Cada consumidor vira um caso de regressão na entrega.
