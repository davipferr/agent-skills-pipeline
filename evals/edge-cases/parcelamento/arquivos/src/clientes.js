// `limiteParcela` entrou em 2024. Clientes mais antigos têm null, o que significa sem limite.
export const CLIENTES = [
  { id: 1, nome: 'Cliente novo', limiteParcela: 500 },
  { id: 2, nome: 'Cliente antigo', limiteParcela: null },
];
