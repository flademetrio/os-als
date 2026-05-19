-- V003__criar_tabela_tecnico.sql
-- Dados especificos quando o usuario e da equipe tecnica. Relacao 1:1 com usuario.

CREATE TABLE tecnico (
    usuario_id          BIGINT          PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
    valor_hora_centavos BIGINT          NOT NULL,
    especialidade       VARCHAR(80),
    telefone            VARCHAR(20),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ
);
