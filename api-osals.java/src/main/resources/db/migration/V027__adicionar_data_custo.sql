-- V027__adicionar_data_custo.sql
-- Data a que o custo se refere (competencia), distinta de created_at (quando o
-- registro foi lancado no sistema). Backfill dos lancamentos antigos com a data
-- de criacao antes de tornar a coluna obrigatoria.

ALTER TABLE lancamento_custo ADD COLUMN data_custo DATE;
UPDATE lancamento_custo SET data_custo = created_at::date WHERE data_custo IS NULL;
ALTER TABLE lancamento_custo ALTER COLUMN data_custo SET NOT NULL;
