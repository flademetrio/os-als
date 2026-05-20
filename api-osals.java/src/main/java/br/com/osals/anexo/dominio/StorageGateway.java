package br.com.osals.anexo.dominio;

import org.springframework.core.io.Resource;

/**
 * Porta de armazenamento de arquivos. A chave (storage_key) e um identificador
 * opaco — na V1 e um caminho relativo no filesystem; numa versao futura pode
 * ser uma chave de object storage (S3/R2). O schema do banco nao muda.
 */
public interface StorageGateway {

    /** Persiste o conteudo sob a chave informada e devolve a propria chave. */
    String armazenar(byte[] conteudo, String chave);

    /** Recupera o conteudo como Resource para streaming na resposta HTTP. */
    Resource recuperar(String chave);

    /** Remove o arquivo. Silencioso se a chave nao existir. */
    void remover(String chave);
}
