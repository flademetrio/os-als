-- V015__criar_tabela_configuracao.sql
-- Chave/valor generico para configuracoes globais do sistema, editaveis pelo admin.
-- Ver documentacao/08-modelo-de-dados.md §3.

CREATE TABLE configuracao (
    chave           VARCHAR(60)     PRIMARY KEY,
    valor           VARCHAR(255)    NOT NULL,
    tipo            VARCHAR(20)     NOT NULL,
    descricao       VARCHAR(255),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_by      BIGINT          REFERENCES usuario(id),
    CONSTRAINT chk_configuracao_tipo CHECK (tipo IN ('NUMBER','STRING','BOOLEAN'))
);

-- Seeds — chaves essenciais da V1.
INSERT INTO configuracao (chave, valor, tipo, descricao) VALUES
    ('markup_percentual',  '30.00', 'NUMBER',
     'Aliquota percentual aplicada sobre o custo total para calcular preco de venda'),
    ('valor_km_centavos',  '150',   'NUMBER',
     'Valor por quilometro de deslocamento, em centavos (R$ 1,50 = 150)')
ON CONFLICT (chave) DO NOTHING;
