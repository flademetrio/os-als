package br.com.osals.observabilidade;

import br.com.osals.seguranca.dominio.Usuario;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Log de acesso HTTP: registra UMA linha por requisicao (metodo, rota, status,
 * tempo de resposta e usuario autenticado) no logger dedicado "ACESSO", que o
 * logback roteia para o arquivo proprio os-als-acesso.log.
 *
 * Leve por design: loga apos a resposta, sem corpo. Roda com a menor precedencia
 * (LOWEST_PRECEDENCE) para executar por dentro da cadeia de seguranca, com o
 * SecurityContext ja populado. Ignora o healthcheck do actuator, o preflight
 * OPTIONS e a documentacao (Swagger) para nao gerar ruido.
 */
@Component
@Order(Ordered.LOWEST_PRECEDENCE)
public class FiltroLogAcesso extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger("ACESSO");

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        long inicio = System.currentTimeMillis();
        try {
            chain.doFilter(req, res);
        } finally {
            long ms = System.currentTimeMillis() - inicio;
            String query = req.getQueryString() != null ? "?" + req.getQueryString() : "";
            log.info("{} {}{} -> {} ({} ms) usuario={}",
                    req.getMethod(), req.getRequestURI(), query, res.getStatus(), ms, usuarioAtual());
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest req) {
        String uri = req.getRequestURI();
        return "OPTIONS".equalsIgnoreCase(req.getMethod())
                || uri.startsWith("/actuator")
                || uri.startsWith("/v3/api-docs")
                || uri.startsWith("/swagger-ui");
    }

    /** Email do usuario autenticado (o principal e o proprio Usuario), ou "anonimo". */
    private String usuarioAtual() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        if (a != null && a.getPrincipal() instanceof Usuario u) {
            return u.getEmail();
        }
        return "anonimo";
    }
}
