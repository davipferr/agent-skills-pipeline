import { encargo } from './regras/index.js';

/** Parcela de um acordo assinado: o encargo é o do contrato, 2%, e não muda depois da assinatura. */
export function valorDaParcela(divida, parcelas) {
  return (divida.valor + encargo(divida.valor)) / parcelas;
}
