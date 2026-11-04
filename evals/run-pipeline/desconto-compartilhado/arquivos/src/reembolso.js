import { aplicarDesconto } from './desconto.js';

const RETENCAO_POR_MOTIVO = { arrependimento: 0, produto_usado: 50, fora_do_prazo: 80 };

/** Quanto volta para o cliente depois de reter a parte que fica com a loja. */
export function valorDoReembolso(valorPago, motivo) {
  return aplicarDesconto(valorPago, RETENCAO_POR_MOTIVO[motivo] ?? 0);
}
