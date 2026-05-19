package br.com.osals.cadastro.dominio;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RepositorioVeiculo extends JpaRepository<Veiculo, Long> {

    Optional<Veiculo> findByPlaca(String placa);

    boolean existsByPlaca(String placa);

    @Query(
            """
            SELECT v FROM Veiculo v
            WHERE (:apenasAtivos = FALSE OR v.ativo = TRUE)
              AND (:status IS NULL OR v.status = :status)
              AND (:busca = '' OR LOWER(v.placa) LIKE LOWER(CONCAT('%', :busca, '%'))
                                OR LOWER(v.modelo) LIKE LOWER(CONCAT('%', :busca, '%'))
                                OR LOWER(v.marca) LIKE LOWER(CONCAT('%', :busca, '%')))
            """)
    Page<Veiculo> buscarFiltrado(
            @Param("status") StatusVeiculo status,
            @Param("busca") String busca,
            @Param("apenasAtivos") boolean apenasAtivos,
            Pageable pageable
    );
}
