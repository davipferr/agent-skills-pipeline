#!/usr/bin/env bash
# Faz o commit da base na pasta disfarçada (que já recebeu o conteúdo de arquivos/) e deixa
# a mudança da tarefa na árvore de trabalho, sem commit, para o revisor ver no git diff.
set -euo pipefail
cd "$1"

git init -q -b main
git config core.autocrlf false
git config user.name 'Dev Marketplace'
git config user.email 'dev@marketplace.test'
git add -A && git commit -qm 'Base do marketplace'

cat > src/taxas.js <<'JS'
export const TAXA_SERVICO = 0.12;

export function calcularTaxa(valorVenda) {
  return Math.round(valorVenda * TAXA_SERVICO * 100) / 100;
}
JS
