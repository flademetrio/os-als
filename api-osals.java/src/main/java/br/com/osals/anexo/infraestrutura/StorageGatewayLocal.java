package br.com.osals.anexo.infraestrutura;

import br.com.osals.anexo.dominio.StorageGateway;
import br.com.osals.compartilhado.excecoes.NegocioException;
import br.com.osals.compartilhado.excecoes.RecursoNaoEncontradoException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

/**
 * Armazenamento de anexos no filesystem local (V1). A raiz e configuravel via
 * app.anexos.dir. A storage_key e um caminho relativo dentro dessa raiz.
 *
 * Producao futura: trocar por um StorageGateway de object storage — o resto
 * do sistema nao muda, pois depende apenas da interface.
 */
@Component
public class StorageGatewayLocal implements StorageGateway {

    private static final Logger log = LoggerFactory.getLogger(StorageGatewayLocal.class);

    private final Path raiz;

    public StorageGatewayLocal(@Value("${app.anexos.dir}") String diretorio) {
        this.raiz = Path.of(diretorio).toAbsolutePath().normalize();
    }

    @Override
    public String armazenar(byte[] conteudo, String chave) {
        Path destino = resolver(chave);
        try {
            Files.createDirectories(destino.getParent());
            Files.write(destino, conteudo);
            log.info("Anexo gravado: {} ({} bytes)", chave, conteudo.length);
            return chave;
        } catch (IOException e) {
            log.error("Falha ao gravar anexo {}", chave, e);
            throw new NegocioException("Falha ao armazenar o arquivo.");
        }
    }

    @Override
    public Resource recuperar(String chave) {
        Path arquivo = resolver(chave);
        if (!Files.isReadable(arquivo)) {
            throw new RecursoNaoEncontradoException("Arquivo do anexo nao encontrado.");
        }
        return new FileSystemResource(arquivo);
    }

    @Override
    public void remover(String chave) {
        try {
            boolean removido = Files.deleteIfExists(resolver(chave));
            if (removido) {
                log.info("Anexo removido do storage: {}", chave);
            }
        } catch (IOException e) {
            log.warn("Falha ao remover anexo {} do storage", chave, e);
        }
    }

    /** Resolve a chave dentro da raiz, barrando tentativas de path traversal. */
    private Path resolver(String chave) {
        Path destino = raiz.resolve(chave).normalize();
        if (!destino.startsWith(raiz)) {
            throw new NegocioException("Chave de storage invalida.");
        }
        return destino;
    }
}
