// Simula o banco. Em produção, `query` usa parâmetros do driver quando recebe `params`.
const tabelas = {
  pedidos: [
    { id: 1, clienteId: 10 },
    { id: 2, clienteId: 20 },
  ],
  itens: [
    { id: 100, pedidoId: 1, preco: 50 },
    { id: 200, pedidoId: 2, preco: 900 },
  ],
  reembolsos: [],
};

export const db = {
  query(sql, params = []) {
    const tabela = /FROM (\w+)/.exec(sql)[1];
    const colunas = [...sql.matchAll(/(\w+) = \?/g)].map((achado) => achado[1]);
    return tabelas[tabela].filter((linha) => colunas.every((coluna, i) => linha[coluna] === params[i]));
  },
  salvar(tabela, registro) {
    const salvo = { ...registro, id: tabelas[tabela].length + 1 };
    tabelas[tabela].push(salvo);
    return salvo;
  },
};
