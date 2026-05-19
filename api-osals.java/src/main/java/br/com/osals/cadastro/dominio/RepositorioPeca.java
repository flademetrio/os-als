package br.com.osals.cadastro.dominio;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RepositorioPeca extends JpaRepository<Peca, Long> {

    @Query(
            """
            SELECT p FROM Peca p
            WHERE (:apenasAtivos = FALSE OR p.ativo = TRUE)
              AND (:busca IS NULL OR LOWER(p.nome) LIKE LOWER(CONCAT('%', :busca, '%'))
                                  OR LOWER(p.descricao) LIKE LOWER(CONCAT('%', :busca, '%')))
            ORDER BY p.nome
            """)
    Page<Peca> buscarFiltrado(
            @Param("busca") String busca,
            @Param("apenasAtivos") boolean apenasAtivos,
            Pageable pageable
    );
}
