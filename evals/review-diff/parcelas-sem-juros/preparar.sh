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

cat > src/parcelas.js <<'JS'
export const PARCELAS_SEM_JUROS = 6;
export const MAXIMO_PARCELAS_CARTAO = 10;
const JUROS_AO_MES = 0.0199;

export function valorParcela(total, quantidade) {
  if (quantidade > MAXIMO_PARCELAS_CARTAO) throw new Error(`Cartão em até ${MAXIMO_PARCELAS_CARTAO} parcelas`);
  if (quantidade <= PARCELAS_SEM_JUROS) return arredondar(total / quantidade);
  const fator = (JUROS_AO_MES * (1 + JUROS_AO_MES) ** quantidade) / ((1 + JUROS_AO_MES) ** quantidade - 1);
  return arredondar(total * fator);
}

export function temJuros(quantidade) {
  return quantidade > PARCELAS_SEM_JUROS;
}

const arredondar = (valor) => Math.round(valor * 100) / 100;
JS
cat > src/mensagens.js <<'JS'
import { PARCELAS_SEM_JUROS } from './parcelas.js';

export function textoParcelamento() {
  return `Em até ${PARCELAS_SEM_JUROS}x sem juros no cartão`;
}
JS
