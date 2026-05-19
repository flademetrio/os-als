-- V011__criar_tabela_peca.sql
-- Catalogo de pecas/materiais. SEM controle de estoque (decisao V1).
-- Usado como referencia em lancamentos de custo livres.

CREATE TABLE peca (
    id                  BIGSERIAL       PRIMARY KEY,
    nome                VARCHAR(120)    NOT NULL,
    descricao           VARCHAR(255),
    unidade_medida_id   INTEGER         REFERENCES unidade_medida(id),
    ativo               BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ
);

CREATE INDEX idx_peca_nome ON peca (LOWER(nome));
CREATE INDEX idx_peca_ativo ON peca (ativo) WHERE ativo = TRUE;
