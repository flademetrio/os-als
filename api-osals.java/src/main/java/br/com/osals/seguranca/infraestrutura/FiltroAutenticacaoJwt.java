package br.com.osals.seguranca.infraestrutura;

import br.com.osals.seguranca.dominio.Papel;
import br.com.osals.seguranca.dominio.RepositorioUsuario;
import br.com.osals.seguranca.dominio.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Filtro de autenticacao JWT. Le o token de:
 *  - cookie httpOnly "osals_at" (preferido — frontend Server Actions)
 *  - header "Authorization: Bearer <token>" (compatibilidade Postman/CLI)
 *
 * Valida assinatura, expiracao, issuer/audience e versao_token (invalidacao em massa).
 * Em sucesso, popula o SecurityContext com Usuario + autoridade ROLE_<papel>.
 *
 * Erros silenciosos (passa adiante sem autenticar); o handler de seguranca decide o 401/403.
 */
@Component
public class FiltroAutenticacaoJwt extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(FiltroAutenticacaoJwt.class);
    private static final String COOKIE_ACCESS = "osals_at";

    private final ValidadorJwt validador;
    private final RepositorioUsuario repositorioUsuario;

    public FiltroAutenticacaoJwt(ValidadorJwt validador, RepositorioUsuario repositorioUsuario) {
        this.validador = validador;
        this.repositorioUsuario = repositorioUsuario;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        Optional<String> token = extrairToken(req);
        if (token.isEmpty()) {
            chain.doFilter(req, res);
            return;
        }

        try {
            Claims claims = validador.validarERetornarClaims(token.get());
            Long usuarioId = Long.parseLong(claims.getSubject());

            Usuario usuario = repositorioUsuario.findById(usuarioId).orElse(null);
            if (usuario == null || !usuario.isAtivo()) {
                chain.doFilter(req, res);
                return;
            }

            int versaoNoToken = claims.get("versaoToken", Integer.class);
            if (versaoNoToken != usuario.getVersaoToken()) {
                log.debug("Token com versao_token desatualizada para usuario {}", usuarioId);
                chain.doFilter(req, res);
                return;
            }

            var autoridades = new ArrayList<GrantedAuthority>();
            // ROLE_<papel> mantido por compatibilidade; a partir da Fase 2 a
            // autorizacao passa a usar as permissoes (hasAuthority).
            autoridades.add(new SimpleGrantedAuthority("ROLE_" + usuario.getPapel().name()));
            for (var permissao : usuario.permissoesEfetivas()) {
                autoridades.add(new SimpleGrantedAuthority(permissao.name()));
            }
            var auth = new UsernamePasswordAuthenticationToken(usuario, null, autoridades);
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (JwtException ex) {
            log.debug("JWT invalido: {}", ex.getMessage());
            // segue sem auth — SegurancaConfig retorna 401 se a rota exigir
        } catch (Exception ex) {
            log.warn("Erro inesperado validando JWT", ex);
        }

        chain.doFilter(req, res);
    }

    private Optional<String> extrairToken(HttpServletRequest req) {
        // 1. Cookie
        if (req.getCookies() != null) {
            for (Cookie c : req.getCookies()) {
                if (COOKIE_ACCESS.equals(c.getName()) && c.getValue() != null && !c.getValue().isBlank()) {
                    return Optional.of(c.getValue());
                }
            }
        }
        // 2. Header Authorization: Bearer
        String auth = req.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            return Optional.of(auth.substring(7));
        }
        return Optional.empty();
    }

    /** Helper estatico para uso em outros pontos. */
    public static String cookieAccessName() {
        return COOKIE_ACCESS;
    }

    /** Helper estatico utilitario. */
    public static Papel papelDoToken(Claims claims) {
        return Papel.valueOf(claims.get("papel", String.class));
    }
}
