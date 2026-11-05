import { hostPermitido } from './integracoes.js';

export async function avisarParceiro(url, dados) {
  if (!hostPermitido(url)) throw new Error('Endereço não permitido');
  await fetch(url, { method: 'POST', body: JSON.stringify(dados) });
}
