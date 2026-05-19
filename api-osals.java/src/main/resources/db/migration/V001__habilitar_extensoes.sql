-- V001__habilitar_extensoes.sql
-- Habilita extensoes do Postgres usadas pelo projeto.
-- citext: text case-insensitive (uso futuro em email se necessario)
-- Mantemos esta migration vazia de tabelas para servir de marco zero do schema.

CREATE EXTENSION IF NOT EXISTS "citext";
