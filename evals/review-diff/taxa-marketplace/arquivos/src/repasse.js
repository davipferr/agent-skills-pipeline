import { calcularTaxa } from './taxas.js';

export function registrarRepasse(venda) {
  const taxa = calcularTaxa(venda.valor);
  return { ...venda, taxaCobrada: taxa, repasse: venda.valor - taxa };
}
