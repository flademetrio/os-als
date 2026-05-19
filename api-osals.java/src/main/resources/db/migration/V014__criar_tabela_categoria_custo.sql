-- V014__criar_tabela_categoria_custo.sql
-- 5 categorias de custo da V1. Admin pode renomear e ativar/desativar,
-- mas NAO pode criar novas categorias (cada tipo_lancamento esta acoplado a
-- comportamento no codigo) — ver documentacao/08 e [16].
--
-- codigo = identificador estavel usado no app.
-- tipo_lancamento: ESTRUTURADO_MAO_OBRA, ESTRUTURADO_DESLOCAMENTO, LIVRE.

CREATE TABLE categoria_custo (
    id                  SERIAL          PRIMARY KEY,
    codigo              VARCHAR(20)     NOT NULL UNIQUE,
    nome                VARCHAR(60)     NOT NULL UNIQUE,
    tipo_lancamento     VARCHAR(30)     NOT NULL,
    ativo               BOOLEAN         NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_categoria_custo_tipo CHECK (tipo_lancamento IN
        ('ESTRUTURADO_MAO_OBRA','ESTRUTURADO_DESLOCAMENTO','LIVRE'))
);

-- Seeds — 5 categorias confirmadas em [06-custos.md]
INSERT INTO categoria_custo (codigo, nome, tipo_lancamento) VALUES
    ('MAO_OBRA',     'Mao de obra',                  'ESTRUTURADO_MAO_OBRA'),
    ('DESLOCAMENTO', 'Deslocamento',                 'ESTRUTURADO_DESLOCAMENTO'),
    ('PECAS',        'Pecas e materiais',            'LIVRE'),
    ('TERCEIROS',    'Terceiros',                    'LIVRE'),
    ('HOSPEDAGEM',   'Hospedagem e alimentacao',     'LIVRE')
ON CONFLICT (codigo) DO NOTHING;
