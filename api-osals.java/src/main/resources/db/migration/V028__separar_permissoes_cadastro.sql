-- V028__separar_permissoes_cadastro.sql
-- Separa as permissoes globais de cadastro (CADASTRO_VER / CADASTRO_GERENCIAR)
-- em permissoes por tipo (cliente, equipamento, peca, fornecedor, veiculo,
-- tecnico). Preserva o acesso atual: quem tinha o global passa a ter as 6
-- equivalentes. Unidade-de-medida vira visivel a qualquer autenticado (tratado
-- no codigo, sem permissao propria).

-- VER global -> 6 VER por tipo
INSERT INTO usuario_permissao (usuario_id, permissao)
SELECT up.usuario_id, n.permissao
  FROM usuario_permissao up
 CROSS JOIN (VALUES ('CLIENTE_VER'),('EQUIPAMENTO_VER'),('PECA_VER'),
                    ('FORNECEDOR_VER'),('VEICULO_VER'),('TECNICO_VER')) AS n(permissao)
 WHERE up.permissao = 'CADASTRO_VER'
ON CONFLICT DO NOTHING;

-- GERENCIAR global -> 6 GERENCIAR por tipo
INSERT INTO usuario_permissao (usuario_id, permissao)
SELECT up.usuario_id, n.permissao
  FROM usuario_permissao up
 CROSS JOIN (VALUES ('CLIENTE_GERENCIAR'),('EQUIPAMENTO_GERENCIAR'),('PECA_GERENCIAR'),
                    ('FORNECEDOR_GERENCIAR'),('VEICULO_GERENCIAR'),('TECNICO_GERENCIAR')) AS n(permissao)
 WHERE up.permissao = 'CADASTRO_GERENCIAR'
ON CONFLICT DO NOTHING;

-- Remove as permissoes globais antigas
DELETE FROM usuario_permissao WHERE permissao IN ('CADASTRO_VER','CADASTRO_GERENCIAR');
