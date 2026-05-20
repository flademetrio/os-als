package br.com.osals.anexo.dominio;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RepositorioAnexoServico extends JpaRepository<AnexoServico, Long> {

    @Query("""
            SELECT a FROM AnexoServico a
            JOIN FETCH a.createdBy
            WHERE a.servico.id = :servicoId
            ORDER BY a.id
            """)
    List<AnexoServico> listarDoServico(@Param("servicoId") Long servicoId);
}
