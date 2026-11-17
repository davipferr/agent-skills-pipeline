export const CUPONS = {
  BEMVINDO10: { percentual: 10 },
  VOLTA15: { percentual: 15 },
};

export function aplicarCupom(total, codigo) {
  const cupom = CUPONS[codigo];
  if (!cupom) return total;
  return Math.round(total * (100 - cupom.percentual)) / 100;
}
