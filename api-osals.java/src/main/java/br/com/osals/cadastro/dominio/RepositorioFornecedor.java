package br.com.osals.cadastro.dominio;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RepositorioFornecedor extends JpaRepository<Fornecedor, Long> {

    @Query(
            """
            SELECT f FROM Fornecedor f
            WHERE (:apenasAtivos = FALSE OR f.ativo = TRUE)
              AND (:busca = '' OR LOWER(f.nome) LIKE LOWER(CONCAT('%', :busca, '%'))
                                OR f.documento LIKE CONCAT('%', :busca, '%'))
            ORDER BY f.nome
            """)
    Page<Fornecedor> buscarFiltrado(
            @Param("busca") String busca,
            @Param("apenasAtivos") boolean apenasAtivos,
            Pageable pageable
    );
}
