-- V021__criar_tabela_lancamento_custo.sql
-- Lancamentos de custo de um Servico. Tabela unica para as 5 categorias —
-- colunas especificas (mao de obra, deslocamento) ficam nulas quando nao se aplicam.
-- Valores monetarios sempre em centavos. Ver documentacao/06 e 08.

CREATE TABLE lancamento_custo (
    id                              BIGSERIAL       PRIMARY KEY,
    servico_id                      BIGINT          NOT NULL REFERENCES servico(id),
    categoria_custo_id              INTEGER         NOT NULL REFERENCES categoria_custo(id),
    descricao                       VARCHAR(255),
    valor_total_centavos            BIGINT          NOT NULL,

    -- Mao de obra (categoria ESTRUTURADO_MAO_OBRA)
    tecnico_id                      BIGINT          REFERENCES tecnico(usuario_id),
    horas                           NUMERIC(6,2),
    valor_hora_snapshot_centavos    BIGINT,

    -- Deslocamento (categoria ESTRUTURADO_DESLOCAMENTO)
    km                              NUMERIC(8,2),
    valor_km_snapshot_centavos      BIGINT,

    -- Auditoria
    created_at                      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    created_by                      BIGINT          NOT NULL REFERENCES usuario(id),
    updated_at                      TIMESTAMPTZ,
    updated_by                      BIGINT          REFERENCES usuario(id),

    CONSTRAINT chk_lancamento_valor_nao_negativo CHECK (valor_total_centavos >= 0)
);

CREATE INDEX idx_lancamento_servico ON lancamento_custo (servico_id);
CREATE INDEX idx_lancamento_categoria ON lancamento_custo (categoria_custo_id);
