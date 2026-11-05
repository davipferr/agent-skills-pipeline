// Simula o banco. Em produção, `query` usa parâmetros do driver quando recebe `params`.
const PEDIDOS = [
  { id: 1, clienteId: 10 },
  { id: 2, clienteId: 20 },
];

export const db = {
  ultimaConsulta: '',
  query(sql, params = []) {
    this.ultimaConsulta = sql;
    const id = params[0] ?? Number(/id = (\d+)/.exec(sql)?.[1]);
    return PEDIDOS.filter((pedido) => pedido.id === id);
  },
};
