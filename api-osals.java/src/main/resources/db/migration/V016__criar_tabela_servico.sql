-- V016__criar_tabela_servico.sql
-- Nucleo do sistema: Servico. Vinculado a um Cliente e a um Tipo de Servico.
-- Numero sequencial global (exibido com 4 digitos: 0001). Ver documentacao/04 e 08.

CREATE SEQUENCE servico_numero_seq START 1;

CREATE TABLE servico (
    id                      BIGSERIAL       PRIMARY KEY,
    numero                  INTEGER         NOT NULL UNIQUE,
    cliente_id              BIGINT          NOT NULL REFERENCES cliente(id),
    tipo_servico_id         INTEGER         NOT NULL REFERENCES tipo_servico(id),
    descricao               TEXT            NOT NULL,
    data_inicio_prevista    DATE,
    data_fim_prevista       DATE,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'EM_ABERTO',
    finalizado_em           TIMESTAMPTZ,
    finalizado_por          BIGINT          REFERENCES usuario(id),
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT now(),
    created_by              BIGINT          NOT NULL REFERENCES usuario(id),
    updated_at              TIMESTAMPTZ,
    updated_by              BIGINT          REFERENCES usuario(id),
    CONSTRAINT chk_servico_status CHECK (
        status IN ('EM_ABERTO','EM_EXECUCAO','AGUARDANDO','CONCLUIDO','CANCELADO')
    )
);

CREATE INDEX idx_servico_cliente ON servico (cliente_id);
CREATE INDEX idx_servico_status ON servico (status);
CREATE INDEX idx_servico_tipo ON servico (tipo_servico_id);
