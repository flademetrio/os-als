package br.com.osals.seguranca.infraestrutura;

import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Carrega as chaves RSA dos arquivos PEM em disco e expoe como beans.
 * Os arquivos vivem em ./keys/ (gitignored). Em prod, gerar via volume montado.
 */
@Configuration
public class ChavesJwt {

    @Bean
    public PrivateKey chavePrivadaJwt(ConfiguracoesJwt config) throws Exception {
        String pem = Files.readString(Path.of(config.chavePrivadaCaminho()));
        byte[] der = pemParaDer(pem, "PRIVATE KEY");
        var spec = new PKCS8EncodedKeySpec(der);
        return KeyFactory.getInstance("RSA").generatePrivate(spec);
    }

    @Bean
    public PublicKey chavePublicaJwt(ConfiguracoesJwt config) throws Exception {
        String pem = Files.readString(Path.of(config.chavePublicaCaminho()));
        byte[] der = pemParaDer(pem, "PUBLIC KEY");
        var spec = new X509EncodedKeySpec(der);
        return KeyFactory.getInstance("RSA").generatePublic(spec);
    }

    private byte[] pemParaDer(String pem, String tipo) {
        String corpo = pem
                .replace("-----BEGIN " + tipo + "-----", "")
                .replace("-----END " + tipo + "-----", "")
                .replaceAll("\\s+", "");
        return Base64.getDecoder().decode(corpo);
    }
}
