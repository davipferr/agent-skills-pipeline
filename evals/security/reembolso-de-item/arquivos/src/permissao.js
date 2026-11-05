export function exigirDono(usuario, pedido) {
  if (pedido.clienteId !== usuario.clienteId) throw new Error('Acesso negado');
}
