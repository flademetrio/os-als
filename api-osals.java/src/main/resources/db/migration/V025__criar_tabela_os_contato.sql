-- V025__criar_tabela_os_contato.sql
-- Juncao N:N: contatos do cliente selecionados para sair na OS e na impressao.
-- Opcional — sem selecao, a impressao usa o contato principal do cliente.

CREATE TABLE os_contato (
    os_id       BIGINT  NOT NULL REFERENCES ordem_servico(id) ON DELETE CASCADE,
    contato_id  BIGINT  NOT NULL REFERENCES contato_cliente(id),
    PRIMARY KEY (os_id, contato_id)
);

CREATE INDEX idx_os_contato_contato ON os_contato (contato_id);
