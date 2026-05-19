package br.com.osals.seguranca.dominio;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RepositorioTecnico extends JpaRepository<Tecnico, Long> {

    @Query(
            """
            SELECT t FROM Tecnico t
            JOIN t.usuario u
            WHERE (:apenasAtivos = FALSE OR u.ativo = TRUE)
              AND (:busca IS NULL OR LOWER(u.nome) LIKE LOWER(CONCAT('%', :busca, '%'))
                                  OR LOWER(u.email) LIKE LOWER(CONCAT('%', :busca, '%'))
                                  OR LOWER(t.especialidade) LIKE LOWER(CONCAT('%', :busca, '%')))
            ORDER BY u.nome
            """)
    Page<Tecnico> buscarFiltrado(
            @Param("busca") String busca,
            @Param("apenasAtivos") boolean apenasAtivos,
            Pageable pageable
    );
}
