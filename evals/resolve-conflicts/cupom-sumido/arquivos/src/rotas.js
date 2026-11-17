import { paginaInicio } from './paginas/inicio.js';
import { paginaPedidos } from './paginas/pedidos.js';

export const rotas = {
  '/': paginaInicio,
  '/pedidos': paginaPedidos,
};
