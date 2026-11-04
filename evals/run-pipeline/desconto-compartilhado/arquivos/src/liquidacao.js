import { aplicarDesconto } from './desconto.js';

const PERCENTUAL_LIQUIDACAO = 70;

/** Produtos parados há mais de um ano saem com 70% de desconto, por decisão do estoque. */
export function precoDeLiquidacao(produto) {
  return aplicarDesconto(produto.preco, PERCENTUAL_LIQUIDACAO);
}
