// Simula o serviço de câmbio. Em produção, cada chamada é uma requisição HTTP.
export const contador = { chamadas: 0 };

const BASE = { USD: 5, EUR: 6, GBP: 7 };

export function buscarCotacao(moeda, data) {
  contador.chamadas++;
  return BASE[moeda] + Number(data.slice(8, 10)) / 100;
}
