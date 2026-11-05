import { statusDoPedido } from './status.js';

const ROTULOS = { aberto: 'Em aberto', entregue: 'Entregue', cancelado: 'Cancelado' };

export function rotuloDoPedido(pedido) {
  return ROTULOS[statusDoPedido(pedido)];
}
