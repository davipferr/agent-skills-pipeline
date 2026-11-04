const PERCENTUAL_MULTA = 2;

/** Multa sobre um valor, com duas casas decimais. */
export function calcularMulta(valor) {
  return Math.round(valor * PERCENTUAL_MULTA) / 100;
}
