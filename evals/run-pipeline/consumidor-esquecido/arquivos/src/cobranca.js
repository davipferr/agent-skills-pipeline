import { calcularMulta } from './multa.js';

/** Quanto o cliente paga por uma fatura vencida. */
export function valorEmAtraso(fatura) {
  return fatura.valor + calcularMulta(fatura.valor);
}
