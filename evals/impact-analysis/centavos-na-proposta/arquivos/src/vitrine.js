export function maisBarato(planos) {
  return [...planos].sort((a, b) => a.valorMensal() - b.valorMensal())[0];
}
