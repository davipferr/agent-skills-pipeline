import { calcularFrete } from './frete.js';

export function fecharPedido(pedido) {
  const subtotal = pedido.itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
  const pesoKg = pedido.itens.reduce((soma, item) => soma + item.pesoKg, 0);
  const frete = calcularFrete(pedido.regiao, pesoKg);
  return { subtotal, frete, total: subtotal + frete };
}
