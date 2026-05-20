-- V019__criar_tabela_os_veiculo.sql
-- Juncao N:N: veiculos usados numa OS (opcional).

CREATE TABLE os_veiculo (
    os_id       BIGINT  NOT NULL REFERENCES ordem_servico(id) ON DELETE CASCADE,
    veiculo_id  BIGINT  NOT NULL REFERENCES veiculo(id),
    PRIMARY KEY (os_id, veiculo_id)
);

CREATE INDEX idx_os_veiculo_veiculo ON os_veiculo (veiculo_id);
