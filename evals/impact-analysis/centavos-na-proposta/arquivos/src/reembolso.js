import { readFileSync } from 'node:fs';

const cobrancas = JSON.parse(readFileSync(new URL('../dados/cobrancas.json', import.meta.url), 'utf8'));

export function diferencaParaEstorno(clienteId, plano) {
  const cobranca = cobrancas.find((item) => item.cliente === clienteId);
  return cobranca.valorCobrado - plano.valorMensal();
}
