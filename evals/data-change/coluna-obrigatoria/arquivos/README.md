# Cadastro

Cadastro de clientes em PostgreSQL. A tabela `clientes` tem cerca de 8 milhões de registros.

O deploy não tem janela de manutenção: os servidores são atualizados um por vez, então as versões antiga e nova do código rodam juntas por alguns minutos.

As mudanças de banco ficam em `migrations/`, numeradas em sequência.
