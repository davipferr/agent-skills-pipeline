export function salvarCliente(db, cliente) {
  return db.query('INSERT INTO clientes (nome, email, telefone) VALUES ($1, $2, $3)', [cliente.nome, cliente.email, cliente.telefone]);
}

/** Cadastro feito no balcão: só nome e telefone. */
export function cadastroRapido(db, nome, telefone) {
  return db.query('INSERT INTO clientes (nome, telefone) VALUES ($1, $2)', [nome, telefone]);
}
