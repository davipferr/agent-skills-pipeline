export function estornarVenda(venda) {
  return {
    devolverAoCliente: venda.valor,
    cobrarDoLojista: venda.valor - venda.taxaCobrada,
  };
}
