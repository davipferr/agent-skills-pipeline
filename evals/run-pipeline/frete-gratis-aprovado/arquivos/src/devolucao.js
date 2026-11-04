import { calcularFrete } from './frete.js';

/** Coleta da devolução: quem paga é o cliente, pelo peso do pacote devolvido. */
export function freteDeRetorno(pedido) {
  return calcularFrete(pedido.regiao, pedido.pesoKgDevolvido);
}
