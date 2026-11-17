export const PARCELAS_SEM_JUROS = 3;
export const MAXIMO_PARCELAS_CARTAO = 10;
const JUROS_AO_MES = 0.0199;

export function valorParcela(total, quantidade) {
  if (quantidade > MAXIMO_PARCELAS_CARTAO) throw new Error(`Cartão em até ${MAXIMO_PARCELAS_CARTAO} parcelas`);
  if (quantidade <= PARCELAS_SEM_JUROS) return arredondar(total / quantidade);
  const fator = (JUROS_AO_MES * (1 + JUROS_AO_MES) ** quantidade) / ((1 + JUROS_AO_MES) ** quantidade - 1);
  return arredondar(total * fator);
}

export function temJuros(quantidade) {
  return quantidade > PARCELAS_SEM_JUROS;
}

const arredondar = (valor) => Math.round(valor * 100) / 100;
