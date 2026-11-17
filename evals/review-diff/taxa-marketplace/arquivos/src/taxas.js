export const TAXA_SERVICO = 0.1;

export function calcularTaxa(valorVenda) {
  return Math.round(valorVenda * TAXA_SERVICO * 100) / 100;
}
