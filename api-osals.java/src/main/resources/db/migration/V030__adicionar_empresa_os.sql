-- V030__adicionar_empresa_os.sql
-- Empresa responsavel pela OS (ALS ou FRYO), usada para separar relatorios.
-- OS existentes recebem ALS via DEFAULT, evitando valores nulos.

ALTER TABLE ordem_servico
    ADD COLUMN empresa VARCHAR(10) NOT NULL DEFAULT 'ALS';

ALTER TABLE ordem_servico
    ADD CONSTRAINT chk_os_empresa CHECK (empresa IN ('ALS', 'FRYO'));

CREATE INDEX idx_os_empresa ON ordem_servico (empresa);
