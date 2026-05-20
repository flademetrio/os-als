package br.com.osals.impressao.aplicacao;

import java.nio.charset.StandardCharsets;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

/**
 * Template engine dedicada a geracao de PDF.
 *
 * Usa modo XML para que a saida seja XHTML bem-formada — requisito do
 * OpenHTMLtoPDF, que faz parsing estrito. Os templates ficam em
 * classpath:/templates-pdf/ e nao interferem na resolucao de views MVC.
 *
 * E um SpringTemplateEngine (avalia expressoes com SpringEL) — assim nao
 * depende da biblioteca OGNL exigida pelo TemplateEngine padrao.
 */
@Configuration
public class ConfiguracaoTemplatePdf {

    @Bean
    public TemplateEngine templateEnginePdf() {
        var resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates-pdf/");
        resolver.setSuffix(".html");
        resolver.setTemplateMode(TemplateMode.XML);
        resolver.setCharacterEncoding(StandardCharsets.UTF_8.name());
        resolver.setCacheable(true);

        var engine = new SpringTemplateEngine();
        engine.setTemplateResolver(resolver);
        return engine;
    }
}
