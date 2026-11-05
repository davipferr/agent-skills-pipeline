import { createHash } from 'node:crypto';
import { db } from './db.js';
import { exigirDono } from './permissao.js';

const COLUNAS = 'id, pedidoId, itemId, valor, motivo, status';

export async function pedirReembolso(usuario, pedidoId, corpo) {
  const [pedido] = db.query('SELECT * FROM pedidos WHERE id = ?', [pedidoId]);
  if (!pedido) throw new Error('Pedido não encontrado');
  exigirDono(usuario, pedido);

  const [item] = db.query('SELECT * FROM itens WHERE id = ?', [corpo.itemId]);
  if (!item) throw new Error('Item não encontrado');

  const reembolso = db.salvar('reembolsos', { pedidoId, itemId: item.id, valor: item.preco, status: 'pendente', ...corpo });

  if (corpo.urlAviso) await fetch(corpo.urlAviso, { method: 'POST', body: JSON.stringify(reembolso) });
  return reembolso;
}

export function comprovante(usuario, reembolsoId) {
  const [reembolso] = db.query(`SELECT ${COLUNAS} FROM reembolsos WHERE id = ?`, [reembolsoId]);
  if (!reembolso) throw new Error('Reembolso não encontrado');
  const [pedido] = db.query('SELECT * FROM pedidos WHERE id = ?', [reembolso.pedidoId]);
  exigirDono(usuario, pedido);

  const html = `<h1>Reembolso ${reembolso.id}</h1><p>Motivo: ${reembolso.motivo}</p>`;
  const etag = createHash('md5').update(html).digest('hex');
  return { html, etag };
}
