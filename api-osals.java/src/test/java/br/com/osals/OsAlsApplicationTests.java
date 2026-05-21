package br.com.osals;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Teste de fumaca: garante que o contexto Spring sobe por inteiro —
 * todos os beans, JPA, Flyway e seguranca.
 *
 * Usa o perfil "test", que conecta num Postgres efemero do Testcontainers
 * (ver src/test/resources/application-test.yml).
 */
@SpringBootTest
@ActiveProfiles("test")
class OsAlsApplicationTests {

    @Test
    void contextLoads() {
    }
}
