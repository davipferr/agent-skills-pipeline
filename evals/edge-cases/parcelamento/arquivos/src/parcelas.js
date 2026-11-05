export function dividirEmParcelas(total, quantidade) {
  const valor = Math.round((total / quantidade) * 100) / 100;
  return Array.from({ length: quantidade }, () => valor);
}

export function vencimentos(primeiroVencimento, quantidade) {
  return Array.from({ length: quantidade }, (_, i) => {
    const data = new Date(primeiroVencimento);
    data.setMonth(data.getMonth() + i);
    return data;
  });
}

export function cabeNoLimite(cliente, valorDaParcela) {
  return valorDaParcela <= cliente.limiteParcela;
}
