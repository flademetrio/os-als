# 01 — Glossário do Domínio

| Termo | Definição |
|-------|-----------|
| **Cliente** | Pessoa física ou jurídica que contrata serviços da empresa. Pode ter múltiplas unidades/filiais e múltiplos contatos |
| **Unidade do Cliente** | Endereço/filial específica do cliente onde os equipamentos estão instalados e os serviços são executados |
| **Equipamento** | Aparelho de climatização instalado em uma unidade do cliente (ex.: split, VRF, chiller). Tem histórico de manutenções |
| **Serviço** | Trabalho contratado pelo cliente. Unidade comercial/operacional. Contém descrição, prazos, cronograma e custos. Envolve uma ou mais atividades operacionais (OS) |
| **OS (Ordem de Serviço)** | Atividade operacional dentro de um Serviço. Cada execução em campo ou oficina gera uma OS. Um Serviço tem 1..N OS. A OS é o artefato impresso que segue com o técnico. **Uma OS só existe associada a um Serviço pai** |
| **Operador** | Usuário que cadastra serviços, abre/imprime OS, e registra no sistema o que o técnico preencheu em papel |
| **Gerente** | Usuário com acesso ampliado: tudo que o operador faz + ver relatórios + editar custos após Serviço concluído |
| **Administrador** | Usuário com acesso total: cadastro de usuários, configurações de sistema (markup, status, tipos, categorias) |
| **Técnico** | Profissional que executa a OS em campo ou oficina. Tem login, mas opera via papel nesta versão. Tem cadastro de **valor/hora** (usado no cálculo da mão de obra). Preenche manualmente o que foi feito, tempo, observações e impedimentos |
| **Veículo** | Veículo da frota usado nos atendimentos externos. Uma OS pode ter **múltiplos veículos** associados |
| **Impedimento** | Imprevisto ou problema registrado pelo técnico durante a execução da OS |
| **Atividade** | Sinônimo operacional de OS. Cada atividade de um serviço corresponde a uma OS |
| **Cronograma** | Datas previstas de início e fim do trabalho. Modelo simples (não Gantt). Fica **no nível do Serviço** (a OS não tem cronograma próprio) |
| **Status do Serviço** | Ciclo: `Em aberto` → `Em execução` → `Aguardando` → `Concluído` → `Cancelado`. Finalizado/Cancelado não reabre |
| **Status da OS** | Ciclo: `Aberta` → `Impressa` → `Pendente de digitação` → `Concluída` → `Cancelada` |
| **Custo** | Valor gasto pela empresa na execução do serviço. Lançado manualmente pelo operador **no nível do Serviço**, agrupado por **categoria** |
| **Categoria de Custo** | Mão de obra, Deslocamento, Peças e materiais, Terceiros, Hospedagem/alimentação. Ver [06](06-custos.md) |
| **Markup** | Acréscimo percentual aplicado sobre o custo total para chegar ao preço de venda (`preço = custo + markup`). É uma **configuração geral do sistema** (uma alíquota única, definida pelo admin) |
| **Margem** | Tratado como sinônimo de markup neste projeto |
| **Código da OS** | Identificador composto `SSSS-NNNNN`, onde `SSSS` é o número do Serviço (4 dígitos) e `NNNNN` é o sequencial global da OS no sistema (5 dígitos). Ex.: `0001-00012` |
