-- V031__mover_empresa_de_os_para_servico.sql
-- A empresa (ALS/FRYO) foi colocada por engano na Ordem de Servico (V030).
-- O lugar correto e o Servico. Aqui removemos da OS e adicionamos no Servico,
-- preenchendo os servicos existentes com ALS via DEFAULT (sem nulos).

-- Remove da ordem_servico (DROP COLUMN derruba o CHECK e o indice dependentes).
ALTER TABLE ordem_servico DROP COLUMN empresa;

-- Adiciona no servico.
ALTER TABLE servico
    ADD COLUMN empresa VARCHAR(10) NOT NULL DEFAULT 'ALS';

ALTER TABLE servico
    ADD CONSTRAINT chk_servico_empresa CHECK (empresa IN ('ALS', 'FRYO'));

CREATE INDEX idx_servico_empresa ON servico (empresa);
