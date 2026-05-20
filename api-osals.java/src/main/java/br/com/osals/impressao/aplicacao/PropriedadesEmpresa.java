package br.com.osals.impressao.aplicacao;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Dados da empresa exibidos no cabecalho da OS impressa.
 * Configuravel via application.yml (app.empresa.*) ou variaveis de ambiente.
 */
@ConfigurationProperties(prefix = "app.empresa")
public record PropriedadesEmpresa(
        String razaoSocial,
        String cnpj,
        String endereco,
        String contato
) {
}
