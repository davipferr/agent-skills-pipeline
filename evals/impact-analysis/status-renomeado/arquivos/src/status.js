export function statusDoPedido(pedido) {
  if (pedido.cancelado) return 'cancelado';
  if (pedido.entregue) return 'entregue';
  return 'aberto';
}
