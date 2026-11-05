/** Layout do arquivo fiscal: corpo e dígito do CPF em campos separados. */
export function linhaFiscal(cliente) {
  const [corpo, digito] = cliente.cpf.split('-');
  return `${corpo.replaceAll('.', '')};${digito.padStart(2, '0')};${cliente.nome}`;
}
