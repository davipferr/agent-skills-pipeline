/** Devolve o valor depois de tirar o percentual, com duas casas decimais. */
export function aplicarDesconto(valor, percentual) {
  return Math.round(valor * (100 - percentual)) / 100;
}
