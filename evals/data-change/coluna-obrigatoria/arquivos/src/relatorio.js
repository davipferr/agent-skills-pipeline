export function contatos(db) {
  return db.query('SELECT nome, telefone FROM clientes');
}
