package br.com.osals.cadastro.dominio;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RepositorioCliente extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByDocumento(String documento);

    boolean existsByDocumento(String documento);

    @Query(
            """
            SELECT c FROM Cliente c
            WHERE (:apenasAtivos = FALSE OR c.ativo = TRUE)
              AND (:busca IS NULL OR LOWER(c.nome) LIKE LOWER(CONCAT('%', :busca, '%'))
                                  OR c.documento LIKE CONCAT('%', :busca, '%'))
            """)
    Page<Cliente> buscarFiltrado(
            @Param("busca") String busca,
            @Param("apenasAtivos") boolean apenasAtivos,
            Pageable pageable
    );
}
