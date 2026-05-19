-- V008__criar_tabela_equipamento.sql
-- Inventario de equipamentos de climatizacao instalados nas unidades dos clientes.
-- Coracao do dominio — fonte de historico de manutencao via OS.

CREATE TABLE equipamento (
    id                      BIGSERIAL       PRIMARY KEY,
    unidade_id              BIGINT          NOT NULL REFERENCES unidade(id) ON DELETE CASCADE,
    marca                   VARCHAR(60),
    modelo                  VARCHAR(60),
    numero_serie            VARCHAR(60),
    tipo                    VARCHAR(20)     NOT NULL,
    capacidade_btus         INTEGER,
    capacidade_tr           NUMERIC(6,2),
    localizacao_interna     VARCHAR(120),
    data_instalacao         DATE,
    data_ultima_manutencao  DATE,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'ATIVO',
    ativo                   BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ,
    CONSTRAINT chk_equipamento_tipo CHECK (tipo IN
        ('SPLIT','MULTI_SPLIT','VRF','SELF','CHILLER','FAN_COIL','JANELA','OUTRO')),
    CONSTRAINT chk_equipamento_status CHECK (status IN
        ('ATIVO','EM_MANUTENCAO','DESATIVADO'))
);

CREATE INDEX idx_equipamento_unidade ON equipamento (unidade_id);
CREATE INDEX idx_equipamento_status ON equipamento (status);
CREATE INDEX idx_equipamento_ativo ON equipamento (ativo) WHERE ativo = TRUE;
