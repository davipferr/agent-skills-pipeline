import { calcularFrete } from './frete.js';

/** Valor do frete mostrado na página do produto, antes da compra. */
export function cotarFrete(produto, regiao) {
  return calcularFrete(regiao, produto.pesoKg);
}
