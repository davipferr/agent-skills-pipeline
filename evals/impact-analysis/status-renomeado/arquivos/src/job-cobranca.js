import { situacao } from './index.js';

export function pedidosParaCobrar(pedidos) {
  return pedidos.filter((pedido) => situacao(pedido) === 'aberto');
}
