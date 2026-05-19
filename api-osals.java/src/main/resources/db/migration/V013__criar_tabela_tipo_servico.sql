-- V013__criar_tabela_tipo_servico.sql
-- Lista configuravel pelo admin. Admin pode renomear e ativar/desativar,
-- mas NAO pode criar novos tipos nesta versao (decisao V1).

CREATE TABLE tipo_servico (
    id      SERIAL          PRIMARY KEY,
    nome    VARCHAR(80)     NOT NULL UNIQUE,
    ativo   BOOLEAN         NOT NULL DEFAULT TRUE
);

-- Seeds: 5 tipos da operacao da empresa (ver documentacao/03)
INSERT INTO tipo_servico (nome) VALUES
    ('Instalacao'),
    ('Manutencao preventiva'),
    ('Manutencao corretiva'),
    ('Higienizacao e limpeza'),
    ('Montagem')
ON CONFLICT (nome) DO NOTHING;
