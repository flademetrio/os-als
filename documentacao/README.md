# Documentação — Projeto OS-ALS

Sistema de gestão de Ordens de Serviço para empresa de **ar condicionado e climatização**.

Stack: **Spring Boot** (backend) · **Next.js** (frontend) · **PostgreSQL/Neon** (banco).

Documentos vivos — atualizados conforme decisões do PO.

## Ordem de leitura

| # | Arquivo | Para que serve |
|---|---------|----------------|
| 00 | [Visão geral](00-visao-geral.md) | Contexto, escopo, premissas iniciais. **Comece por aqui.** |
| 01 | [Glossário](01-glossario.md) | Termos do domínio (Cliente, Unidade, Equipamento, Serviço, OS, etc.) |
| 02 | [Atores e papéis](02-atores.md) | Perfis de usuário (operador, gerente, admin, técnico) |
| 03 | [Cadastros](03-cadastros.md) | Dados mestres (clientes, equipamentos, peças, fornecedores...) |
| 04 | [Fluxo Serviço ↔ OS](04-fluxo-servico-os.md) | Modelo conceitual e ciclo de vida do principal fluxo do sistema |
| 05 | [Perguntas em aberto](05-perguntas-abertas.md) | Backlog de decisões pendentes + histórico do que foi resolvido. **Consultar antes de propor algo novo.** |
| 06 | [Custos](06-custos.md) | Categorias, lançamento, markup, cálculo do preço de venda |
| 07 | [Fora de escopo (V1)](07-fora-de-escopo-v1.md) | O que ficou de fora desta versão |
| 08 | [Modelo de dados](08-modelo-de-dados.md) | Entidades, relacionamentos, esquema do banco |
| 09 | [Arquitetura](09-arquitetura.md) | Camadas, stack, autenticação, banco, storage, convenções |
| 10 | [Matriz de permissões](10-matriz-permissoes.md) | O que cada perfil pode fazer, operação por operação |
| 11 | [Relatórios](11-relatorios.md) | Relatórios essenciais para a V1 |
| 12 | [Impressão da OS](12-impressao-os.md) | Layout e conteúdo da OS impressa em papel |
| 13 | [Anexos (PDFs)](13-anexos.md) | Regras de upload de PDFs no Serviço e na OS |
| 14 | [Padrões de UI/UX](14-ui-padroes.md) | Paleta, componentes, layout, convenções de frontend |
| 15 | [Padrões de Backend](15-padroes-backend.md) | Estrutura modular, DTOs, exception handler, testes, Flyway |
| 16 | [Plano de Implementação — Backend](16-plano-backend.md) | Fases de construção do back, com Definition of Done |
| 17 | [Plano de Implementação — Frontend](17-plano-frontend.md) | Fases de construção do front, sincronizadas com o back |
| 18 | [Usuários iniciais](18-usuarios-iniciais.md) | Lista de seed (admin + 3 operadores), senhas provisórias, plano de troca |

## Convenções

- **✅** marca decisões confirmadas.
- **🔸** marca pontos pendentes. Detalhe vive em [05](05-perguntas-abertas.md).
- **⭐** marca conceitos centrais do domínio.

## Próximos documentos previstos

Documentação técnica core está completa. Próximos podem ser:

- Cards de feature/épicos (granulares, conforme implementação avançar)
- Setup detalhado por componente (`SETUP_BACKEND.md`, `SETUP_FRONTEND.md`)
