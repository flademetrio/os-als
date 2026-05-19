package br.com.osals.seguranca.infraestrutura;

import br.com.osals.seguranca.dominio.Usuario;
import io.jsonwebtoken.Jwts;
import java.security.PrivateKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.springframework.stereotype.Component;

/**
 * Gera tokens JWT RS256 para o usuario autenticado.
 */
@Component
public class GeradorJwt {

    private final PrivateKey chavePrivada;
    private final ConfiguracoesJwt config;

    public GeradorJwt(PrivateKey chavePrivada, ConfiguracoesJwt config) {
        this.chavePrivada = chavePrivada;
        this.config = config;
    }

    /**
     * Gera access token com subject = id do usuario.
     * Claims: email, papel, versao_token, aud=tenant, iss, exp.
     */
    public String gerarAccessToken(Usuario usuario) {
        var agora = Instant.now();
        var expira = agora.plus(config.expiracaoMinutos(), ChronoUnit.MINUTES);

        return Jwts.builder()
                .subject(usuario.getId().toString())
                .issuer(config.emissor())
                .audience().add(config.audience()).and()
                .issuedAt(java.util.Date.from(agora))
                .expiration(java.util.Date.from(expira))
                .claim("email", usuario.getEmail())
                .claim("papel", usuario.getPapel().name())
                .claim("versaoToken", usuario.getVersaoToken())
                .claim("nome", usuario.getNome())
                .id(UUID.randomUUID().toString())
                .signWith(chavePrivada, Jwts.SIG.RS256)
                .compact();
    }

    /**
     * Gera um refresh token opaco (UUID). Nao e JWT — vai pra tabela token_refresh com hash.
     */
    public String gerarRefreshTokenOpaco() {
        return UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
    }

    public long expiracaoAccessMillis() {
        return Instant.now().plus(config.expiracaoMinutos(), ChronoUnit.MINUTES).toEpochMilli();
    }

    public Instant expiracaoRefreshInstant() {
        return Instant.now().plus(config.refreshExpiracaoDias(), ChronoUnit.DAYS);
    }
}
