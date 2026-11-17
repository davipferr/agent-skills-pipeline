export function resumoCarrinho(cliente, itens) {
  const total = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
  const desconto = cliente.vip ? Math.round(total * 0.1 * 100) / 100 : 0;
  return { total, desconto, aPagar: total - desconto };
}
