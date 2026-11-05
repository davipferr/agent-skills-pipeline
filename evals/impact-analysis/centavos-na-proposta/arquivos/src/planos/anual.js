import { Plano } from './plano.js';

export class PlanoAnual extends Plano {
  valorMensal() {
    return super.valorMensal() * 0.9;
  }
}
