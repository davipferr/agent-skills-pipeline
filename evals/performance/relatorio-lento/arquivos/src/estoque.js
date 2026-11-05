import { buscarEstoqueDoProduto } from './db.js';

export function posicaoDeEstoque(produtoIds) {
  return produtoIds.map((produtoId) => buscarEstoqueDoProduto(produtoId));
}
