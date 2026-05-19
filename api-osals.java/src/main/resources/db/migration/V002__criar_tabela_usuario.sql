-- V002__criar_tabela_usuario.sql
-- Tabela de usuarios do sistema (operadores, gerentes, admins, tecnicos).

CREATE TABLE usuario (
    id                  BIGSERIAL       PRIMARY KEY,
    nome                VARCHAR(120)    NOT NULL,
    email               VARCHAR(160)    NOT NULL UNIQUE,
    senha_hash          VARCHAR(255)    NOT NULL,
    papel               VARCHAR(20)     NOT NULL,
    ativo               BOOLEAN         NOT NULL DEFAULT TRUE,
    versao_token        INTEGER         NOT NULL DEFAULT 1,
    tentativas_login    INTEGER         NOT NULL DEFAULT 0,
    bloqueado_ate       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ,
    CONSTRAINT chk_usuario_papel CHECK (papel IN ('OPERADOR','GERENTE','ADMIN','TECNICO'))
);

CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_ativo ON usuario(ativo) WHERE ativo = TRUE;
