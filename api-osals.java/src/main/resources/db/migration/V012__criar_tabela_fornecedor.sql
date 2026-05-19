-- V012__criar_tabela_fornecedor.sql
-- Cadastro de fornecedores (pecas, terceiros, etc.). Sem vinculo de estoque.

CREATE TABLE fornecedor (
    id              BIGSERIAL       PRIMARY KEY,
    nome            VARCHAR(160)    NOT NULL,
    tipo_pessoa     VARCHAR(2),
    documento       VARCHAR(14),
    telefone        VARCHAR(20),
    email           VARCHAR(160),
    ativo           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ,
    CONSTRAINT chk_fornecedor_tipo_pessoa CHECK (tipo_pessoa IS NULL OR tipo_pessoa IN ('PF','PJ'))
);

CREATE INDEX idx_fornecedor_nome ON fornecedor (LOWER(nome));
CREATE INDEX idx_fornecedor_ativo ON fornecedor (ativo) WHERE ativo = TRUE;
