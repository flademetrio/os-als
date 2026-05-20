-- V017__criar_tabela_ordem_servico.sql
-- Ordem de Servico (OS): atividade operacional dentro de um Servico.
-- Numero sequencial global (exibido com 5 digitos: 00012). Ver documentacao/04 e 08.

CREATE SEQUENCE os_numero_seq START 1;

CREATE TABLE ordem_servico (
    id                      BIGSERIAL       PRIMARY KEY,
    numero                  INTEGER         NOT NULL UNIQUE,
    servico_id              BIGINT          NOT NULL REFERENCES servico(id),
    descricao_atividade     TEXT            NOT NULL,
    status                  VARCHAR(25)     NOT NULL DEFAULT 'ABERTA',
    data_abertura           TIMESTAMPTZ     NOT NULL DEFAULT now(),
    data_impressao          TIMESTAMPTZ,
    hora_inicio_execucao    TIMESTAMPTZ,
    hora_fim_execucao       TIMESTAMPTZ,
    o_que_foi_feito         TEXT,
    observacoes             TEXT,
    impedimentos            TEXT,
    digitado_em             TIMESTAMPTZ,
    digitado_por            BIGINT          REFERENCES usuario(id),
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT now(),
    created_by              BIGINT          NOT NULL REFERENCES usuario(id),
    CONSTRAINT chk_os_status CHECK (
        status IN ('ABERTA','IMPRESSA','PENDENTE_DIGITACAO','CONCLUIDA','CANCELADA')
    )
);

CREATE INDEX idx_os_servico ON ordem_servico (servico_id);
CREATE INDEX idx_os_status ON ordem_servico (status);
