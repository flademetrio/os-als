package br.com.osals.compartilhado.api;

import java.util.List;
import org.springframework.data.domain.Page;

/**
 * Resposta paginada padrao. Espelha o formato consumido pelo frontend (ver documentacao/09 §8).
 *
 * @param conteudo        lista da pagina atual
 * @param pagina          indice da pagina (zero-based)
 * @param tamanho         tamanho da pagina (default 20)
 * @param totalElementos  total de registros que satisfazem o filtro
 * @param totalPaginas    quantidade total de paginas
 */
public record PaginaResposta<T>(
        List<T> conteudo,
        int pagina,
        int tamanho,
        long totalElementos,
        int totalPaginas
) {

    public static <T> PaginaResposta<T> de(Page<T> page) {
        return new PaginaResposta<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }
}
