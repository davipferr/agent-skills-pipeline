import { cabeNoLimite, dividirEmParcelas, vencimentos } from './parcelas.js';

export function simularParcelamento(cliente, pedido) {
  if (!(pedido.total > 0)) throw new Error('Total inválido');
  if (!Number.isInteger(pedido.quantidade) || pedido.quantidade < 1 || pedido.quantidade > 12) {
    throw new Error('Quantidade de parcelas inválida');
  }
  const parcelas = dividirEmParcelas(pedido.total, pedido.quantidade);
  if (!cabeNoLimite(cliente, parcelas[0])) throw new Error('Parcela acima do limite');
  return { parcelas, vencimentos: vencimentos(pedido.primeiroVencimento, pedido.quantidade) };
}
