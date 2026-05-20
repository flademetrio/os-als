-- V018__criar_tabela_os_tecnico.sql
-- Juncao N:N: tecnicos envolvidos numa OS (1..N obrigatorio).

CREATE TABLE os_tecnico (
    os_id       BIGINT  NOT NULL REFERENCES ordem_servico(id) ON DELETE CASCADE,
    tecnico_id  BIGINT  NOT NULL REFERENCES tecnico(usuario_id),
    PRIMARY KEY (os_id, tecnico_id)
);

CREATE INDEX idx_os_tecnico_tecnico ON os_tecnico (tecnico_id);
