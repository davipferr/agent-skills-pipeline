export function salvar(db, cliente) {
  return db.query('INSERT INTO clientes (nome, cpf) VALUES (?, ?)', [cliente.nome, cliente.cpf]);
}

export function buscarPorCpf(db, cpf) {
  const digitos = cpf.replace(/\D/g, '');
  return db.query('SELECT id, nome, cpf FROM clientes WHERE cpf = ?', [digitos]);
}
