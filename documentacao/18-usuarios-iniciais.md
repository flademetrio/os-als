# 18 — Usuários Iniciais (Seeds)

Usuários cadastrados no boot inicial do sistema, antes do primeiro uso.

> ⚠️ **Senhas provisórias.** Todos os usuários abaixo nascem com senha `123` apenas para o ambiente de desenvolvimento e a primeira instalação. **Trocar antes de qualquer uso real** — ver §4.

---

## 1. Lista de usuários

| Nome | E-mail | Papel | Senha provisória |
|---|---|---|---|
| Flavio | `flavio@alsindustria.com.br` | `ADMIN` | `123` |
| Vendas 2 | `vendas2@alsindustria.com.br` | `OPERADOR` | `123` |
| Compras | `compra@alsindustria.com.br` | `OPERADOR` | `123` |
| Atendimento | `atendimento@alsindustria.com.br` | `OPERADOR` | `123` |

**Notas:**
- Nomes em "Vendas 2", "Compras", "Atendimento" são placeholders derivados do email. Substituir pelos nomes reais das pessoas via UI (`/configuracoes/usuarios`) assim que possível.
- **Gerentes** e **técnicos** não entram nesta seed — são cadastrados pelo admin via UI conforme necessidade (técnicos têm campos adicionais — `valor_hora_centavos`, `especialidade` — que entram no formulário próprio).

---

## 2. Como esses usuários entram no sistema

### Opção A — Bootstrap via `.env` (somente o admin)

Conforme decidido em [16-plano-backend.md Fase 1](16-plano-backend.md), há um componente `BootstrapAdmin` que cria o **admin inicial** no primeiro boot **se a tabela `usuario` estiver vazia**. Usa as variáveis:

```dotenv
BOOTSTRAP_ADMIN_EMAIL=flavio@alsindustria.com.br
BOOTSTRAP_ADMIN_SENHA=123
BOOTSTRAP_ADMIN_NOME=Flavio
```

**Esta opção cobre apenas o admin.** Os 3 operadores precisam ser cadastrados pelo admin via UI depois do primeiro login (ou via Opção B abaixo).

### Opção B — Migration Flyway de seed (recomendado)

Uma migration cria todos os 4 usuários de uma vez. Mais previsível e idempotente.

**Arquivo**: `V0XX__seed_usuarios_iniciais.sql` (a numeração depende da posição na sequência de migrations do back).

```sql
-- V0XX__seed_usuarios_iniciais.sql
-- Cadastra os usuarios iniciais conforme documentacao/18-usuarios-iniciais.md
-- ATENCAO: senhas provisorias '123' — trocar antes de uso real.

INSERT INTO usuario (nome, email, senha_hash, papel, ativo, versao_token, created_at)
VALUES
  ('Flavio',      'flavio@alsindustria.com.br',     '<HASH_BCRYPT_DE_123>', 'ADMIN',    TRUE, 1, now()),
  ('Vendas 2',    'vendas2@alsindustria.com.br',    '<HASH_BCRYPT_DE_123>', 'OPERADOR', TRUE, 1, now()),
  ('Compras',     'compra@alsindustria.com.br',     '<HASH_BCRYPT_DE_123>', 'OPERADOR', TRUE, 1, now()),
  ('Atendimento', 'atendimento@alsindustria.com.br','<HASH_BCRYPT_DE_123>', 'OPERADOR', TRUE, 1, now())
ON CONFLICT (email) DO NOTHING;
```

`<HASH_BCRYPT_DE_123>` é o hash BCrypt da senha `123`, gerado uma vez e colocado **literalmente** no SQL — ver §3.

> **Observação:** se a opção B for usada, **desabilitar** ou **ajustar** o `BootstrapAdmin` para não tentar criar o admin de novo. Pode usar o mesmo critério (`SELECT count(*) FROM usuario`) — se já houver usuários, não bootstrap.

---

## 3. Como gerar o hash BCrypt da senha provisória

Com **força 10** (alinhado com `BCRYPT_FORCA=10` do [09 §10](09-arquitetura.md)).

### Forma 1 — Script Java temporário

```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GerarHashSeed {
    public static void main(String[] args) {
        var enc = new BCryptPasswordEncoder(10);
        System.out.println(enc.encode("123"));
    }
}
```

Rodar uma vez, copiar o output (ex.: `$2a$10$abc...xyz`) e colar no SQL da migration.

### Forma 2 — `htpasswd` (Apache utils)

```bash
htpasswd -bnBC 10 "" "123" | tr -d ':\n' | sed 's/\$2y/\$2a/'
```

(`BCryptPasswordEncoder` aceita `$2a` e `$2y` — alguns frameworks normalizam para `$2a`.)

### Forma 3 — Site online

Não usar para senhas reais. Para `123` em ambiente de dev, é aceitável.

### Validade do hash

Cada hash BCrypt gerado é **único** (o salt é embutido nele e é aleatório). Você pode gerar **um único hash** e usar nos 4 registros — o BCrypt vai validar a senha `123` contra qualquer um deles independentemente.

---

## 4. Plano de troca de senhas — OBRIGATÓRIO antes de produção

### 4.1 Por que trocar

- Senha `123` viola qualquer política básica de segurança
- Aparece neste documento (que vive no repo)
- Aparece no `.env.example` se for usada como bootstrap

### 4.2 Quando trocar

- **Antes do primeiro uso real do sistema** (mesmo em ambiente interno da empresa)
- **Sempre antes de qualquer deploy fora do localhost**

### 4.3 Como trocar

Por enquanto **não há tela "alterar senha" no escopo da V1** (ver [09 §3](09-arquitetura.md) — recuperação de senha está fora). Caminhos disponíveis:

1. **Via UI de admin** (preferido): `/configuracoes/usuarios` permite ao admin redefinir a senha de qualquer usuário (esta capability deve estar implementada na Fase 4 do front, ver [17](17-plano-frontend.md)).
2. **Via SQL direto no banco** (último caso): atualizar `senha_hash` com novo hash BCrypt:
   ```sql
   UPDATE usuario
   SET senha_hash = '<NOVO_HASH>', versao_token = versao_token + 1
   WHERE email = '<email-do-usuario>';
   ```
   O incremento de `versao_token` invalida tokens emitidos antes (logout forçado em todos os dispositivos).

### 4.4 Checklist antes de virada de produção

- [ ] Senha do admin (`flavio@alsindustria.com.br`) trocada por algo forte
- [ ] Senhas dos 3 operadores trocadas
- [ ] `BOOTSTRAP_ADMIN_SENHA` removido do `.env` de produção (ou setado para valor diferente)
- [ ] Confirmar que nenhum usuário do banco ainda tem `senha_hash` correspondente a `123`

---

## 5. Exceção na regra de tamanho de senha

A regra padrão de senha exige **mínimo 8 caracteres** (ver [15-padroes-backend.md §4.7](15-padroes-backend.md)). A senha `123` viola essa regra propositalmente.

**A exceção vale somente para seeds Flyway** — inserção direta no banco com hash já calculado. **Endpoints REST (`POST /usuarios`, `PATCH /usuarios/{id}/senha`) mantêm a validação de 8 caracteres normalmente**, lançando 400 se a senha for menor.

Em termos práticos: ninguém consegue criar uma senha `123` via API. Só via migration de seed inicial.

---

## 6. Onde isso afeta o resto da documentação

- [09-arquitetura.md §3](09-arquitetura.md) — autenticação e cookies
- [15-padroes-backend.md §4.7](15-padroes-backend.md) — exceção marcada explicitamente
- [16-plano-backend.md Fase 1](16-plano-backend.md) — migration de seed incluída
- [02-atores.md](02-atores.md) e [10-matriz-permissoes.md](10-matriz-permissoes.md) — papéis aplicáveis (ADMIN, OPERADOR aqui; GERENTE e TECNICO criados depois pela UI)
