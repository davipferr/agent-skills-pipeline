export const DESCONTO_VIP = 0.1;

export function calcularDesconto(cliente, total) {
  if (!cliente.vip) return 0;
  return arredondar(total * DESCONTO_VIP);
}

const arredondar = (valor) => Math.round(valor * 100) / 100;
