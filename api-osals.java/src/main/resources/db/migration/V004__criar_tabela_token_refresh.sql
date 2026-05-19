-- V004__criar_tabela_token_refresh.sql
-- Tokens de refresh com rotacao. Cada uso revoga o anterior e emite novo.
-- Reutilizar token revogado = revoga toda a familia (deteccao de roubo).

CREATE TABLE token_refresh (
    id                  BIGSERIAL       PRIMARY KEY,
    usuario_id          BIGINT          NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    token_hash          VARCHAR(255)    NOT NULL UNIQUE,
    expira_em           TIMESTAMPTZ     NOT NULL,
    revogado_em         TIMESTAMPTZ,
    substituido_por_id  BIGINT          REFERENCES token_refresh(id),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_token_refresh_usuario ON token_refresh(usuario_id);
CREATE INDEX idx_token_refresh_hash ON token_refresh(token_hash);
