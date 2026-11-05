import { Plano } from './plano.js';
import { PlanoAnual } from './anual.js';
import { PlanoLegado } from './legado.js';

export const PLANOS = [
  new Plano('Básico', 29.9),
  new PlanoAnual('Anual', 29.9),
  new PlanoLegado('Legado', 0),
];
