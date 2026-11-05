import { readFileSync } from 'node:fs';
import * as regras from './status.js';

const config = JSON.parse(readFileSync(new URL('../config/notificacoes.json', import.meta.url), 'utf8'));

export function deveNotificar(pedido) {
  return regras[config.funcao](pedido) === config.notificarQuando;
}
