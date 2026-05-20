-- V023__criar_tabela_anexo_os.sql
-- Anexo PDF unico da OS: o scan do papel preenchido pelo tecnico.
-- Relacao 1:1 com ordem_servico (PK = FK). Substituicao reescreve a linha.
-- Ver documentacao/13-anexos.md.

CREATE TABLE anexo_os (
    os_id           BIGINT          PRIMARY KEY REFERENCES ordem_servico(id),
    nome_arquivo    VARCHAR(255)    NOT NULL,
    storage_key     VARCHAR(500)    NOT NULL,
    content_type    VARCHAR(60)     NOT NULL DEFAULT 'application/pdf',
    tamanho_bytes   BIGINT          NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    created_by      BIGINT          NOT NULL REFERENCES usuario(id)
);
