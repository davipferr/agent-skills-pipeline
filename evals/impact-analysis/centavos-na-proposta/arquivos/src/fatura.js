export function linhaDaFatura(plano) {
  return `${plano.nome}: R$ ${plano.valorMensal().toFixed(2)}`;
}
