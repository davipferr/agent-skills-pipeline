CREATE TABLE clientes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  cpf VARCHAR(14) NULL,
  data_nascimento VARCHAR(10) NULL,
  UNIQUE KEY uk_clientes_cpf (cpf)
);
