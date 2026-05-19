# 00 — Visão Geral do Sistema

## Contexto
Sistema de gestão de ordens de serviço para empresa especializada em **ar condicionado e climatização**, com atuação em:
- **Serviços externos**: equipe técnica vai até o cliente (instalações, manutenções, atendimentos)
- **Serviços em oficina**: equipamentos retirados do cliente e reparados na sede

## Escopo
- Sistema para **uma empresa específica** (não é multi-tenant)
- Backend: Java 17 + Spring Boot 4.0.6
- Frontend: Next.js 16 + Tailwind v4
- Banco: PostgreSQL 16
- Hospedagem V1: **Docker Compose** no localhost (3 containers: backend, frontend, postgres). Produção definida depois

## Objetivo
Digitalizar e centralizar todo o fluxo desde o cadastro do trabalho contratado pelo cliente até o registro das atividades executadas em campo/oficina pela equipe técnica, incluindo controle de custos com aplicação de markup para chegar ao preço de venda.

## Premissas confirmadas

- ✅ A OS impressa em papel continua sendo um artefato físico que o técnico preenche manualmente em campo/oficina
- ✅ O **operador** é o ponto central de alimentação do sistema (cadastra serviços, abre/imprime OS, recebe a OS preenchida e digita)
- ✅ Um Serviço pode gerar **uma ou várias OS** ao longo da sua execução (1..N)
- ✅ **OS sempre tem Serviço pai** — não existe OS avulsa
- ✅ Numeração: Serviço sequencial global 4 dígitos (`0001`) + OS sequencial global 5 dígitos (`00012`). Exibição combinada: `0001-00012`
- ✅ Tipos de Serviço da empresa: Instalação, Manutenção preventiva, Manutenção corretiva, Higienização/limpeza, Montagem
- ✅ Sistema trabalha com **markup geral** (configuração única) para calcular preço de venda
- ✅ **Cobrança/financeiro está fora do escopo da V1** (ver [07](07-fora-de-escopo-v1.md))

## Atores
Operador, Gerente, Administrador, Técnico — ver [02](02-atores.md).

## Documentos
Ver [README.md](README.md) para o índice completo e a ordem de leitura.

## Status
Documento vivo. Atualizado conforme decisões.
