import { buscarPedidosDoCliente } from './db.js';

/** Uma linha por cliente, na ordem recebida. Cliente sem pedido aparece com zero. */
export function relatorioDeVendas(clienteIds) {
  return clienteIds.map((clienteId) => {
    const pedidos = buscarPedidosDoCliente(clienteId);
    return {
      clienteId,
      quantidade: pedidos.length,
      total: pedidos.reduce((soma, pedido) => soma + pedido.valor, 0),
    };
  });
}
