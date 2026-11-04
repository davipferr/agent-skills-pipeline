import { aplicarDesconto } from './desconto.js';

const DESCONTO_POR_NIVEL = { padrao: 0, ouro: 10, vip: 20 };
const CUPONS = { BEMVINDO: 5, FIDELIDADE: 15 };

export function totalDoPedido(itens, nivel, cupom) {
  const subtotal = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
  const percentual = (DESCONTO_POR_NIVEL[nivel] ?? 0) + (CUPONS[cupom] ?? 0);
  return aplicarDesconto(subtotal, percentual);
}
