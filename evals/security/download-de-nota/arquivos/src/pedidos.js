import { db } from './db.js';
import { exigirDono } from './permissao.js';

export function verPedido(usuario, pedidoId) {
  const [pedido] = db.query('SELECT * FROM pedidos WHERE id = ?', [pedidoId]);
  if (!pedido) throw new Error('Pedido não encontrado');
  exigirDono(usuario, pedido);
  return pedido;
}
