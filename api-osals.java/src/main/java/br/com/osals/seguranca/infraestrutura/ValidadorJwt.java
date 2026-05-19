package br.com.osals.seguranca.infraestrutura;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import java.security.PublicKey;
import org.springframework.stereotype.Component;

/**
 * Valida e parseia JWTs recebidos. Verifica assinatura RS256, expiracao, issuer e audience.
 */
@Component
public class ValidadorJwt {

    private final PublicKey chavePublica;
    private final ConfiguracoesJwt config;

    public ValidadorJwt(PublicKey chavePublica, ConfiguracoesJwt config) {
        this.chavePublica = chavePublica;
        this.config = config;
    }

    /**
     * Valida o JWT e retorna as claims. Lanca {@link JwtException} se invalido ou expirado.
     */
    public Claims validarERetornarClaims(String token) {
        return Jwts.parser()
                .verifyWith(chavePublica)
                .requireIssuer(config.emissor())
                .requireAudience(config.audience())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
