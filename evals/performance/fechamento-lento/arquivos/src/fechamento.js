import { buscarCotacao } from './cambio.js';

/** Uma linha por filial, na ordem recebida, com o total em reais. */
export function fechamentoDoMes(vendas, filiais) {
  const linhas = filiais.map((filial) => ({ id: filial.id, nome: filial.nome, totalBrl: 0 }));

  for (const venda of vendas) {
    const cotacao = buscarCotacao(venda.moeda, venda.data);
    const linha = linhas.find((item) => item.id === venda.filialId);
    linha.totalBrl += venda.valor * cotacao;
  }

  return linhas.map((linha) => ({ ...linha, totalBrl: Math.round(linha.totalBrl * 100) / 100 }));
}
