import { calcularDesconto } from './desconto.js';
import { calcularFrete } from './frete.js';

export function fecharPedido(cliente, itens, cep) {
  const total = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
  const desconto = calcularDesconto(cliente, total);
  const frete = calcularFrete(cep, total);
  return { total, desconto, frete, aPagar: total - desconto + frete };
}
