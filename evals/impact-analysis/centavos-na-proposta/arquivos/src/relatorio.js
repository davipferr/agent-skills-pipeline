import { readFileSync } from 'node:fs';

const { periodo } = JSON.parse(readFileSync(new URL('../config/relatorio.json', import.meta.url), 'utf8'));

export function receitaPrevista(planos) {
  const total = planos.reduce((soma, plano) => soma + plano[`valor${periodo}`](), 0);
  return `R$ ${total.toFixed(2)}`;
}
