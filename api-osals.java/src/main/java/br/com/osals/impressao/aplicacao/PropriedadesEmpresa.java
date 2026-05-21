package br.com.osals.impressao.aplicacao;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Dados da empresa exibidos no cabecalho da OS impressa.
 * Configuravel via application.yml (app.empresa.*) ou variaveis de ambiente.
 *
 * Validado no startup — a aplicacao falha rapido se algum campo vier vazio.
 */
@Validated
@ConfigurationProperties(prefix = "app.empresa")
public record PropriedadesEmpresa(
        @NotBlank String razaoSocial,
        @NotBlank String cnpj,
        @NotBlank String inscricaoEstadual,
        @NotBlank String endereco
) {
}
