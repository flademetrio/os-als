-- V009__criar_tabela_veiculo.sql
-- Frota de veiculos da empresa usados em atendimentos externos.

CREATE TABLE veiculo (
    id              BIGSERIAL       PRIMARY KEY,
    placa           VARCHAR(8)      NOT NULL UNIQUE,
    marca           VARCHAR(40),
    modelo          VARCHAR(60),
    ano             INTEGER,
    status          VARCHAR(20)     NOT NULL DEFAULT 'ATIVO',
    ativo           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ,
    CONSTRAINT chk_veiculo_status CHECK (status IN ('ATIVO','MANUTENCAO','INATIVO'))
);

CREATE INDEX idx_veiculo_ativo ON veiculo (ativo) WHERE ativo = TRUE;
