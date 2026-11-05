export class Funcionario {
  constructor(nome, salario) {
    this.nome = nome;
    this.salario = salario;
  }

  valorMensal() {
    return this.salario;
  }
}
