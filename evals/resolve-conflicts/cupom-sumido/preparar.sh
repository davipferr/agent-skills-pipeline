#!/usr/bin/env bash
# Monta o histórico do caso na pasta disfarçada (que já recebeu o conteúdo de arquivos/):
# main com a base, homologacao com o item do Cupom (de outra pessoa), feature/frete com o
# item do Frete, e termina no meio do merge da homologacao na feature/frete, com conflito.
set -euo pipefail
cd "$1"

git init -q -b main
git config core.autocrlf false
git config user.name 'Dev Frete'
git config user.email 'frete@loja.test'
git add -A && git commit -qm 'Base da loja'

colega() { git -c user.name='Ana Cupom' -c user.email='ana@loja.test' "$@"; }

git checkout -qb homologacao
cat > src/menu.js <<'JS'
export const itensMenu = [
  { id: 'inicio', rotulo: 'Início', rota: '/' },
  { id: 'pedidos', rotulo: 'Meus pedidos', rota: '/pedidos' },
  { id: 'cupom', rotulo: 'Cupons', rota: '/cupons' },
];
JS
cat > src/rotas.js <<'JS'
import { paginaInicio } from './paginas/inicio.js';
import { paginaPedidos } from './paginas/pedidos.js';
import { paginaCupons } from './paginas/cupom.js';

export const rotas = {
  '/': paginaInicio,
  '/pedidos': paginaPedidos,
  '/cupons': paginaCupons,
};
JS
cat > src/paginas/cupom.js <<'JS'
export const paginaCupons = () => '<h1>Cupons</h1>';
JS
colega add -A && colega commit -qm 'LOJA-210: tela de cupons no menu'
cat > src/config/ambiente.js <<'JS'
export const API_URL = 'https://api-v2.homolog.loja.test';
export const TIMEOUT_MS = 5000;
JS
cat > src/config/limites.js <<'JS'
export const MAX_ITENS_CARRINHO = 20;
JS
colega add -A && colega commit -qm 'LOJA-214: API v2 e carrinho com até 20 itens'

git checkout -q main
git checkout -qb feature/frete
cat > src/menu.js <<'JS'
export const itensMenu = [
  { id: 'inicio', rotulo: 'Início', rota: '/' },
  { id: 'pedidos', rotulo: 'Meus pedidos', rota: '/pedidos' },
  { id: 'frete', rotulo: 'Calcular frete', rota: '/frete' },
];
JS
cat > src/rotas.js <<'JS'
import { paginaInicio } from './paginas/inicio.js';
import { paginaPedidos } from './paginas/pedidos.js';
import { paginaFrete } from './paginas/frete.js';

export const rotas = {
  '/': paginaInicio,
  '/pedidos': paginaPedidos,
  '/frete': paginaFrete,
};
JS
cat > src/paginas/frete.js <<'JS'
export const paginaFrete = () => '<h1>Calcular frete</h1>';
JS
cat > src/config/ambiente.js <<'JS'
export const API_URL = 'http://localhost:3000';
export const TIMEOUT_MS = 5000;
JS
cat > src/config/limites.js <<'JS'
export const MAX_ITENS_CARRINHO = 15;
JS
git add -A && git commit -qm 'LOJA-220: tela de cálculo de frete'

git merge homologacao >/dev/null 2>&1 || true
git status --short
