-- V022__criar_tabela_anexo_servico.sql
-- Anexos PDF de um Servico — multiplos por servico, sem categoria fixa.
-- O arquivo fisico fica no storage (filesystem na V1); a tabela guarda
-- apenas os metadados e a storage_key. Ver documentacao/13-anexos.md.

CREATE TABLE anexo_servico (
    id              BIGSERIAL       PRIMARY KEY,
    servico_id      BIGINT          NOT NULL REFERENCES servico(id),
    nome_arquivo    VARCHAR(255)    NOT NULL,
    descricao       VARCHAR(255),
    storage_key     VARCHAR(500)    NOT NULL,
    content_type    VARCHAR(60)     NOT NULL DEFAULT 'application/pdf',
    tamanho_bytes   BIGINT          NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    created_by      BIGINT          NOT NULL REFERENCES usuario(id)
);

CREATE INDEX idx_anexo_servico_servico ON anexo_servico (servico_id);
