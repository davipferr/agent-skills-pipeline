const CHAVE_GATEWAY = 'gw_live_exemplo_0000';

export function cabecalhosGateway() {
  return { Authorization: `Bearer ${CHAVE_GATEWAY}` };
}
