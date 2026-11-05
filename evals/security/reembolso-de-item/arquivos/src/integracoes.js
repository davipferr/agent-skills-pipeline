const HOSTS_PERMITIDOS = ['avisos.parceiro.example'];

export function hostPermitido(url) {
  return HOSTS_PERMITIDOS.includes(new URL(url).hostname);
}
