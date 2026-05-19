-- V007__criar_tabela_unidade.sql
-- Unidade/filial do cliente (endereco onde estao os equipamentos).

CREATE TABLE unidade (
    id                      BIGSERIAL       PRIMARY KEY,
    cliente_id              BIGINT          NOT NULL REFERENCES cliente(id) ON DELETE CASCADE,
    identificacao_interna   VARCHAR(80)     NOT NULL,
    cep                     VARCHAR(8),
    logradouro              VARCHAR(160),
    numero                  VARCHAR(20),
    complemento             VARCHAR(80),
    bairro                  VARCHAR(80),
    cidade                  VARCHAR(80),
    estado                  VARCHAR(2),
    ativo                   BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ
);

CREATE INDEX idx_unidade_cliente ON unidade (cliente_id);
CREATE INDEX idx_unidade_ativo ON unidade (ativo) WHERE ativo = TRUE;
