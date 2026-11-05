import { statusDoPedido } from './status.js';

// Contrato com os parceiros: `status` é aberto, entregue ou cancelado.
export function respostaDoPedido(pedido) {
  return { id: pedido.id, status: statusDoPedido(pedido) };
}
