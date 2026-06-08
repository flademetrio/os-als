package br.com.osals.seguranca.infraestrutura;

import br.com.osals.seguranca.dominio.Papel;
import br.com.osals.seguranca.dominio.PresetsPermissao;
import br.com.osals.seguranca.dominio.RepositorioUsuario;
import br.com.osals.seguranca.dominio.Usuario;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Cria os usuarios iniciais no primeiro boot, se a tabela usuario estiver vazia.
 *
 * Lista: 1 admin + 3 operadores. Senha provisoria "123" para todos
 * (ver documentacao/18-usuarios-iniciais.md). TROCAR antes de qualquer uso real.
 */
@Component
public class BootstrapUsuariosIniciais implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(BootstrapUsuariosIniciais.class);
    private static final String SENHA_PROVISORIA = "123";

    private final RepositorioUsuario repositorioUsuario;
    private final PasswordEncoder passwordEncoder;

    public BootstrapUsuariosIniciais(RepositorioUsuario repositorioUsuario, PasswordEncoder passwordEncoder) {
        this.repositorioUsuario = repositorioUsuario;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        long total = repositorioUsuario.count();
        if (total > 0) {
            log.info("Bootstrap pulado: ja existem {} usuario(s) no banco.", total);
            return;
        }

        log.warn("=========================================================");
        log.warn(" PRIMEIRO BOOT — criando 4 usuarios iniciais com senha '{}'.", SENHA_PROVISORIA);
        log.warn(" TROCAR ESSAS SENHAS antes de qualquer uso real!");
        log.warn(" Ver documentacao/18-usuarios-iniciais.md");
        log.warn("=========================================================");

        criar("Flavio", "flavio@alsindustria.com.br", Papel.ADMIN);
        criar("Vendas 2", "vendas2@alsindustria.com.br", Papel.OPERADOR);
        criar("Compras", "compra@alsindustria.com.br", Papel.COMPRAS);
        criar("Atendimento", "atendimento@alsindustria.com.br", Papel.OPERADOR);
    }

    private void criar(String nome, String email, Papel papel) {
        var hash = passwordEncoder.encode(SENHA_PROVISORIA);
        var usuario = new Usuario(nome, email, hash, papel);
        usuario.definirPermissoes(PresetsPermissao.doPapel(papel));
        repositorioUsuario.save(usuario);
        log.info("Usuario criado: {} ({}) — {} com {} permissoes",
                nome, email, papel, usuario.getPermissoes().size());
    }
}
