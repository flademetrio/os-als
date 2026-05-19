# 15 — Padrões de Backend (Spring Boot)

Padrões de código, organização e práticas do backend do OS-ALS. **Inspirado** no projeto api-salesys (referência interna), adaptado ao escopo single-tenant e ao domínio de ar condicionado.

Complementa o [09-arquitetura.md](09-arquitetura.md), que tem a visão técnica geral. Aqui o foco é **como escrever o código no dia a dia**.

---

## 1. Idioma — pt-BR sem acentos

**Tudo em português brasileiro sem acentos**, exceto sintaxe de linguagem/framework e termos técnicos universais (JWT, REST, CORS, SQL).

### Por quê sem acentos
- Evita problemas de encoding em logs (console Windows, agregadores)
- Evita problemas em filesystems estrangeiros
- Reduz risco de erros sutis em comparações de string
- Convenção alinhada com [api-salesys](D:\DEV\projetos\salesys\api-salesys-java)

### Exemplos

```java
// ✅ CORRETO
public class ServicoOrdemServico {
    private final RepositorioOrdens repositorioOrdens;

    public OrdemResposta abrir(AberturaOrdemRequisicao requisicao) {
        var servico = repositorioServicos.buscarPorId(requisicao.servicoId())
            .orElseThrow(() -> new RecursoNaoEncontradoException("Servico nao encontrado"));
        // ...
    }
}

// ❌ ERRADO — com acentos
public class ServiçoOrdemServiço { /* ... */ }

// ❌ ERRADO — em inglês
public class OrderService { /* ... */ }
```

### Tabela de convenções

| Tipo | Convenção | Exemplo |
|---|---|---|
| Tabelas SQL | snake_case pt-BR | `ordem_servico`, `lancamento_custo` |
| Colunas SQL | snake_case pt-BR | `data_abertura`, `valor_hora_centavos` |
| Classes Java | PascalCase pt-BR | `ServicoOrdemServico`, `RepositorioOrdens` |
| Métodos | camelCase pt-BR | `buscarPorId()`, `validarTransicao()` |
| Variáveis | camelCase pt-BR | `ordemAtual`, `tokenRefresh` |
| Pacotes | minúsculo pt-BR | `osals.servico.aplicacao` |
| DTOs | PascalCase + sufixo | `AberturaOrdemRequisicao`, `OrdemResposta`, `OrdemResumoDto` |
| Exceções | PascalCase + Exception | `RecursoNaoEncontradoException`, `OrdemConcluidaException` |
| Endpoints REST | kebab-case pt-BR | `/ordens-servico`, `/lancamentos-custo` |
| Variáveis de ambiente | SCREAMING_SNAKE pt-BR | `BD_URL`, `JWT_CHAVE_PRIVADA`, `ANEXOS_DIR` |
| Migrations Flyway | `V###__descricao.sql` | `V001__criar_tabela_usuarios.sql` |
| Permissões | `modulo.acao` | `servico.criar`, `custo.editar_apos_concluido` |
| Status/Enums (valor) | UPPER_SNAKE_CASE pt-BR | `EM_ABERTO`, `PENDENTE_DIGITACAO` |

---

## 2. Estrutura do projeto

### 2.1 Modular Monolith

```
src/main/java/br/com/empresa/osals/
├── OsAlsApplication.java
├── seguranca/                 ← módulo: login, usuário, JWT, permissões
├── cadastro/                  ← módulo: cliente, unidade, equipamento, técnico, veículo, peça, fornecedor
├── servico/                   ← módulo: serviço, tipo de serviço, custo, categoria
├── ordemservico/              ← módulo: OS + relações com técnicos, veículos, equipamentos
├── anexo/                     ← módulo: PDFs do serviço e da OS
├── relatorio/                 ← módulo: endpoints agregados (OS por status, custos por serviço, etc.)
├── impressao/                 ← módulo: geração do PDF da OS impressa
└── compartilhado/             ← infra transversal (não tem regra de negócio)
```

> **OS-ALS não é multi-tenant**, então não há módulo `admin` separado nem prefixo `adm_` em tabelas. Tudo é "negócio" de uma única empresa.

### 2.2 Camadas dentro de cada módulo

```
modulo/
├── dominio/                   ← Entidades JPA, interfaces de Repositório, enums
├── aplicacao/                 ← Services (regras de negócio), DTOs, validações
├── infraestrutura/            ← Implementações técnicas (mappers, filtros, integrações externas)
└── api/                       ← Controllers REST, exception handlers locais
```

### 2.3 Direção de dependências

```
ordemservico/ ──► servico/ ──► cadastro/ ──► seguranca/ ──► compartilhado/
```

E também:

```
anexo/        ──► servico/ + ordemservico/
relatorio/    ──► servico/ + ordemservico/ + cadastro/
impressao/    ──► ordemservico/ + cadastro/
```

**NUNCA** dependência circular. Se um módulo precisar de algo de outro que ainda não está acima dele na hierarquia, extraia para `compartilhado/`.

### 2.4 Regras entre camadas (mesmo módulo)

- `api/` depende de `aplicacao/` (nunca de `dominio/` diretamente)
- `aplicacao/` depende de `dominio/`
- `infraestrutura/` depende de `dominio/` e `aplicacao/`
- `dominio/` **não depende** de nenhuma outra camada do mesmo módulo

---

## 3. Anatomia de uma feature

Implementar a feature **"Abrir OS dentro de um Serviço"** envolve:

```
ordemservico/
├── dominio/
│   ├── OrdemServico.java                       ← @Entity
│   ├── RepositorioOrdemServico.java            ← interface (JpaRepository)
│   └── StatusOrdemServico.java                 ← enum
├── aplicacao/
│   ├── ServicoOrdemServico.java                ← regras de negócio
│   ├── dto/
│   │   ├── AberturaOrdemRequisicao.java        ← record DTO
│   │   ├── OrdemResposta.java                  ← record DTO
│   │   └── OrdemResumoDto.java                 ← record (para listagens)
│   └── mapper/
│       └── MapperOrdemServico.java             ← Entity ↔ DTO (manual)
├── infraestrutura/
│   └── (vazio na maioria das features simples)
└── api/
    └── ControladorOrdemServico.java            ← @RestController
```

---

## 4. Padrões de código

### 4.1 Princípios

- **Imutabilidade quando possível** — `record` para DTOs, `final` em variáveis locais
- **Fail fast** — validar no início do método, lançar exceção cedo
- **Sem null retornado** — usar `Optional<>` em repositórios, nunca retornar null em services
- **Logs significativos** — logar ações de negócio, não fluxo técnico
- **Sem lógica em controllers** — controller delega para service, sem `if/else` de negócio
- **Sem `@Autowired` em campo** — injeção sempre via construtor

### 4.2 Estrutura de uma Service

```java
package br.com.empresa.osals.ordemservico.aplicacao;

import /* imports organizados: java, jakarta, spring, projeto */;

/**
 * Servico responsavel pelas operacoes de Ordem de Servico.
 */
@Service
@Transactional(readOnly = true)
public class ServicoOrdemServico {

    private static final Logger log = LoggerFactory.getLogger(ServicoOrdemServico.class);

    private final RepositorioOrdemServico repositorioOrdens;
    private final RepositorioServico repositorioServicos;
    private final MapperOrdemServico mapper;

    public ServicoOrdemServico(RepositorioOrdemServico repositorioOrdens,
                               RepositorioServico repositorioServicos,
                               MapperOrdemServico mapper) {
        this.repositorioOrdens = repositorioOrdens;
        this.repositorioServicos = repositorioServicos;
        this.mapper = mapper;
    }

    @Transactional
    public OrdemResposta abrir(AberturaOrdemRequisicao requisicao, Usuario usuarioAtual) {
        // 1. Buscar Servico pai
        var servico = repositorioServicos.findById(requisicao.servicoId())
            .orElseThrow(() -> new RecursoNaoEncontradoException("Servico nao encontrado"));

        // 2. Validar regra: servico nao pode estar Concluido/Cancelado
        if (servico.estaEncerrado()) {
            throw new NegocioException("Nao e possivel abrir OS em servico " + servico.getStatus().getNomeAmigavel() + ".");
        }

        // 3. Criar OS
        var ordem = new OrdemServico(servico, requisicao.descricaoAtividade(), usuarioAtual);
        ordem.adicionarTecnicos(requisicao.tecnicosIds());
        ordem.adicionarVeiculos(requisicao.veiculosIds());
        ordem.adicionarEquipamentos(requisicao.equipamentosIds());

        // 4. Persistir
        var salva = repositorioOrdens.save(ordem);

        log.info("OS aberta: numero={} servico={} usuario={}", salva.getNumero(), servico.getId(), usuarioAtual.getId());

        // 5. Retornar DTO
        return mapper.paraResposta(salva);
    }
}
```

### 4.3 DTOs como Records

```java
// Requisicao — validacoes via Bean Validation
public record AberturaOrdemRequisicao(
    @NotNull(message = "servicoId e obrigatorio")
    Long servicoId,

    @NotBlank(message = "descricaoAtividade e obrigatoria")
    @Size(max = 2000)
    String descricaoAtividade,

    @NotEmpty(message = "Pelo menos um tecnico deve ser informado")
    List<Long> tecnicosIds,

    List<Long> veiculosIds,    // opcional
    List<Long> equipamentosIds // opcional
) {}

// Resposta — sem dados sensiveis
public record OrdemResposta(
    Long id,
    String numero,                     // 5 digitos com padding ("00012")
    String codigoExibicao,             // "0001-00012"
    Long servicoId,
    String descricaoAtividade,
    StatusOrdemServico status,
    LocalDateTime dataAbertura,
    List<TecnicoResumoDto> tecnicos,
    List<VeiculoResumoDto> veiculos,
    List<EquipamentoResumoDto> equipamentos
) {}

public record TecnicoResumoDto(Long id, String nome) {}
```

### 4.4 Controllers

```java
@RestController
@RequestMapping("/ordens-servico")
public class ControladorOrdemServico {

    private final ServicoOrdemServico servicoOrdens;

    public ControladorOrdemServico(ServicoOrdemServico servicoOrdens) {
        this.servicoOrdens = servicoOrdens;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('os.criar')")
    public ResponseEntity<OrdemResposta> abrir(
            @Valid @RequestBody AberturaOrdemRequisicao requisicao,
            @AuthenticationPrincipal Usuario usuarioAtual
    ) {
        var resposta = servicoOrdens.abrir(requisicao, usuarioAtual);
        return ResponseEntity
            .created(URI.create("/ordens-servico/" + resposta.id()))
            .body(resposta);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('os.visualizar')")
    public ResponseEntity<OrdemResposta> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(servicoOrdens.buscarPorId(id));
    }
}
```

**Regras**:
- Controller NUNCA acessa Repository direto.
- Controller NUNCA tem `if/else` de negócio.
- Validação de input por `@Valid` + Bean Validation no DTO.
- Autorização por `@PreAuthorize` com permissão `<modulo>.<acao>`.

### 4.5 Repositórios

```java
public interface RepositorioOrdemServico extends JpaRepository<OrdemServico, Long> {

    Optional<OrdemServico> findByNumero(Integer numero);

    List<OrdemServico> findByServicoIdOrderByDataAberturaDesc(Long servicoId);

    @Query("SELECT o FROM OrdemServico o WHERE o.status = :status ORDER BY o.dataAbertura DESC")
    Page<OrdemServico> buscarPorStatus(@Param("status") StatusOrdemServico status, Pageable pageable);

    boolean existsByServicoIdAndStatus(Long servicoId, StatusOrdemServico status);
}
```

- Métodos derivados da query (Spring Data) sempre que possível.
- `@Query` JPQL quando precisar de algo customizado.
- Nada de `nativeQuery` exceto se realmente necessário (relatórios complexos).

### 4.6 Mappers (manuais)

```java
@Component
public class MapperOrdemServico {

    public OrdemResposta paraResposta(OrdemServico ordem) {
        return new OrdemResposta(
            ordem.getId(),
            String.format("%05d", ordem.getNumero()),
            ordem.getCodigoExibicao(),
            ordem.getServico().getId(),
            ordem.getDescricaoAtividade(),
            ordem.getStatus(),
            ordem.getDataAbertura(),
            ordem.getTecnicos().stream().map(this::tecnicoResumo).toList(),
            ordem.getVeiculos().stream().map(this::veiculoResumo).toList(),
            ordem.getEquipamentos().stream().map(this::equipamentoResumo).toList()
        );
    }

    private TecnicoResumoDto tecnicoResumo(Tecnico t) {
        return new TecnicoResumoDto(t.getId(), t.getUsuario().getNome());
    }
    // ...
}
```

**MapStruct fica fora da V1** — mappers manuais são explícitos e simples de entender. Adicionar MapStruct é evolução se a quantidade de mapeamentos virar problema.

### 4.7 Validação de senha

Senhas criadas via API REST seguem regra de tamanho mínimo:

```java
public record CriacaoUsuarioRequisicao(
    @NotBlank @Email String email,
    @NotBlank String nome,
    @NotBlank @Size(min = 8, message = "Senha deve ter no minimo 8 caracteres") String senha,
    @NotNull Papel papel
) {}

public record AlteracaoSenhaRequisicao(
    @NotBlank @Size(min = 8, message = "Senha deve ter no minimo 8 caracteres") String novaSenha
) {}
```

Hash sempre via `PasswordEncoder` injetado (BCrypt força 10 — config `BCRYPT_FORCA`). **Nunca** instanciar `BCryptPasswordEncoder` direto no service.

**Exceção — seeds Flyway**: senhas curtas (ex.: `123` para usuários iniciais de desenvolvimento) são aceitas **apenas** em migrations SQL com hash pré-calculado. A validação `@Size(min=8)` aplica somente a senhas entrando via REST. Detalhe em [18-usuarios-iniciais.md §5](18-usuarios-iniciais.md).

### 4.8 Tratamento global de exceções

```java
@RestControllerAdvice
public class TratadorExcecoesGlobal {

    private static final Logger log = LoggerFactory.getLogger(TratadorExcecoesGlobal.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResposta> tratar(MethodArgumentNotValidException ex) {
        String mensagem = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining("; "));
        return ResponseEntity.status(400).body(new ErroResposta(400, mensagem));
    }

    @ExceptionHandler(NegocioException.class)
    public ResponseEntity<ErroResposta> tratar(NegocioException ex) {
        return ResponseEntity.status(422).body(new ErroResposta(422, ex.getMessage()));
    }

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroResposta> tratar(RecursoNaoEncontradoException ex) {
        return ResponseEntity.status(404).body(new ErroResposta(404, ex.getMessage()));
    }

    @ExceptionHandler(DuplicidadeException.class)
    public ResponseEntity<ErroResposta> tratar(DuplicidadeException ex) {
        return ResponseEntity.status(409).body(new ErroResposta(409, ex.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErroResposta> tratar(AccessDeniedException ex) {
        return ResponseEntity.status(403).body(new ErroResposta(403, "Sem permissao para esta operacao."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResposta> tratar(Exception ex) {
        log.error("Erro nao tratado", ex);
        return ResponseEntity.status(500).body(new ErroResposta(500, "Erro interno. Tente novamente."));
    }
}

public record ErroResposta(int codigo, String mensagem, String timestamp) {
    public ErroResposta(int codigo, String mensagem) {
        this(codigo, mensagem, LocalDateTime.now().toString());
    }
}
```

### 4.9 Hierarquia de exceções

```
compartilhado/excecoes/
├── NegocioException.java                       ← base — regras de negocio violadas (422)
├── RecursoNaoEncontradoException.java          ← 404
├── DuplicidadeException.java                   ← 409 (UNIQUE constraint)
├── CredenciaisInvalidasException.java          ← 401
└── (criar specificas conforme aparecer)
```

---

## 5. Valores monetários

**Centavos como `Long` (BIGINT no banco), sempre**. Nunca `float`, `double` ou `BigDecimal`.

```java
// ✅ CORRETO
private Long valorHoraCentavos;
private Long valorTotalCentavos;

// ❌ ERRADO
private double valorHora;
private BigDecimal valorTotal;
```

### Por quê
- Aritmética de centavos é exata (sem erro de ponto flutuante)
- Conversão simples na borda: `reais × 100 = centavos`
- API e banco usam o mesmo formato (sem mapper especial)

### Conversão na borda

```java
// utilitario em compartilhado/util/MoedaUtil.java
public final class MoedaUtil {
    public static long reaisParaCentavos(String reaisFormatado) {
        // "299,90" ou "1.234,56" → centavos
        String limpo = reaisFormatado.replace(".", "").replace(",", ".").trim();
        return Math.round(Double.parseDouble(limpo) * 100);   // Math.round OBRIGATORIO
    }

    public static String centavosParaReais(long centavos) {
        return String.format(Locale.of("pt", "BR"), "R$ %,.2f", centavos / 100.0);
    }
}
```

Conversão acontece **apenas na camada de UI** (no front, ou em geração de PDF). API e service sempre lidam com `Long`.

---

## 6. Migrations Flyway

### 6.1 Convenção

```
V<numero_3_digitos>__<descricao_pt-BR_sem_acentos>.sql
```

Exemplos:
```
V001__criar_tabela_usuarios.sql
V002__criar_tabela_clientes.sql
V003__criar_tabela_unidades.sql
V004__criar_tabela_equipamentos.sql
V005__criar_tabela_tecnicos.sql
V006__criar_tabela_servicos.sql
V007__criar_tabela_ordens_servico.sql
V008__criar_tabela_lancamentos_custo.sql
V009__criar_tabela_anexos.sql
V010__seed_categorias_custo.sql
V011__seed_tipos_servico.sql
V012__seed_configuracoes.sql
```

### 6.2 Regras

- **NUNCA alterar** uma migration já executada em qualquer ambiente. Flyway calcula checksum sobre o arquivo inteiro.
- Para corrigir, criar **nova** migration com `ALTER TABLE` / `UPDATE` / `INSERT ON CONFLICT`.
- Migrations de seed devem ser **idempotentes** (`INSERT ... ON CONFLICT DO NOTHING`).
- Sempre incluir índices na mesma migration da tabela.
- Comentar a migration com a finalidade.

### 6.3 Checksum mismatch

Se `FlywayValidateException` no boot:
1. **Investigar** com `git log` quem editou o arquivo
2. Se acidental → reverter ao conteúdo original
3. Se deliberado → criar nova migration e reverter o original
4. **NUNCA** ativar `repair-on-migrate` automático
5. **NUNCA** apagar linhas de `flyway_schema_history` manualmente

### 6.4 Exemplo

```sql
-- V006__criar_tabela_servicos.sql
-- Servico = unidade comercial contratada pelo cliente.

CREATE TABLE servico (
    id BIGSERIAL PRIMARY KEY,
    numero INTEGER NOT NULL UNIQUE,
    cliente_id BIGINT NOT NULL REFERENCES cliente(id),
    tipo_servico_id INTEGER NOT NULL REFERENCES tipo_servico(id),
    descricao TEXT NOT NULL,
    data_inicio_prevista DATE,
    data_fim_prevista DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'EM_ABERTO',
    finalizado_em TIMESTAMPTZ,
    finalizado_por BIGINT REFERENCES usuario(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by BIGINT NOT NULL REFERENCES usuario(id),
    updated_at TIMESTAMPTZ,
    updated_by BIGINT REFERENCES usuario(id)
);

CREATE INDEX idx_servico_cliente ON servico(cliente_id);
CREATE INDEX idx_servico_status ON servico(status);

CREATE SEQUENCE servico_numero_seq START 1;
```

---

## 7. Testes

### 7.1 Regra de ouro

**Toda criação ou alteração de código DEVE ter teste correspondente.** Sem teste, a alteração não está completa.

### 7.2 Meta de cobertura

- **80%+** nos services (regras de negócio)
- Sem meta rígida para Controllers (testes de integração cobrem)
- Sem meta para DTOs, entidades simples, mappers triviais

Ferramenta: **JaCoCo**. Relatório em `target/site/jacoco/index.html`. Rodar com `./mvnw jacoco:report`.

### 7.3 Convenção de nomes

Padrão: `metodo_cenario_resultadoEsperado`.

```java
@Test
void abrir_comServicoConcluido_lancaNegocioException() { }

@Test
void abrir_comTecnicoInexistente_lanca404() { }

@Test
void finalizar_servicoSemOSConcluida_lancaNegocioException() { }
```

### 7.4 Estrutura

```
src/test/java/br/com/empresa/osals/
├── servico/
│   ├── aplicacao/
│   │   ├── ServicoServicoTest.java                 ← unitario com Mockito
│   │   └── ServicoLancamentoCustoTest.java
│   └── api/
│       └── ControladorServicoIT.java               ← integracao com Testcontainers
├── ordemservico/
│   ├── aplicacao/
│   │   └── ServicoOrdemServicoTest.java
│   └── api/
│       └── ControladorOrdemServicoIT.java
└── compartilhado/
    └── util/
        └── MoedaUtilTest.java
```

### 7.5 Unitário

```java
@ExtendWith(MockitoExtension.class)
class ServicoOrdemServicoTest {

    @Mock RepositorioOrdemServico repositorioOrdens;
    @Mock RepositorioServico repositorioServicos;
    @Mock MapperOrdemServico mapper;

    @InjectMocks ServicoOrdemServico servico;

    @Test
    void abrir_comServicoEmAberto_persisteERetornaResposta() {
        var requisicao = new AberturaOrdemRequisicao(1L, "Trocar capacitor", List.of(1L), List.of(), List.of());
        var servicoPai = criarServicoEmAberto();
        when(repositorioServicos.findById(1L)).thenReturn(Optional.of(servicoPai));
        when(repositorioOrdens.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.paraResposta(any())).thenReturn(criarOrdemResposta());

        var resultado = servico.abrir(requisicao, criarUsuarioAtual());

        assertNotNull(resultado);
        verify(repositorioOrdens).save(any(OrdemServico.class));
    }

    @Test
    void abrir_comServicoConcluido_lancaNegocioException() {
        var requisicao = new AberturaOrdemRequisicao(1L, "Trocar capacitor", List.of(1L), List.of(), List.of());
        when(repositorioServicos.findById(1L)).thenReturn(Optional.of(criarServicoConcluido()));

        assertThrows(NegocioException.class, () -> servico.abrir(requisicao, criarUsuarioAtual()));
    }
}
```

### 7.6 Integração

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class ControladorOrdemServicoIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void config(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", postgres::getJdbcUrl);
        r.add("spring.datasource.username", postgres::getUsername);
        r.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired TestRestTemplate restTemplate;

    @Test
    void abrir_comDadosValidos_retorna201ComLocation() {
        // ... seed + chamada + assertion no status, body e header Location
    }
}
```

### 7.7 Protocolo de alteração segura

Ao alterar código existente:

1. **Antes** — rodar `./mvnw test` para garantir baseline verde
2. Fazer a alteração no código de produção
3. **Depois** — rodar `./mvnw test` de novo
4. Se teste quebrou:
   - **Relacionado à mudança** → atualizar o teste
   - **Não relacionado** → PARAR, investigar antes de seguir
5. Criar/atualizar testes da nova funcionalidade
6. Suite completa verde antes de considerar concluído

---

## 8. Variáveis de ambiente

Todas em **pt-BR sem acentos**. Carregadas via `spring-dotenv` a partir de `.env` na raiz.

### Banco
```
BD_URL=jdbc:postgresql://...:5432/osals?sslmode=require
```

### JWT
```
JWT_CHAVE_PRIVADA=<PEM>
JWT_CHAVE_PUBLICA=<PEM>
JWT_EMISSOR=os-als
JWT_AUDIENCE=tenant
JWT_EXPIRACAO_MINUTOS=1440           # 24h
JWT_REFRESH_EXPIRACAO_DIAS=30
```

### Aplicação
```
APP_PORTA=8080
APP_URL_BASE=http://localhost:8080
FRONTEND_URL=http://localhost:3000
```

### Anexos
```
ANEXOS_DIR=./anexos-local           # dev
ANEXO_TAMANHO_MAX_MB=10
```

### Custos
```
MARKUP_PADRAO=30.00                 # alíquota inicial (admin altera depois via UI)
VALOR_KM_CENTAVOS_PADRAO=150        # R$ 1,50 inicial
```

### Segurança
```
LOGIN_MAX_TENTATIVAS=5
LOGIN_BLOQUEIO_MINUTOS=15
BCRYPT_FORCA=10
```

### CORS
```
CORS_ORIGENS_PERMITIDAS=http://localhost:3000
CORS_METODOS_PERMITIDOS=GET,POST,PUT,DELETE,PATCH,OPTIONS
CORS_HEADERS_PERMITIDOS=Authorization,Content-Type
```

### Validação no startup

Aplicação **deve falhar no boot** se variáveis obrigatórias faltarem. Usar `@ConfigurationProperties` + `@Validated`:

```java
@Validated
@ConfigurationProperties(prefix = "app.jwt")
public record ConfiguracoesJwt(
    @NotBlank String chavePrivada,
    @NotBlank String chavePublica,
    @Min(15) int expiracaoMinutos,
    @Min(1) int refreshExpiracaoDias,
    @NotBlank String emissor
) {}
```

---

## 9. OpenAPI

- Gerado automaticamente em `/v3/api-docs` (Springdoc).
- Swagger UI em `/swagger-ui.html` — **disponível em dev, desabilitado em prod**.
- O arquivo `documentos/postman/openapi.json` (no repo) é a **fonte de verdade do contrato** e deve ser regenerado sempre que um controller mudar:

```bash
# Terminal 1
./mvnw spring-boot:run

# Terminal 2
curl -s http://localhost:8080/v3/api-docs -o documentos/postman/openapi.json
```

Anotações úteis:

```java
@Operation(summary = "Abrir nova Ordem de Servico em um Servico existente",
           description = "Cria uma OS com status ABERTA, associada a um Servico pai ainda nao concluido.")
@ApiResponses({
    @ApiResponse(responseCode = "201", description = "OS criada"),
    @ApiResponse(responseCode = "404", description = "Servico nao encontrado"),
    @ApiResponse(responseCode = "422", description = "Servico ja Concluido ou Cancelado")
})
@PostMapping
public ResponseEntity<OrdemResposta> abrir(...) { }
```

---

## 10. Endpoints — convenções REST

### 10.1 Verbos

```
GET    /ordens-servico              → Listar (paginado)
GET    /ordens-servico/{id}         → Buscar por ID
POST   /ordens-servico              → Criar
PUT    /ordens-servico/{id}         → Atualizar completo
PATCH  /ordens-servico/{id}         → Atualizar parcial
DELETE /ordens-servico/{id}         → Cancelar (soft, status → CANCELADA)

# Acoes especiais (verbo no caminho)
POST   /ordens-servico/{id}/imprimir
POST   /ordens-servico/{id}/digitar-execucao
POST   /servicos/{id}/finalizar
POST   /servicos/{id}/anexos
```

### 10.2 Códigos HTTP padrão

| Status | Significado |
|---|---|
| 200 | OK (GET, PUT, PATCH) |
| 201 | Created (POST) — com header `Location` |
| 204 | No Content (DELETE, logout) |
| 400 | Bean Validation falhou |
| 401 | Sem token, token inválido |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 409 | Duplicidade (UNIQUE) |
| 422 | Regra de negócio violada |
| 429 | Rate limit (no Nginx) |

### 10.3 Paginação

```java
public record PaginaResposta<T>(
    List<T> conteudo,
    int pagina,           // zero-based
    int tamanho,          // default 20
    long totalElementos,
    int totalPaginas
) {}
```

Query: `?pagina=0&tamanho=20&ordenarPor=dataAbertura&direcao=desc`.

---

## 11. Logging

- SLF4J via `LoggerFactory.getLogger(MinhaClasse.class)` — **sempre** com a classe como contexto.
- Configuração em `src/main/resources/logback-spring.xml`.
- **Saída**: arquivo `${LOGS_DIR}/os-als.log` com **rotação diária** e **retenção de 30 dias** (compressão gzip dos arquivos rotacionados). Também console para `docker-compose logs`.
- `LOGS_DIR` é variável de ambiente; em Docker aponta para volume montado.
- **Nunca** logar: senhas, tokens, body completo de DTOs com dados pessoais.
- Detalhe do `logback-spring.xml` em [09-arquitetura.md §11](09-arquitetura.md).

---

## 12. Checklist de segurança por endpoint

Ao criar qualquer endpoint novo, verificar:

- [ ] Endpoint exige autenticação? (se sim, está fora do `permitAll()` do `SecurityConfig`)
- [ ] Endpoint exige permissão específica? (`@PreAuthorize`)
- [ ] Input validado? (Bean Validation no DTO)
- [ ] Dados sensíveis não vazam na resposta? (senha, token_hash, etc.)
- [ ] Rate limit considerado? (login, reset de senha → ler nota em [09](09-arquitetura.md) sobre Nginx)
- [ ] Teste cobrindo: caso de sucesso + caso sem autenticação + caso sem permissão?

---

## 13. Anti-padrões — não fazer

- ❌ Acentos em código, identificadores ou nomes de arquivos
- ❌ Nomes em inglês para domínio de negócio
- ❌ `@Autowired` em campo (usar construtor)
- ❌ Retornar `null` de service
- ❌ Lógica de negócio em controller
- ❌ `if/else` para tratamento de erro em controller
- ❌ `float`/`double` para dinheiro
- ❌ `BigDecimal` para dinheiro (usar centavos como `Long`)
- ❌ Alterar migration já aplicada
- ❌ Usar `flyway:repair` automático no boot
- ❌ Logar tokens, senhas ou dados pessoais sensíveis
- ❌ Expor stack trace ou detalhes internos em resposta HTTP
- ❌ MapStruct na V1 (mappers manuais explícitos)
- ❌ Lombok (preferir Records + construtor verbose mas explícito)

---

## 14. Divergências propositais em relação ao salesys

| Item | Salesys | OS-ALS | Por quê |
|---|---|---|---|
| Multi-tenant | Sim, por `conta_id` | Não | OS-ALS é instalação para empresa única |
| IDs | UUID | BIGINT | Há números públicos sequenciais (Servico, OS) — alinhar PK ajuda a evitar confusão |
| JWT TTL access | 15 min | 24 h | Sistema interno, sem refresh proativo ainda; reduzir fricção do operador |
| JWT TTL refresh | 7 dias | 30 dias | Idem |
| Rate limit interno (Bucket4j) | Sim | Não (só Nginx) | Escopo menor; defesa em profundidade não justifica complexidade extra na V1 |
| Módulo `admin/` | Sim | Não | Não é SaaS, sem operadores internos do produto |
| Prefixo `adm_` em tabelas | Sim | Não | Sem multi-tenant |
| CHANGELOG obrigatório | Sim, com timestamp/commit padronizado | Opcional na V1 | Pode entrar como prática mais tarde |
