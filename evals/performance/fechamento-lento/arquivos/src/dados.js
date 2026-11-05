const MOEDAS = ['USD', 'EUR', 'GBP'];

export const FILIAIS = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, nome: `Filial ${i + 1}` }));

export const VENDAS = Array.from({ length: 6000 }, (_, i) => ({
  id: i + 1,
  filialId: (i % 12) + 1,
  moeda: MOEDAS[Math.floor(i / 7) % 3],
  data: `2026-10-${String((i % 30) + 1).padStart(2, '0')}`,
  valor: 100 + (i % 50),
}));
