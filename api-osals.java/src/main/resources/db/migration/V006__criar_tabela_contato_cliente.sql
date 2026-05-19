-- V006__criar_tabela_contato_cliente.sql
-- Multiplos contatos por cliente (responsavel tecnico, comercial, etc.).

CREATE TABLE contato_cliente (
    id          BIGSERIAL       PRIMARY KEY,
    cliente_id  BIGINT          NOT NULL REFERENCES cliente(id) ON DELETE CASCADE,
    nome        VARCHAR(120)    NOT NULL,
    funcao      VARCHAR(60),
    telefone    VARCHAR(20),
    email       VARCHAR(160),
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ
);

CREATE INDEX idx_contato_cliente_cliente ON contato_cliente (cliente_id);
