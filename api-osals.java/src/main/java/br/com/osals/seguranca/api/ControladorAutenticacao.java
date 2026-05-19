package br.com.osals.seguranca.api;

import br.com.osals.seguranca.aplicacao.ServicoAutenticacao;
import br.com.osals.seguranca.aplicacao.dto.LoginRequisicao;
import br.com.osals.seguranca.aplicacao.dto.ResultadoLogin;
import br.com.osals.seguranca.aplicacao.dto.TokenResposta;
import br.com.osals.seguranca.aplicacao.dto.UsuarioResumoDto;
import br.com.osals.seguranca.dominio.Usuario;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.time.Instant;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@Tag(name = "Autenticacao", description = "Login, refresh, logout e dados do usuario logado")
public class ControladorAutenticacao {

    private static final String COOKIE_ACCESS = "osals_at";
    private static final String COOKIE_REFRESH = "osals_rt";

    private final ServicoAutenticacao servico;

    public ControladorAutenticacao(ServicoAutenticacao servico) {
        this.servico = servico;
    }

    @PostMapping("/login")
    @Operation(summary = "Autentica usuario com email e senha. Retorna tokens em cookies httpOnly.")
    public ResponseEntity<TokenResposta> login(@Valid @RequestBody LoginRequisicao requisicao,
                                               HttpServletResponse response) {
        ResultadoLogin resultado = servico.login(requisicao);
        gravarCookiesDeSessao(response, resultado);
        return ResponseEntity.ok(new TokenResposta(resultado.usuario(), resultado.accessExpiraEm().toEpochMilli()));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotaciona o refresh token. Revoga o anterior, emite novo par.")
    public ResponseEntity<TokenResposta> refresh(HttpServletRequest req, HttpServletResponse res) {
        String refresh = lerCookie(req, COOKIE_REFRESH);
        if (refresh == null) {
            return ResponseEntity.status(401).build();
        }
        ResultadoLogin resultado = servico.refresh(refresh);
        gravarCookiesDeSessao(res, resultado);
        return ResponseEntity.ok(new TokenResposta(resultado.usuario(), resultado.accessExpiraEm().toEpochMilli()));
    }

    @PostMapping("/logout")
    @Operation(summary = "Revoga o refresh token atual e limpa os cookies de sessao.")
    public ResponseEntity<Void> logout(HttpServletRequest req, HttpServletResponse res) {
        String refresh = lerCookie(req, COOKIE_REFRESH);
        servico.logout(refresh);
        limparCookie(res, COOKIE_ACCESS);
        limparCookie(res, COOKIE_REFRESH);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/eu")
    @Operation(summary = "Retorna dados do usuario logado (resolvido a partir do token).")
    public ResponseEntity<UsuarioResumoDto> eu(@AuthenticationPrincipal Usuario usuario) {
        if (usuario == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(UsuarioResumoDto.de(usuario));
    }

    // --- helpers de cookies ---

    private void gravarCookiesDeSessao(HttpServletResponse res, ResultadoLogin r) {
        gravarCookie(res, COOKIE_ACCESS, r.accessToken(), segundosAte(r.accessExpiraEm()));
        gravarCookie(res, COOKIE_REFRESH, r.refreshToken(), segundosAte(r.refreshExpiraEm()));
    }

    private void gravarCookie(HttpServletResponse res, String nome, String valor, int maxAgeSegundos) {
        Cookie c = new Cookie(nome, valor);
        c.setHttpOnly(true);
        c.setPath("/");
        c.setMaxAge(maxAgeSegundos);
        c.setAttribute("SameSite", "Lax");
        // Em prod habilitar c.setSecure(true) condicional ao HTTPS
        res.addCookie(c);
    }

    private void limparCookie(HttpServletResponse res, String nome) {
        Cookie c = new Cookie(nome, "");
        c.setHttpOnly(true);
        c.setPath("/");
        c.setMaxAge(0);
        res.addCookie(c);
    }

    private String lerCookie(HttpServletRequest req, String nome) {
        if (req.getCookies() == null) return null;
        for (Cookie c : req.getCookies()) {
            if (nome.equals(c.getName())) return c.getValue();
        }
        return null;
    }

    private int segundosAte(Instant instante) {
        long segundos = (instante.toEpochMilli() - System.currentTimeMillis()) / 1000;
        return (int) Math.max(0, Math.min(segundos, Integer.MAX_VALUE));
    }
}
