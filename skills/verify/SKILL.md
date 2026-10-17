---
name: verify
description: Usa o que foi implementado em workspace/ como um usuário de verdade (roda os comandos, abre a tela, monta entradas reais e casos de borda), deixa um script de fumaça reproduzível e grava as provas em docs/flow/06-verificacao.md. Use quando o usuário pedir para testar, verificar ou "ver se funciona de verdade" o que foi implementado, ou quando o run-pipeline estiver na etapa "verify".
---

# Verificar como um usuário

**Entradas:** `docs/flow/03-prd.md`, `docs/flow/04-arquitetura.md`, `docs/flow/05-implementacao.md`, `workspace/FEATURE-MAP.md`
**Saída:** `docs/flow/06-verificacao.md` (e o script de fumaça em `workspace/verify/`)

Testes passando não provam que o programa funciona: provam que os testes passam. Esta etapa existe para que **ninguém precise rodar o programa à mão** para descobrir que ele quebra. Você é o primeiro usuário: se algo não funciona, é você quem descobre, não o dono do projeto.

Você **não corrige o código** aqui. Achou um problema, reproduza, entenda e registre. A correção volta para a etapa de implementação.

## Passos

1. **Leia o mapa.** Abra `workspace/FEATURE-MAP.md`. Ele diz como instalar, como rodar e onde está cada funcionalidade. Se o mapa não existir ou estiver errado (um comando que não funciona, uma tela que não existe), isso já é uma falha: registre e reprove.

2. **Rode numa cópia limpa.** Copie `workspace/` para uma pasta temporária **fora deste repositório** (sem `node_modules`, sem arquivos gerados) e trabalhe lá. Instale as dependências e rode os comandos de build, typecheck e testes que o mapa indica. Isso pega o que só funciona por acidente: arquivo que herda configuração da pasta de cima, dependência instalada só na sua máquina, caminho absoluto.

3. **Use cada funcionalidade do mapa como um usuário.**
   - Monte entradas reais: os exemplos do PRD, um arquivo do tamanho que um usuário teria, texto com acentos.
   - Rode o comando de verdade (não a função do teste), ou suba o servidor e faça as requisições, ou abra a tela. Para interface gráfica, use a automação de navegador que você tiver (ferramenta de navegador do seu agente, Playwright se o projeto já tiver, etc.). Se não tiver nenhuma, diga isso no artefato em vez de fingir que olhou.
   - Para cada critério de aceite com comportamento observável, guarde o **comando exato** e a **saída real** (um trecho, não um resumo seu).

4. **Procure as bordas.** Pelo menos: entrada vazia, entrada inválida, arquivo inexistente, caminho com espaço, texto com acentos e quebra de linha do Windows (CRLF), volume grande o bastante para notar lentidão. Inclua outras que o PRD e a arquitetura sugerirem.

5. **Quando algo falhar, não adivinhe.** Use a skill `investigate`: reproduza, leia o código do caminho que falhou e só então escreva a causa, citando arquivo e linha. Registre no artefato com os passos para reproduzir.

6. **Deixe um script de fumaça.** Crie `workspace/verify/smoke.<ext>` (na linguagem do projeto) que repete o essencial do que você verificou: roda os comandos principais com entradas reais e confere as saídas, saindo com código ≠ 0 se algo divergir. Se o projeto tiver `package.json`, exponha como `npm run smoke`. Rode-o na cópia limpa: ele precisa passar. Assim a próxima verificação (sua, de outro agente ou do dono) custa um comando.

7. **Atualize o mapa** se descobriu algo que faltava nele (um atalho, uma opção, um passo de instalação). O mapa é do código: vive em `workspace/`.

8. Escreva `docs/flow/06-verificacao.md` a partir de [template.md](template.md). O veredito é **aprovado** só se a instalação limpa funcionou, o script de fumaça passa e nenhuma funcionalidade falhou. "Não deu para verificar" não é aprovação: liste em "Não verificado", com o motivo, e o ship-report vai cobrar isso.

## Regras

- Prova é comando + saída. "Funcionou" sem saída colada não conta.
- Não edite `docs/flow/05-implementacao.md` nem o código em `workspace/src`. Problema encontrado vira item em "Falhas", e o run-pipeline manda de volta para a implementação.
- Apague a cópia temporária no fim. Não deixe arquivos de teste soltos dentro de `workspace/` fora de `workspace/verify/`.
