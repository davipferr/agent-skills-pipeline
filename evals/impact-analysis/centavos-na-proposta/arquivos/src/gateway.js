// Contrato do gateway de pagamento: `amount` em reais, com duas casas decimais.
export function montarCobranca(cliente, plano) {
  return { cliente: cliente.id, amount: plano.valorMensal() };
}
