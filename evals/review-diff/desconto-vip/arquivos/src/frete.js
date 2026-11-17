const FRETE_GRATIS_A_PARTIR = 150;

export function calcularFrete(cep, total) {
  if (total > FRETE_GRATIS_A_PARTIR) return 0;
  return cep.startsWith('0') ? 15 : 25;
}
