package br.com.osals.seguranca.infraestrutura;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Configuracoes JWT vindas do .env / application.yml (prefix app.jwt.*).
 *
 * Caminhos PEM apontam para arquivos no disco (gitignored em dev).
 */
@Validated
@ConfigurationProperties(prefix = "app.jwt")
public record ConfiguracoesJwt(
        @NotBlank String chavePrivadaCaminho,
        @NotBlank String chavePublicaCaminho,
        @NotBlank String emissor,
        @NotBlank String audience,
        @Min(1) int expiracaoMinutos,
        @Min(1) int refreshExpiracaoDias
) {
}
