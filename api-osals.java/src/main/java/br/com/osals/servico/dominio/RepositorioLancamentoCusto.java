package br.com.osals.servico.dominio;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RepositorioLancamentoCusto extends JpaRepository<LancamentoCusto, Long> {

    @Query("""
            SELECT l FROM LancamentoCusto l
            JOIN FETCH l.categoriaCusto
            LEFT JOIN FETCH l.tecnico t
            LEFT JOIN FETCH t.usuario
            WHERE l.servico.id = :servicoId
            ORDER BY l.id
            """)
    List<LancamentoCusto> listarDoServico(@Param("servicoId") Long servicoId);

    /** Quantos lancamentos historicos usam uma categoria — usado na exclusao. */
    long countByCategoriaCustoId(Integer categoriaCustoId);
}
