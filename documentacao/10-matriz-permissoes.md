# 10 — Matriz de Permissões

Matriz detalhada do que cada perfil pode fazer no sistema. Visão resumida está em [02-atores.md](02-atores.md).

## Convenções

- ✅ pode executar
- ❌ não pode executar
- 🔒 pode executar **com restrição** (especificada na linha)

## Cadastros (dados mestres)

| Operação | Operador | Gerente | Admin |
|---|:-:|:-:|:-:|
| Listar/consultar Cliente, Unidade, Equipamento | ✅ | ✅ | ✅ |
| Criar/editar Cliente, Unidade, Equipamento | ✅ | ✅ | ✅ |
| Excluir Cliente, Unidade, Equipamento | ❌ | ✅ | ✅ |
| Listar/criar/editar Técnico | ✅ | ✅ | ✅ |
| Excluir Técnico (inativar) | ❌ | ✅ | ✅ |
| Listar/criar/editar Veículo | ✅ | ✅ | ✅ |
| Excluir Veículo | ❌ | ✅ | ✅ |
| Listar/criar/editar Peças, Fornecedores, Unidades de Medida | ✅ | ✅ | ✅ |

## Serviço e OS

| Operação | Operador | Gerente | Admin |
|---|:-:|:-:|:-:|
| Listar/consultar Serviços e OS | ✅ | ✅ | ✅ |
| Criar Serviço | ✅ | ✅ | ✅ |
| Editar Serviço (descrição, prazos, cronograma) enquanto **não Concluído** | ✅ | ✅ | ✅ |
| Editar Serviço **após Concluído** | ❌ | 🔒 *(apenas em casos excepcionais, com log)* | ✅ |
| Cancelar Serviço | ✅ | ✅ | ✅ |
| Abrir OS | ✅ | ✅ | ✅ |
| Imprimir OS | ✅ | ✅ | ✅ |
| Digitar execução da OS (o que foi feito, tempo, observações, impedimentos) | ✅ | ✅ | ✅ |
| Cancelar OS | ✅ | ✅ | ✅ |
| Finalizar Serviço | ✅ | ✅ | ✅ |
| Reabrir Serviço/OS Concluído | ❌ | ❌ | ❌ *(regra de negócio absoluta)* |

## Custos

| Operação | Operador | Gerente | Admin |
|---|:-:|:-:|:-:|
| Lançar custo no Serviço (qualquer categoria) | ✅ | ✅ | ✅ |
| Editar/excluir custo enquanto Serviço **não está Concluído** | ✅ | ✅ | ✅ |
| Editar/excluir custo **após** Serviço Concluído ou Cancelado | ❌ | ✅ | ✅ |
| Ver preço de venda calculado (custo + markup) | ✅ | ✅ | ✅ |

## Anexos (PDFs)

| Operação | Operador | Gerente | Admin |
|---|:-:|:-:|:-:|
| Anexar PDF ao Serviço (múltiplos) | ✅ | ✅ | ✅ |
| Anexar PDF à OS (scan da OS preenchida — 1 por OS) | ✅ | ✅ | ✅ |
| Baixar/visualizar anexos | ✅ | ✅ | ✅ |
| Remover/substituir anexo enquanto **não Concluído** | ✅ | ✅ | ✅ |
| Remover/substituir anexo **após Concluído/Cancelado** | ❌ | ✅ | ✅ |

Detalhe em [13-anexos.md](13-anexos.md).

## Relatórios

| Operação | Operador | Gerente | Admin |
|---|:-:|:-:|:-:|
| Ver relatórios operacionais (OS por status, custos, equipamentos) | ❌ | ✅ | ✅ |

Detalhe dos relatórios em [11-relatorios.md](11-relatorios.md).

## Administração do sistema

| Operação | Operador | Gerente | Admin |
|---|:-:|:-:|:-:|
| Cadastrar usuários e atribuir perfil | ❌ | ❌ | ✅ |
| Configurar **markup geral** | ❌ | ❌ | ✅ |
| Configurar **valor/km** do deslocamento | ❌ | ❌ | ✅ |
| Configurar lista de Tipos de Serviço | ❌ | ❌ | ✅ |
| Configurar lista de Categorias de Custo | ❌ | ❌ | ✅ |
| Configurar listas de Status (Serviço, OS) | ❌ | ❌ | ✅ |

## Notas

- O **Técnico** tem login, mas na V1 não opera o sistema (preenche papel). Suas permissões padrão são: consultar OS impressa e histórico de manutenção do equipamento — outros acessos serão definidos quando/se a operação digital entrar em escopo.
- O perfil **Admin** acumula tudo: faz qualquer coisa que o Gerente e o Operador fazem, além das ações exclusivas de administração.
