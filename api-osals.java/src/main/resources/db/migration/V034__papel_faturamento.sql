-- V034__papel_faturamento.sql
-- Novo papel FATURAMENTO: ve tudo (menos custos), edita so o faturamento
-- (lancar NF, fechar) e anexa scan. So relaxa o CHECK do papel; o admin
-- atribui o papel pela tela de Usuarios (sem seed de usuario).

ALTER TABLE usuario DROP CONSTRAINT chk_usuario_papel;
ALTER TABLE usuario ADD CONSTRAINT chk_usuario_papel
    CHECK (papel IN ('OPERADOR','COMPRAS','GERENTE','ADMIN','TECNICO','FATURAMENTO'));
