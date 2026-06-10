-- V029__permissao_editar_os.sql
-- Nova permissao ORDEM_SERVICO_EDITAR (editar dados de uma OS nao encerrada).
-- Concedida a quem ja gerencia OS (mesmo criterio: tem SERVICO_GERENCIAR),
-- preservando o comportamento atual. Admin recebe tudo implicitamente.

INSERT INTO usuario_permissao (usuario_id, permissao)
SELECT up.usuario_id, 'ORDEM_SERVICO_EDITAR'
  FROM usuario_permissao up
 WHERE up.permissao = 'SERVICO_GERENCIAR'
ON CONFLICT DO NOTHING;
