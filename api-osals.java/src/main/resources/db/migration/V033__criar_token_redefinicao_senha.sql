-- V033__criar_token_redefinicao_senha.sql
-- Tokens de redefinicao de senha por link (admin gera, usuario define a senha).
-- Guarda apenas o hash SHA-256 do token; uso unico (usado_em) e validade (expira_em).

CREATE TABLE token_redefinicao_senha (
    id          BIGSERIAL    PRIMARY KEY,
    usuario_id  BIGINT       NOT NULL REFERENCES usuario(id),
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    expira_em   TIMESTAMPTZ  NOT NULL,
    usado_em    TIMESTAMPTZ,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    created_by  BIGINT       NOT NULL REFERENCES usuario(id)
);

CREATE INDEX idx_token_redef_usuario ON token_redefinicao_senha (usuario_id);
