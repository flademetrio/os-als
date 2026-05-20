package br.com.osals.anexo.aplicacao.dto;

import org.springframework.core.io.Resource;

/** Conteudo de um anexo pronto para streaming na resposta HTTP. */
public record ConteudoAnexo(
        Resource recurso,
        String nomeArquivo,
        String contentType,
        long tamanhoBytes
) {
}
