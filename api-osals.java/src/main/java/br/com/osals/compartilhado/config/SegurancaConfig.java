package br.com.osals.compartilhado.config;

import br.com.osals.seguranca.infraestrutura.FiltroAutenticacaoJwt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuracao de seguranca. Stateless, autenticacao via JWT no cookie httpOnly "osals_at"
 * (ou header Authorization: Bearer para CLI/Postman).
 *
 * Endpoints publicos:
 *  - /actuator/health, /actuator/info
 *  - /swagger-ui, /v3/api-docs
 *  - /auth/login, /auth/refresh, /auth/logout (qualquer um deve poder bater pra entrar/sair)
 *
 * Resto exige autenticacao.
 */
@Configuration
@EnableMethodSecurity
public class SegurancaConfig {

    @Value("${app.cors.origens-permitidas}")
    private List<String> origensPermitidas;

    @Value("${app.cors.metodos-permitidos}")
    private List<String> metodosPermitidos;

    @Value("${app.cors.headers-permitidos}")
    private List<String> headersPermitidos;

    @Value("${app.seguranca.bcrypt-forca:10}")
    private int bcryptForca;

    private final FiltroAutenticacaoJwt filtroJwt;

    public SegurancaConfig(FiltroAutenticacaoJwt filtroJwt) {
        this.filtroJwt = filtroJwt;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(c -> c.configurationSource(corsConfigurationSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/actuator/health",
                                "/actuator/info",
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs",
                                "/v3/api-docs/**",
                                "/auth/login",
                                "/auth/refresh",
                                "/auth/logout"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(filtroJwt, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        var config = new CorsConfiguration();
        config.setAllowedOrigins(origensPermitidas);
        config.setAllowedMethods(metodosPermitidos);
        config.setAllowedHeaders(headersPermitidos);
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(bcryptForca);
    }
}
