package br.com.osals.compartilhado.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuracao do OpenAPI (Swagger UI em /swagger-ui.html, JSON em /v3/api-docs).
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("API OS-ALS")
                        .version("0.0.1")
                        .description("API REST para o sistema de gestao de ordens de servico OS-ALS.")
                        .contact(new Contact().name("ALS Industria")));
    }
}
