const BASE_POR_REGIAO = { sul: 15, sudeste: 12, norte: 30 };
const POR_KG_EXCEDENTE = 4;

/** Frete de uma entrega: a base da região mais R$ 4 por kg acima de 5 kg. */
export function calcularFrete(regiao, pesoKg) {
  const base = BASE_POR_REGIAO[regiao] ?? 30;
  return base + Math.max(0, pesoKg - 5) * POR_KG_EXCEDENTE;
}
