-- V020__criar_tabela_os_equipamento.sql
-- Juncao N:N: equipamentos atendidos numa OS (1..N obrigatorio).
-- Alimenta o historico de manutencao por equipamento.

CREATE TABLE os_equipamento (
    os_id           BIGINT  NOT NULL REFERENCES ordem_servico(id) ON DELETE CASCADE,
    equipamento_id  BIGINT  NOT NULL REFERENCES equipamento(id),
    PRIMARY KEY (os_id, equipamento_id)
);

CREATE INDEX idx_os_equipamento_equipamento ON os_equipamento (equipamento_id);
