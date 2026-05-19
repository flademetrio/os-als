-- V010__criar_tabela_unidade_medida.sql
-- Catalogo de unidades de medida usadas nas pecas.

CREATE TABLE unidade_medida (
    id          SERIAL          PRIMARY KEY,
    sigla       VARCHAR(8)      NOT NULL UNIQUE,
    nome        VARCHAR(40)     NOT NULL
);

-- Seeds — idempotentes via ON CONFLICT
INSERT INTO unidade_medida (sigla, nome) VALUES
    ('un',  'Unidade'),
    ('pc',  'Peca'),
    ('m',   'Metro'),
    ('m2',  'Metro quadrado'),
    ('kg',  'Quilograma'),
    ('h',   'Hora'),
    ('BTU', 'BTU'),
    ('TR',  'Tonelada de Refrigeracao'),
    ('L',   'Litro'),
    ('mL',  'Mililitro')
ON CONFLICT (sigla) DO NOTHING;
