# 03 — Cadastros (Dados Mestres)

## Definidos

### Cliente
- Pode ter **múltiplas unidades/filiais** (endereços distintos)
- Pode ter **múltiplos contatos** (responsável técnico, responsável geral, etc.)
- Campos detalhados a especificar (CNPJ/CPF, razão social, etc.)

### Unidade do Cliente
- Endereço, identificação interna ("Matriz", "Filial Centro", "Loja 4")
- Vincula os equipamentos àquele endereço

### Equipamento do Cliente ⭐
Inventário dos equipamentos de climatização instalados em cada unidade do cliente:
- Marca, modelo, número de série
- Capacidade (BTUs / TR)
- Tipo (split, multi-split, VRF, self, chiller, fan coil, janela...)
- Localização interna (andar, sala, setor, tag)
- Data de instalação, data da última manutenção
- Status (ativo, em manutenção, desativado)

Permite **histórico de manutenções por equipamento**, base para relatórios do parque do cliente.

### Técnico
- Funcionário da equipe técnica (vinculado a um usuário do sistema, pois técnico tem login)
- Campos: nome, contato, especialidade(?), **valor/hora** ⭐
- O **valor/hora** é usado pelo sistema para calcular automaticamente o custo de mão de obra (técnico × horas × valor/hora) — ver [06-custos.md](06-custos.md)

### Veículo
- Veículo da frota usado em atendimentos externos
- Campos: placa, modelo, marca, ano, status

### Tipo de Serviço
Categorização do que a empresa oferece (lista oficial):
- Instalação
- Manutenção preventiva
- Manutenção corretiva
- Higienização / limpeza
- Montagem

### Peças e Materiais
Itens consumidos nos serviços: filtros, gás refrigerante (R-410A, R-32, R-22), capacitores, contatores, placas, tubulação de cobre, isolamento, suportes etc.
- **Sem controle de estoque** nesta versão (entrada/saída/saldo não é controlado)
- Cadastro serve apenas como **catálogo de referência**. O lançamento de peças como custo é **livre** (não obriga puxar do cadastro) — ver [06-custos.md](06-custos.md)

### Fornecedores
Cadastro de origem de peças e terceiros contratados.
- Lançamento de custos de terceiros também é **livre** (não obriga puxar do cadastro)

### Unidades de Medida
m, m², kg, BTU, TR, hora, unidade, peça, frasco etc.

### Categorias de Custo
Mão de obra, deslocamento, peças/materiais, terceiros, hospedagem/alimentação em obra. Detalhe em [06-custos.md](06-custos.md).

## Fora do escopo (V1)
- **Controle de estoque** (entrada/saída/saldo de peças)
- **Formas de pagamento / condições comerciais** (cobrança fora de escopo)
- **Contrato recorrente / PMOC** como entidade dedicada — quando houver recorrência, o operador cadastra um Serviço comum para cada visita
