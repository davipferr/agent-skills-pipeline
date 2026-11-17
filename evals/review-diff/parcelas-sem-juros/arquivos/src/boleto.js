export const MAXIMO_PARCELAS_BOLETO = 3;

export function parcelasBoleto(total, quantidade) {
  if (quantidade > MAXIMO_PARCELAS_BOLETO) throw new Error('Boleto em até 3 parcelas');
  return Array.from({ length: quantidade }, () => Math.round((total / quantidade) * 100) / 100);
}
