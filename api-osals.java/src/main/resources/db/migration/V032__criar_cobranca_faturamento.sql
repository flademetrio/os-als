-- V032__criar_cobranca_faturamento.sql
-- Cobranca (1:1 com servico) e Notas Fiscais (1:N) do faturamento.
-- Valores monetarios sempre em centavos. Backfill: todo servico existente ganha
-- uma cobranca SEM_COBRANCA (sem nulos). Concede as permissoes novas de
-- faturamento a quem ja tem as de custo.

CREATE TABLE cobranca (
    id                   BIGSERIAL    PRIMARY KEY,
    servico_id           BIGINT       NOT NULL UNIQUE REFERENCES servico(id),
    tipo                 VARCHAR(15)  NOT NULL DEFAULT 'SEM_COBRANCA',
    valor_centavos       BIGINT,
    dias_previstos       INTEGER,
    qtde_pessoas         INTEGER,
    obs                  TEXT,
    faturamento_status   VARCHAR(12)  NOT NULL DEFAULT 'AGUARDANDO',
    fechado_em           TIMESTAMPTZ,
    fechado_por          BIGINT       REFERENCES usuario(id),
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
    created_by           BIGINT       NOT NULL REFERENCES usuario(id),
    updated_at           TIMESTAMPTZ,
    updated_by           BIGINT       REFERENCES usuario(id),
    CONSTRAINT chk_cobranca_tipo CHECK (tipo IN ('COBRADO','GARANTIA','ORCAMENTO','SEM_COBRANCA')),
    CONSTRAINT chk_cobranca_status CHECK (faturamento_status IN ('AGUARDANDO','FECHADO')),
    CONSTRAINT chk_cobranca_valor CHECK (valor_centavos IS NULL OR valor_centavos >= 0)
);

CREATE TABLE nota_fiscal (
    id              BIGSERIAL    PRIMARY KEY,
    servico_id      BIGINT       NOT NULL REFERENCES servico(id),
    numero          VARCHAR(40)  NOT NULL,
    data_emissao    DATE         NOT NULL,
    valor_centavos  BIGINT       NOT NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    created_by      BIGINT       NOT NULL REFERENCES usuario(id),
    updated_at      TIMESTAMPTZ,
    updated_by      BIGINT       REFERENCES usuario(id),
    CONSTRAINT chk_nf_valor CHECK (valor_centavos >= 0)
);

CREATE INDEX idx_nota_fiscal_servico ON nota_fiscal (servico_id);

-- Backfill: cada servico recebe uma cobranca SEM_COBRANCA (autor = quem criou o servico).
INSERT INTO cobranca (servico_id, created_by)
SELECT s.id, s.created_by FROM servico s;

-- Permissoes novas: quem ja ve/edita custos passa a ver/editar faturamento.
INSERT INTO usuario_permissao (usuario_id, permissao)
SELECT up.usuario_id, 'FATURAMENTO_VER'
  FROM usuario_permissao up
 WHERE up.permissao = 'CUSTO_VER'
ON CONFLICT DO NOTHING;

INSERT INTO usuario_permissao (usuario_id, permissao)
SELECT up.usuario_id, 'FATURAMENTO_EDITAR'
  FROM usuario_permissao up
 WHERE up.permissao = 'CUSTO_EDITAR'
ON CONFLICT DO NOTHING;
