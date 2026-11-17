#!/usr/bin/env bash
# Faz o commit da base na pasta disfarçada (que já recebeu o conteúdo de arquivos/) e deixa
# a mudança da tarefa na árvore de trabalho, sem commit, para o revisor ver no git diff.
set -euo pipefail
cd "$1"

git init -q -b main
git config core.autocrlf false
git config user.name 'Dev Loja'
git config user.email 'dev@loja.test'
git add -A && git commit -qm 'Base da loja'

cat > src/desconto.js <<'JS'
export const DESCONTO_VIP = 0.1;
export const DESCONTO_VIP_MAIOR = 0.15;
export const MINIMO_DESCONTO_MAIOR = 200;

export function calcularDesconto(cliente, total) {
  if (!cliente.vip) return 0;
  const percentual = total > MINIMO_DESCONTO_MAIOR ? DESCONTO_VIP_MAIOR : DESCONTO_VIP;
  return arredondar(total * percentual);
}

const arredondar = (valor) => Math.round(valor * 100) / 100;
JS
