---
step: verify
skill: verify
inputs:
  - docs/flow/03-prd.md
  - docs/flow/04-arquitetura.md
  - docs/flow/05-implementacao.md
---

# Verificação: Contador de palavras

**Veredito:** aprovado (1 observação fora dos critérios de aceite)

## Ambiente
- Cópia limpa em: pasta temporária fora do repositório (`/tmp/tmp.XXXX`), só com `package.json`, `src/` e `test/`
- Sistema e runtime: Windows 11 (Git Bash), Node v25.5.0
- Instalação: nada a instalar (sem dependências) → ok
- Testes: `npm test` → `tests 8 · pass 8 · fail 0`

## Funcionalidades (como usuário)
| Funcionalidade (mapa do 05) | CA | Comando / ação | Saída real (trecho) | ✅/❌ |
|------------------------------|----|----------------|---------------------|-------|
| Contar um arquivo | CA-1 | `node src/cli.ts a.txt` (`olá mundo olá`) | `palavras: 3` · `linhas: 1` · `caracteres: 13` | ✅ |
| Palavras mais frequentes | CA-2 | `node src/cli.ts b.txt --top 1` (`Casa casa CASA rua`) | `casa: 3` | ✅ |
| Contar um arquivo | CA-3 | `node src/cli.ts c.txt` (`pé-de-moleque é ótimo`) | `palavras: 3` | ✅ |
| Contar um arquivo | CA-4 | `node src/cli.ts naoexiste.txt` | `arquivo não encontrado: naoexiste.txt`, código 1 | ✅ |
| Contar um arquivo | CA-5 | `node src/cli.ts vazio.txt` (arquivo vazio) | `palavras: 0` · `linhas: 0` · `caracteres: 0` | ✅ |
| Contar a partir do stdin | CA-1 | `printf 'oi mundo\n' \| node src/cli.ts` | `palavras: 2` · `linhas: 1` | ✅ |

## Bordas
| Caso | Comando / ação | Saída real (trecho) | ✅/❌ |
|------|----------------|---------------------|-------|
| caminho com espaço | `node src/cli.ts "meu texto.txt" --top 2` | `olá: 2` · `mundo: 1`, código 0 | ✅ |
| CRLF | arquivo `um\r\ndois\r\n` | `linhas: 2` · `caracteres: 10` (o `\r` conta como caractere) | ✅ |
| volume grande | 200 mil palavras (1,6 MB), `--top 1` | `palavra: 200000` em 0,17 s | ✅ |
| `--top` inválido | `--top 0` e `--top abc` | `--top precisa ser um inteiro maior que zero`, código 1 | ✅ |

## Como repetir
Comandos para colar num terminal, a partir da raiz do repositório. Criam as entradas numa pasta temporária e não gravam nada em `workspace/`. Rodados ao gravar esta verificação: todas as saídas bateram com o esperado.
```bash
cd examples/contador-de-palavras/workspace
t=$(mktemp -d)
printf 'olá mundo olá' > "$t/a.txt"
node src/cli.ts "$t/a.txt"                        # esperado: palavras: 3 · linhas: 1 · caracteres: 13 (CA-1)
printf 'Casa casa CASA rua' > "$t/b.txt"
node src/cli.ts "$t/b.txt" --top 1                # esperado: ... e por último casa: 3 (CA-2)
printf 'pé-de-moleque é ótimo' > "$t/c.txt"
node src/cli.ts "$t/c.txt"                        # esperado: palavras: 3 (CA-3)
node src/cli.ts "$t/nao existe.txt"; echo "código $?"   # esperado: arquivo não encontrado: ... e código 1 (CA-4)
printf '' > "$t/vazio.txt"
node src/cli.ts "$t/vazio.txt"                    # esperado: palavras: 0 · linhas: 0 · caracteres: 0 (CA-5)
printf 'oi mundo\n' | node src/cli.ts             # esperado: palavras: 2 · linhas: 1 (stdin)
printf 'um\r\ndois\r\n' > "$t/crlf.txt"
node src/cli.ts "$t/crlf.txt"                     # esperado: linhas: 2 · caracteres: 10 (CRLF)
node src/cli.ts "$t/a.txt" --top 0; echo "código $?"    # esperado: --top precisa ser um inteiro maior que zero e código 1
rm -rf "$t"; cd - > /dev/null
```

## Falhas
- nenhuma

## Observações (não bloqueiam)
1. Com `--top abc`, o comando imprime as contagens no stdout **antes** de reclamar do `--top` e sair com código 1. Quem usar a saída num script recebe um resultado parcial junto com o erro. O PRD não cobre esse caso; se importar, vira um CA novo (validar as opções antes de contar).

## Não verificado
- Typecheck dentro da cópia limpa: a pasta não tem `tsconfig.json` próprio; quem faz o typecheck é o `npm run typecheck` da raiz do repositório (rodado: sem erros).
