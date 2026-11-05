# Cadastro

Cadastro de clientes em MySQL 8. Cada cliente da empresa tem o próprio banco: `loja_norte`, `loja_sul` e `loja_centro`. O maior, `loja_norte`, tem cerca de 3 milhões de registros em `clientes`.

Este repositório não guarda mudanças de banco. Os scripts vão no chamado e o DBA executa em cada banco. O arquivo `docs/schema.sql` é só uma referência da estrutura.

Os servidores são atualizados um por vez, sem janela de manutenção.
