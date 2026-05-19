-- V005__criar_tabela_cliente.sql
-- Cadastro de cliente (PF ou PJ). Documento armazenado apenas com digitos.

CREATE TABLE cliente (
    id              BIGSERIAL       PRIMARY KEY,
    tipo_pessoa     VARCHAR(2)      NOT NULL,
    documento       VARCHAR(14)     NOT NULL UNIQUE,
    nome            VARCHAR(160)    NOT NULL,
    nome_fantasia   VARCHAR(160),
    ativo           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    created_by      BIGINT          NOT NULL REFERENCES usuario(id),
    updated_at      TIMESTAMPTZ,
    updated_by      BIGINT          REFERENCES usuario(id),
    CONSTRAINT chk_cliente_tipo_pessoa CHECK (tipo_pessoa IN ('PF','PJ'))
);

CREATE INDEX idx_cliente_nome ON cliente (LOWER(nome));
CREATE INDEX idx_cliente_ativo ON cliente (ativo) WHERE ativo = TRUE;
