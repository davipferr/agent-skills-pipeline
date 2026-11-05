// Simula o banco. Em produção, cada chamada abaixo é uma consulta de cerca de 700 ms.
const PEDIDOS = Array.from({ length: 1110 }, (_, i) => ({
  id: i + 1,
  clienteId: (i % 370) + 1,
  valor: 10 + (i % 7),
}));

export const contador = { consultas: 0 };

export function buscarPedidosDoCliente(clienteId) {
  contador.consultas++;
  return PEDIDOS.filter((pedido) => pedido.clienteId === clienteId);
}

/** Uma consulta só. Os pedidos voltam por id, misturando os clientes. */
export function buscarPedidosDosClientes(clienteIds) {
  contador.consultas++;
  return PEDIDOS.filter((pedido) => clienteIds.includes(pedido.clienteId));
}

export function buscarEstoqueDoProduto(produtoId) {
  contador.consultas++;
  return { produtoId, quantidade: produtoId * 2 };
}
