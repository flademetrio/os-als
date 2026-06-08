-- V026__criar_permissoes_usuario.sql
-- Fase 1 do sistema de autorizacao por permissoes:
--  1. Novo papel COMPRAS (operador focado em custos/compras)
--  2. Tabela usuario_permissao (permissoes concedidas por usuario)
--  3. Reclassifica o usuario de compras para o papel COMPRAS
--  4. Seed das permissoes de cada usuario conforme o preset do seu papel

-- 1. Permitir o novo papel COMPRAS no CHECK existente
ALTER TABLE usuario DROP CONSTRAINT chk_usuario_papel;
ALTER TABLE usuario ADD CONSTRAINT chk_usuario_papel
    CHECK (papel IN ('OPERADOR','COMPRAS','GERENTE','ADMIN','TECNICO'));

-- 2. Tabela de permissoes concedidas por usuario
CREATE TABLE usuario_permissao (
    usuario_id  BIGINT       NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    permissao   VARCHAR(40)  NOT NULL,
    PRIMARY KEY (usuario_id, permissao)
);
CREATE INDEX idx_usuario_permissao_usuario ON usuario_permissao(usuario_id);

-- 3. Reclassificar o usuario de compras (era OPERADOR generico)
UPDATE usuario
   SET papel = 'COMPRAS', updated_at = now()
 WHERE email = 'compra@alsindustria.com.br';

-- 4. Seed das permissoes por preset de papel.
--    A chave persistida e' o NOME da constante do enum Permissao.
--    ADMIN recebe todas as permissoes implicitamente em runtime
--    (Usuario.permissoesEfetivas), mas tambem gravamos para a UI ficar fiel.

-- ADMIN: todas
INSERT INTO usuario_permissao (usuario_id, permissao)
SELECT u.id, p.permissao
  FROM usuario u
 CROSS JOIN (VALUES
        ('SERVICO_VER'),('SERVICO_GERENCIAR'),('SERVICO_EXCLUIR'),
        ('CUSTO_VER'),('CUSTO_EDITAR'),
        ('RELATORIO_VER'),
        ('CADASTRO_VER'),('CADASTRO_GERENCIAR'),
        ('CONFIG_GERENCIAR'),
        ('USUARIO_GERENCIAR')
       ) AS p(permissao)
 WHERE u.papel = 'ADMIN';

-- GERENTE
INSERT INTO usuario_permissao (usuario_id, permissao)
SELECT u.id, p.permissao
  FROM usuario u
 CROSS JOIN (VALUES
        ('SERVICO_VER'),('SERVICO_GERENCIAR'),('SERVICO_EXCLUIR'),
        ('CUSTO_VER'),('CUSTO_EDITAR'),
        ('RELATORIO_VER'),
        ('CADASTRO_VER'),('CADASTRO_GERENCIAR'),
        ('CONFIG_GERENCIAR')
       ) AS p(permissao)
 WHERE u.papel = 'GERENTE';

-- COMPRAS
INSERT INTO usuario_permissao (usuario_id, permissao)
SELECT u.id, p.permissao
  FROM usuario u
 CROSS JOIN (VALUES
        ('SERVICO_VER'),
        ('CUSTO_VER'),('CUSTO_EDITAR'),
        ('RELATORIO_VER'),
        ('CADASTRO_VER'),('CADASTRO_GERENCIAR')
       ) AS p(permissao)
 WHERE u.papel = 'COMPRAS';

-- OPERADOR
INSERT INTO usuario_permissao (usuario_id, permissao)
SELECT u.id, p.permissao
  FROM usuario u
 CROSS JOIN (VALUES
        ('SERVICO_VER'),('SERVICO_GERENCIAR'),
        ('CADASTRO_VER'),('CADASTRO_GERENCIAR')
       ) AS p(permissao)
 WHERE u.papel = 'OPERADOR';

-- TECNICO
INSERT INTO usuario_permissao (usuario_id, permissao)
SELECT u.id, p.permissao
  FROM usuario u
 CROSS JOIN (VALUES
        ('SERVICO_VER'),
        ('CADASTRO_VER')
       ) AS p(permissao)
 WHERE u.papel = 'TECNICO';
