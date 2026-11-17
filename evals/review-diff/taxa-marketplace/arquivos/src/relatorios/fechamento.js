export function fechamentoMensal(vendas) {
  const bruto = vendas.reduce((soma, venda) => soma + venda.valor, 0);
  const receitaPlataforma = Math.round(bruto * 10) / 100;
  return { bruto, receitaPlataforma, repassado: bruto - receitaPlataforma };
}
