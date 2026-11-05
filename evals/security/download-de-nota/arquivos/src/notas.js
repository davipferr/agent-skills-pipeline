import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { db } from './db.js';

const PASTA_NOTAS = './notas';

export function baixarNota(usuario, pedidoId, nomeArquivo) {
  console.log('download de nota', { email: usuario.email, token: usuario.token, pedidoId });
  const [pedido] = db.query(`SELECT * FROM pedidos WHERE id = ${pedidoId}`);
  if (!pedido) throw new Error('Pedido não encontrado');
  return readFileSync(join(PASTA_NOTAS, nomeArquivo), 'utf8');
}
