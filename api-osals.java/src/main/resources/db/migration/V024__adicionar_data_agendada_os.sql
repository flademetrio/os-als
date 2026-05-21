-- V024__adicionar_data_agendada_os.sql
-- Data agendada da visita: dia em que a equipe ira ao cliente executar a OS.
-- Coluna anulavel — OS abertas antes desta versao nao possuem o dado.

ALTER TABLE ordem_servico ADD COLUMN data_agendada DATE;
