export class Plano {
  constructor(nome, preco) {
    this.nome = nome;
    this.preco = preco;
  }

  valorMensal() {
    return this.preco;
  }

  valorAnual() {
    return this.valorMensal() * 12;
  }
}
