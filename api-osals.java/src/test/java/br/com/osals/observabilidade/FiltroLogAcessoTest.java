package br.com.osals.observabilidade;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.osals.seguranca.dominio.Papel;
import br.com.osals.seguranca.dominio.Usuario;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

class FiltroLogAcessoTest {

    private final Logger acessoLogger = (Logger) LoggerFactory.getLogger("ACESSO");
    private final ListAppender<ILoggingEvent> appender = new ListAppender<>();

    @AfterEach
    void limpar() {
        SecurityContextHolder.clearContext();
        acessoLogger.detachAppender(appender);
    }

    private void capturar() {
        appender.start();
        acessoLogger.addAppender(appender);
    }

    @Test
    void registraMetodoRotaStatusEUsuarioAutenticado() throws Exception {
        capturar();
        Usuario u = new Usuario("Flavio", "flavio@alsindustria.com.br", "hash", Papel.ADMIN);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(u, null, List.of()));

        var req = new MockHttpServletRequest("GET", "/relatorios/servicos-abertos");
        req.setQueryString("clienteId=4");
        var res = new MockHttpServletResponse();
        res.setStatus(200);

        new FiltroLogAcesso().doFilter(req, res, new MockFilterChain());

        assertThat(appender.list).hasSize(1);
        String msg = appender.list.get(0).getFormattedMessage();
        assertThat(msg)
                .contains("GET /relatorios/servicos-abertos?clienteId=4 -> 200")
                .contains("usuario=flavio@alsindustria.com.br");
    }

    @Test
    void registraComoAnonimoSemAutenticacao() throws Exception {
        capturar();
        var req = new MockHttpServletRequest("POST", "/auth/login");
        var res = new MockHttpServletResponse();
        res.setStatus(401);

        new FiltroLogAcesso().doFilter(req, res, new MockFilterChain());

        assertThat(appender.list).hasSize(1);
        assertThat(appender.list.get(0).getFormattedMessage())
                .contains("POST /auth/login -> 401")
                .contains("usuario=anonimo");
    }

    @Test
    void ignoraHealthcheckDoActuator() throws Exception {
        capturar();
        var req = new MockHttpServletRequest("GET", "/actuator/health");
        var res = new MockHttpServletResponse();

        new FiltroLogAcesso().doFilter(req, res, new MockFilterChain());

        assertThat(appender.list).isEmpty();
    }
}
