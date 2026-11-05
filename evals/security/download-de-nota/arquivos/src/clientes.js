import { db } from './db.js';

export function buscarClientePorNome(nome) {
  return db.query(`SELECT * FROM clientes WHERE nome = '${nome}'`);
}
